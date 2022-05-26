'use strict';

const cf = require('@mapbox/cloudfriend');

const stack = {
    Resources: {
        JobRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: 'Allow',
                        Principal: { Service: 'ecs-tasks.amazonaws.com' },
                        Action: 'sts:AssumeRole'
                    }]
                },
                Policies: [{
                    PolicyName: cf.join([cf.stackName, '-etl-policy']),
                    PolicyDocument: {
                        Statement: [{
                            Effect: 'Allow' ,
                            Action: ['batch:DescribeJobs'],
                            Resource: ['*']
                        },{
                            Effect: 'Allow' ,
                            Action: ['ecs:DescribeContainerInstances'],
                            Resource: ['*']
                        },{
                            Effect: 'Allow',
                            Action: [
                                's3:*',
                            ],
                            Resource: [
                                cf.getAtt('Bucket', 'Arn')
                            ]
                        },{
                            Effect: 'Allow',
                            Action: [
                                'kms:Decrypt',
                                'kms:GenerateDataKey'
                            ],
                            Resource: [cf.getAtt('KMS', 'Arn')]
                        }]
                    }
                }],
                Path: '/'
            }
        },
        JobDefinition: {
            Type: 'AWS::Batch::JobDefinition',
            Properties: {
                Type: 'container',
                JobDefinitionName: cf.join([cf.stackName, '-job']),
                RetryStrategy: { Attempts: 1 },
                Parameters: { },
                ContainerProperties: {
                    Environment: [
                        { Name: 'StackName', Value: cf.stackName },
                        {
                            Name: 'DATABASE_URL',
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
                        { Name: 'BUCKET', Value: cf.ref('Bucket') }
                    ],
                    Memory: 1900,
                    Privileged: true,
                    JobRoleArn: cf.getAtt('JobRole', 'Arn'),
                    ReadonlyRootFilesystem: false,
                    Vcpus: 2,
                    Image: cf.join([cf.ref('AWS::AccountId'), '.dkr.ecr.', cf.ref('AWS::Region'), '.amazonaws.com/raster-uploader:task-', cf.ref('GitSha')])
                }
            }
        },
        ComputeEnvironment: {
            Type: 'AWS::Batch::ComputeEnvironment',
            Properties: {
                Type: 'MANAGED',
                ServiceRole: cf.getAtt('BatchServiceRole', 'Arn'),
                ComputeEnvironmentName: cf.join('-', ['batch', cf.ref('AWS::StackName')]),
                ComputeResources: {
                    ImageId: 'ami-056807e883f197989',
                    MaxvCpus: 128,
                    DesiredvCpus: 32,
                    MinvCpus: 0,
                    SecurityGroupIds: [cf.ref('BatchSecurityGroup')],
                    Subnets:  [
                        cf.ref('SubA'),
                        cf.ref('SubB')
                    ],
                    Type : 'EC2',
                    InstanceRole : cf.getAtt('InstanceProfile', 'Arn'),
                    InstanceTypes : ['optimal']
                },
                State: 'ENABLED'
            }
        },
        BatchServiceRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: 'Allow',
                        Principal: {
                            Service: 'batch.amazonaws.com'
                        },
                        Action: 'sts:AssumeRole'
                    }]
                },
                ManagedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole'],
                Path: '/service-role/'
            }
        },
        BatchSecurityGroup: {
            Type: 'AWS::EC2::SecurityGroup',
            Properties: {
                VpcId: cf.ref('VPC'),
                GroupDescription: cf.join([cf.stackName, ' Batch Security Group']),
                SecurityGroupIngress: []
            }
        },
        BatchInstanceRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: 'Allow',
                        Principal: {
                            Service: 'ec2.amazonaws.com'
                        },
                        Action: 'sts:AssumeRole'
                    }]
                },
                ManagedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role'],
                Path: '/'
            }
        },
        InstanceProfile: {
            Type: 'AWS::IAM::InstanceProfile',
            Properties: {
                Roles: [cf.ref('BatchInstanceRole')],
                Path: '/'
            }
        },
        JobQueue: {
            Type: 'AWS::Batch::JobQueue',
            Properties: {
                ComputeEnvironmentOrder: [{
                    Order: 1,
                    ComputeEnvironment: cf.ref('ComputeEnvironment')
                }],
                State: 'ENABLED',
                Priority: 1,
                JobQueueName: cf.join([cf.stackName, '-queue'])
            }
        },

    },
};

module.exports = stack;
