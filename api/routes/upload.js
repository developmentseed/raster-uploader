import { Err } from '@openaddresses/batch-schema';
import busboy from 'busboy';
import Upload from '../lib/upload.js';
import Auth from '../lib/auth.js';
import S3 from '../lib/s3.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/upload List Uploads
     * @apiVersion 1.0.0
     * @apiName ListUploads
     * @apiGroup Upload
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of uploads that have been attempted by a user
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListUploads.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListUploads.json} apiSuccess
     */
    await schema.get('/upload', {
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

    /**
     * @api {get} /api/upload/:upload Get Upload
     * @apiVersion 1.0.0
     * @apiName GetUpload
     * @apiGroup Upload
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single upload
     *
     * @apiParam {Number} :upload The ID of the upload
     *
     * @apiSchema {jsonschema=../schema/res.Upload.json} apiSuccess
     */
    await schema.get('/upload/:upload', {
        ':upload': 'integer',
        res: 'res.Upload.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);

            if (req.auth.access !== 'admin' && req.auth.id !== upload.uid) {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            }

            res.json(upload.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/user Create Upload
     * @apiVersion 1.0.0
     * @apiName CreateUpload
     * @apiGroup Upload
     t @apiPermission user
     *
     * @apiDescription
     *     Create a new upload
     *
     * @apiSchema {jsonschema=../schema/res.Upload.json} apiSuccess
     */
    await schema.post('/upload', {
        res: 'res.Upload.json'
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

            let meta = {
                path: '',
                name: '',
                size: 0
            };
            const files = [];

            bb.on('file', (fieldname, file, blob) => {
                meta.name = blob.filename;
                meta.path = `uploads/${upload.id}/${blob.filename}`;
                files.push(S3.put(meta.path, file));

            }).on('error', (err) => {
                Err.respond(err, res);
            }).on('close', async () => {
                try {
                    await Promise.all(files);
                    const head = await S3.head(meta.path);
                    meta.size = head.ContentLength;

                    await upload.commit(config.pool, {}, {
                        name: meta.name,
                        size: meta.size
                    });

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

    /**
     * @api {patch} /api/upload/:upload Update Upload
     * @apiVersion 1.0.0
     * @apiName PatchUpload
     * @apiGroup User
     * @apiPermission user
     *
     * @apiDescription
     *     Update information about a given upload
     *
     * @apiParam {Number} :upload The ID of the upload
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchUpload.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Upload.json} apiSuccess
     */
    await schema.patch('/upload/:upload', {
        ':upload': 'integer',
        body: 'req.body.PatchUpload.json',
        res: 'res.Upload.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);

            if (req.auth.access !== 'admin' && req.auth.id !== upload.uid) {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            }

            return res.json(upload.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/upload/:upload Delete Upload
     * @apiVersion 1.0.0
     * @apiName DeleteUpload
     * @apiGroup User
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a given upload
     *
     * @apiParam {Number} :upload The ID of the upload
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/upload/:upload', {
        ':upload': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);

            if (req.auth.access !== 'admin' && req.auth.id !== upload.uid) {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            }

            await upload.delete(config.pool);

            S3.del(`uploads/${upload.id}/`, {
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
