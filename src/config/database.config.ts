import { DataSourceOptions } from 'typeorm';
import { config } from './env.config';

// PGlite doesn't need connection details - it runs in-memory
const isPGlite = config.DATABASE_TYPE === 'pglite';

// 'none' skips database entirely (useful for WebContainer preview)
const skipDatabase = config.DATABASE_TYPE === 'none';

// Base config for standard database connections (postgres, mysql)
const standardDatabaseConfig: Partial<DataSourceOptions> = {
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  username: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  schema: config.DATABASE_SCHEMA,
};

// Only create database config if we're not skipping database
export const database: DataSourceOptions | null = skipDatabase
  ? null
  : ({
      // PGlite uses 'postgres' type under the hood
      type: isPGlite ? 'postgres' : config.DATABASE_TYPE,
      // Only include connection details for non-pglite databases
      ...(isPGlite ? {} : standardDatabaseConfig),
      // Environment Variables store as a string but this prop expects a boolean value.
      synchronize: /^true$/i.test(config.DATABASE_SYNC),
      logging: config.DATABASE_LOGGING,
    } as DataSourceOptions);

// Export flags for use in orm.config.ts and app.module.ts
export const usePGlite = isPGlite;
export const useNoDatabase = skipDatabase;
