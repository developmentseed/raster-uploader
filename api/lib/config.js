/**
 * @class
 */
export default class Config {
    static async env(args = {}) {
        this.args = args;
        this.silent = args.silent;

        // TODO Figure out frontend URL
        this.url = 'http://developmentseed.org';

        this.titiler = process.env.TiTiler;

        try {
            if (!process.env.AWS_DEFAULT_REGION) {
                if (!this.silent) console.error('ok - set env AWS_DEFAULT_REGION: us-east-1');
                process.env.AWS_DEFAULT_REGION = 'us-east-1';
            }

            if (!process.env.StackName || process.env.StackName === 'test') {
                if (!this.silent) console.error('ok - set env StackName: test');
                process.env.StackName = 'test';

                this.StackName = 'test';
                this.SigningSecret = '123';

                process.env.ASSET_BUCKET = 'test';
            } else {
                this.StackName = process.env.StackName;

                if (!process.env.SigningSecret) throw new Error('SigningSecret env must be set');
                if (!process.env.ASSET_BUCKET) throw new Error('ASSET_BUCKET env must be set');
                this.SigningSecret = process.env.SigningSecret;
            }
        } catch (err) {
            throw new Error(err);
        }

        return this;
    }
}
