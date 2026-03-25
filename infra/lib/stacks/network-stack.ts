import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly albSg: ec2.SecurityGroup;
  public readonly fargateSg: ec2.SecurityGroup;
  public readonly auroraSg: ec2.SecurityGroup;
  public readonly ecrRepo: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { subnetType: ec2.SubnetType.PUBLIC, name: 'Public' },
      ],
    });

    this.albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc: this.vpc,
      description: 'ALB security group',
    });
    this.albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');
    this.albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP redirect');

    this.fargateSg = new ec2.SecurityGroup(this, 'FargateSg', {
      vpc: this.vpc,
      description: 'Fargate task security group',
    });
    this.fargateSg.addIngressRule(this.albSg, ec2.Port.tcp(8000), 'From ALB');

    this.auroraSg = new ec2.SecurityGroup(this, 'AuroraSg', {
      vpc: this.vpc,
      description: 'Aurora security group',
    });
    this.auroraSg.addIngressRule(this.fargateSg, ec2.Port.tcp(5432), 'From Fargate');

    this.ecrRepo = new ecr.Repository(this, 'EcrRepo', {
      repositoryName: 'covers-backend',
      lifecycleRules: [{ maxImageCount: 5 }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });
  }
}
