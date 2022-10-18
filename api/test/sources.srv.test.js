import test from 'tape';
import Flight from './flight.js';
import AWS from '@mapbox/mock-aws-sdk-js';
import fs from 'fs';
import fsp from 'fs/promises';
import { pipeline } from 'stream/promises';

const flight = new Flight();

flight.init(test);
flight.takeoff(test);
flight.user(test, 'ingalls');

test('GET: api/source', async (t) => {
    try {
        const res = await flight.fetch('/api/source', {
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.deepEquals(res.body, {
            total: 0,
            upload_sources: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/source/1 - no source found', async (t) => {
    try {
        const res = await flight.fetch('/api/source/1', {
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.deepEquals(res.body, {
            status: 404,
            message: 'upload_sources not found',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('DELETE: api/source/1 - no source found', async (t) => {
    try {
        const res = await flight.fetch('/api/source/1', {
            method: 'DELETE',
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.deepEquals(res.body, {
            status: 404,
            message: 'upload_sources not found',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('PATCH: api/source/1 - no source found', async (t) => {
    try {
        const res = await flight.fetch('/api/source/1', {
            method: 'PATCH',
            body: {},
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.deepEquals(res.body, {
            status: 404,
            message: 'upload_sources not found',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/source', async (t) => {
    try {
        const res = await flight.fetch('/api/source', {
            method: 'POST',
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                name: 'Test Source',
                url: 's3://bucket/',
                glob: '**/*.tiff',
                type: 's3',
                secrets: {

                }
            }
        }, t);

        t.ok(res.body.created);
        delete res.body.created;
        t.ok(res.body.updated);
        delete res.body.updated;

        t.deepEquals(res.body, {
            id: 1,
            uid: 1,
            name: 'Test Basemap',
            url: 'https://example.com/{z}/{x}/{y}.png'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/source', async (t) => {
    try {
        const res = await flight.fetch('/api/source', {
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.ok(res.body.source[0].created);
        delete res.body.source[0].created;
        t.ok(res.body.source[0].updated);
        delete res.body.source[0].updated;

        t.deepEquals(res.body, {
            total: 1,
            source: [{
                id: 1,
                uid: 1,
                name: 'Test Basemap',
                url: 'https://example.com/{z}/{x}/{y}.png'
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('PATCH: api/source/1', async (t) => {
    try {
        const res = await flight.fetch('/api/source/1', {
            method: 'PATCH',
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                name: 'Test (Updated) Basemap',
                url: 'https://example2.com/{z}/{x}/{y}.png'
            }
        }, t);

        t.ok(res.body.created);
        delete res.body.created;
        t.ok(res.body.updated);
        delete res.body.updated;

        t.deepEquals(res.body, {
            id: 1,
            uid: 1,
            name: 'Test (Updated) Basemap',
            url: 'https://example2.com/{z}/{x}/{y}.png'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('DELETE: api/source/1', async (t) => {
    try {
        const res = await flight.fetch('/api/source/1', {
            method: 'DELETE',
            auth: {
                bearer: flight.token.ingalls
            },
        }, t);

        t.deepEquals(res.body, {
            status: 200,
            message: 'Deleted BaseMap'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
