import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { EcrConstruct } from "./constructs/container/ecr.construct";
import { EcsClusterConstruct } from "./constructs/container/ecsCluster.construct";
import { EcsServiceConstruct } from "./constructs/container/ecsService.construct";
import { CodeCommitConstruct } from "./constructs/pipeline/codeCommit.construct";
import { ServerCodePipelineConstruct } from "./constructs/pipeline/codePipelineServer.construct";
import { getVpc } from "./utils/vpc";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { Repository as CCRepository } from "aws-cdk-lib/aws-codecommit";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import { CodeBuildAction, CodeCommitSourceAction, CodeCommitTrigger } from "aws-cdk-lib/aws-codepipeline-actions";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { LambdaConstruct, LambdaContainerConstruct } from "./constructs/lambda";

import { LambdaCodePipelineConstruct } from "./constructs/pipeline/codePipelineLambda.construct";
import * as path from "path";
import * as fs from "fs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { BuildSpec, ComputeType, LinuxBuildImage, PipelineProject } from "aws-cdk-lib/aws-codebuild";

export interface InfraProps extends cdk.StackProps {
  readonly environmentName: string;
  // readonly domainName: string;
  readonly vpcId: string;
  readonly dbUserSecretArn: string;
  readonly readyToBuild: boolean;
  readonly useECS: boolean;
  readonly templatePath: string;
}
export class ApsoServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraProps) {
    super(scope, id, props);

    const { environmentName, dbUserSecretArn } = props;

    const vpc = getVpc(this, `${id}-vpc`, props.vpcId);

    // const ccRepoResources = new CodeCommitConstruct(
    //   this,
    //   `${id}-code-repo`,
    //   props.environmentName
    // );

    if (props.readyToBuild) {
      if (props.useECS) {
        this.provisionEcsCluster(id, environmentName, vpc, dbUserSecretArn)
      } else {
        this.provisionLambdaService(id, environmentName, vpc, dbUserSecretArn, props.templatePath)
      }
    }
  }

  private provisionEcsCluster(
    id: string,
    environmentName: string,
    vpc: IVpc,
    dbUserSecretArn: string) {
    const ecrResources = new EcrConstruct(this, `${id}-ecr`, environmentName);
    const ecsClusterResources = new EcsClusterConstruct(
      this,
      `${id}-ecs-cluster`,
      vpc,
      environmentName
    );

    const ecsServiceResources = new EcsServiceConstruct(
      this,
      `${id}-ecs-service`,
      environmentName,
      ecsClusterResources.cluster,
      ecsClusterResources.executionRole,
      ecrResources.repository,
      dbUserSecretArn,
      vpc
    );

  }

  private provisionLambdaService(
    id: string,
    environmentName: string,
    vpc: IVpc,
    dbUserSecretArn: string,
    templatePath: string
  ) {
    const dbUserSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      id,
      dbUserSecretArn
    );
    const dbUser = dbUserSecret.secretValueFromJson('username').unsafeUnwrap();
    const dbPass = dbUserSecret.secretValueFromJson('password').unsafeUnwrap();
    const schema = dbUserSecret.secretValueFromJson('schema').unsafeUnwrap();
    const database = dbUserSecret.secretValueFromJson('database').unsafeUnwrap();
    const host = dbUserSecret.secretValueFromJson('host').unsafeUnwrap();
    const port = dbUserSecret.secretValueFromJson('port').unsafeUnwrap();

    console.log('Template File: ', `${templatePath}/src/lambda.ts`)

    const container = {
      src: path.join(`${templatePath}`, 'containers', 'lambda', 'Dockerfile'),
      dest: path.join(`${templatePath}`, 'Dockerfile')
    }

    fs.copyFileSync(container.src, container.dest);

    const nestJsLambda = new LambdaContainerConstruct(
      this,
      `${id}-apso-service-lambda`,
      templatePath,
      'dist/lambda.handler', // despite the file name, it always compiles to index.js
      {
        // ...props.environmentVariables,
        "DATABASE_HOST": host,
        "DATABASE_PORT": port,
        "DATABASE_USERNAME": dbUser,
        "DATABASE_PASSWORD": dbPass,
        "DATABASE_NAME": database,
        "DATABASE_SCHEMA": schema,
        "DATABASE_SYNC": "true",
        "DATABASE_LOGGING": 'all'
      },
      {
        timeoutMinutes: 2,
        vpc,
      },
    );

    const restApi = new RestApi(this, `${id}-apso-api-gateway`, {
      restApiName: id
    });

    const proxyResource = restApi.root.addResource('{proxy+}'); // Catch-all for any subpath
    proxyResource.addMethod('ANY', new LambdaIntegration(nestJsLambda.lambda));

    new cdk.CfnOutput(this, "APIGatewayURL", {
      value: restApi.url,
    });

  }

}
