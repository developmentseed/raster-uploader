function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE upload_sources
            ADD COLUMN glob TEXT;
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE upload_sources
            DROP COLUMN glob;
    `);
}

export {
    up,
    down
}
