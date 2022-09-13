import Err from '@openaddresses/batch-error';
import Upload from '../lib/types/upload.js';
import Auth from '../lib/auth.js';
import SQS from '../lib/aws/sqs.js';

export default async function router(schema, config) {
    const sqs = new SQS(config.SigningSecret);

    await schema.post('/obtain', {
        name: 'Create Obtain',
        group: 'Obtain',
        auth: 'user',
        description: 'Create a new obtain task',
        body: 'req.body.CreateObtain.json',
        res: 'uploads.json'
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

            req.body.obtain.upload = upload.id;
            await sqs.obtain({
                ...req.body.obtain
            }, req.auth.id);

            return res.json(upload.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
