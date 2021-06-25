import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { buildTransportOptions } from 'src/lib/nats';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OgmaInterceptor, OgmaModule } from '@ogma/nestjs-module';
import { ExpressParser } from '@ogma/platform-express';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NatsParser } from '@ogma/platform-nats';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MS_CLIENT',
        useFactory: () => {
          return buildTransportOptions('nats://localhost:4222');
        },
      },
    ]),
    OgmaModule.forRoot({
      service: {
        color: true,
        json: false,
        application: 'api',
      },
      interceptor: {
        http: ExpressParser,
        ws: false,
        gql: false,
        rpc: NatsParser,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: OgmaInterceptor,
    },
  ],
})
export class AppModule {}
