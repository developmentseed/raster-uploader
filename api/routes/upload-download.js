import { Err } from '@openaddresses/batch-schema';
import Upload from '../lib/types/upload.js';
import Auth from '../lib/auth.js';
import S3 from '../lib/s3.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/upload/:upload/download Download Upload
     * @apiVersion 1.0.0
     * @apiName DownloadUpload
     * @apiGroup Upload
     * @apiPermission user
     *
     * @apiDescription
     *     Download the initially uploaded file
     *
     * @apiParam {Number} :upload The ID of the upload
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.DownloadUpload.json} apiParam
     */
    await schema.get('/upload/:upload/download', {
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
