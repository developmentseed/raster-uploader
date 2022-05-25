'use strict';

const cf = require('@mapbox/cloudfriend');

const stack = {
    Resources: {
        Bucket: {
            Type: 'AWS::S3::Bucket',
            Properties: {
                BucketName: cf.join('-', [cf.stackName, cf.accountId, cf.region])
            }
        },
    }
};

module.exports = stack;
