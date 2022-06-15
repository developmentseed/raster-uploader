'use strict';

const cf = require('@mapbox/cloudfriend');
const fs = require('fs');
const path = require('path');

const stack = {
    Resources: {
        LambdaFunctionRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                RoleName: cf.join([ cf.stackName, '-queue-role' ]),
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: 'Allow',
                        Principal: {
                            Service: 'lambda.amazonaws.com'
                        },
                        Action: 'sts:AssumeRole'
                    }]
                },
                Path: '/',
                Policies: [{
                    PolicyName: cf.join([ cf.stackName, '-queue-policy' ]),
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [{
                            Effect: 'Allow',
                            Action: [
                                'lambda:GetFunction',
                                'lambda:invokeFunction',
                                'logs:CreateLogGroup',
                                'logs:CreateLogStream',
                                'logs:DescribeLogStreams',
                                'logs:PutLogEvents'
                            ],
                            Resource: '*'
                        },{
                            Effect: 'Allow',
                            Action: [
                                'sqs:SendMessage',
                                'sqs:ReceiveMessage',
                                'sqs:ChangeMessageVisibility',
                                'sqs:DeleteMessage',
                                'sqs:GetQueueUrl',
                                'sqs:GetQueueAttributes'
                            ],
                            Resource: '*'
                        }]
                    }
                }]
            }
        }
    }
}

for (const task of fs.readdirSync(path.resolve(__dirname, '../../tasks'))) {
    stack.Resources[`LambdaFunction${task.charAt(0).toUpperCase() + task.slice(1)}`] = {
        Type: 'AWS::Lambda::Function',
        DependsOn: [`LambdaLogs${task}`],
        Properties: {
            Code: {
                ImageUri: cf.join([cf.accountId, '.dkr.ecr.', cf.region, `.amazonaws.com/raster-uploader:task-${task}-`, cf.ref('GitSha')])
            },
            PackageType: 'Image',
            FunctionName: cf.join([cf.stackName, '-identify']),
            Role: cf.getAtt('LambdaFunctionRole', 'Arn'),
            MemorySize: 1024,
            ReservedConcurrentExecutions: 5,
            Timeout: 900,
            Environment: {
                Variables: {
                    StackName: cf.stackName,
                    BUCKET: cf.ref('Bucket'),
                    API: cf.join(['http://', cf.getAtt('ELB', 'DNSName')])
                }
            },
            VpcConfig: {
                SubnetIds: [
                    cf.ref('SubA'),
                    cf.ref('SubB')
                ]
            }
        }
    };

    stack.Resources[`LambdaLogs${task}`] = {
        Type: 'AWS::Logs::LogGroup',
        Properties: {
            LogGroupName: cf.join([
                '/aws/lambda/', cf.stackName, `-${task}`
            ]),
            RetentionInDays: 7
        }
    };
}

module.exports = stack;
