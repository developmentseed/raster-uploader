import { Err } from '@openaddresses/batch-schema';
import Collection from '../lib/types/collection.js';
import Auth from '../lib/auth.js';
import jwt from 'jsonwebtoken';

export default async function router(schema, config) {
    /**
     * @api {post} /api/machine
     * @apiVersion 1.0.0
     * @apiName PostMachine
     * @apiGroup machine
     * @apiPermission machine
     *
     * @apiDescription
     *     Obtain tasks started as part of a collection via the EventBridge scheduling
     *      rules must obtain data about the user/collection that initiated the task
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateMachine.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Machine.json} apiSuccess
     */
    await schema.post('/machine', {
        body: 'req.body.CreateMachine.json',
        res: 'res.Collection.json'
    }, async (req, res) => {
        try {
            await Auth.is_machine(req);

            const collection = await Collection.from(config.pool, req.body.collection);

            const token = jwt.sign({
                u: collection.uid
            }, config.SigningSecret, {
                expiresIn: '15m'
            });

            res.json({ token });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
