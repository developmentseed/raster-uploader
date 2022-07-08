function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE uploads
            ADD COLUMN starred BOOLEAN NOT NULL DEFAULT False;
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE uploads
            DROP COLUMN starred;
    `);
}

export {
    up,
    down
}
