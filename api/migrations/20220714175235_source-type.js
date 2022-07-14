function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE upload_sources
            ADD COLUMN type TEXT NOT NULL;
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE upload_sources
            DROP COLUMN type;
    `);
}

export {
    up,
    down
}
