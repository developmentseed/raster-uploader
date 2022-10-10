import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    await schema.get('/map', {
        name: 'Map Init',
        group: 'Map',
        auth: 'user',
        description: 'Data required for new map initialization'
    }, async (req, res) => {
        await Auth.is_auth(req);

        return res.json({
            token: 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJjbDRpeHVmYzEwMnA2M2NwaGRyNXBjdHYzIn0.l48CI6KpfTwcBVoHTPgqXA',
            url: config.titiler
        });
    });
}
