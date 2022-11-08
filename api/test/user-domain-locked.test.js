import test from 'tape';
import Flight from './flight.js';

const flight = new Flight();
flight.init(test);
flight.takeoff(test, {
    validate: true,
    meta: {
        'user::registration': true,
        'user::domains': [
            '@example.com'
        ]
    }
});

test('POST: api/user', async (t) => {
    try {
        const res = await flight.fetch('/api/user', {
            method: 'POST',
            body: {
                username: 'ingalls',
                password: 'password123',
                email: 'ingalls@example.com'
            }
        }, t);

        t.deepEquals(res.body, {
            id: 1,
            username: 'ingalls',
            email: 'ingalls@example.com',
            access: 'user',
            validated: false
        }, 'user');

        t.end();
    } catch (err) {
        t.error(err, 'no error');
    }
});

test('POST: api/user', async (t) => {
    try {
        const res = await flight.fetch('/api/user', {
            method: 'POST',
            body: {
                username: 'ingalls',
                password: 'password123',
                email: 'ingalls@test.com'
            }
        }, false);

        t.deepEquals(res.body, {
            status: 400,
            message: 'User Registration is restricted by email domain',
            messages: []
        }, 'user');

        t.end();
    } catch (err) {
        t.error(err, 'no error');
    }
});

flight.landing(test);
