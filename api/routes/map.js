import Auth from '../lib/Auth.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/map Map Init
     * @apiVersion 1.0.0
     * @apiName TileJSON
     * @apiGroup Map
     * @apiPermission user
     *
     * @apiDescription
     *   Data required for map initialization
     */
    await schema.get('/map', null, async (req, res) => {
        await Auth.is_auth(req);

        return res.json({
            token: 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJjbDRpeHVmYzEwMnA2M2NwaGRyNXBjdHYzIn0.l48CI6KpfTwcBVoHTPgqXA',
            url: config.titiler
        });
    });
}
