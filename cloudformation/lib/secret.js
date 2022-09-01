import cf from '@mapbox/cloudfriend';

export default {
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
