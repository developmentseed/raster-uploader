import { Err } from '@openaddresses/batch-schema';
import Schedule from '../lib/types/schedule.js';
import Auth from '../lib/auth.js';
import Rule from '../lib/aws/rule.js';

export default async function router(schema, config) {
    const rule = new Rule(config.StackName, config.sqs);

    /**
     * @api {get} /api/schedule List Schedules
     * @apiVersion 1.0.0
     * @apiName ListSchedules
     * @apiGroup Schedule
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of Schedules
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListSchedules.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListSchedules.json} apiSuccess
     */
    await schema.get('/schedule', {
        query: 'req.query.ListSchedules.json',
        res: 'res.ListSchedules.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.uid = req.auth.id;
            const list = await Schedule.list(config.pool, req.query);

            res.json(list);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/schedule/:schedule Get Schedule
     * @apiVersion 1.0.0
     * @apiName GetSchedule
     * @apiGroup schedule
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single schedule
     *
     * @apiParam {Number} schedule The ID of the schedule
     *
     * @apiSchema {jsonschema=../schema/res.Schedule.json} apiSuccess
     */
    await schema.get('/schedule/:schedule', {
        ':schedule': 'integer',
        res: 'res.Schedule.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const schedule = await Schedule.from(config.pool, req.params.schedule);
            schedule.permission(req.auth);

            schedule.paused = (await rule.describe(schedule)).State !== 'ENABLED';

            res.json(schedule.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/schedule Create Schedule
     * @apiVersion 1.0.0
     * @apiName CreateSchedule
     * @apiGroup Schedule
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new schedule
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateSchedule.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Schedule.json} apiSuccess
     */
    await schema.post('/schedule', {
        body: 'req.body.CreateSchedule.json',
        res: 'res.Schedule.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.body.uid = req.auth.id;
            const paused = req.body.paused;
            delete req.body.paused;
            const schedule = await Schedule.generate(config.pool, req.body);

            schedule.paused = paused;
            await rule.create(schedule);

            schedule.paused = (await rule.describe(schedule)).State !== 'ENABLED';

            return res.json(schedule.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/schedule/:schedule Update Schedule
     * @apiVersion 1.0.0
     * @apiName PatchSchedule
     * @apiGroup Schedule
     * @apiPermission user
     *
     * @apiDescription
     *     Update information about a given schedule
     *
     * @apiParam {Number} schedule The ID of the schedule
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchSchedule.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Schedule.json} apiSuccess
     */
    await schema.patch('/schedule/:schedule', {
        ':schedule': 'integer',
        body: 'req.body.PatchSchedule.json',
        res: 'res.Schedule.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const schedule = await Schedule.from(config.pool, req.params.schedule);
            schedule.permission(req.auth);

            const paused = req.body.paused;
            delete req.body.paused;
            await schedule.commit(config.pool, null, req.body);

            await rule.update(schedule);

            if (paused === true) await rule.disable(schedule);
            if (paused === false) await rule.enable(schedule);

            schedule.paused = (await rule.describe(schedule)).State !== 'ENABLED';

            return res.json(schedule.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/schedule/:schedule Delete Schedule
     * @apiVersion 1.0.0
     * @apiName DeleteSchedule
     * @apiGroup Schedule
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a given Schedule
     *
     * @apiParam {Number} schedule The ID of the schedule
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/schedule/:schedule', {
        ':schedule': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const schedule = await Schedule.from(config.pool, req.params.schedule);
            schedule.permission(req.auth);

            await rule.delete(schedule);

            await schedule.delete(config.pool);

            return res.json({
                status: 200,
                message: 'Deleted Schedule'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
