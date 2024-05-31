import { DockerImageFunction, DockerImageCode, Function } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Duration } from 'aws-cdk-lib';

export class LambdaContainerConstruct extends Construct {
    public readonly lambda: Function;
    constructor(
        scope: Construct,
        id: string,
        imagePath: string,
        handler: string,
        environment: { [key: string]: string },
        options?: { [key: string]: string | any },
    ) {
        super(scope, id);

        //AWS Lambda Functions

        this.lambda = new DockerImageFunction(this, id, {
            functionName: id,
            code: DockerImageCode.fromImageAsset(imagePath, {
                cmd: [ handler ],
                entrypoint: ["/lambda-entrypoint.sh"],
            }),
            environment,
            logRetention: RetentionDays.ONE_WEEK,
            timeout: Duration.minutes(options?.timeoutMinutes || 2),
            vpc: options?.vpc,
        });

        //CloudWatch Logs Policy

        // const cloudWatchLogsPolicyPolicy = new iam.PolicyStatement({
        //     effect: iam.Effect.ALLOW,
        //     actions: [
        //         "logs:CreateLogGroup",
        //         "logs:CreateLogStream",
        //         "logs:PutLogEvents",
        //     ]
        // });

        // cloudWatchLogsPolicyPolicy.addAllResources();

        //Grant CloudWatch access to Lambda Functions

        // listMovieFunction.addToRolePolicy(cloudWatchLogsPolicyPolicy);
        // getMovieFunction.addToRolePolicy(cloudWatchLogsPolicyPolicy);

    }
}