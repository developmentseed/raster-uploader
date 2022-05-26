import test from 'tape';
import Flight from './flight.js';
import AWS from '@mapbox/mock-aws-sdk-js';
import fsp from 'fs/promises';

const flight = new Flight();

flight.init(test);
flight.takeoff(test);
flight.user(test, 'ingalls');

test('GET: api/upload', async (t) => {
    try {
        const res = await flight.fetch('/api/upload', {
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.deepEquals(res.body, {
            total: 0,
            uploads: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/upload/1', async (t) => {
    try {
        const res = await flight.fetch('/api/upload/1', {
            auth: {
                bearer: flight.token.ingalls
            }
        }, false);

        t.deepEquals(res.body, {
            status: 404,
            message: 'uploads not found',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/upload - Missing Content-Type', async (t) => {
    try {
        const res = await flight.fetch('/api/upload', {
            method: 'POST',
            auth: {
                bearer: flight.token.ingalls
            }
        }, false);

        t.deepEquals(res.body, {
            status: 400,
            message: 'Missing Content-Type Header',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/upload', async (t) => {
    try {
        AWS.stub('S3', 'upload', async function(params) {
            assert.equal(params.Bucket, 'test');
            assert.equal(!!params.Key.includes('test/upload/'), true);

            await pipeline(
                params.Body,
                fs.createWriteStream('/dev/null')
            );

            return this.request.promise.returns(Promise.resolve({}));
        });

        const body = new FormData();
        body.append('file', new Blob(await fsp.readFile(new URL('../package.json', import.meta.url))));

        const res = await flight.fetch('/api/upload', {
            method: 'POST',
            auth: {
                bearer: flight.token.ingalls
            },
            body
        }, false);

        t.deepEquals(res.body, {
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    AWS.S3.restore();
    t.end();
});

flight.landing(test);
