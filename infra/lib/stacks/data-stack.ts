import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

interface DataStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  auroraSg: ec2.SecurityGroup;
}

export class DataStack extends cdk.Stack {
  public readonly dbCluster: rds.DatabaseCluster;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly portfolioBucket: s3.Bucket;
  public readonly assetsDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const { vpc, auroraSg } = props;

    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: 'nbrouwers.com',
    });

    // --- Aurora Serverless v2 ---
    this.dbCluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_4,
      }),
      serverlessV2MinCapacity: 0,
      serverlessV2MaxCapacity: 1,
      writer: rds.ClusterInstance.serverlessV2('writer'),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [auroraSg],
      defaultDatabaseName: 'covers',
      credentials: rds.Credentials.fromGeneratedSecret('covers_admin'),
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    });

    // --- Cognito ---
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'covers-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
        requireUppercase: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      standardAttributes: {
        email: { required: true, mutable: true },
        fullname: { required: false, mutable: true },
      },
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
      },
    });

    this.userPoolClient = this.userPool.addClient('WebClient', {
      generateSecret: false,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        callbackUrls: [
          'https://covers.nbrouwers.com/auth/callback',
          'http://localhost:5173/auth/callback',
        ],
        logoutUrls: [
          'https://covers.nbrouwers.com/',
          'http://localhost:5173/',
        ],
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    this.userPool.addDomain('CognitoDomain', {
      cognitoDomain: { domainPrefix: 'covers-nbrouwers' },
    });

    // --- S3 Portfolio Bucket ---
    this.portfolioBucket = new s3.Bucket(this, 'PortfolioBucket', {
      bucketName: 'covers-portfolio-assets',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // --- CloudFront for assets ---
    const assetsCert = new acm.Certificate(this, 'AssetsCert', {
      domainName: 'assets.covers.nbrouwers.com',
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    this.assetsDistribution = new cloudfront.Distribution(this, 'AssetsDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.portfolioBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      domainNames: ['assets.covers.nbrouwers.com'],
      certificate: assetsCert,
    });

    new route53.ARecord(this, 'AssetsARecord', {
      zone: hostedZone,
      recordName: 'assets.covers',
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(this.assetsDistribution),
      ),
    });
  }
}
