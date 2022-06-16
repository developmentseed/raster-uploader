function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE upload_steps
            ADD COLUMN type TEXT NOT NULL;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
