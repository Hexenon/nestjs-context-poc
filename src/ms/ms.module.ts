import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ContextInterceptor } from 'src/lib/context';
import { ContextDataPipe } from 'src/lib/context';
import { MsController } from './ms.controller';
import { MsService } from './ms.service';
import { OgmaInterceptor, OgmaModule } from '@ogma/nestjs-module';
import { NatsParser } from '@ogma/platform-nats';
import { ExpressParser } from '@ogma/platform-express';
import { OgmaExtensionInterceptor } from './ogma-extension.interceptor';

@Module({
  imports: [
    OgmaModule.forRoot({
      service: {
        color: true,
        json: false,
        application: 'ms',
      },
      interceptor: {
        http: ExpressParser,
        ws: false,
        gql: false,
        rpc: NatsParser,
      },
    }),
  ],
  controllers: [MsController],
  providers: [
    MsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: OgmaExtensionInterceptor,
    },
    // {
    //   provide: APP_PIPE,
    //   useClass: ContextDataPipe,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ContextInterceptor,
    // },
  ],
})
export class MsModule {}
