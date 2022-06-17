function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE upload_steps
            ADD COLUMN config JSONB NOT NULL DEFAULT '{}'::JSONB;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
