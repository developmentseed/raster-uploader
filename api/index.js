import fs from 'fs';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import express from 'express';
import minify from 'express-minify';
import history from 'connect-history-api-fallback';
import bodyparser from 'body-parser';
import { Schema, Err } from '@openaddresses/batch-schema';
import { Pool } from '@openaddresses/batch-generic';
import minimist from 'minimist';

import User from './lib/types/user.js';
import Token from './lib/types/token.js';
import Config from './lib/config.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)));
const args = minimist(process.argv, {
    boolean: ['help', 'silent'],
    string: ['postgres']
});

if (import.meta.url === `file://${process.argv[1]}`) {
    const config = Config.env(args);
    await config.load();
    await server(config);
}

/**
 * @apiDefine admin Admin
 *   The user must be an admin to use this endpoint
 */
/**
 * @apiDefine user User
 *   A user must be logged in to use this endpoint
 */
/**
 * @apiDefine public Public
 *   This API endpoint does not require authentication
 */

export default async function server(config) {
    config.pool = await Pool.connect(process.env.POSTGRES || args.postgres || 'postgres://postgres@localhost:5432/uploader', {
        parsing: {
            geometry: true
        },
        schemas: {
            dir: new URL('./schema', import.meta.url)
        }
    });

    const app = express();

    const schema = new Schema(express.Router(), {
        schemas: String(new URL('./schema', import.meta.url)).replace('file://', '')
    });

    app.disable('x-powered-by');
    app.use(cors({
        origin: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));

    app.use(minify());

    /**
     * @api {get} /api Get Metadata
     * @apiVersion 1.0.0
     * @apiName Meta
     * @apiGroup Server
     * @apiPermission public
     *
     * @apiDescription
     *     Return basic metadata about server configuration
     *
     * @apiSchema {jsonschema=./schema/res.Meta.json} apiSuccess
     */
    app.get('/api', (req, res) => {
        return res.json({
            version: pkg.version,
            assets: {
                bucket: config.Bucket
            },
            limits: {
                compression: [
                    '.zip',
                    '.tar',
                    '.gz'
                ],
                extensions: [
                    '.zip',  // Archive  - https://en.wikipedia.org/wiki/ZIP_(file_format)
                    '.nc',   // NetCDF   - https://en.wikipedia.org/wiki/NetCDF
                    '.tif',  // Tiff
                    '.h5',
                    '.hdf5',
                    '.he5'
                ]
            }
        });
    });

    app.use('/api', schema.router);
    app.use('/docs', express.static('./doc'));

    schema.router.use(bodyparser.urlencoded({ extended: true }));
    schema.router.use(morgan('combined'));
    schema.router.use(bodyparser.json({
        limit: '50mb'
    }));

    schema.router.use(async (req, res, next) => {
        if (req.header('authorization')) {
            const authorization = req.header('authorization').split(' ');

            if (authorization[0].toLowerCase() !== 'bearer') {
                return res.status(401).json({
                    status: 401,
                    message: 'Only "Bearer" authorization header is allowed'
                });
            }

            if (!authorization[1]) {
                return res.status(401).json({
                    status: 401,
                    message: 'No bearer token present'
                });
            }

            if (authorization[1].split('.')[0] === 'uploader') {
                try {
                    req.auth = await Token.validate(config.pool, authorization[1]);
                    req.auth.type = 'token';
                } catch (err) {
                    return Err.respond(err, res);
                }
            } else {
                try {
                    const decoded = jwt.verify(authorization[1], config.SigningSecret);
                    if (decoded.type === 'machine') {
                        req.auth = {
                            access: 'machine'
                        };
                    } else {
                        req.auth = await User.from(config.pool, decoded.u);
                        req.auth.type = 'session';
                    }
                } catch (err) {
                    console.error(err);
                    return Err.respond(new Err(401, err, 'Invalid Token'), res);
                }
            }
        } else if (req.query.token) {
            try {
                if (req.query.token[0] === 'e') {
                    const decoded = jwt.verify(req.query.token, config.SigningSecret);
                    req.token = await User.from(config.pool, decoded.u);
                    req.token.type = 'session';
                } else {
                    req.token = await Token.validate(config.pool, req.query.token);
                    req.token.type = 'token';
                }
            } catch (err) {
                console.error(err);
                return Err.respond(new Err(401, err, 'Invalid Token'), res);
            }
        } else {
            req.user = false;
        }

        return next();
    });

    await schema.api();
    await schema.load(
        String(new URL('./routes/', import.meta.url)).replace('file://', ''),
        config,
        {
            silent: !!config.silent
        }
    );
    schema.not_found();
    schema.error();

    app.use(history({
        rewrites: [{
            from: /.*\/js\/.*$/,
            to: function(context) {
                return context.parsedUrl.pathname.replace(/.*\/js\//, '/js/');
            }
        },{
            from: /.*$/,
            to: function(context) {
                const parse = path.parse(context.parsedUrl.path);
                if (parse.ext) {
                    return context.parsedUrl.pathname;
                } else {
                    return '/';
                }
            }
        }]
    }));
    app.use(express.static('web/dist'));

    return new Promise((resolve, reject) => {
        const srv = app.listen(4999, (err) => {
            if (err) return reject(err);

            if (!config.silent) console.log('ok - http://localhost:4999');
            return resolve(srv);
        });
    });
}
