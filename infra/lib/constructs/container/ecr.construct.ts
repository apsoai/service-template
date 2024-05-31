import { RemovalPolicy, Tags } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-ecr";
import * as imagedeploy from '@mavric/cdk-docker-image-deployment';
import { Construct } from "constructs";
import * as path from "path";

// const baseTemplateImageUri =
//   "041451437307.dkr.ecr.us-west-2.amazonaws.com/apso-service-template:latest";

export class EcrConstruct extends Construct {
  public readonly repository: Repository;

  constructor(scope: Construct, id: string, envName: string) {
    super(scope, id);

    const repoName = `${envName}-ecr`;
    this.repository = new Repository(this, "Repository", {
      repositoryName: repoName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteImages: true,
    });
    this.repository.addLifecycleRule({ maxImageCount: 5 });

    // const image = new DockerImageAsset(this, 'ServiceApiDockerImage', {
    //   // directory: path.join(__dirname, '../../../..'),
    //   directory: '/usr/src/template'
    // });

    // // Copy from cdk docker image asset to another ECR.
    // new ecrdeploy.ECRDeployment(this, "DeployDockerImage", {
    //   // src: new ecrdeploy.DockerImageName(image.imageUri),
    //   buildImage: 'public.ecr.aws/sam/build-provided.al2023:1.113.0-20240319235114',
    //   src: new ecrdeploy.DockerImageName(baseTemplateImageUri),
    //   dest: new ecrdeploy.DockerImageName(this.repository.repositoryUri),
    // });

    // Copy from cdk docker image asset to another ECR.
    new imagedeploy.DockerImageDeployment(this, 'DeployDockerImage', {
      source: imagedeploy.Source.directory(path.join(__dirname, '../../../../apso-service-template')),
      // source: imagedeploy.Source.bind()
      destination: imagedeploy.Destination.ecr(this.repository, {
        tag: 'latest',
      }),
    });
  }
}
