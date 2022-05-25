const cf = require('@mapbox/cloudfriend');
const alarms = require('@openaddresses/batch-alarms');

const db = require('./lib/db.js');
const s3 = require('./lib/s3.js');
const api = require('./lib/api.js');
const kms = require('./lib/kms.js');
const vpc = require('./lib/vpc.js');
const etl = require('./lib/etl.js');
const secret = require('./lib/secret.js');

const base = {
    Parameters: {
        GitSha: {
            Type: 'String',
            Description: 'GitSha to Deploy'
        }
    }
};

module.exports = cf.merge(
    base,
    s3,
    db,
    api,
    kms,
    vpc,
    etl,
    secret,
    alarms({
        prefix: 'RasterUpload',
        apache: cf.stackName,
        email: 'ingalls@developmentseed.org',
        cluster: cf.ref('ECSCluster'),
        service: cf.getAtt('Service', 'Name'),
        loadbalancer: cf.getAtt('ELB', 'LoadBalancerFullName'),
        targetgroup: cf.getAtt('TargetGroup', 'TargetGroupFullName')
    })
);
