import { Err } from '@openaddresses/batch-schema';
import UploadSource from '../lib/types/upload-source.js';
import Auth from '../lib/auth.js';
import AWS from 'aws-sdk';

const sm = new AWS.SecretsManager({ region: process.env.AWS_DEFAULT_REGION });

export default async function router(schema, config) {
    /**
     * @api {get} /api/source List Sources
     * @apiVersion 1.0.0
     * @apiName ListUploadSource
     * @apiGroup UploadSource
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of sources
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListUploadSources.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListUploadSources.json} apiSuccess
     */
    await schema.get('/source', {
        query: 'req.query.ListUploadSources.json',
        res: 'res.ListUploadSources.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.uid = req.auth.id;
            const list = await UploadSource.list(config.pool, req.query);

            res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/source/:source Get Source
     * @apiVersion 1.0.0
     * @apiName GetUploadSource
     * @apiGroup UploadSource
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single source
     *
     * @apiParam {Number} source The ID of the source
     *
     * @apiSchema {jsonschema=../schema/res.UploadSource.json} apiSuccess
     */
    await schema.get('/source/:source', {
        ':source': 'integer',
        res: 'res.UploadSource.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const source = await UploadSource.from(config.pool, req.params.source);
            source.permission(req.auth);

            res.json(source.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/source Create Source
     * @apiVersion 1.0.0
     * @apiName CreateUploadSource
     * @apiGroup UploadSource
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new source
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateUploadSource.json} apiParam
     * @apiSchema {jsonschema=../schema/res.UploadSource.json} apiSuccess
     */
    await schema.post('/source', {
        body: 'req.body.CreateUploadSource.json',
        res: 'res.UploadSource.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const secrets = req.body.secrets;
            delete req.body.secrets;

            req.body.uid = req.auth.id;
            const source = await UploadSource.generate(config.pool, req.body);

            await sm.createSecret({
                Name: `${config.StackName}-source-${source.id}`,
                Description: `${config.StackName} Source: ${source.id}`,
                SecretString: JSON.stringify(secrets)
            }).promise();

            return res.json(source.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/source/:source Update Source
     * @apiVersion 1.0.0
     * @apiName PatchUploadSource
     * @apiGroup UploadSource
     * @apiPermission user
     *
     * @apiDescription
     *     Update information about a given source
     *
     * @apiParam {Number} source The ID of the source
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchUploadSource.json} apiParam
     * @apiSchema {jsonschema=../schema/res.UploadSource.json} apiSuccess
     */
    await schema.patch('/source/:source', {
        ':source': 'integer',
        body: 'req.body.PatchUploadSource.json',
        res: 'res.UploadSource.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const source = await UploadSource.from(config.pool, req.params.source);
            source.permission(req.auth);

            const secrets = req.body.secrets;
            delete req.body.secrets;

            await source.commit(config.pool, null, req.body);

            if (secrets) {
                await sm.putSecretValue({
                    SecretId: `${config.StackName}-source-${source.id}`,
                    SecretString: JSON.stringify(secrets)
                }).promise();
            }

            return res.json(source.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/source/:source Delete Source
     * @apiVersion 1.0.0
     * @apiName DeleteUploadSource
     * @apiGroup UploadSource
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a given source
     *
     * @apiParam {Number} source The ID of the source
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/source/:source', {
        ':source': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const source = await UploadSource.from(config.pool, req.params.source);
            source.permission(req.auth);

            await source.delete(config.pool);

            return res.json({
                status: 200,
                message: 'Deleted Upload Source'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
