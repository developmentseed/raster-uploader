function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE collections
            ADD COLUMN glob TEXT;
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE collections
            DROP COLUMN glob;
    `);
}

export {
    up,
    down
}
