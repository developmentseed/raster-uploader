'use strict';
const cf = require('@mapbox/cloudfriend');

const stack = {
    Resources: {
        TiTilerLambda: {
            Type: "AWS::Lambda::Function",
            Properties: {
                Code: {
                    S3Bucket:
                    S3Key:
                },
                Role: cf.getAtt('titilerlambdaproductionlambdaServiceRole3217BBDC', 'Arn')
                Environment: {
                    Variables: {
                        "CPL_VSIL_CURL_ALLOWED_EXTENSIONS": ".tif,.TIF,.tiff",
                        "GDAL_CACHEMAX": "200",
                        "GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
                        "GDAL_INGESTED_BYTES_AT_OPEN": "32768",
                        "GDAL_HTTP_MERGE_CONSECUTIVE_RANGES": "YES",
                        "GDAL_HTTP_MULTIPLEX": "YES",
                        "GDAL_HTTP_VERSION": "2",
                        "PYTHONWARNINGS": "ignore",
                        "VSI_CACHE": "TRUE",
                        "VSI_CACHE_SIZE": "5000000"
                    }
                },
                Handler: "handler.handler",
                MemorySize: 1536,
                Runtime: "python3.9",
                Timeout: 10
            },
            DependsOn: ['titilerlambdaproductionlambdaServiceRole3217BBDC']
        },
        TiTilerRole: {
            Type: "AWS::IAM::Role",
            Properties: {
                AssumeRolePolicyDocument: {
                    Statement: [{
                        Action: "sts:AssumeRole",
                        Effect: "Allow",
                        Principal: {
                            Service: "lambda.amazonaws.com"
                        }
                    }],
                    Version: "2012-10-17"
                },
                ManagedPolicyArns: [ cf.join(['arn:', cf.ref('AWS::Partition'), ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']) ]
            }
        },
        TiTilerLogs: {
            Type: 'AWS::Logs::LogGroup',
            Properties: {
                LogGroupName: cf.join([
                    '/aws/lambda/', cf.stackName, `-titiler`
                ]),
                RetentionInDays: 7
            }
        },
        titilerlambdaproductionendpoint8291F0FE: {
            Type: "AWS::ApiGatewayV2::Api",
            Properties: {
                Name: "titiler-lambda-production-endpoint",
                ProtocolType: "HTTP",
            },
        },
        titilerlambdaproductionendpointDefaultRoutetitilerlambdaproductionintegrationPermissionAB079600: {
            Type: "AWS::Lambda::Permission",
            Properties: {
                Action: "lambda:InvokeFunction",
                FunctionName: cf.getAtt('titilerlambdaproductionlambdaAA4DE1A7', "Arn"),
                Principal: "apigateway.amazonaws.com",
                SourceArn: cf.join(["arn:", cf.ref('AWS::Partition'), ":execute-api:", cf.region, ":", cf.accountId, ":", cf.ref('titilerlambdaproductionendpoint8291F0FE'), "/*/*"])
            },
        },
        titilerlambdaproductionendpointDefaultRoutetitilerlambdaproductionintegration37D4B4E9: {
            Type: "AWS::ApiGatewayV2::Integration",
            Properties: {
                ApiId: cf.ref('titilerlambdaproductionendpoint8291F0FE'),
                IntegrationType: "AWS_PROXY",
                IntegrationUri: cf.getAtt('titilerlambdaproductionlambdaAA4DE1A7', 'Arn')
                PayloadFormatVersion: "2.0"
            },
        },
        titilerlambdaproductionendpointDefaultRouteFA5A84AD: {
            Type: "AWS::ApiGatewayV2::Route",
            Properties: {
                ApiId: cf.ref('titilerlambdaproductionendpoint8291F0FE'),
                RouteKey: "$default",
                AuthorizationType: "NONE",
                Target: cf.join(['integrations/', cf.ref("titilerlambdaproductionendpointDefaultRoutetitilerlambdaproductionintegration37D4B4E9")])
            },
        },
        titilerlambdaproductionendpointDefaultStage814A6EEC: {
            Type: "AWS::ApiGatewayV2::Stage",
            Properties: {
                "ApiId": cf.ref('titilerlambdaproductionendpoint8291F0FE')
                StageName: "$default",
                AutoDeploy: true,
            },
        },
    },
    Outputs: {
        Endpoint: {
            Value: cf.join(['https://', cf.ref('titilerlambdaproductionendpoint8291F0FE'), '.execute-api.', cf.region, cf.ref('AWS::URLSuffix'), '/'])
        }
    },
};

module.exports = stack;
