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
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateObtain.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Upload.json} apiSuccess
     */
    await schema.post('/obtain', {
        body: 'req.body.CreateObtain.json',
        res: 'res.Upload.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.generate(config.pool, {
                name: '<pending obtain>',
                uid: req.auth.id,
                obtain: true,
                config: {
                    cog: req.body.cog
                }
            });

            await sqs.obtain(req.body, req.auth.id);

            return res.json(upload.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
