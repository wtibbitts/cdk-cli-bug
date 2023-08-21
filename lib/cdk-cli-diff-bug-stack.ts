
import { Stack, StackProps } from 'aws-cdk-lib';
import { User } from 'aws-cdk-lib/aws-iam'
import {
  Cluster,
  KubernetesVersion,
} from 'aws-cdk-lib/aws-eks';
import { KubectlV26Layer } from '@aws-cdk/lambda-layer-kubectl-v26';
import { STSClient, GetCallerIdentityCommand, GetCallerIdentityCommandOutput } from '@aws-sdk/client-sts'
import { Construct } from 'constructs';
import * as util from 'util';


async function getCallerIdentity(): Promise<GetCallerIdentityCommandOutput> {
  const client = new STSClient({ region: process.env.CDK_DEFAULT_REGION });
  const command = new GetCallerIdentityCommand({});
  return client.send(command)
}

export class CdkCliDiffBugStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cluster = new Cluster(this, 'Cluster', {
      clusterName: 'dummyCluster',
      defaultCapacity: 0, 
      kubectlLayer: new KubectlV26Layer(this, 'KubeClientUtils'),
      outputClusterName: true,
      version: KubernetesVersion.of('1.27'),
    });

    getCallerIdentity().then((user) => {
      console.log(`current user: ${util.inspect(user, { depth: null, colors: true })}`)
      if (user?.Arn) { 
        const iamuser = User.fromUserArn(this, `Admin${user.UserId}`, user.Arn)
        console.log(`iamuser: ${iamuser.userName}, ${iamuser.userArn}`);
        cluster.awsAuth.addUserMapping(iamuser, { groups: ['system:masters'] })
      } else {
        console.error('Unable to get current user');
      }
    });
  }
}
