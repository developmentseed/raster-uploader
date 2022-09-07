import Meta from './types/meta.js';
import Err from '@openaddresses/batch-error';
import Ajv from 'ajv';

const ajv = new Ajv({
    allErrors: true
});

const Defaults = {
    // Disallow new user registration
    'user::registration': {
        type: 'boolean',
        default: false
    },

    // Only allow new user registration for the given domains (ie: `@example.com`)
    'user::domains': {
        type: 'array',
        items: { type: 'string' },
        default: []
    }

};

const Compiled = {};
for (const key in Defaults) {
    Compiled[key] = ajv.compile(Defaults[key]);
}

/**
 * @class
 */
export default class Settings {
    static async generate(pool, params) {
        if (Defaults[params.key] !== undefined) {
            const valid = Compiled[params.key](params.value);
            if (!valid) throw new Err(400, null, 'Setting does not conform to schema');
        }

        return await Meta.generate(pool, params);
    }

    static async schema(key) {
        return Defaults[key];
    }

    static async patch(meta, patch) {
        if (Defaults[meta.key] !== undefined) {
            const valid = Compiled[meta.key](patch.value);
            if (!valid) throw new Err(400, null, 'Setting does not conform to schema');
        }

        return true;
    }

    static async from(pool, key) {
        try {
            return await Meta.from(pool, key);
        } catch (err) {
            if (err.status === 404 && Defaults[key] !== undefined) {
                return {
                    key,
                    value: JSON.parse(JSON.stringify(Defaults[key].default))
                };
            } else {
                throw err;
            }
        }
    }
}
