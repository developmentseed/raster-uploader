function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE uploads
            ADD COLUMN obtain BOOLEAN NOT NULL DEFAULT False;

        ALTER TABLE uploads
            ADD COLUMN uploaded BOOLEAN NOT NULL DEFAULT False;
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE uploads
            DROP COLUMN obtain;

        ALTER TABLE uploads
            DROP COLUMN uploaded;
    `);
}

export {
    up,
    down
}
