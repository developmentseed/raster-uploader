import { Err } from '@openaddresses/batch-schema';
import Generic from '@openaddresses/batch-generic';
import crypto from 'crypto';
import { promisify } from 'util';
import { sql } from 'slonik';

const randomBytes = promisify(crypto.randomBytes);

/**
 * @class
 */
export default class Token extends Generic {
    static _table = 'users_tokens';

    /**
     * List & Filter Tokens
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Object} query - Query object
     * @param {Number} query.uid - Limit to a specific UID
     * @param {String} [query.filter=] - Filter tokens by name
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page to return
     */
    static async list(pool, query) {
        if (!query) query = {};
        if (!query.filter) query.filter = '';
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    id,
                    created,
                    name
                FROM
                    users_tokens
                WHERE
                    name ~ ${query.filter}
                    AND (${query.uid}::BIGINT IS NULL OR uid = ${query.uid})
                ORDER BY
                    id DESC
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres, 'tokens');
        } catch (err) {
            throw new Err(500, err, 'Failed to list tokens');
        }
    }

    /**
     * Validate a token
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {String} token Token to validate
     */
    static async validate(pool, token) {
        if (token.split('.').length !== 2 || token.split('.')[0] !== 'uploader' || token.length !== 73) {
            throw new Err(401, null, 'Invalid Token');
        }

        let pgres;
        try {
            pgres = await pool.query(sql`
                SELECT
                    users.id,
                    users.username,
                    users.access,
                    users.email
                FROM
                    users_tokens INNER JOIN users
                        ON users.id = users_tokens.uid
                WHERE
                    users_tokens.token = ${token}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to validate token');
        }

        if (!pgres.rows.length) {
            throw new Err(401, null, 'Invalid Token');
        } else if (pgres.rows.length > 1) {
            throw new Err(401, null, 'Token collision');
        }

        return {
            id: pgres.rows[0].id,
            username: pgres.rows[0].username,
            access: pgres.rows[0].access,
            email: pgres.rows[0].email
        };
    }

    /**
     * Create a new Token
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Object} params - Create Params
     * @param {Number} params.uid - User ID to assign token to
     * @param {String} params.name - Name of Token
     *
     * @returns {Token}
     */
    static async generate(pool, params = {}) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO users_tokens (
                    token,
                    created,
                    uid,
                    name
                ) VALUES (
                    ${'uploader.' + (await randomBytes(32)).toString('hex')},
                    NOW(),
                    ${params.uid},
                    ${params.name}
                ) RETURNING *
            `);

            return this.deserialize(pool, pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate token');
        }
    }
}
