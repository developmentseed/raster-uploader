import test from 'tape';
import Flight from './flight.js';
import AWS from '@mapbox/mock-aws-sdk-js';

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
        AWS.stub('SecretsManager', 'createSecret', async function(params) {
            t.equals(params.Name, 'test-source-1');
            t.equals(params.Description, 'test Source: 1');
            t.deepEquals(JSON.parse(params.SecretString), {
                aws_access_key_id: '123',
                aws_secret_access_key: '123'
            });

            return this.request.promise.returns(Promise.resolve({}));
        });

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
                    aws_access_key_id: '123',
                    aws_secret_access_key: '123'
                }
            }
        }, t);

        t.ok(res.body.created);
        delete res.body.created;
        t.ok(res.body.updated);
        delete res.body.updated;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Test Source',
            url: 's3://bucket/',
            uid: 1,
            type: 's3',
            glob: '**/*.tiff'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    AWS.SecretsManager.restore();

    t.end();
});

test('GET: api/source', async (t) => {
    try {
        const res = await flight.fetch('/api/source', {
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.ok(res.body.upload_sources[0].created);
        delete res.body.upload_sources[0].created;
        t.ok(res.body.upload_sources[0].updated);
        delete res.body.upload_sources[0].updated;

        t.deepEquals(res.body, {
            total: 1,
            upload_sources: [{
                id: 1,
                name: 'Test Source',
                url: 's3://bucket/',
                uid: 1,
                type: 's3'
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
                name: 'Test (Updated) Source'
            }
        }, t);

        t.ok(res.body.created);
        delete res.body.created;
        t.ok(res.body.updated);
        delete res.body.updated;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Test (Updated) Source',
            url: 's3://bucket/',
            uid: 1,
            type: 's3',
            glob: '**/*.tiff'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('PATCH: api/source/1 - new secret', async (t) => {
    try {
        AWS.stub('SecretsManager', 'putSecretValue', async function(params) {
            t.equals(params.SecretId, 'test-source-1');
            t.deepEquals(JSON.parse(params.SecretString), {
                aws_access_key_id: '321',
                aws_secret_access_key: '321'
            });

            return this.request.promise.returns(Promise.resolve({}));
        });

        const res = await flight.fetch('/api/source/1', {
            method: 'PATCH',
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                secrets: {
                    aws_access_key_id: '321',
                    aws_secret_access_key: '321'
                }
            }
        }, t);

        t.ok(res.body.created);
        delete res.body.created;
        t.ok(res.body.updated);
        delete res.body.updated;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Test (Updated) Source',
            url: 's3://bucket/',
            uid: 1,
            type: 's3',
            glob: '**/*.tiff'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('DELETE: api/source/1', async (t) => {
    try {
        AWS.stub('SecretsManager', 'deleteSecret', async function(params) {
            t.equals(params.SecretId, 'test-source-1');

            return this.request.promise.returns(Promise.resolve({}));
        });

        const res = await flight.fetch('/api/source/1', {
            method: 'DELETE',
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.deepEquals(res.body, {
            status: 200,
            message: 'Deleted Upload Source'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    AWS.SecretsManager.restore();
    t.end();
});

flight.landing(test);
