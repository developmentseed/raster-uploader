import { Err } from '@openaddresses/batch-schema';
import Upload from '../lib/upload.js';
import UploadStep from '../lib/upload-step.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/upload/:upload/step List Steps
     * @apiVersion 1.0.0
     * @apiName ListUploadSteps
     * @apiGroup Steps
     * @apiPermission user
     *
     * @apiParam {Number} :upload The ID of the upload
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
            if (upload.uid !== req.user.id || req.user.access !== 'access') {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            }

            req.query.uid = req.auth.id;
            const list = await UploadStep.list(config.pool, req.query);

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
     * @apiParam {Number} :upload The ID of the upload
     * @apiParam {Number} :step The ID of the step
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
            if (upload.uid !== req.user.id || req.user.access !== 'access') {
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

    /**
     * @api {post} /api/:upload/step Create Step
     * @apiVersion 1.0.0
     * @apiName CreateUploadStep
     * @apiGroup Steps
     * @apiPermission user
     *
     * @apiParam {Number} :upload The ID of the upload
     *
     * @apiDescription
     *     Create a new upload step
     *
     * @apiSchema {jsonschema=../schema/res.Step.json} apiSuccess
     */
    await schema.post('/upload/:upload/step', {
        ':upload': 'integer',
        res: 'res.UploadStep.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            if (upload.uid !== req.user.id || req.user.access !== 'access') {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            }

            req.body.upload_id = req.params.upload;
            const step = UploadStep.generate(config.pool, req.body);

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
     * @apiParam {Number} :upload The ID of the upload
     * @apiParam {Number} :step The ID of the step
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

            const upload = await UploadStep.from(config.pool, req.params.upload);
            if (req.auth.access !== 'admin' && req.auth.id !== upload.uid) {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            }

            const step = UploadStep.from(config.pool, req.params.step);

            if (step.upload_id !== upload.id) {
                throw new Err(401, null, 'Upload Step does not belong to upload');
            }

            await step.commit(config.pool, null, req.body);

            return res.json(step.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/upload/:upload/step/:step Delete Step
     * @apiVersion 1.0.0
     * @apiName DeleteUploadStep
     * @apiGroup UploadStep
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a given upload step
     *
     * @apiParam {Number} :upload The ID of the upload
     * @apiParam {Number} :step The ID of the upload
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
            if (req.auth.access !== 'admin' && req.auth.id !== upload.uid) {
                throw new Err(401, null, 'Cannot access an upload you didn\'t create');
            }

            // TODO Ensure no children steps are present
            const step = UploadStep.from(config.pool, req.params.step);

            if (step.upload_id !== upload.id) {
                throw new Err(401, null, 'Upload Step does not belong to upload');
            }

            await step.delete(config.pool);

            return res.json({
                status: 200,
                message: 'Deleted Upload Step'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
