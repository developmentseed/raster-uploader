import { Err } from '@openaddresses/batch-schema';
import Upload from '../lib/upload.js';
import UploadStep from '../lib/upload-step.js';
import Auth from '../lib/auth.js';
import SQS from '../lib/sqs.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/upload/:upload/step/:step/cog/info COG Info
     * @apiVersion 1.0.0
     * @apiName COGInfo
     * @apiGroup Cogs
     * @apiPermission user
     *
     * @apiDescription
     *     Get information about a COG
     *
     * @apiParam {Number} :upload The ID of the upload
     * @apiParam {Number} :step The ID of the step
     */
    await schema.get('/upload/:upload/step/:step', {
        ':upload': 'integer',
        ':step': 'integer',
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            if (upload.uid !== req.auth.id && req.auth.access !== 'admin') {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            }

            const step = await UploadStep.from(config.pool, req.params.upload);

            if (step.upload_id !== upload.id) {
                throw new Err(401, null, 'Upload Step does not belong to upload');
            }

            if (req.auth.access !== 'admin' && req.auth.id !== step.uid) {
                throw new Err(401, null, 'Cannot access an upload step you didn\'t create');
            }



            res.json(step.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
