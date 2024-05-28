import { promises as fs } from 'fs';
import * as path from 'path';
import { setServiceStatus } from './utils/status';
import { getServiceDetails, storeServiceDetailsApi } from './utils/api';
import { getApiGatewayUrl, getEcsServiceUrl, runCdkDeploy } from './utils/cdk';
import { logger } from './utils/logger';
import config from './config';

async function getApsoJson(filePath: string) {
    try {
        // Read the existing package.json file
        const data = await fs.readFile(filePath, 'utf-8');
        
        // Parse the JSON data
        const apsorc = JSON.parse(data);
        return apsorc;
    } catch (error) {
        console.error(`Failed to read package.json: ${error.message}`);
        return null;
    }
}

async function build() {
    const apso = await getApsoJson(path.join('..','..', '.apsorc'));
    const serviceDetails = await getServiceDetails(apso.serviceId);
    await setServiceStatus.deploying(apso.serviceId);
    const cdkParams = {
        stackId: serviceDetails.stackId,
        serviceType: serviceDetails.serviceType,
        serviceId: serviceDetails.serviceId,
        vpcId: serviceDetails.vpcId,
        dbUserSecretArn: serviceDetails.dbAdminCredentialsArn,
        readyToBuild: true,
        useECS: false,
        templatePath: config.PROCESS_REPO_DIRECTORY
      };
      runCdkDeploy("service", cdkParams);
      const ecsServiceUrl = getEcsServiceUrl(cdkParams);
      const apiGatewayUrl = getApiGatewayUrl(cdkParams);
      logger.info('ecsCommitUrl', ecsServiceUrl);
      serviceDetails.serviceUrl = ecsServiceUrl || apiGatewayUrl;
      await storeServiceDetailsApi(apso.serviceId, serviceDetails);
  
      console.log("New service is deployed and ready");
      await setServiceStatus.ready(serviceDetails.serviceId);
}

build()
  .then((response) => {
    console.log(`Response: ${JSON.stringify(response)}`);
    process.exit(0);
  })
  .catch((err) => {
    console.log(`Error: ${err}`);
    process.exit(1);
  });
