import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Meta from '../lib/types/meta.js';
import Settings from '../lib/settings.js';
import { sql } from 'slonik';

export default async function router(schema, config) {
    await schema.get('/meta', {
        name: 'List Meta',
        group: 'Meta',
        auth: 'admin',
        description: 'Return a list of metadata objects',
        query: 'req.query.ListMeta.json',
        res: 'res.ListMeta.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            res.json(await Meta.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/meta', {
        name: 'Create Meta',
        group: 'Meta',
        auth: 'Create a new metadata object',
        description: '',
        body: 'req.body.CreateMeta.json',
        res: 'meta.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            const meta = await Settings.generate(config.pool, req.body);

            return res.json(meta.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/meta/:key', {
        name: 'Update Meta',
        group: 'Meta',
        auth: 'admin',
        description: 'Update a metadata object',
        ':key': 'string',
        body: 'req.body.PatchMeta.json',
        res: 'meta.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            const meta = await Settings.from(config.pool, req.params.key);
            if (!(meta instanceof Meta)) throw new Err(400, null, 'Meta not found');

            Settings.patch(meta, req.body);
            await meta.commit({
                updated: sql`NOW()`,
                ...req.body
            });

            res.json(meta.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/meta/:key', {
        name: 'Delete Meta',
        group: 'Meta',
        auth: 'admin',
        description: 'Delete a metadata object',
        ':key': 'string',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_admin(req);

            const meta = await Meta.from(config.pool, req.params.key);
            await meta.delete();

            res.json({
                status: 200,
                message: 'Metadata Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
