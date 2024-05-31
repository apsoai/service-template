import { IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export const getVpc = (scope: Construct, id: string, vpcId: string): IVpc => {
  return Vpc.fromLookup(scope, id, { vpcId });
};
