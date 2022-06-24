import { Err } from '@openaddresses/batch-schema';
import jwt from 'jsonwebtoken';

/**
 * @class
 */
export default class Tile {
    constructor(secret) {
        this.secret = secret;
    }

    token(upload_id, step_id) {
        try {
            const token = jwt.sign({
                upload: upload_id,
                step: step_id
            }, this.secret, {
                expiresIn: '60m'
            });

            return token;
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to generate token');
        }
    }

    verify(token) {
        const decoded = jwt.verify(token, this.secret);
        return decoded;
    }
}
