import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { createContextMiddleware } from './lib/context';
import { createTraceIdMiddleware } from './lib/trace-id';
import * as context from './lib/context';
import { Logger } from '@nestjs/common';
import { MsModule } from './ms/ms.module';
import { buildTransportOptions } from './lib/nats';

async function bootstrapApi() {
  await context.init({
    providerType: 'node',
  });
  const app = await NestFactory.create(AppModule);
  app.use(createContextMiddleware());
  app.use(createTraceIdMiddleware());
  app.listen(3000, () => {
    Logger.log('Api ready http://localhost:3000');
  });
}
bootstrapApi();

async function boostrapMs() {
  await context.init({
    providerType: 'node',
  });
  const ms = await NestFactory.createMicroservice(MsModule, {
    ...buildTransportOptions('nats://localhost:4222'),
  });

  await ms.listenAsync();
}
boostrapMs();
