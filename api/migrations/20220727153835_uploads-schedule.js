function up(knex) {
    return knex.schema.raw(`
        ALTER TABLE schedules ADD PRIMARY KEY (id);
    
        ALTER TABLE uploads
            ADD COLUMN schedule_id BIGINT REFERENCES schedules(id);
    `);
}

function down(knex) {
    return knex.schema.raw(`
        ALTER TABLE schedules DROP PRIMARY KEY (id);

        ALTER TABLE uploads
            DROP COLUMN schedule_id;
    `);
}

export {
    up,
    down
}
