import Err from '@openaddresses/batch-error';
import Upload from '../lib/types/upload.js';
import Auth from '../lib/auth.js';
import S3 from '../lib/aws/s3.js';

export default async function router(schema, config) {
    await schema.get('/upload/:upload/download', {
        name: 'Download',
        group: 'DownloadUpload',
        auth: 'user',
        description: 'Download the initially uploaded file',
        ':upload': 'integer',
        query: 'req.query.DownloadUpload.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);

            const upload = await Upload.from(config.pool, req.params.upload);

            if (req.auth.access !== 'admin' && req.auth.id !== upload.uid) {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            } else if (!upload.uploaded) {
                throw new Err(400, null, 'Cannot download an upload that hasn\'t been uploaded');
            }

            const s3 = new S3({
                Bucket: config.Bucket,
                Key: `uploads/${upload.id}/${upload.name}`
            });

            return s3.stream(res, upload.name);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
