import Err from '@openaddresses/batch-error';
import UserToken from '../lib/types/token.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/token', {
        name: 'List Tokens',
        group: 'Token',
        auth: 'user',
        description: 'List all tokens associated with the requesters account',
        query: 'req.query.ListTokens.json',
        res: 'res.ListTokens.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.uid = req.auth.id;
            return res.json(await UserToken.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.post('/token', {
        name: 'Create Token',
        group: 'Token',
        auth: 'user',
        description: 'Create a new API token for programmatic access',
        body: 'req.body.CreateToken.json',
        res: 'res.CreateToken.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.body.uid = req.auth.id;
            const token = await UserToken.generate(config.pool, req.body);

            return res.json(token.serialize(true));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.get('/token/:token_id', {
        name: 'Get Token',
        group: 'Token',
        auth: 'user',
        description: 'Get information about a single token',
        ':token_id': 'integer',
        res: 'res.Token.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            let token = await UserToken.from(config.pool, req.params.token_id);
            if (token.uid !== req.auth.id) throw new Err(401, null, 'Cannot get a token you did not create');

            token = token.serialize();
            delete token.token;
            return res.json(token);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    await schema.delete('/token/:token_id', {
        name: 'Delete Token',
        group: 'Token',
        auth: 'user',
        description: 'Delete a user\'s API Token',
        ':token_id': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const token = await UserToken.from(config.pool, req.params.token_id);
            if (token.uid !== req.auth.id) throw new Err(401, null, 'Cannot delete a token you did not create');

            await token.delete();

            return res.json({
                status: 200,
                message: 'Token Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
