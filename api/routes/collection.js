import Err from '@openaddresses/batch-error';
import Collection from '../lib/types/collection.js';
import UploadSource from '../lib/types/upload-source.js';
import Auth from '../lib/auth.js';
import Rule from '../lib/aws/rule.js';
import SQS from '../lib/aws/sqs.js';
import Secret from '../lib/aws/secret.js';

export default async function router(schema, config) {
    const rule = new Rule(config.StackName, config.sqs);
    const sqs = new SQS(config.SigningSecret, config.sqs);
    const secret = new Secret(config.StackName);

    /**
     * @api {get} /api/collection List Collections
     * @apiVersion 1.0.0
     * @apiName ListCollections
     * @apiGroup Collection
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of Collections
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListCollections.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListCollections.json} apiSuccess
     */
    await schema.get('/collection', {
        query: 'req.query.ListCollections.json',
        res: 'res.ListCollections.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.uid = req.auth.id;
            const list = await Collection.list(config.pool, req.query);

            res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/collection/:collection/trigger Trigger Collection
     * @apiVersion 1.0.0
     * @apiName TriggerCollection
     * @apiGroup Collection
     * @apiPermission user
     *
     * @apiDescription
     *     Manually trigger a collection outside of set Cron rules
     *
     * @apiSchema {jsonschema=../schema/collections.json} apiSuccess
     */
    await schema.post('/collection/:collection/trigger', {
        ':collection': 'integer',
        res: 'collections.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const collection = await Collection.from(config.pool, req.params.collection);
            collection.permission(req.auth);

            const source = await UploadSource.from(config.pool, collection.source_id);
            source.permission(req.auth);

            await sqs.obtain({
                collection: collection.id,
                url: source.url,
                type: source.type,
                glob: source.glob,
                ...(await secret.from(source))
            }, req.auth.id);

            return res.json(collection.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/collection/:collection Get Collection
     * @apiVersion 1.0.0
     * @apiName GetCollection
     * @apiGroup collection
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single collection
     *
     * @apiParam {Number} collection The ID of the collection
     *
     * @apiSchema {jsonschema=../schema/collections.json} apiSuccess
     */
    await schema.get('/collection/:collection', {
        ':collection': 'integer',
        res: 'collections.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const collection = await Collection.from(config.pool, req.params.collection);
            collection.permission(req.auth);

            collection.paused = (await rule.describe(collection)).State !== 'ENABLED';

            res.json(collection.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/collection Create Collection
     * @apiVersion 1.0.0
     * @apiName CreateCollection
     * @apiGroup Collection
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new collection
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateCollection.json} apiParam
     * @apiSchema {jsonschema=../schema/collections.json} apiSuccess
     */
    await schema.post('/collection', {
        body: 'req.body.CreateCollection.json',
        res: 'collections.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.body.uid = req.auth.id;
            const paused = req.body.paused;
            delete req.body.paused;

            const source = await UploadSource.from(config.pool, req.body.source_id);
            source.permission(req.auth);

            const collection = await Collection.generate(config.pool, req.body);

            collection.paused = paused;
            await rule.create(collection);

            collection.paused = (await rule.describe(collection)).State !== 'ENABLED';

            return res.json(collection.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/collection/:collection Update Collection
     * @apiVersion 1.0.0
     * @apiName PatchCollection
     * @apiGroup Collection
     * @apiPermission user
     *
     * @apiDescription
     *     Update information about a given collection
     *
     * @apiParam {Number} collection The ID of the collection
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchCollection.json} apiParam
     * @apiSchema {jsonschema=../schema/collections.json} apiSuccess
     */
    await schema.patch('/collection/:collection', {
        ':collection': 'integer',
        body: 'req.body.PatchCollection.json',
        res: 'collections.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const collection = await Collection.from(config.pool, req.params.collection);
            collection.permission(req.auth);

            const paused = req.body.paused;
            delete req.body.paused;
            await collection.commit(req.body);

            await rule.update(collection);

            if (paused === true) await rule.disable(collection);
            if (paused === false) await rule.enable(collection);

            collection.paused = (await rule.describe(collection)).State !== 'ENABLED';

            return res.json(collection.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/collection/:collection Delete Collection
     * @apiVersion 1.0.0
     * @apiName DeleteCollection
     * @apiGroup Collection
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a given Collection
     *
     * @apiParam {Number} collection The ID of the collection
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/collection/:collection', {
        ':collection': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const collection = await Collection.from(config.pool, req.params.collection);
            collection.permission(req.auth);

            await rule.delete(collection);

            await collection.delete();

            return res.json({
                status: 200,
                message: 'Deleted Collection'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
