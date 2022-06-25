'use strict';

const cf = require('@mapbox/cloudfriend');

const stack = {
    Resources: {
        Queue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join([cf.stackName, '-queue' ]),
                VisibilityTimeout: 1200,
                RedrivePolicy: {
                    deadLetterTargetArn: cf.getAtt('DeadQueue', 'Arn'),
                    maxReceiveCount: 3
                }
            }
        },
        DeadQueue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join([cf.stackName, '-dead-queue'])
            }
        },
        LambdaSource: {
            Type: 'AWS::Lambda::EventSourceMapping',
            DependsOn: ['LambdaFunctionIdentify'],
            Properties: {
                Enabled: 'True',
                EventSourceArn:  cf.getAtt('Queue', 'Arn'),
                FunctionName: cf.ref('LambdaFunctionIdentify')
            }
        },
        ObtainQueue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join([cf.stackName, '-obtain-queue' ]),
                VisibilityTimeout: 1200,
                RedrivePolicy: {
                    deadLetterTargetArn: cf.getAtt('DeadQueue', 'Arn'),
                    maxReceiveCount: 3
                }
            }
        },
        LambdaSource: {
            Type: 'AWS::Lambda::EventSourceMapping',
            DependsOn: ['LambdaFunctionIdentify'],
            Properties: {
                Enabled: 'True',
                EventSourceArn:  cf.getAtt('ObtainQueue', 'Arn'),
                FunctionName: cf.ref('LambdaFunctionObtain')
            }
        },
    },
};

module.exports = stack;
