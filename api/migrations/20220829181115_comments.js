function up(knex) {
    return knex.schema.raw(`
        COMMENT ON TABLE basemap IS 'Basemaps that can be used underneath generated raster data for viz purposes';
        COMMENT ON COLUMN basemap.id IS 'Unique ID';
        COMMENT ON COLUMN basemap.name IS 'Human Readable Name';
        COMMENT ON COLUMN basemap.uid IS 'User ID that basemap belongs to';
        COMMENT ON COLUMN basemap.created IS 'Timestamp at which basemap was created';
        COMMENT ON COLUMN basemap.updated IS 'Timestamp at which basemap was updated';
        COMMENT ON COLUMN basemap.url IS 'WMS URL of basemap';

        COMMENT ON TABLE collections IS 'Collections are sets of uploads generated from the same config';
        COMMENT ON COLUMN collections.id IS 'Unique ID';
        COMMENT ON COLUMN collections.cron IS 'AWS Cron schedule for running the collection';
        COMMENT ON COLUMN collections.uid IS 'User ID that the collection belongs to';
        COMMENT ON COLUMN collections.name IS 'Human Readable Name';
        COMMENT ON COLUMN collections.created IS 'Timestamp at which collection was created';
        COMMENT ON COLUMN collections.updated IS 'Timestamp at which collection was updated';
        COMMENT ON COLUMN collections.source_id IS 'Source from which the collection is pulling data';

        COMMENT ON TABLE meta IS 'Meta provides server-wide configuration options';
        COMMENT ON COLUMN meta.key IS 'Meta Key';
        COMMENT ON COLUMN meta.value IS 'Meta Value';
        COMMENT ON COLUMN meta.created IS 'Timestamp at which meta was created';
        COMMENT ON COLUMN meta.updated IS 'Timestamp at which meta was updated';

        COMMENT ON TABLE upload_sources IS 'Upload Sources provide locations where data can be pulled from';
        COMMENT ON COLUMN upload_sources.id IS 'Unique ID';
        COMMENT ON COLUMN upload_sources.name IS 'Human Readable Name';
        COMMENT ON COLUMN upload_sources.url IS 'URL to the source data';
        COMMENT ON COLUMN upload_sources.uid IS 'User ID that the upload source belongs to';
        COMMENT ON COLUMN meta.created IS 'Timestamp at which upload source was created';
        COMMENT ON COLUMN meta.updated IS 'Timestamp at which upload source was updated';
        COMMENT ON COLUMN upload_sources.type IS 'Type of upload source';
        COMMENT ON COLUMN upload_sources.glob IS 'Glob for filtering data to a subset of the data found in the upload source';

        COMMENT ON TABLE upload_steps IS 'Upload Steps are config mutations performed on the way to a COG and transforms applied after';
        COMMENT ON COLUMN upload_steps.id IS 'Unique ID';
        COMMENT ON COLUMN upload_steps.upload_id IS 'Upload the step belongs to';
        COMMENT ON COLUMN upload_steps.parent IS 'Parent Step used to pre-populate the current step';
        COMMENT ON COLUMN upload_steps.created IS 'Timestamp at which upload step was created';
        COMMENT ON COLUMN upload_steps.step IS 'Step Object used by the frontend for obtaining input';
        COMMENT ON COLUMN upload_steps.type IS 'Type of Step Object';
        COMMENT ON COLUMN upload_steps.closed IS 'Has user input been obained to start the next step';
        COMMENT ON COLUMN upload_steps.config IS 'Processing Config used by the Identify Task';

        COMMENT ON TABLE uploads IS 'Uploads are the backbone of the service and represent a contain for transforming an input source into a usable COG';
        COMMENT ON COLUMN uploads.id IS 'Unique ID';
        COMMENT ON COLUMN uploads.uid IS 'User ID that the upload belongs to';
        COMMENT ON COLUMN uploads.created IS 'Timestamp at which upload step was created';
        COMMENT ON COLUMN uploads.updated IS 'Timestamp at which upload step was updated';
        COMMENT ON COLUMN uploads.size IS 'Size of the Upload in bytes';
        COMMENT ON COLUMN uploads.status IS 'Status of the Upload';
        COMMENT ON COLUMN uploads.name IS 'Human Readable Name';
        COMMENT ON COLUMN uploads.config IS 'Initial Upload Config';
        COMMENT ON COLUMN uploads.archived IS 'Has the Upload been archived';
        COMMENT ON COLUMN uploads.obtain IS 'Is the Upload currently being obtained before being processed (ie: not a manual upload via the UI)';
        COMMENT ON COLUMN uploads.uploaded IS 'Has the file been uploaded to the datastore';
        COMMENT ON COLUMN uploads.starred IS 'Has the upload been starred as a favourite';
        COMMENT ON COLUMN uploads.collection_id IS 'If the upload is part of a collection, the ID of the collection';

        COMMENT ON TABLE users IS 'Users';
        COMMENT ON COLUMN users.id IS 'Unique ID';
        COMMENT ON COLUMN users.created IS 'Timestamp at which upload step was created';
        COMMENT ON COLUMN users.email IS 'The email of the user';
        COMMENT ON COLUMN users.username IS 'The unique username of the user';
        COMMENT ON COLUMN users.password IS 'The password of the user';
        COMMENT ON COLUMN users.access IS 'The access level of the user';
        COMMENT ON COLUMN users.validated IS 'Has the user validated their email';

        COMMENT ON TABLE users_reset IS 'Internal table for User reset tokens';
        COMMENT ON COLUMN users_reset.uid IS 'User ID that the reset belongs to';
        COMMENT ON COLUMN users_reset.expires IS 'Timestamp at which the reset expires';
        COMMENT ON COLUMN users_reset.token IS 'User Reset Token';
        COMMENT ON COLUMN users_reset.action IS 'Type of reset';

        COMMENT ON TABLE users_tokens IS 'API Tokens';
        COMMENT ON COLUMN users_tokens.id IS 'Unique ID';
        COMMENT ON COLUMN users_tokens.uid IS 'User ID that the API Token belongs to';
        COMMENT ON COLUMN users_tokens.name IS 'Human Readable Name';
        COMMENT ON COLUMN users_tokens.token IS 'API Token';
        COMMENT ON COLUMN users_tokens.created IS 'Timestamp at which API Token was created';
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
