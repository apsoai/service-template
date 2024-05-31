import {
  DatabaseCluster,
  DatabaseInstanceBase,
  IDatabaseCluster,
  IDatabaseInstance,
} from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

export const getDatabaseCluster = (
  scope: Construct,
  id: string,
  clusterIdentifier: string
): IDatabaseCluster => {
  return DatabaseCluster.fromDatabaseClusterAttributes(scope, id, {
    clusterIdentifier,
  });
};

export const getDatabaseInstance = (
  scope: Construct,
  id: string,
  dbIdentifier: string
): IDatabaseInstance => {
  return DatabaseInstanceBase.fromDatabaseInstanceAttributes(scope, id, {
    instanceIdentifier: dbIdentifier,
    instanceEndpointAddress:
      "apsodatabasestack-db1-apsodatabaseapsodbdafbc910-pbtmvkapf69i.csy2h76nlvlq.us-west-2.rds.amazonaws.com",
    port: 5432,
    securityGroups: [],
  });
};
