function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE basemap (
            id          BIGSERIAL,
            name        TEXT NOT NULL,
            uid         BIGINT REFERENCES users(id),
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            url         TEXT NOT NULL
        );
    `);
}

function down(knex) {
    return knex.schema.raw(`
        DROP TABLE basemap;
    `);
}

export {
    up,
    down
}
