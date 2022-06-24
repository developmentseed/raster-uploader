function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE uploads
            ADD COLUMN archived BOOLEAN NOT NULL DEFAULT False;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
