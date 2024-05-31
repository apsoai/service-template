import { ServiceType } from "../types/service";
import { Command, runSyncCommand } from "./run";
import config from "../config"

export enum CdkCommand {
  Deploy = "deploy",
  Destroy = "destroy",
}

export interface CdkNetworkParams {
  stackId: string;
  vpcIpAddress: string;
}

export interface ServiceResponse {
  codeCommitUrl: string;
  serviceUrl: string;
}

export interface NetworkResponse {
  vpcId: string;
  ecsClusterName: string;
  ecsClusterArn: string;
  ecsExecutionRoleArn: string;
}

export interface CdkDBParams {
  stackId: string;
  vpcId: string;
  useCluster: boolean;
}

export interface CdkSharedServiceParams {
  stackId: string;
  serviceType: ServiceType;
  serviceId: number;
  vpcId: string;
  dbUserSecretArn: string;
}

const parseCdkOutput = (stackId: string, searchKey: string): string => {
  const command = new Command("sh", [
    "-c",
    `aws cloudformation describe-stacks --stack-name=${stackId} --output=json --region=us-east-1 | jq -r '.Stacks[0].Outputs[] | select(.OutputKey | contains("${searchKey}")) | .OutputValue'`,
  ]);
  return runSyncCommand(command).trim();
};

const runCdkCommand = (
  cdkCommand: CdkCommand,
  stackType: string,
  stackParams: CdkNetworkParams | CdkDBParams | CdkSharedServiceParams
): void => {
  const approval =
    cdkCommand === "deploy" ? ["--require-approval", "never"] : ["--force"];
  const paramArgs = [
    "-c",
    `type=${stackType}`,
    ...Object.entries(stackParams)
      .map(([key, value]) => ["-c", `${key}=${value}`])
      .flat(1),
    ...approval,
  ];
  const command = new Command("npx", ["cdk", cdkCommand, ...paramArgs]);
  runSyncCommand(command, config.BUILD_SERVICE_DIRECTORY);
};

export const runCdkDeploy = (
  stackType: string,
  stackParams: CdkNetworkParams | CdkDBParams | CdkSharedServiceParams
): void => {
  runCdkCommand(CdkCommand.Deploy, stackType, stackParams);
};

export const runCdkDestroy = (
  stackType: string,
  stackParams: CdkNetworkParams | CdkDBParams | CdkSharedServiceParams
): void => {
  runCdkCommand(CdkCommand.Destroy, stackType, stackParams);
};

export const deployService = (
  stackParams: CdkSharedServiceParams
): ServiceResponse => {
  // runCdkDeploy("service", stackParams);
  return {
    codeCommitUrl: parseCdkOutput(stackParams.stackId, "CodeCommitRepo"),
    serviceUrl: parseCdkOutput(stackParams.stackId, "ecsserviceServiceURL"),
  };
};

export const getServiceCodeCommitUrl = (
  stackParams: CdkSharedServiceParams
): string => {
  return parseCdkOutput(`${stackParams.stackId}-service`, "CodeCommitRepo")
};

export const getEcsServiceUrl = (
  stackParams: CdkSharedServiceParams
): string => {
  return parseCdkOutput(`${stackParams.stackId}-service`, "ecsserviceServiceURL")
};

export const getApiGatewayUrl = (
  stackParams: CdkSharedServiceParams
): string => {
  return parseCdkOutput(`${stackParams.stackId}-service`, "APIGatewayURL")
};

export const destroyService = (stackParams: CdkSharedServiceParams): void => {
  runCdkDestroy("service", stackParams);
};

export const deployNetwork = (
  stackParams: CdkNetworkParams
): NetworkResponse => {
  runCdkDeploy("network", stackParams);
  return {
    vpcId: parseCdkOutput(stackParams.stackId, "VpcId"),
    ecsClusterName: parseCdkOutput(stackParams.stackId, "ECSClusterName"),
    ecsClusterArn: parseCdkOutput(stackParams.stackId, "ECSClusterArn"),
    ecsExecutionRoleArn: parseCdkOutput(
      stackParams.stackId,
      "ECSExecutionRoleArn"
    ),
  };
};

export const destroyNetwork = (stackParams: CdkNetworkParams): void => {
  runCdkDestroy("network", stackParams);
};

export const deployDatabase = (stackParams: CdkDBParams): string => {
  runCdkDeploy("database", stackParams);
  return parseCdkOutput(stackParams.stackId, "DBUserCredentialsArn");
};

export const destroyDatabase = (stackParams: CdkDBParams): void => {
  runCdkDestroy("database", stackParams);
};
