import fs from 'fs';
import Generic from '@openaddresses/batch-generic';

/**
 * @class
 */
export default class UploadStep extends Generic {
    static _table = 'upload_steps';
    static _patch = JSON.parse(fs.readFileSync(new URL('../schema/req.body.PatchUploadStep.json', import.meta.url)));
    static _res = JSON.parse(fs.readFileSync(new URL('../schema/res.UploadStep.json', import.meta.url)));
}
