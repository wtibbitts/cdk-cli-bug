#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CdkCliDiffBugStack } from '../lib/cdk-cli-diff-bug-stack';

const app = new App();
new CdkCliDiffBugStack(app, 'CdkCliDiffBugStack', {
  env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION
  }
});