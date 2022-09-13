import Err from '@openaddresses/batch-error';
import Upload from '../lib/types/upload.js';
import UploadStep from '../lib/types/upload-step.js';
import Auth from '../lib/auth.js';
import SQS from '../lib/aws/sqs.js';

export default async function router(schema, config) {
    const sqs = new SQS(config.SigningSecret, config.sqs);

    await schema.get('/upload/:upload/step', {
        name: 'List Steps',
        group: 'Steps',
        auth: 'user',
        description: 'Return a list of steps related to a given upload',
        ':upload': 'integer',
        query: 'req.query.ListUploadSteps.json',
        res: 'res.ListUploadSteps.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            req.query.uid = req.auth.id;
            const list = await UploadStep.list(config.pool, req.params.upload, req.query);

            res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/upload/:upload/step/:step', {
        name: 'Get Step',
        group: 'Steps',
        auth: 'user',
        description: 'Get a single upload step',
        ':upload': 'integer',
        ':step': 'integer',
        res: 'res.UploadStep.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            const step = await UploadStep.from(config.pool, req.params.upload);
            step.permission(upload);

            res.json(step.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/upload/:upload/step', {
        name: 'Create Step',
        group: 'Steps',
        auth: 'user',
        description: 'Creata a new upload step',
        ':upload': 'integer',
        res: 'res.UploadStep.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            req.body.upload_id = req.params.upload;
            const step = await UploadStep.generate(config.pool, req.body);

            return res.json(step.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/upload/:upload/step/:step', {
        name: 'Update Step',
        group: 'Steps',
        auth: 'user',
        description: 'Update information about a given upload',
        ':upload': 'integer',
        ':step': 'integer',
        body: 'req.body.PatchUploadStep.json',
        res: 'res.UploadStep.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            const step = await UploadStep.from(config.pool, req.params.step);
            step.permission(upload);

            if (step.closed) {
                throw new Err(401, null, 'Cannot edit a closed step');
            }

            if (req.body.step) req.body.step = Object.assign(step.step, req.body.step);

            await step.commit(req.body);

            if (req.body.closed === true) {
                await sqs.send(req.params.upload, step.compile(), req.auth.id, step.id);
            }

            return res.json(step.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/upload/:upload/step/:step', {
        name: 'Delete Step',
        group: 'Steps',
        auth: 'user',
        description: 'Delete a given upload step',
        ':upload': 'integer',
        ':step': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            // TODO Ensure no children steps are present
            const step = await UploadStep.from(config.pool, req.params.step);
            step.permission(upload);

            await step.delete();

            return res.json({
                status: 200,
                message: 'Deleted Upload Step'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.put('/upload/:upload/step/:step', {
        name: 'Resubmit Step',
        group: 'Steps',
        auth: 'user',
        description: 'Resubmit a step to the SQS Queue',
        ':upload': 'integer',
        ':step': 'integer',
        res: 'res.UploadStep.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            const step = await UploadStep.from(config.pool, req.params.step);
            step.permission(step);

            await sqs.send(req.params.upload, step.compile(), req.auth.id, step.id);

            return res.json(step.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
