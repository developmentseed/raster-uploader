function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE meta (
            key TEXT NOT NULL PRIMARY KEY,
            value JSONB NOT NULL,
            created TIMESTAMP NOT NULL DEFAULT NOW(),
            updated TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
