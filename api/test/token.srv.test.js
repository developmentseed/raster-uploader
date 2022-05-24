import test from 'tape';
import Flight from './flight.js';

const flight = new Flight();

flight.init(test);
flight.takeoff(test);
flight.user(test, 'ingalls');
flight.user(test, 'ingalls_sub');

test('GET: api/token', async (t) => {
    try {
        const res = await flight.fetch('/api/token', {
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.deepEquals(res.body, {
            total: 0,
            tokens: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/token', async (t) => {
    try {
        const res = await flight.fetch('/api/token', {
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                name: 'Default Token'
            },
            method: 'POST'
        }, t);

        t.ok(res.body.created);
        delete res.body.created;
        t.ok(res.body.token);
        delete res.body.token;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Default Token'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/token/1', async (t) => {
    try {
        const res = await flight.fetch('/api/token/1', {
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.ok(res.body.created);
        delete res.body.created;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Default Token'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/token/1', async (t) => {
    try {
        const res = await flight.fetch('/api/token/1', {
            auth: {
                bearer: flight.token.ingalls_sub
            }
        }, false);

        t.equals(res.status, 401, 'http: 401');

        t.deepEquals(res.body, {
            status: 401,
            message: 'Cannot get a token you did not create',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/token - ensure user can\'t see other user tokens', async (t) => {
    try {
        const res = await flight.fetch('/api/token', {
            auth: {
                bearer: flight.token.ingalls_sub
            }
        }, t);

        t.deepEquals(res.body, {
            total: 0,
            tokens: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/token', async (t) => {
    try {
        const res = await flight.fetch('/api/token', {
            auth: {
                bearer: flight.token.ingalls_sub
            },
            body: {
                name: 'Default Token'
            },
            method: 'POST'
        }, t);

        t.ok(res.body.created);
        delete res.body.created;
        t.ok(res.body.token);
        delete res.body.token;

        t.deepEquals(res.body, {
            id: 2,
            name: 'Default Token'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('DELETE: api/token/1 - delete a token you didn\'t create', async (t) => {
    try {
        const res = await flight.fetch('/api/token/1', {
            auth: {
                bearer: flight.token.ingalls_sub
            },
            method: 'DELETE'
        }, false);

        t.equals(res.status, 401, 'http: 401');

        t.deepEquals(res.body, {
            status: 401,
            message: 'Cannot delete a token you did not create',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/login - test token (bad)', async (t) => {
    try {
        const tres = await flight.fetch('/api/token', {
            auth: {
                bearer: flight.token.ingalls_sub
            },
            body: {
                name: 'Default Token 2'
            },
            method: 'POST'
        }, t);

        const res = await flight.fetch('/api/login', {
            auth: {
                bearer: tres.body.token + 2
            }
        }, false);

        t.equals(res.status, 401, 'http: 401');

        t.deepEquals(res.body, {
            status: 401,
            message: 'Invalid Token',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/login - test token', async (t) => {
    try {
        const tres = await flight.fetch('/api/token', {
            auth: {
                bearer: flight.token.ingalls_sub
            },
            body: {
                name: 'Default Token 3'
            },
            method: 'POST'
        }, t);

        const res = await flight.fetch('/api/login', {
            auth: {
                bearer: tres.body.token
            }
        }, t);

        t.deepEquals(await res.body, {
            id: 2,
            username: 'ingalls_sub',
            access: 'user',
            email: 'ingalls_sub@example.com'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('DELETE: api/token/2', async (t) => {
    try {
        const res = await flight.fetch('/api/token/2', {
            auth: {
                bearer: flight.token.ingalls_sub
            },
            method: 'DELETE'
        }, t);

        t.deepEquals(res.body, {
            status: 200,
            message: 'Token Deleted'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
