import Err from '@openaddresses/batch-error';
import Collection from '../lib/types/collection.js';
import Auth from '../lib/auth.js';
import jwt from 'jsonwebtoken';

export default async function router(schema, config) {
    await schema.post('/machine', {
        name: 'Internal',
        group: 'Machine',
        auth: 'machine',
        description: `
            Obtain tasks started as part of a collection via the EventBridge scheduling
            rules must obtain data about the user/collection that initiated the task
        `,
        body: 'req.body.CreateMachine.json',
        res: 'res.Machine.json'
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
