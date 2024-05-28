import * as env from "dotenv";
import path from "path";

export interface EnvConfigOptions {
  ENV: "local" | "dev" | "staging" | "production";
  PROCESS_REPO_DIRECTORY: string;
  BUILD_SERVICE_DIRECTORY: string;
  TEMPLATE_DIRECTORY: string;
}

const defaultConfig: EnvConfigOptions = {
  ENV: "local",
  PROCESS_REPO_DIRECTORY: "/tmp/repo",
  TEMPLATE_DIRECTORY: path.join(__dirname, "../../apso-service-template"),
  BUILD_SERVICE_DIRECTORY: "/usr/src/service-build"
};

export const config: EnvConfigOptions = {
  ...defaultConfig,
  ...process.env,
  ...env.config().parsed,
};
