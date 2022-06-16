function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE upload_steps
            ADD COLUMN closed BOOLEAN NOT NULL DEFAULT False;
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
