function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE uploads
            RENAME COLUMN schedule_id
                TO collection_id;
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE uploads
            RENAME COLUMN collection_id
                TO schedule_id;
    `);
}

export {
    up,
    down
}
