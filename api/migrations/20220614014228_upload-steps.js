function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE upload_steps (
            id          BIGSERIAL PRIMARY KEY,
            upload_id   BIGINT NOT NULL REFERENCES uploads(id),
            parent      BIGINT,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            step        JSONB NOT NULL
        );
    `);
}

function download(knex) {
    return knex.schema.raw(`
        DROP TABLE upload_steps;
    `);
}

export {
    up,
    down
}
