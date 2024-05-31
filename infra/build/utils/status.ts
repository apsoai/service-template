import { ServiceStatus } from "../types/service";
import { updateServiceStatus } from "./api";

export const setServiceStatus = {
    provisionDatabase: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.ProvisioningDatabase),
    databaseProvisioned: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.DatabaseProvisioned),
    initializeService: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.InitializingService),
    serviceInitialized: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.ServiceInitialized),
    scaffolding: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.Scaffolding),
    readyToBuild: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.ReadyToBuild),
    deploying: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.Building),
    deployed: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.BuildDone),
    ready: (serviceId: number) => updateServiceStatus(serviceId, ServiceStatus.Ready),
}