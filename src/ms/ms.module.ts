import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ContextInterceptor } from 'src/lib/context';
import { MsController } from './ms.controller';
import { MsService } from './ms.service';

@Module({
  controllers: [MsController],
  providers: [
    MsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ContextInterceptor,
    },
  ],
})
export class MsModule {}
