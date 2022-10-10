import Err from '@openaddresses/batch-error';
import UploadSource from '../lib/types/upload-source.js';
import Auth from '../lib/auth.js';
import Secret from '../lib/aws/secret.js';

export default async function router(schema, config) {
    const secret = new Secret(config.StackName);

    await schema.get('/source', {
        name: 'List Sources',
        group: 'UploadSource',
        auth: 'user',
        description: 'Return a list of sources',
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

    await schema.get('/source/:source', {
        name: 'Get Source',
        group: 'UploadSource',
        auth: 'user',
        description: 'Get a single soruce',
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

    await schema.post('/source', {
        name: 'Create Source',
        group: 'UploadSource',
        auth: 'user',
        description: 'Create a new source',
        body: 'req.body.CreateUploadSource.json',
        res: 'res.UploadSource.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const secrets = req.body.secrets;
            delete req.body.secrets;

            req.body.uid = req.auth.id;
            const source = await UploadSource.generate(config.pool, req.body);

            await secret.create(source, secrets);

            return res.json(source.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/source/:source', {
        name: 'Update Source',
        group: 'UploadSource',
        auth: 'user',
        description: 'Update information about a given source',
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

            await source.commit(req.body);

            if (secrets) await secret.update(source, secrets);

            return res.json(source.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/source/:source', {
        name: 'Delete Source',
        group: 'UploadSource',
        auth: 'user',
        description: 'Delete a given source',
        ':source': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const source = await UploadSource.from(config.pool, req.params.source);
            source.permission(req.auth);

            await secret.delete(source);
            await source.delete();

            return res.json({
                status: 200,
                message: 'Deleted Upload Source'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
