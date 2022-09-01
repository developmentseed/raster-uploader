import cf from '@mapbox/cloudfriend';
import alarms from '@openaddresses/batch-alarms';

import db from './lib/db.js';
import s3 from './lib/s3.js';
import api from './lib/api.js';
import kms from './lib/kms.js';
import vpc from './lib/vpc.js';
import etl from './lib/etl.js';
import sqs from './lib/sqs.js';
import lambda from './lib/lambda.js';
import titiler from './lib/titiler.js';
import secret from './lib/secret.js';

const base = {
    Parameters: {
        GitSha: {
            Type: 'String',
            Description: 'GitSha to Deploy'
        }
    }
};

export default cf.merge(
    base,
    s3,
    db,
    api,
    kms,
    vpc,
    etl,
    sqs,
    lambda,
    secret,
    titiler,
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
