
const cf = require('@mapbox/cloudfriend');
const alarms = require('@openaddresses/batch-alarms');

const db = require('./lib/db.js');
const api = require('./lib/api.js');
const kms = require('./lib/kms.js');
const vpc = require('./lib/vpc.js');
const secret = require('./lib/secret.js');

const Parameters = {
    GitSha: {
        Type: 'String',
        Description: 'GitSha to Deploy'
    }
};

module.exports = cf.merge(
    {
        Parameters
    },
    db,
    api,
    kms,
    vpc,
    secret,
    alarms({
        prefix: 'CPAL',
        apache: cf.stackName,
        email: 'ingalls@developmentseed.org',
        cluster: cf.ref('ECSCluster'),
        service: cf.getAtt('Service', 'Name'),
        loadbalancer: cf.getAtt('ELB', 'LoadBalancerFullName'),
        targetgroup: cf.getAtt('TargetGroup', 'TargetGroupFullName')
    })
);
