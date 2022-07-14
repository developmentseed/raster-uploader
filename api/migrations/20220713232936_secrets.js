function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE upload_sources (
            id          BIGSERIAL,
            name        TEXT NOT NULL,
            url         TEXT NOT NULL,
            uid         BIGINT REFERENCES users(id),
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now()
        );
    `);
}

function down(knex) {
    return knex.schema.raw(`
        DROP TABLE upload_sources;
    `);
}

export {
    up,
    down
}
