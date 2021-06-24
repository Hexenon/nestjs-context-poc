import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { buildTransportOptions } from 'src/lib/nats';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
