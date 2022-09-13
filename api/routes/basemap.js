import Err from '@openaddresses/batch-error';
import BaseMap from '../lib/types/basemap.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/basemap', {
        name: 'List BaseMap',
        group: 'BaseMap',
        auth: 'user',
        description: 'Return a list of basemaps',
        query: 'req.query.ListBaseMap.json',
        res: 'res.ListBaseMap.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.uid = req.auth.id;
            const list = await BaseMap.list(config.pool, req.query);

            res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/basemap/:basemap', {
        name: 'Get BaseMap',
        group: 'BaseMap',
        auth: 'user',
        description: 'Get a single basemap',
        ':basemap': 'integer',
        res: 'basemap.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const basemap = await BaseMap.from(config.pool, req.params.basemap);
            basemap.permission(req.auth);

            res.json(basemap.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/basemap', {
        name: 'Create BaseMap',
        group: 'BaseMap',
        auth: 'user',
        description: 'Create a new basemap',
        body: 'req.body.CreateBaseMap.json',
        res: 'basemap.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.body.uid = req.auth.id;
            const basemap = await BaseMap.generate(config.pool, req.body);

            return res.json(basemap.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/basemap/:basemap', {
        name: 'Update BaseMap',
        group: 'BaseMap',
        auth: 'user',
        description: 'Update information about a given basemap',
        ':basemap': 'integer',
        body: 'req.body.PatchBaseMap.json',
        res: 'basemap.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const basemap = await BaseMap.from(config.pool, req.params.basemap);
            basemap.permission(req.auth);

            await basemap.commit(req.body);

            return res.json(basemap.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/basemap/:basemap', {
        name: 'Delete BaseMap',
        group: 'BaseMap',
        auth: 'user',
        description: 'Delete a given basemap',
        ':basemap': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const basemap = await BaseMap.from(config.pool, req.params.basemap);
            basemap.permission(req.auth);

            await basemap.delete();

            return res.json({
                status: 200,
                message: 'Deleted BaseMap'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
