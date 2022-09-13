import Err from '@openaddresses/batch-error';
import busboy from 'busboy';
import Upload from '../lib/types/upload.js';
import Auth from '../lib/auth.js';
import S3 from '../lib/aws/s3.js';
import SQS from '../lib/aws/sqs.js';

export default async function router(schema, config) {
    const sqs = new SQS(config.SigningSecret, config.sqs);

    await schema.get('/upload', {
        name: 'List Uploads',
        group: 'Upload',
        auth: 'user',
        description: 'Return a list of uploads that have been attempted by a user',
        query: 'req.query.ListUploads.json',
        res: 'res.ListUploads.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.uid = req.auth.id;
            const list = await Upload.list(config.pool, req.query);

            res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/upload/:upload', {
        name: 'Get Upload',
        group: 'Upload',
        auth: 'user',
        description: 'Get a single upload',
        ':upload': 'integer',
        res: 'uploads.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            res.json(upload.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.put('/upload', {
        name: 'JSON Upload',
        group: 'Upload',
        auth: 'user',
        description: `
            Create a new upload but don't populate it with an actual file
            Generally this will only be called internally via the obtain task
        `,
        body: 'req.body.CreateUpload.json',
        res: 'uploads.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.generate(config.pool, {
                uid: req.auth.id,
                ...req.body
            });

            return res.json(upload.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/upload', {
        name: 'Create Upload',
        group: 'Upload',
        auth: 'user',
        description: 'Create a new upload',
        res: 'uploads.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            if (req.headers['content-type']) {
                req.headers['content-type'] = req.headers['content-type'].split(',')[0];
            } else {
                throw new Err(400, null, 'Missing Content-Type Header');
            }

            const upload = await Upload.generate(config.pool, {
                uid: req.auth.id
            });

            let bb;
            try {
                bb = busboy({
                    headers: req.headers,
                    limits: {
                        files: 1
                    }
                });
            } catch (err) {
                return Err.respond(err, res);
            }

            const meta = {
                path: '',
                name: '',
                size: 0
            };
            const files = [];
            const fields = {};

            bb.on('file', (fieldname, file, blob) => {
                meta.name = blob.filename;
                meta.path = `uploads/${upload.id}/${blob.filename}`;
                files.push(S3.put(meta.path, file));
            }).on('field', (name, val) => {
                fields[name] = val;
            }).on('error', (err) => {
                Err.respond(err, res);
            }).on('close', async () => {
                try {
                    await Promise.all(files);
                    const head = await S3.head(meta.path);
                    meta.size = head.ContentLength;

                    await upload.commit({
                        name: meta.name,
                        size: meta.size,
                        uploaded: true,
                        config: {
                            cog: {
                                blocksize: fields.blocksize || 512,
                                compression: fields.compression || 'deflate',
                                overview: fields.overview || null
                            }
                        }
                    });

                    await sqs.send(upload.id, {
                        upload: upload.id,
                        ...upload.config
                    }, req.auth.id);

                    return res.json(upload.serialize());
                } catch (err) {
                    Err.respond(err, res);
                }
            });

            return req.pipe(bb);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/upload/:upload', {
        name: 'Update Upload',
        group: 'Upload',
        auth: 'user',
        description: 'Update information about a given upload',
        ':upload': 'integer',
        body: 'req.body.PatchUpload.json',
        res: 'uploads.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            await upload.commit(req.body);

            if (upload.obtain && req.body.uploaded) {
                await sqs.send(upload.id, {
                    upload: upload.id,
                    ...upload.config
                }, req.auth.id);
            }

            return res.json(upload.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/upload/:upload', {
        name: 'Delete Upload',
        group: 'Upload',
        auth: 'user',
        description: 'Delete a given upload',
        ':upload': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            await upload.delete();

            await S3.del(`uploads/${upload.id}/`, {
                recurse: true
            });

            return res.json({
                status: 200,
                message: 'Deleted Upload'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
