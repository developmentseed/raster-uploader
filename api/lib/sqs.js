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
        try {
            if (!process.env.QUEUE) throw new Err(400, null, 'QUEUE not set');

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
}
