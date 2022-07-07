import AWS from 'aws-sdk';
import { Err } from '@openaddresses/batch-schema';
import jwt from 'jsonwebtoken';

/**
 * @class
 */
export default class SQS {
    constructor(secret) {
        this.sqs = new AWS.SQS({ region: process.env.AWS_DEFAULT_REGION });
        this.secret = secret;
    }

    async send(upload, config, uid) {
        if (!process.env.QUEUE) throw new Err(400, null, 'QUEUE not set');

        try {
            const token = jwt.sign({
                u: uid
            }, this.secret, {
                expiresIn: '15m'
            });

            await this.sqs.sendMessage({
                QueueUrl: process.env.QUEUE,
                MessageBody: JSON.stringify({
                    upload,
                    token,
                    config
                })
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to send message');
        }
    }

    async transform(config, transform, uid) {
        if (!process.env.TRANSFORM_QUEUE) throw new Err(400, null, 'TRANSFORM_QUEUE not set');

        try {
            const token = jwt.sign({
                u: uid
            }, this.secret, {
                expiresIn: '15m'
            });

            if (!config.transform) config.transform = [];

            await this.sqs.sendMessage({
                QueueUrl: process.env.TRANSFORM_QUEUE,
                MessageBody: JSON.stringify({
                    token,
                    config,
                    transform
                })
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to send message');
        }
    }

    async obtain(config, uid) {
        if (!process.env.OBTAIN_QUEUE) throw new Err(400, null, 'OBTAIN_QUEUE not set');

        try {
            const token = jwt.sign({
                u: uid
            }, this.secret, {
                expiresIn: '15m'
            });

            await this.sqs.sendMessage({
                QueueUrl: process.env.OBTAIN_QUEUE,
                MessageBody: JSON.stringify({
                    token,
                    config
                })
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to send message');
        }
    }
}
