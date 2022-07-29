function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE upload_sources ADD PRIMARY KEY (id);

        DELETE FROM collections;
        ALTER TABLE collections
            ADD COLUMN source_id BIGINT NOT NULL REFERENCES upload_sources(id);
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE collections
            DROP COLUMN source_id;
    `);
}

export {
    up,
    down
}
