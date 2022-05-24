'use strict';

const cf = require('@mapbox/cloudfriend');

const stack = {
    Resources: {
        APISecrets: {
            Type: 'AWS::SecretsManager::Secret',
            Properties: {
                Description: cf.join([cf.stackName, ' API Secrets']),
                Name: cf.join([cf.stackName, '/api']),
                KmsKeyId: cf.ref('KMS')
            }
        }
    }
};

module.exports = stack;
