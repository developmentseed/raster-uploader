import { Err } from '@openaddresses/batch-schema';
import BaseMap from '../lib/types/basemap.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/basemap List BaseMap
     * @apiVersion 1.0.0
     * @apiName ListBaseMap
     * @apiGroup BaseMap
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of basemaps
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListBaseMap.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListBaseMap.json} apiSuccess
     */
    await schema.get('/basemap', {
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

    /**
     * @api {get} /api/basemap/:basemap Get BaseMap
     * @apiVersion 1.0.0
     * @apiName GetBaseMap
     * @apiGroup BaseMap
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single basemap
     *
     * @apiParam {Number} basemap The ID of the basemap
     *
     * @apiSchema {jsonschema=../schema/res.BaseMap.json} apiSuccess
     */
    await schema.get('/basemap/:basemap', {
        ':basemap': 'integer',
        res: 'res.BaseMap.json'
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

    /**
     * @api {post} /api/basemap Create BaseMap
     * @apiVersion 1.0.0
     * @apiName CreateBaseMap
     * @apiGroup BaseMap
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new basemap
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateBaseMap.json} apiParam
     * @apiSchema {jsonschema=../schema/res.BaseMap.json} apiSuccess
     */
    await schema.post('/basemap', {
        body: 'req.body.CreateBaseMap.json',
        res: 'res.BaseMap.json'
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

    /**
     * @api {patch} /api/basemap/:basemap Update BaseMap
     * @apiVersion 1.0.0
     * @apiName PatchBaseMap
     * @apiGroup BaseMap
     * @apiPermission user
     *
     * @apiDescription
     *     Update information about a given basemap
     *
     * @apiParam {Number} basemap The ID of the basemap
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchBaseMap.json} apiParam
     * @apiSchema {jsonschema=../schema/res.BaseMap.json} apiSuccess
     */
    await schema.patch('/basemap/:basemap', {
        ':basemap': 'integer',
        body: 'req.body.PatchBaseMap.json',
        res: 'res.BaseMap.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const basemap = await BaseMap.from(config.pool, req.params.basemap);
            basemap.permission(req.auth);

            await basemap.commit(config.pool, null, req.body);

            return res.json(basemap.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/basemap/:basemap Delete BaseMap
     * @apiVersion 1.0.0
     * @apiName DeleteBaseMap
     * @apiGroup BaseMap
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a given basemap
     *
     * @apiParam {Number} basemap The ID of the basemap
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/basemap/:basemap', {
        ':basemap': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const basemap = await BaseMap.from(config.pool, req.params.basemap);
            basemap.permission(req.auth);

            await basemap.delete(config.pool);

            return res.json({
                status: 200,
                message: 'Deleted BaseMap'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
