import fs from 'fs';
import Generic from '@openaddresses/batch-generic';
import { Err } from '@openaddresses/batch-schema';
import { sql } from 'slonik';

/**
 * @class
 */
export default class UploadStep extends Generic {
    static _table = 'upload_steps';
    static _patch = JSON.parse(fs.readFileSync(new URL('../schema/req.body.PatchUploadStep.json', import.meta.url)));
    static _res = JSON.parse(fs.readFileSync(new URL('../schema/res.UploadStep.json', import.meta.url)));

    /**
     * List & Filter steps
     *
     * @param {Pool} pool - Postgres Pool instance
     * @param {Number} upload_id - Upload ID
     * @param {Object} query - Query object
     * @param {Number} query.uid - Limit to a specific UID
     * @param {String} [query.filter=] - Filter tokens by name
     * @param {Number} [query.limit=100] - Max number of results to return
     * @param {Number} [query.page=0] - Page to return
     */
    static async list(pool, upload_id, query) {
        if (!query) query = {};
        if (!query.filter) query.filter = '';
        if (!query.limit) query.limit = 100;
        if (!query.page) query.page = 0;

        try {
            const pgres = await pool.query(sql`
                SELECT
                    count(*) OVER() AS count,
                    id,
                    upload_id,
                    created,
                    step,
                    type,
                    config,
                    closed
                FROM
                    upload_steps
                WHERE
                    upload_id = ${upload_id}
                ORDER BY
                    id ASC
                LIMIT
                    ${query.limit}
                OFFSET
                    ${query.limit * query.page}
            `);

            return this.deserialize_list(pgres);
        } catch (err) {
            throw new Err(500, err, 'Failed to list steps');
        }
    }

    /**
     * Update config object with the step object applied
     *
     * @returns {Object} Config Object
     */
    compile() {
        if (this.type === 'selection') {
            this.config[this.step.variable] = this.step.selection;
        }

        return this.config;
    }
}
