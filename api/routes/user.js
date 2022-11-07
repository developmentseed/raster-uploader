import Err from '@openaddresses/batch-error';
import User from '../lib/types/user.js';
import Auth from '../lib/auth.js';
import Login from '../lib/login.js';
import Settings from './lib/settings.js';
import Email from '../lib/email.js';
import bcrypt from 'bcrypt';

export default async function router(schema, config) {
    const email = new Email(config);

    await schema.get('/user', {
        name: 'List Users',
        group: 'User',
        auth: 'user',
        description: 'Return a list of users that have registered with the service',
        query: 'req.query.ListUsers.json',
        res: 'res.ListUsers.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const list = await User.list(config.pool, req.query);

            res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/user', {
        name: 'Create User',
        group: 'User',
        auth: 'public',
        description: 'Create a new user',
        body: 'req.body.CreateUser.json',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            const has_password = !!req.body.password;

            if (!(await Settings.from(config.pool, 'user::registration')).value && req.user.access !== 'admin') {
                throw new Err(400, null, 'User Registration has been disabled');
            }

            const domains = (await Settings.from(config.pool, 'user::domains')).value;

            if (domains.length) {
                let matched = false;
                for (const domain of domains) {
                    if (req.body.email.endsWith(domain)) matched = true;
                }

                if (!matched) throw new Err(400, null, 'User Registration is restricted by email domain');
            }

            if (req.auth.access !== 'admin') {
                delete req.body.access;
            }

            // Generate a temporary random password - can't actually be used as the user still has
            // to verify email (unless the server is in auto-validate mode)

            const usr = await User.generate(config.pool, {
                ...req.body,
                password: await bcrypt.hash(req.body.password || (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)), 10)
            });

            let token;
            if (has_password) {
                const forgot = await Login.forgot(config.pool, usr.username, 'verify');
                token = forgot.token;

                if (config.email) {
                    await email.verify({
                        username: usr.username,
                        email: usr.email,
                        token
                    });
                }
            } else {
                const forgot = await Login.forgot(config.pool, usr.username, 'reset');
                token = forgot.token;

                if (config.email) {
                    await email.forgot({
                        username: usr.username,
                        email: usr.email,
                        token
                    });
                }
            }

            if (!config.validate) {
                await usr.commit({
                    validated: true
                });
            }

            return res.json({
                id: usr.id,
                username: usr.username,
                email: usr.email,
                access: usr.access,
                validated: usr.validated
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.patch('/user/:uid', {
        name: 'Update User',
        group: 'User',
        auth: 'admin',
        description: 'Update information about a given user - or allow a user to update their own information',
        ':uid': 'integer',
        body: 'req.body.PatchUser.json',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            if (req.auth.access !== 'admin' && req.auth.id !== req.params.uid) {
                throw new Err(401, null, 'You can only edit your own user account');
            }

            // Only admins can change access or set validated
            if (req.auth.access !== 'admin') {
                delete req.body.access;
                delete req.body.validated;
            }

            const usr = await User.from(config.pool, req.params.uid);
            await usr.commit(req.body);

            return res.json({
                id: usr.id,
                username: usr.username,
                email: usr.email,
                access: usr.access,
                validated: usr.validated
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
