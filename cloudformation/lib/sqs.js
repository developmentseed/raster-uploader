import cf from '@mapbox/cloudfriend';

export default {
    Resources: {
        Queue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join([cf.stackName, '-queue']),
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
        TransformQueue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join([cf.stackName, '-transform-queue']),
                VisibilityTimeout: 1200,
                RedrivePolicy: {
                    deadLetterTargetArn: cf.getAtt('DeadQueue', 'Arn'),
                    maxReceiveCount: 3
                }
            }
        },
        TransformLambdaSource: {
            Type: 'AWS::Lambda::EventSourceMapping',
            DependsOn: ['LambdaFunctionTransform'],
            Properties: {
                Enabled: 'True',
                EventSourceArn:  cf.getAtt('TransformQueue', 'Arn'),
                FunctionName: cf.ref('LambdaFunctionTransform')
            }
        },
        ObtainQueue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join([cf.stackName, '-obtain-queue']),
                VisibilityTimeout: 1200,
                RedrivePolicy: {
                    deadLetterTargetArn: cf.getAtt('DeadQueue', 'Arn'),
                    maxReceiveCount: 3
                }
            }
        },
        ObtainQueuePolicy: {
            Type: 'AWS::SQS::QueuePolicy',
            Properties: {
                PolicyDocument: {
                    Statement: [{
                        Effect: 'Allow',
                        Principal: {
                            Service: 'events.amazonaws.com'
                        },
                        Action: ['sqs:SendMessage'],
                        Resource: [cf.getAtt('ObtainQueue', 'Arn')]
                    }]
                },
                Queues: [
                    cf.ref('ObtainQueue')
                ]
            }
        },
        ObtainLambdaSource: {
            Type: 'AWS::Lambda::EventSourceMapping',
            DependsOn: ['LambdaFunctionObtain'],
            Properties: {
                Enabled: 'True',
                EventSourceArn:  cf.getAtt('ObtainQueue', 'Arn'),
                FunctionName: cf.ref('LambdaFunctionObtain')
            }
        },
        IdentifyLambdaSource: {
            Type: 'AWS::Lambda::EventSourceMapping',
            DependsOn: ['LambdaFunctionIdentify'],
            Properties: {
                Enabled: 'True',
                EventSourceArn:  cf.getAtt('Queue', 'Arn'),
                FunctionName: cf.ref('LambdaFunctionIdentify')
            }
        }
    }
};
