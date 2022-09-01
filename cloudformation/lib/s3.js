import cf from '@mapbox/cloudfriend';

export default {
    Resources: {
        Bucket: {
            Type: 'AWS::S3::Bucket',
            Properties: {
                BucketName: cf.join('-', [cf.stackName, cf.accountId, cf.region])
            }
        }
    }
};
