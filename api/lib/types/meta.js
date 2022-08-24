import { Err } from '@openaddresses/batch-schema';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

/**
 * @class
 */
export default class Meta extends Generic {
    static _table = 'meta';

    /**
     * List & Filter Meta
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Object} query - Query object
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
                    key,
                    created,
                    updated,
                    value
                FROM
                    meta
                WHERE
                    key ~ ${query.filter}
                ORDER BY
                    key DESC
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list meta');
        }
    }

    /**
     * Commit a meta to the database
     *
     * @param {Pool} pool - Postgres Pool instance
     */
    async commit(pool) {
        try {
            await pool.query(sql`
                UPDATE meta
                    SET
                        value = ${JSON.stringify(this.value)},
                        updated = NOW()
                    WHERE
                        key = ${this.key}
            `);
        } catch (err) {
            throw new Err(500, err, 'failed to save meta');
        }
    }

    /**
     * Create a new Meta
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Object} params - Create Params
     * @param {String} params.key - Key of Meta
     * @param {Object} params.value - Value of Meta
     *
     * @returns {Meta}
     */
    static async generate(pool, params = {}) {
        try {
            const pgres = await pool.query(sql`
                INSERT INTO meta (
                    key,
                    value
                ) VALUES (
                    ${params.key},
                    ${JSON.stringify(params.value)}
                ) RETURNING *
            `);

            return this.deserialize(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate meta');
        }
    }

    /**
     * Delete a meta
     *
     * @param {Pool} pool - Postgres Pool instance
     *
     * @returns {meta}
     */
    async delete(pool) {
        try {
            await pool.query(sql`
                DELETE FROM meta
                    WHERE key = ${this.key}
            `);
        } catch (err) {
            throw new Err(500, err, 'Failed to generate meta');
        }
    }
}
