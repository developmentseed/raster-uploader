import fs from 'fs';
import { Err } from '@openaddresses/batch-schema';
import Generic from '@openaddresses/batch-generic';
import { sql } from 'slonik';

/**
 * @class
 */
export default class Uploads extends Generic {
    static _table = 'uploads';
    static _patch = JSON.parse(fs.readFileSync(new URL('../schema/req.body.PatchUpload.json', import.meta.url)));
    static _res = JSON.parse(fs.readFileSync(new URL('../schema/res.Upload.json', import.meta.url)));

    /**
     * List & Filter Uploads
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
                    uid,
                    created,
                    updated,
                    size,
                    status,
                    name
                FROM
                    uploads
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

            return this.deserialize(pgres.rows);
        } catch (err) {
            throw new Err(500, err, 'Failed to list uploads');
        }
    }
}
