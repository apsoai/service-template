import { JSONObject } from "../utils/types";

export enum ServiceType {
  Shared = "Shared",
  Standalone = "Standalone",
}

export interface SharedServiceParameters {
  serviceId: number;
  stackId: string;
  serviceType: ServiceType;
  apsorc: JSONObject;
  vpcId: string;
  dbAdminCredentialsArn: string;
  dbUserCredentialsArn?: string;
  codeCommitUrl?: string;
  serviceUrl?: string;
}

export enum ServiceStatus {
  New = "New",
  ProvisioningDatabase = "ProvisioningDatabase",
  DatabaseProvisioned = "DatabaseProvisioned",
  InitializingService = "InitializingService",
  ServiceInitialized = "ServiceInitialized",
  Scaffolding = "Scaffolding",
  ReadyToBuild = "ReadyToBuild",
  Building = "Building",
  BuildDone = "BuildDone",
  Ready = "Ready",
}
