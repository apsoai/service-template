import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmAsyncConfig, useNoDatabase } from './orm.config';
import { HealthCheckController } from './healthCheck/HealthCheckController';
import moduleImports from './autogen';
import testmoduleImports from './test-module';

// Build imports array conditionally
const imports = [
  ConfigModule.forRoot({ isGlobal: true }),
  // Only include TypeOrmModule if we have a database configured
  ...(useNoDatabase || !typeOrmAsyncConfig ? [] : [TypeOrmModule.forRootAsync(typeOrmAsyncConfig)]),
  // Only include entity modules if we have a database
  ...(useNoDatabase ? [] : moduleImports),
  ...(useNoDatabase ? [] : testmoduleImports),
];

@Module({
  imports,
  controllers: [HealthCheckController],
})
export class AppModule {}
