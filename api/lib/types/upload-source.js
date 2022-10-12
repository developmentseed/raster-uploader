import Generic from '@openaddresses/batch-generic';
import Err from '@openaddresses/batch-error';
import { sql } from 'slonik';

/**
 * @class
 */
export default class UploadSource extends Generic {
    static _table = 'upload_sources';

    /**
     * List & Filter sources
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Number} upload_id - Upload ID
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
                    name,
                    url,
                    uid,
                    type,
                    created,
                    updated
                FROM
                    upload_sources
                WHERE
                    name ~ ${query.filter}
                    AND uid = ${query.uid}
                ORDER BY
                    id ASC
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list sources');
        }
    }

    permission(auth) {
        if (this.uid !== auth.id && auth.access !== 'admin') {
            throw new Err(401, null, 'Upload Source does not belong to user');
        }
    }
}
