import AWS from 'aws-sdk';
import SQS from './aws/sqs.js';

/**
 * @class
 */
export default class Config {
    async load() {
        if (this.StackName === 'test') return;

        const STS = new AWS.STS();

        try {
            const account = await STS.getCallerIdentity().promise();
            this.account = account.Account;
        } catch (err) {
            console.error(err);
        }

        for (const sqs of ['queue', 'transform-queue', 'obtain-queue']) {
            try {
                const name = `${this.StackName}-${sqs}`;

                const url = await SQS.getQueueURL(name);

                this.sqs[sqs] = {
                    url: url.QueueUrl,
                    arn: `arn:aws:sqs:${process.env.AWS_DEFAULT_REGION}:${this.account}:${name}`
                };

            } catch (err) {
                console.error(err);
            }
        }
    }

    static env(args = {}) {
        const config = new Config();

        config.sqs = {};
        config.meta = args.meta || {};

        config.silent = args.silent;
        config.email = args.email || false;
        config.validate = args.validate !== undefined ? args.validate : true;

        // TODO Figure out frontend URL
        config.url = 'http://developmentseed.org';

        config.titiler = process.env.TiTiler;

        try {
            if (!process.env.AWS_DEFAULT_REGION) {
                if (!config.silent) console.error('ok - set env AWS_DEFAULT_REGION: us-east-1');
                process.env.AWS_DEFAULT_REGION = 'us-east-1';
            }

            if (!process.env.StackName || process.env.StackName === 'test') {
                if (!config.silent) console.error('ok - set env StackName: test');
                process.env.StackName = 'test';

                config.StackName = 'test';
                config.SigningSecret = '123';

                process.env.ASSET_BUCKET = 'test';
                config.Bucket = process.env.ASSET_BUCKET;

                config.Frontend = process.env.FRONTEND_DOMAIN || 'http://localhost:4999';
                config.FromEmailAddress = process.env.FROM_EMAIL_ADDRESS;
            } else {
                if (!process.env.StackName) throw new Error('StackName env must be set');
                if (!process.env.SigningSecret) throw new Error('SigningSecret env must be set');
                if (!process.env.ASSET_BUCKET) throw new Error('ASSET_BUCKET env must be set');

                config.StackName = process.env.StackName;
                config.Bucket = process.env.ASSET_BUCKET;
                config.SigningSecret = process.env.SigningSecret;

                config.Frontend = process.env.FRONTEND_DOMAIN || 'http://raster-uploader.com';
                config.FromEmailAddress = process.env.FROM_EMAIL_ADDRESS || 'robot@raster-uploader.com';
            }
        } catch (err) {
            throw new Error(err);
        }

        return config;
    }
}
