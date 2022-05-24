'use strict';

const cf = require('@mapbox/cloudfriend');

const stack = {
    Parameters: {
        DatabaseType: {
            Type: 'String',
            Default: 'db.t3.micro',
            Description: 'Database size to create',
            AllowedValues: [
                'db.t3.micro',
                'db.t3.small',
                'db.t3.medium',
                'db.t3.large'
            ]
        },
        DatabasePassword: {
            Type: 'String',
            Description: '[secure] Database Password'
        }
    },
    Resources: {
        DBInstanceVPC: {
            Type: 'AWS::RDS::DBInstance',
            Properties: {
                Engine: 'postgres',
                EnablePerformanceInsights: true,
                DBName: 'uploader',
                DBInstanceIdentifier: cf.stackName,
                KmsKeyId: cf.ref('KMS'),
                EngineVersion: '14.2',
                MasterUsername: 'uploader',
                MasterUserPassword: cf.ref('DatabasePassword'),
                AllocatedStorage: 10,
                MaxAllocatedStorage: 100,
                BackupRetentionPeriod: 10,
                StorageType: 'gp2',
                StorageEncrypted: true,
                DBInstanceClass: cf.ref('DatabaseType'),
                VPCSecurityGroups: [cf.ref('DBVPCSecurityGroup')],
                DBSubnetGroupName: cf.ref('DBSubnet'),
                PubliclyAccessible: true
            }
        },
        DBVPCSecurityGroup: {
            Type: 'AWS::EC2::SecurityGroup',
            Properties: {
                GroupDescription: cf.join('-', [cf.stackName, 'rds-sg']),
                VpcId: cf.ref('VPC'),
                SecurityGroupIngress: [{
                    IpProtocol: '-1',
                    SourceSecurityGroupId: cf.getAtt('ServiceSecurityGroup', 'GroupId')
                },{
                    IpProtocol: '-1',
                    CidrIp: '0.0.0.0/0'
                }]
            }
        },
        DBSubnet: {
            Type: 'AWS::RDS::DBSubnetGroup',
            Properties: {
                DBSubnetGroupDescription: cf.join('-', [cf.stackName, 'rds-subnets']),
                SubnetIds: [
                    cf.ref('SubA'),
                    cf.ref('SubB')
                ]
            }
        }
    },
    Outputs: {
        DB: {
            Description: 'Postgres Connection String',
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
        }
    }
};

module.exports = stack;
