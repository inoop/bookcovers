import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

interface AppStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  albSg: ec2.SecurityGroup;
  fargateSg: ec2.SecurityGroup;
  ecrRepo: ecr.Repository;
  dbCluster: rds.DatabaseCluster;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  portfolioBucket: s3.Bucket;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const {
      vpc, albSg, fargateSg, ecrRepo, dbCluster,
      userPool, userPoolClient, portfolioBucket,
    } = props;

    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: 'nbrouwers.com',
    });

    // --- ECS Cluster + Fargate ---
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    const dbSecret = dbCluster.secret!;

    taskDef.addContainer('api', {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepo, 'latest'),
      portMappings: [{ containerPort: 8000 }],
      environment: {
        ENVIRONMENT: 'production',
        AUTH_PROVIDER: 'cognito',
        COGNITO_USER_POOL_ID: userPool.userPoolId,
        COGNITO_APP_CLIENT_ID: userPoolClient.userPoolClientId,
        COGNITO_REGION: 'us-east-1',
        STORAGE_BACKEND: 's3',
        S3_BUCKET: portfolioBucket.bucketName,
        S3_REGION: 'us-east-1',
        CLOUDFRONT_DOMAIN: 'assets.covers.nbrouwers.com',
        CORS_ORIGINS: '["https://covers.nbrouwers.com"]',
        AWS_DEFAULT_REGION: 'us-east-1',
      },
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(dbSecret, 'host'),
        DB_PORT: ecs.Secret.fromSecretsManager(dbSecret, 'port'),
        DB_USERNAME: ecs.Secret.fromSecretsManager(dbSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
        DB_NAME: ecs.Secret.fromSecretsManager(dbSecret, 'dbname'),
      },
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'covers-api' }),
    });

    portfolioBucket.grantReadWrite(taskDef.taskRole);

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      assignPublicIp: true,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [fargateSg],
    });

    // --- ALB ---
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });

    const apiCert = new acm.Certificate(this, 'ApiCert', {
      domainName: 'api.covers.nbrouwers.com',
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const httpsListener = alb.addListener('HTTPS', {
      port: 443,
      certificates: [apiCert],
    });

    httpsListener.addTargets('FargateTarget', {
      port: 8000,
      targets: [service],
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
      },
    });

    alb.addListener('HTTP', {
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    new route53.ARecord(this, 'ApiARecord', {
      zone: hostedZone,
      recordName: 'api.covers',
      target: route53.RecordTarget.fromAlias(
        new route53targets.LoadBalancerTarget(alb),
      ),
    });

    // --- Frontend S3 + CloudFront ---
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const siteCert = new acm.Certificate(this, 'SiteCert', {
      domainName: 'covers.nbrouwers.com',
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const siteDistribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      certificate: siteCert,
      defaultRootObject: 'index.html',
      domainNames: ['covers.nbrouwers.com'],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: cdk.Duration.minutes(0) },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: cdk.Duration.minutes(0) },
      ],
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    new s3deploy.BucketDeployment(this, 'SiteDeployment', {
      destinationBucket: siteBucket,
      sources: [s3deploy.Source.asset(path.join(__dirname, '..', '..', '..', 'frontend', 'dist'))],
      distribution: siteDistribution,
      distributionPaths: ['/*'],
    });

    new route53.ARecord(this, 'SiteARecord', {
      zone: hostedZone,
      recordName: 'covers',
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(siteDistribution),
      ),
    });
  }
}
