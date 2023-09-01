import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmAsyncConfig } from './orm.config';
import { HealthCheckController } from './healthCheck/HealthCheckController';
import moduleImports from './autogen';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      resolvers: { JSON: GraphQLJSON },
      sortSchema: true,
      context: ({ req }) => ({ req }),
    }),
    ...moduleImports,
  ],
  controllers: [HealthCheckController],
})
export class AppModule {}
