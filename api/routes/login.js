import Err from '@openaddresses/batch-error';
import Auth from '../lib/auth.js';
import Login from '../lib/login.js';
import Email from '../lib/email.js';

export default async function router(schema, config) {
    const email = new Email(config);

    await schema.get('/login', {
        name: 'Session Info',
        group: 'Login',
        auth: 'user',
        description: 'REturn information about the currently logged in user',
        res: 'res.Login.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json({
                id: req.auth.id,
                username: req.auth.username,
                email: req.auth.email,
                access: req.auth.access,
                validated: req.auth.validated
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/login', {
        name: 'Create Session',
        group: 'Login',
        auth: 'user',
        description: 'Log a user into the service and create an auth cookie',
        body: 'req.body.CreateLogin.json',
        res: 'res.Login.json'
    }, async (req, res) => {
        try {
            req.auth = await Login.attempt(config.pool, {
                username: req.body.username,
                password: req.body.password
            }, config.SigningSecret);

            return res.json({
                id: req.auth.id,
                username: req.auth.username,
                email: req.auth.email,
                access: req.auth.access,
                token: req.auth.token
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/login/verify', {
        name: 'Verify User',
        group: 'Login',
        auth: 'public',
        description: 'Email verification of a new user',
        body: 'req.body.VerifyLogin.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Login.verify(config.pool, req.body.token);

            return res.json({
                status: 200,
                message: 'User Verified'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/login/forgot', {
        name: 'Forgot Login',
        group: 'Login',
        auth: 'public',
        description: 'If a user has forgotten their password, send a password reset link to their email',
        body: 'req.body.ForgotLogin.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            const reset = await Login.forgot(config.pool, req.body.username); // Username or email

            if (config.email) {
                await email.forgot(reset);
            }

            // To avoid email scraping - this will always return true, regardless of success
            return res.json({
                status: 200,
                message: 'Password Email Sent'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/login/reset', {
        name: 'Reset Login',
        group: 'Login',
        auth: 'public',
        description: 'Once a user has obtained a password reset by email via the Forgot Login API, use the token to reset the password',
        body: 'req.body.ResetLogin.json',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Login.reset(config.pool, {
                token: req.body.token,
                password: req.body.password
            });

            return res.json({
                status: 200,
                message: 'User Reset'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
