import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { join } from 'path';
import AppConfig from './config';
import { usePGlite } from './config/database.config';

// Conditionally import PGliteDriver only when needed
let PGliteDriver: any;
if (usePGlite) {
  try {
    PGliteDriver = require('typeorm-pglite').PGliteDriver;
  } catch (e) {
    console.error('Failed to load typeorm-pglite. Make sure it is installed:', e);
  }
}

const sslConfig = process.env.DB_SSL
  ? {
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }
  : {};

// Build ORM config based on database type
const ormConfig = {
  type: AppConfig.database.type as any,
  // PGlite uses driver injection instead of connection details
  ...(usePGlite && PGliteDriver
    ? { driver: new PGliteDriver().driver }
    : {
        host: AppConfig.database.host,
        port: parseInt(AppConfig.database.port, 10),
        username: AppConfig.database.username,
        database: AppConfig.database.database,
        password: AppConfig.database.password,
        schema: AppConfig.database.schema,
        ...sslConfig,
      }),
  entities: [join(__dirname, '**', '*.entity.js')],
  migrations: [join(__dirname, '**', 'migrations/*-migration.js')],
  synchronize: AppConfig.database.synchronize,
  logging: AppConfig.database.logging,
};

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    console.log('ORM CONFIG', { ...ormConfig, driver: usePGlite ? '[PGliteDriver]' : undefined });
    if (usePGlite) {
      console.log('Using PGlite in-memory database');
    }
    return ormConfig;
  },
};

export default new DataSource(ormConfig);
