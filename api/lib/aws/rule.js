import AWS from 'aws-sdk';
import { Err } from '@openaddresses/batch-schema';

/**
 * @class
 */
export default class EventRule {
    async create(schedule) {
        try {
            const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

            await eb.putRule({
                Name: ``
                Description: ``
                ScheduleExpression: `cron(${schedule.cron})`,
                State: 'ENABLED'
            }).promise();

        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to create rule');
        }

        try {
            await eb.putTargets({
                Rule: ``,
                Targets: [{

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
                Name: ``
                Description: ``
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
                Name: ``
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to disable rule');
        }
    }

    async disable(schedule) {
        try {
            const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

            await eb.disableRule({
                Name: ``
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to disable rule');
        }
    }

    async enable(schedule) {
        try {
            const eb = new AWS.EventBridge({ region: process.env.AWS_DEFAULT_REGION });

            await eb.enableRule({
                Name: ``
            }).promise();
        } catch (err) {
            throw new Err(500, new Error(err), 'Failed to disable rule');
        }
    }
}
