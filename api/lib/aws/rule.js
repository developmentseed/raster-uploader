import AWS from 'aws-sdk';
import { Err } from '@openaddresses/batch-schema';

/**
 * @class
 */
export default class EventRule {
    constructor(stack, sqs) {
        this.stack = stack;
        this.sqs = sqs;
    }

    async create(schedule) {
        const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

        try {
            await eb.putRule({
                Name: `${this.stack}-schedule-${schedule.id}`,
                Description: `${this.stack} Schedule: ${schedule.id}`,
                ScheduleExpression: `cron(${schedule.cron})`,
                State: 'ENABLED'
            }).promise();

        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to create rule');
        }

        try {
            await eb.putTargets({
                Rule: `${this.stack}-schedule-${schedule.id}`,
                Targets: [{
                    Id: 'default',
                    Arn: this.sqs['obtain-queue'].arn
                }]
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to add targets to rule');
        }
    }

    async update(schedule) {
        try {
            const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

            await eb.putRule({
                Name: `${this.stack}-schedule-${schedule.id}`,
                Description: `${this.stack} Schedule: ${schedule.id}`,
                ScheduleExpression: `cron(${schedule.cron})`,
                State: 'ENABLED'
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to disable rule');
        }
    }

    async delete(schedule) {
        try {
            const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

            await eb.deleteRule({
                Name: `${this.stack}-schedule-${schedule.id}`,
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to disable rule');
        }
    }

    async disable(schedule) {
        try {
            const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

            await eb.disableRule({
                Name: `${this.stack}-schedule-${schedule.id}`,
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to disable rule');
        }
    }

    async enable(schedule) {
        try {
            const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

            await eb.enableRule({
                Name: `${this.stack}-schedule-${schedule.id}`,
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to disable rule');
        }
    }
}
