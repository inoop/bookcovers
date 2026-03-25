import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from './stacks/network-stack';
import { DataStack } from './stacks/data-stack';
import { AppStack } from './stacks/app-stack';

const env: cdk.Environment = {
  account: '408264629574',
  region: 'us-east-1',
};

const app = new cdk.App();

const network = new NetworkStack(app, 'CoversNetworkStack', { env });

const data = new DataStack(app, 'CoversDataStack', {
  env,
  vpc: network.vpc,
  auroraSg: network.auroraSg,
});

new AppStack(app, 'CoversAppStack', {
  env,
  vpc: network.vpc,
  albSg: network.albSg,
  fargateSg: network.fargateSg,
  ecrRepo: network.ecrRepo,
  dbCluster: data.dbCluster,
  userPool: data.userPool,
  userPoolClient: data.userPoolClient,
  portfolioBucket: data.portfolioBucket,
});
