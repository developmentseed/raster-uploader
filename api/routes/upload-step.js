import Err from '@openaddresses/batch-error';
import Upload from '../lib/types/upload.js';
import UploadStep from '../lib/types/upload-step.js';
import Auth from '../lib/auth.js';
import SQS from '../lib/aws/sqs.js';

export default async function router(schema, config) {
    const sqs = new SQS(config.SigningSecret, config.sqs);

    /**
     * @api {get} /api/upload/:upload/step List Steps
     * @apiVersion 1.0.0
     * @apiName ListUploadSteps
     * @apiGroup Steps
     * @apiPermission user
     *
     * @apiParam {Number} upload The ID of the upload
     *
     * @apiDescription
     *     Return a list of steps related to a given upload
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListUploadSteps.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListUploadSteps.json} apiSuccess
     */
    await schema.get('/upload/:upload/step', {
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

    /**
     * @api {get} /api/upload/:upload/step/:step Get Step
     * @apiVersion 1.0.0
     * @apiName GetUploadStep
     * @apiGroup Steps
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single upload step
     *
     * @apiParam {Number} upload The ID of the upload
     * @apiParam {Number} step The ID of the step
     *
     * @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
     */
    await schema.get('/upload/:upload/step/:step', {
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

    /**
     * @api {post} /api/:upload/step Create Step
     * @apiVersion 1.0.0
     * @apiName CreateUploadStep
     * @apiGroup Steps
     * @apiPermission user
     *
     * @apiParam {Number} upload The ID of the upload
     *
     * @apiDescription
     *     Create a new upload step
     *
     * @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
     */
    await schema.post('/upload/:upload/step', {
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

    /**
     * @api {patch} /api/upload/:upload/step/:step Update Step
     * @apiVersion 1.0.0
     * @apiName PatchUploadStep
     * @apiGroup Steps
     * @apiPermission user
     *
     * @apiDescription
     *     Update information about a given upload step
     *
     * @apiParam {Number} upload The ID of the upload
     * @apiParam {Number} step The ID of the step
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchUploadStep.json} apiParam
     * @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
     */
    await schema.patch('/upload/:upload/step/:step', {
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

    /**
     * @api {delete} /api/upload/:upload/step/:step Delete Step
     * @apiVersion 1.0.0
     * @apiName DeleteUploadStep
     * @apiGroup Steps
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a given upload step
     *
     * @apiParam {Number} upload The ID of the upload
     * @apiParam {Number} step The ID of the upload
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/upload/:upload/step/:step', {
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

    /**
     * @api {put} /api/upload/:upload/step/:step Resubmit Step
     * @apiVersion 1.0.0
     * @apiName PutUploadStep
     * @apiGroup Steps
     * @apiPermission user
     *
     * @apiDescription
     *     Resubmit a step to an SQS Queue
     *
     * @apiParam {Number} upload The ID of the upload
     * @apiParam {Number} step The ID of the step
     *
     * @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
     */
    await schema.put('/upload/:upload/step/:step', {
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
