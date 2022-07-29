function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE schedules
            RENAME TO collections;
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE collections
            RENAME TO schedules;
    `);
}

export {
    up,
    down
}
