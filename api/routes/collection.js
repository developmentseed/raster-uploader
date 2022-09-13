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

    await schema.get('/collection', {
        name: 'List Collections',
        group: 'Collection',
        auth: 'user',
        description: 'Return a list of collections',
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

    await schema.post('/collection/:collection/trigger', {
        name: 'Trigger Collection',
        group: 'Collection',
        auth: 'user',
        description: 'Manually trigger a collection outside of set Cron rules',
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

    await schema.get('/collection/:collection', {
        name: 'Get Collection',
        group: 'Collection',
        auth: 'user',
        description: 'Get a single collection',
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

    await schema.post('/collection', {
        name: 'Create Collection',
        group: 'Collection',
        auth: 'user',
        description: 'Create a new collection',
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

    await schema.patch('/collection/:collection', {
        name: 'Update Collection',
        group: 'Collection',
        auth: 'user',
        description: 'Update information about a given collection',
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

    await schema.delete('/collection/:collection', {
        name: 'Delete Collection',
        group: 'Collection',
        auth: 'user',
        description: 'Delete a given collection',
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
