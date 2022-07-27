import AWS from 'aws-sdk';
import { Err } from '@openaddresses/batch-schema';
import jwt from 'jsonwebtoken';

/**
 * @class
 */
export default class SQS {
    constructor(secret, sqs) {
        this.secret = secret;
        this.sqs = sqs;
    }

    static async getQueueURL(name) {
        const sqs = new AWS.SQS({ region: process.env.AWS_DEFAULT_REGION });

        const res = await sqs.getQueueUrl({
            QueueName: name
        }).promise()

        return res.QueueURL;
    }

    async send(upload, config, uid, parent = null) {
        try {
            const token = jwt.sign({
                u: uid
            }, this.secret, {
                expiresIn: '15m'
            });

            const sqs = new AWS.SQS({ region: process.env.AWS_DEFAULT_REGION });
            await sqs.sendMessage({
                QueueUrl: this.sqs['queue'].url,
                MessageBody: JSON.stringify({
                    upload,
                    parent,
                    token,
                    config
                })
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to send message');
        }
    }

    async transform(config, transform, uid, parent = null) {
        try {
            const token = jwt.sign({
                u: uid
            }, this.secret, {
                expiresIn: '15m'
            });

            if (!config.transform) config.transform = [];

            const sqs = new AWS.SQS({ region: process.env.AWS_DEFAULT_REGION });
            await sqs.sendMessage({
                QueueUrl: this.sqs['transform-queue'].url,
                MessageBody: JSON.stringify({
                    parent,
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
        try {
            const token = jwt.sign({
                u: uid
            }, this.secret, {
                expiresIn: '15m'
            });

            const sqs = new AWS.SQS({ region: process.env.AWS_DEFAULT_REGION });
            await sqs.sendMessage({
                QueueUrl: this.sqs['obtain-queue'].url,
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
