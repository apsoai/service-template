import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.rest';
import { TypeORMErrorFilter } from './utils/errors/db-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new TypeORMErrorFilter());

  const options = new DocumentBuilder()
    .setTitle('{ApplicationName}')
    .setVersion('1.0')
    .build();
  // const document = SwaggerModule.createDocument(app, options);
  // SwaggerModule.setup('_docs', app, document);

  await app.listen(process.env.APP_PORT || 3000);
}

bootstrap();
