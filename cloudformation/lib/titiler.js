'use strict';
const cf = require('@mapbox/cloudfriend');

const stack = {
    Resources: {
        TiTilerLambda: {
            Type: 'AWS::Lambda::Function',
            DependsOn: [ 'TiTilerRole', 'TiTilerLogs' ],
            Properties: {
                FunctionName: cf.join([cf.stackName, '-titiler']),
                Code: {
                    ImageUri: cf.join([cf.accountId, '.dkr.ecr.', cf.region, `.amazonaws.com/raster-uploader:task-titiler-`, cf.ref('GitSha')])
                },
                PackageType: 'Image',
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
                MemorySize: 1536,
                Timeout: 10
            },
        },
        TiTilerLogs: {
            Type: 'AWS::Logs::LogGroup',
            Properties: {
                LogGroupName: cf.join(['/aws/lambda/', cf.stackName, '-titiler']),
                RetentionInDays: 7
            }
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
                Policies: [{
                    PolicyName: cf.join([cf.stackName, '-titiler']),
                    PolicyDocument: {
                        Statement: [{
                            Effect: 'Allow',
                            Action: [
                                'kms:Decrypt',
                                'kms:GenerateDataKey'
                            ],
                            Resource: [cf.getAtt('KMS', 'Arn')]
                        },{
                            Effect: 'Allow',
                            Action: [
                                's3:*'
                            ],
                            Resource: [cf.join(['arn:aws:s3:::', cf.ref('Bucket'), '/*'])]
                        }]
                    }
                }],
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
        TiTilerEndpoint: {
            Value: cf.join(['https://', cf.ref('TiTilerAPI'), '.execute-api.', cf.region, cf.ref('AWS::URLSuffix'), '/'])
        }
    },
};

module.exports = stack;
