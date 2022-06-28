import { Err } from '@openaddresses/batch-schema';
import Upload from '../lib/upload.js';
import Auth from '../lib/auth.js';
import SQS from '../lib/sqs.js';

export default async function router(schema, config) {
    const sqs = new SQS(config.SigningSecret);

    /**
     * @api {post} /api/obtain Create Obtain
     * @apiVersion 1.0.0
     * @apiName CreateObtain
     * @apiGroup Obtain
     t @apiPermission user
     *
     * @apiDescription
     *     Create a new obtain
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.post('/obtain', {
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            await sqs.obtain({

            });

            return res.json({
                status: 200,
                message: 'Obtain Submitted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
