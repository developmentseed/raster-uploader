function up(knex) {
    return knex.schema.raw(`
        CREATE EXTENSION IF NOT EXISTS POSTGIS;

        CREATE TABLE users (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT NOW(),
            email       TEXT NOT NULL,
            username    TEXT NOT NULL UNIQUE,
            password    TEXT NOT NULL,
            access      TEXT NOT NULL DEFAULT 'user',
            validated   BOOLEAN NOT NULL DEFAULT False
        );

        CREATE TABLE users_reset (
            uid          BIGINT REFERENCES users(id),
            expires     TIMESTAMP NOT NULL,
            token       TEXT NOT NULL,
            action      TEXT NOT NULL
        );

        CREATE TABLE users_tokens (
            id          BIGSERIAL PRIMARY KEY,
            uid         BIGINT REFERENCES users(id),
            name        TEXT NOT NULL,
            token       TEXT NOT NULL,
            created     TIMESTAMP NOT NULL DEFAULT NOW()
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
