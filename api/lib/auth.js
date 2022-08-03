import { Err } from '@openaddresses/batch-schema';

/**
 * @class
 */
export default class Auth {
    /**
     * Is the user authenticated
     *
     * @param {Object} req Express Request
     * @param {boolean} token Should URL query tokens be allowed (usually only for downloads)
     */
    static async is_auth(req, token = false) {
        if (token && req.token) req.auth = req.token;

        if (!req.auth || !req.auth.access || !['session', 'token'].includes(req.auth.type)) {
            throw new Err(403, null, 'Authentication Required');
        }

        if (req.auth.access === 'disabled') {
            throw new Err(403, null, 'Account Disabled - Please Contact Us');
        }

        if (req.auth.access === 'machine') {
            throw new Err(403, null, 'Machine token has restricted access');
        }

        return true;
    }

    static async is_machine(req) {
        if (!req.auth || !req.auth.access || req.auth.access !== 'machine') {
            throw new Err(403, null, 'Machine token required');
        }

        return true;
    }

    static async is_admin(req) {
        if (!req.auth || !req.auth.access || req.auth.access !== 'admin') {
            throw new Err(403, null, 'Admin token required');
        }

        return true;
    }
}
