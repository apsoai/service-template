import { CfnOutput, Tags } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import {
  Cluster,
  ContainerImage,
  FargateTaskDefinition,
  LogDrivers,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { ManagedPolicy, Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class EcsServiceConstruct extends Construct {
  public readonly lbService: ApplicationLoadBalancedFargateService;
  public readonly containerName: string;

  constructor(
    scope: Construct,
    id: string,
    envName: string,
    cluster: Cluster,
    ecsExecutionRole: Role,
    repository: Repository,
    dbUserSecretArn: string,
    vpc: IVpc
  ) {
    super(scope, id);

    console.log('build service', dbUserSecretArn);
    const clusterSG = new ec2.SecurityGroup(this, `${id}-security-group`, {
      vpc,
      description: 'cluster Security Group',
      });

    cluster.connections.securityGroups.push(clusterSG);

    const fargateTaskDefinition = new FargateTaskDefinition(this, `${id}-td`, {
      family: `${id}-api-td`,
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole: ecsExecutionRole,
    });
    fargateTaskDefinition.taskRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonECSTaskExecutionRolePolicy"
      )
    );

    fargateTaskDefinition.taskRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonRDSFullAccess"
      )
    );

    const dbUserSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      id,
      dbUserSecretArn
    );

    this.containerName = `${envName}-server`;
    const container = fargateTaskDefinition.addContainer("service-api", {
      // Use an image from Amazon ECR
      containerName: this.containerName,
      image: ContainerImage.fromRegistry(repository.repositoryUri),
      logging: LogDrivers.awsLogs({ streamPrefix: envName }),
      environment: {
        APP_ID: `${envName}-api`,
        APP_PORT: "3000",
        DATABASE_TYPE: "postgres",
        DATABASE_NAME: "postgres",
        DATABASE_SCHEMA: "public",
        DATABASE_LOGGING: "all",
        ENV: "dev",
      },
      // ... other options here ...
    });
    container.addPortMappings({
      containerPort: 3000,
    });

    // Add the database username and password as a secret to the container
    container.addSecret(
      "DATABASE_HOST",
      ecs.Secret.fromSecretsManager(dbUserSecret, "host")
    );
    container.addSecret(
      "DATABASE_PORT",
      ecs.Secret.fromSecretsManager(dbUserSecret, "port")
    );
    container.addSecret(
      "DATABASE_USERNAME",
      ecs.Secret.fromSecretsManager(dbUserSecret, "username")
    );
    container.addSecret(
      "DATABASE_PASSWORD",
      ecs.Secret.fromSecretsManager(dbUserSecret, "password")
    );

     // Create a security group for the ALB
     const albSecurityGroup = new ec2.SecurityGroup(this, `${envName}-ALBSecurityGroup`, {
      vpc,
    });

    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP ingress traffic');
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS ingress traffic');

    clusterSG.addEgressRule(
      albSecurityGroup,
      ec2.Port.allTraffic(),
      `Allow HTTPS egress traffic from ecs`
    );

    // Create a load-balanced Fargate service and make it public
    this.lbService = new ApplicationLoadBalancedFargateService(
      this,
      `${envName}-api-service`,
      {
        serviceName: `${envName}-api`,
        cluster, // Required
        cpu: 512, // Default is 256
        desiredCount: 1, // Default is 1
        taskDefinition: fargateTaskDefinition,
        memoryLimitMiB: 1024, // Default is 512
        publicLoadBalancer: true, // Default is true
        securityGroups: [albSecurityGroup]
      }
    );
    this.lbService.targetGroup.configureHealthCheck({
      path: "/health",
    });

    const scalableTarget = this.lbService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 6,
    });
    scalableTarget.scaleOnMemoryUtilization("ScaleUpMem", {
      targetUtilizationPercent: 75,
    });

    scalableTarget.scaleOnCpuUtilization("ScaleUpCPU", {
      targetUtilizationPercent: 75,
    });

    Tags.of(this.lbService).add("environment", envName);

    new CfnOutput(this, "ServiceURL", {
      value: `http://${this.lbService.loadBalancer.loadBalancerDnsName}`,
    });
  }
}
