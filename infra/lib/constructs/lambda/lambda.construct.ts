import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Duration } from 'aws-cdk-lib';

export class LambdaConstruct extends Construct {
  public readonly lambda: lambda.Function;
  constructor(
    scope: Construct,
    id: string,
    entryFile: string,
    handler: string,
    environment: { [key: string]: string },
    options?: { [key: string]: string | any },
  ) {
    super(scope, id);

    this.lambda = new NodejsFunction(this, id, {
      bundling: {
        externalModules: [
          '@nestjs/platform-socket.io',
          'ioredis',
          'kafkajs',
          'mqtt',
          'amqplib',
          'nats',
          'amqp-connection-manager',
          '@grpc/grpc-js',
          '@grpc/proto-loader',
          'class-transformer/storage',
          'cache-manager',
          '@nestjs/websockets/socket-module',
          'cache-manager',
        ],
      },
      functionName: id,
      handler,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: entryFile,
      environment,
      depsLockFilePath: 'package-lock.json',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.minutes(options?.timeoutMinutes || 2),
      vpc: options?.vpc,
      // vpcSubnets: 
    });

    // new LogGroup(this, 'LogGroup', {
    //     logGroupName: `/aws/lambda/${this.lambda.functionName}`
    // })
  }
}
