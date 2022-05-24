function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE uploads (
            id          BIGSERIAL PRIMARY KEY,
            uid         BIGINT REFERENCES users(id),
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            size        BIGINT,
            status      TEXT NOT NULL DEFAULT 'Pending'
        );
    `);
}

function down(knex) {
    return knex.schema.raw(`
        DROP TABLE uploads;
    `);
}

export {
    up,
    down
}
