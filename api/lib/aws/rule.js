import AWS from 'aws-sdk';
import { Err } from '@openaddresses/batch-schema';

/**
 * @class
 */
export default class EventRule {
    constructor(stack) {
        this.stack = stack;
    }

    async create(schedule) {
        try {
            const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

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
                    Arn: `arn:aws:lambda:us-east-1:123456789012:function:MyFunction`
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
