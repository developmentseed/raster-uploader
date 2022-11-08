import test from 'tape';
import Flight from './flight.js';

const flight = new Flight();
flight.init(test);
flight.takeoff(test, {
    validate: true,
    meta: {
        'user::registration': false
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
        }, false);

        t.deepEquals(res.body, {
            status: 400,
            message: 'User Registration has been disabled',
            messages: []
        }, 'user');

        t.end();
    } catch (err) {
        t.error(err, 'no error');
    }
});

flight.landing(test);
