import { Err } from '@openaddresses/batch-schema';
import Upload from '../lib/upload.js';
import UploadStep from '../lib/upload-step.js';
import Auth from '../lib/auth.js';
import Tile from '../lib/tile.js';
import S3 from '../lib/s3.js';
import SQS from '../lib/sqs.js';

export default async function router(schema, config) {
    const tile = new Tile(config.SigningSecret);
    const sqs = new SQS(config.SigningSecret);

    /**
     * @api {post} /api/upload/:upload/step/:step/cog/transform COG Transform
     * @apiVersion 1.0.0
     * @apiName COGTransform
     * @apiGroup Cogs
     * @apiPermission user
     *
     * @apiDescription
     *     Perform a transform step on a COG
     *
     * @apiParam {Number} upload The ID of the upload
     * @apiParam {Number} step The ID of the step
     *
     * @apiSchema {jsonschema=../schema/res.UploadStep.json} apiSuccess
     */
    await schema.post('/upload/:upload/step/:step/cog/transform', {
        ':upload': 'integer',
        ':step': 'integer',
        body: 'req.body.CreateTransform.json',
        res: 'res.UploadStep.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            const step = await UploadStep.from(config.pool, req.params.step);
            step.permission(upload);

            if (step.type !== 'cog') {
                throw new Err(401, null, 'Can only request transform on "Cog" Steps');
            }

            req.body.upload = upload.id;
            req.body.step = step.id;

            await sqs.transform(step.config, req.body, req.auth.id);

            step.closed = true;
            await step.commit(config.pool);

            return res.json(step.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/upload/:upload/step/:step/cog/download COG Download
     * @apiVersion 1.0.0
     * @apiName COGDownload
     * @apiGroup Cogs
     * @apiPermission user
     *
     * @apiDescription
     *     Download a cog
     *
     * @apiParam {Number} upload The ID of the upload
     * @apiParam {Number} step The ID of the step
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.COGDownload.json} apiParam
     */
    await schema.get('/upload/:upload/step/:step/cog/download', {
        ':upload': 'integer',
        ':step': 'integer',
        query: 'req.query.COGDownload.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req, true);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            const step = await UploadStep.from(config.pool, req.params.step);
            step.permission(upload);

            if (step.type !== 'cog') {
                throw new Err(401, null, 'Can only request info on "Cog" Steps');
            }

            const s3 = new S3({
                Bucket: config.Bucket,
                Key: `uploads/${upload.id}/step/${step.id}/final.tif`
            });

            return s3.stream(res, `upload-${upload.id}-step-${step.id}.tif`);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/upload/:upload/step/:step/cog/info COG Info
     * @apiVersion 1.0.0
     * @apiName COGInfo
     * @apiGroup Cogs
     * @apiPermission user
     *
     * @apiDescription
     *     Get information about a COG
     *
     * @apiParam {Number} upload The ID of the upload
     * @apiParam {Number} step The ID of the step
     */
    await schema.get('/upload/:upload/step/:step/cog/info', {
        ':upload': 'integer',
        ':step': 'integer'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const upload = await Upload.from(config.pool, req.params.upload);
            upload.permission(req.auth);

            const step = await UploadStep.from(config.pool, req.params.step);
            step.permission(upload);

            if (step.type !== 'cog') {
                throw new Err(401, null, 'Can only request info on "Cog" Steps');
            }

            const url = new URL('/cog/info', config.titiler);

            for (const query in req.query) {
                url.searchParams.append(query, req.query[query]);
            }

            url.searchParams.append('url', `s3://${process.env.ASSET_BUCKET}/uploads/${upload.id}/step/${step.id}/final.tif`);

            const tires = await fetch(url);
            const tibody = await tires.json();

            tibody.token = tile.token(upload.id, step.id);

            res.json(tibody);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/cog/:z/:x/:y.png COG Tile
     * @apiVersion 1.0.0
     * @apiName COGTile
     * @apiGroup Cogs
     * @apiPermission user
     *
     * @apiDescription
     *     Get a given tile from a cog
     *
     * @apiParam {Number} upload The ID of the upload
     * @apiParam {Number} step The ID of the step
     *
     * @apiParam {Number} x WMS X Coordinate
     * @apiParam {Number} y WMS Y Coordinate
     * @apiParam {Number} z WMS Z Coordinate
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.COGTile.json} apiParam
     */
    await schema.get('/cog/:z/:x/:y.png', {
        ':upload': 'integer',
        ':step': 'integer',
        ':z': 'integer',
        ':x': 'integer',
        ':y': 'integer',
        query: 'req.query.COGTile.json'
    }, async (req, res) => {
        try {
            const params = tile.verify(req.query.access);

            const url = new URL(`/cog/tiles/${req.params.z}/${req.params.x}/${req.params.y}.png`, config.titiler);
            url.searchParams.append('url', `s3://${process.env.ASSET_BUCKET}/uploads/${params.upload}/step/${params.step}/final.tif`);

            delete req.query.access;
            for (const query in req.query) {
                url.searchParams.append(query, req.query[query]);
            }

            const tires = await fetch(url);

            const blob = Buffer.from(await tires.arrayBuffer(), 'binary');

            res
                .status(tires.status)
                .set(Object.fromEntries(tires.headers))
                .send(blob);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
