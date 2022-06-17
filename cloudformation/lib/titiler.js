'use strict';
const cf = require('@mapbox/cloudfriend');

const stack = {
    Resources: {
        TiTilerLambda: {
            Type: 'AWS::Lambda::Function',
            DependsOn: [ 'TiTilerRole' ],
            Properties: {
                FunctionName: cf.join([cf.stackName, '-titiler']),
                Code: {
                    S3Bucket: 'assets-853558080719-us-east-1',
                    S3Key: cf.join(['titiler/', cf.ref('GitSha'), '.zip'])
                },
                Role: cf.getAtt('TiTilerRole', 'Arn'),
                Environment: {
                    Variables: {
                        'CPL_VSIL_CURL_ALLOWED_EXTENSIONS': '.tif,.TIF,.tiff',
                        'GDAL_CACHEMAX': '200',
                        'GDAL_DISABLE_READDIR_ON_OPEN': 'EMPTY_DIR',
                        'GDAL_INGESTED_BYTES_AT_OPEN': '32768',
                        'GDAL_HTTP_MERGE_CONSECUTIVE_RANGES': 'YES',
                        'GDAL_HTTP_MULTIPLEX': 'YES',
                        'GDAL_HTTP_VERSION': '2',
                        'PYTHONWARNINGS': 'ignore',
                        'VSI_CACHE': 'TRUE',
                        'VSI_CACHE_SIZE': '5000000'
                    }
                },
                Handler: 'handler.handler',
                MemorySize: 1536,
                Runtime: 'python3.9',
                Timeout: 10
            },
        },
        TiTilerRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Statement: [{
                        Action: 'sts:AssumeRole',
                        Effect: 'Allow',
                        Principal: {
                            Service: 'lambda.amazonaws.com'
                        }
                    }],
                    Version: '2012-10-17'
                },
                ManagedPolicyArns: [ cf.join(['arn:', cf.ref('AWS::Partition'), ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']) ]
            }
        },
        TiTilerAPI: {
            Type: 'AWS::ApiGatewayV2::Api',
            Properties: {
                Name: cf.join([cf.stackName, '-titiler']),
                ProtocolType: 'HTTP',
            }
        },
        TiTilerPermission: {
            Type: 'AWS::Lambda::Permission',
            Properties: {
                Action: 'lambda:InvokeFunction',
                FunctionName: cf.getAtt('TiTilerLambda', 'Arn'),
                Principal: 'apigateway.amazonaws.com',
                SourceArn: cf.join(['arn:', cf.ref('AWS::Partition'), ':execute-api:', cf.region, ':', cf.accountId, ':', cf.ref('TiTilerAPI'), '/*/*'])
            },
        },
        TiTilerIntegration: {
            Type: 'AWS::ApiGatewayV2::Integration',
            Properties: {
                ApiId: cf.ref('TiTilerAPI'),
                IntegrationType: 'AWS_PROXY',
                IntegrationUri: cf.getAtt('TiTilerLambda', 'Arn'),
                PayloadFormatVersion: '2.0'
            },
        },
        TiTilerRoute: {
            Type: 'AWS::ApiGatewayV2::Route',
            Properties: {
                ApiId: cf.ref('TiTilerAPI'),
                RouteKey: '$default',
                AuthorizationType: 'NONE',
                Target: cf.join(['integrations/', cf.ref('TiTilerIntegration')])
            },
        },
        TiTilerStage: {
            Type: 'AWS::ApiGatewayV2::Stage',
            Properties: {
                ApiId: cf.ref('TiTilerAPI'),
                StageName: '$default',
                AutoDeploy: true,
            },
        },
    },
    Outputs: {
        Endpoint: {
            Value: cf.join(['https://', cf.ref('TiTilerAPI'), '.execute-api.', cf.region, cf.ref('AWS::URLSuffix'), '/'])
        }
    },
};

module.exports = stack;
