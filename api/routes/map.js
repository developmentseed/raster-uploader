import { Err } from '@openaddresses/batch-schema';

export default async function router(schema, config) {
    /**
     * @api {get} /api/map Mapping Backend
     * @apiVersion 1.0.0
     * @apiName TileJSON
     * @apiGroup Map
     * @apiPermission public
     *
     * @apiDescription
     *   Data required for map initialization
     */
    await schema.get('/map', null, (req, res) => {
        return res.json({
            token: 'pk.eyJ1IjoiaW5nYWxscyIsImEiOiJjbDRpeHVmYzEwMnA2M2NwaGRyNXBjdHYzIn0.l48CI6KpfTwcBVoHTPgqXA'
        });
    });
}
