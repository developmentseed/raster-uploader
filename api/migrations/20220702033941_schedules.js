function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE schedules (
            id      BIGSERIAL,
            cron    TEXT NOT NULL,
            uid     BIGINT NOT NULL REFERENCES users(id),
            name    TEXT NOT NULL
        )
    `);
}

function down(knex) {
    return knex.schema.raw(`
        DROP TABLE schedules
    `);
}

export {
    up,
    down
}
