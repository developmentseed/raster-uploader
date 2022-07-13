'use strict';
const cf = require('@mapbox/cloudfriend');

const stack = {
    Parameters: {
        SigningSecret: {
            Type: 'String',
            Description: 'API Token Signing Secret'
        },
        FromEmailAddress: {
            Type: 'String',
            Description: 'Email address to be used to send emails'
        },
        FrontEndDomain: {
            Type: 'String',
            Description: 'Domain at which the frontend resides'
        }
    },
    Resources: {
        Logs: {
            Type: 'AWS::Logs::LogGroup',
            Properties: {
                LogGroupName: cf.stackName,
                RetentionInDays: 7
            }
        },
        ELB: {
            Type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
            Properties: {
                Name: cf.stackName,
                Type: 'application',
                SecurityGroups: [cf.ref('ELBSecurityGroup')],
                Subnets:  [
                    cf.ref('SubA'),
                    cf.ref('SubB')
                ]
            }

        },
        ELBSecurityGroup: {
            'Type' : 'AWS::EC2::SecurityGroup',
            'Properties' : {
                GroupDescription: cf.join('-', [cf.stackName, 'elb-sg']),
                SecurityGroupIngress: [{
                    CidrIp: '0.0.0.0/0',
                    IpProtocol: 'tcp',
                    FromPort: 80,
                    ToPort: 80
                },{
                    CidrIp: '0.0.0.0/0',
                    IpProtocol: 'tcp',
                    FromPort: 443,
                    ToPort: 443
                }],
                VpcId: cf.ref('VPC')
            }
        },
        HTTPListener: {
            Type: 'AWS::ElasticLoadBalancingV2::Listener',
            Properties: {
                DefaultActions: [{
                    Type: 'forward',
                    TargetGroupArn: cf.ref('TargetGroup')
                }],
                LoadBalancerArn: cf.ref('ELB'),
                Port: 80,
                Protocol: 'HTTP'
            }
        },
        TargetGroup: {
            Type: 'AWS::ElasticLoadBalancingV2::TargetGroup',
            DependsOn: 'ELB',
            Properties: {
                HealthCheckEnabled: true,
                HealthCheckIntervalSeconds: 30,
                HealthCheckPath: '/api',
                Port: 5000,
                Protocol: 'HTTP',
                TargetType: 'ip',
                VpcId: cf.ref('VPC'),
                Matcher: {
                    HttpCode: '200,202,302,304'
                }
            }
        },
        ECSCluster: {
            Type: 'AWS::ECS::Cluster',
            Properties: {
                ClusterName: cf.join('-', [cf.stackName, 'cluster'])
            }
        },
        TaskRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: 'Allow',
                        Principal: {
                            Service: 'ecs-tasks.amazonaws.com'
                        },
                        Action: 'sts:AssumeRole'
                    }]
                },
                Policies: [{
                    PolicyName: cf.join([cf.stackName, '-api-task']),
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
                            Resource: [
                                cf.join(['arn:aws:s3:::', cf.ref('Bucket') ]),
                                cf.join(['arn:aws:s3:::', cf.ref('Bucket'), '/*'])
                            ]
                        },{
                            Effect: 'Allow',
                            Action: [
                                'secretsmanager:Describe*',
                                'secretsmanager:Get*',
                                'secretsmanager:List*'
                            ],
                            Resource: [
                                cf.join(['arn:aws:secretsmanager:', cf.region, ':', cf.accountId, ':secret:', cf.stackName, '/*' ]),
                            ]
                        },{
                            Effect: 'Allow',
                            Action: [
                                "secretsmanager:Create*",
                                "secretsmanager:Put*",
                                "secretsmanager:Update*",
                                "secretsmanager:Delete*",
                                "secretsmanager:Restore*",
                                'secretsmanager:Describe*',
                                'secretsmanager:Get*',
                                'secretsmanager:List*'
                            ],
                            Resource: [
                                cf.join(['arn:aws:secretsmanager:', cf.region, ':', cf.accountId, ':secret:', cf.stackName, '-*' ])
                            ]
                        },{
                            Effect: 'Allow',
                            Action: [
                                'sqs:ChangeMessageVisibility',
                                'sqs:DeleteMessage',
                                'sqs:GetQueueAttributes',
                                'sqs:GetQueueUrl',
                                'sqs:ListDeadLetterSourceQueues',
                                'sqs:PurgeQueue',
                                'sqs:SendMessage'
                            ],
                            Resource: [
                                cf.getAtt('Queue', 'Arn'),
                                cf.getAtt('DeadQueue', 'Arn'),
                                cf.getAtt('ObtainQueue', 'Arn'),
                                cf.getAtt('TransformQueue', 'Arn')
                            ]
                        }]
                    }
                }]
            }
        },
        ExecRole: {
            'Type': 'AWS::IAM::Role',
            'Properties': {
                'AssumeRolePolicyDocument': {
                    'Version': '2012-10-17',
                    'Statement': [{
                        Effect: 'Allow',
                        Principal: {
                            Service: 'ecs-tasks.amazonaws.com'
                        },
                        'Action': 'sts:AssumeRole'
                    }]
                },
                Policies: [{
                    PolicyName: cf.join([cf.stackName, '-api-logging']),
                    PolicyDocument: {
                        'Statement': [{
                            'Effect': 'Allow',
                            'Action': [
                                'logs:CreateLogGroup',
                                'logs:CreateLogStream',
                                'logs:PutLogEvents',
                                'logs:DescribeLogStreams'
                            ],
                            'Resource': ['arn:aws:logs:*:*:*']
                        }]
                    }
                }],
                'ManagedPolicyArns': [
                    'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
                    'arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role',
                    'arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly'
                ],
                'Path': '/service-role/'
            }
        },
        TaskDefinition: {
            Type: 'AWS::ECS::TaskDefinition',
            Properties: {
                Family: cf.stackName,
                Cpu: 1024,
                Memory: 4096,
                NetworkMode: 'awsvpc',
                RequiresCompatibilities: ['FARGATE'],
                Tags: [{
                    Key: 'Name',
                    Value: cf.join('-', [cf.stackName, 'api'])
                }],
                ExecutionRoleArn: cf.getAtt('ExecRole', 'Arn'),
                TaskRoleArn: cf.getAtt('TaskRole', 'Arn'),
                ContainerDefinitions: [{
                    Name: 'api',
                    Image: cf.join([cf.accountId, '.dkr.ecr.', cf.region, '.amazonaws.com/raster-uploader:', cf.ref('GitSha')]),
                    PortMappings: [{
                        ContainerPort: 5000
                    }],
                    Environment: [
                        {
                            Name: 'POSTGRES',
                            Value: cf.join([
                                'postgresql://uploader',
                                ':',
                                cf.ref('DatabasePassword'),
                                '@',
                                cf.getAtt('DBInstanceVPC', 'Endpoint.Address'),
                                ':',
                                cf.getAtt('DBInstanceVPC', 'Endpoint.Port'),
                                '/uploader'
                            ])
                        },
                        { Name: 'QUEUE', Value: cf.ref('Queue') },
                        { Name: 'OBTAIN_QUEUE', Value: cf.ref('ObtainQueue') },
                        { Name: 'TRANSFORM_QUEUE', Value: cf.ref('TransformQueue') },
                        { Name: 'SecretARN', Value: cf.ref('APISecrets') },
                        { Name: 'ASSET_BUCKET', Value: cf.ref('Bucket') },
                        { Name: 'SigningSecret', Value: cf.ref('SigningSecret') },
                        { Name: 'StackName', Value: cf.stackName },
                        { Name: 'AWS_DEFAULT_REGION', Value: cf.region },
                        { Name: 'TiTiler', Value: cf.join(['https://', cf.ref('TiTilerAPI'), '.execute-api.', cf.region, '.', cf.ref('AWS::URLSuffix'), '/']) },
                        { Name: 'FROM_EMAIL_ADDRESS', Value: cf.ref('FromEmailAddress') },
                        { Name: 'FRONTEND_DOMAIN', Value: cf.ref('FrontEndDomain') },
                    ],
                    LogConfiguration: {
                        LogDriver: 'awslogs',
                        Options: {
                            'awslogs-group': cf.stackName,
                            'awslogs-region': cf.region,
                            'awslogs-stream-prefix': cf.stackName,
                            'awslogs-create-group': true
                        }
                    },
                    Essential: true
                }]
            }
        },
        Service: {
            Type: 'AWS::ECS::Service',
            Properties: {
                ServiceName: cf.join('-', [cf.stackName, 'Service']),
                Cluster: cf.ref('ECSCluster'),
                TaskDefinition: cf.ref('TaskDefinition'),
                LaunchType: 'FARGATE',
                HealthCheckGracePeriodSeconds: 300,
                DesiredCount: 1,
                NetworkConfiguration: {
                    AwsvpcConfiguration: {
                        AssignPublicIp: 'ENABLED',
                        SecurityGroups: [cf.ref('ServiceSecurityGroup')],
                        Subnets:  [
                            cf.ref('SubA'),
                            cf.ref('SubB')
                        ]
                    }
                },
                LoadBalancers: [{
                    ContainerName: 'api',
                    ContainerPort: 5000,
                    TargetGroupArn: cf.ref('TargetGroup')
                }]
            }
        },
        ServiceSecurityGroup: {
            'Type' : 'AWS::EC2::SecurityGroup',
            'Properties' : {
                GroupDescription: cf.join('-', [cf.stackName, 'ec2-sg']),
                VpcId: cf.ref('VPC'),
                SecurityGroupIngress: [{
                    CidrIp: '0.0.0.0/0',
                    IpProtocol: 'tcp',
                    FromPort: 5000,
                    ToPort: 5000
                }]
            }
        }
    },
    Outputs: {
        ELB: {
            Description: 'Raster Uploader API URL',
            Value: cf.join(['http://', cf.getAtt('ELB', 'DNSName')])
        }
    }
};

module.exports = stack;
