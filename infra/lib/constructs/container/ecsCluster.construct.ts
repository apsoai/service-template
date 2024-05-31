import { CfnOutput, Tags } from "aws-cdk-lib";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class EcsClusterConstruct extends Construct {
  public readonly cluster: Cluster;
  public readonly executionRole: Role;

  constructor(scope: Construct, id: string, vpc: IVpc, envName: string) {
    super(scope, id);

    this.cluster = new Cluster(this, `${id}-ct`, {
      vpc,
      clusterName: envName,
    });
    Tags.of(this.cluster).add("env", envName);

    this.executionRole = new Role(this, "EcsExecutionRole", {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
    });
    this.executionRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ssm:GetParameters",
        ],
        resources: ["*"],
      })
    );

    new CfnOutput(this, "ECSClusterArn", {
      value: this.cluster.clusterArn,
    });
    new CfnOutput(this, "ECSClusterName", {
      value: this.cluster.clusterName,
    });
    new CfnOutput(this, "ECSExecutionRoleArn", {
      value: this.executionRole.roleArn,
    });
  }
}
