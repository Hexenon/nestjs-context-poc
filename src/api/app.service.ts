import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TraceId, context } from '../lib/context';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
@Injectable()
export class AppService {
  constructor(
    @Inject('MS_CLIENT') private readonly client: ClientProxy,

    private readonly logger: OgmaService,
  ) {}
  async getHello(data: unknown): Promise<{
    msg: string;
    traceId: string;
    remote: unknown;
  }> {
    this.logger.info('Amazing logging 1', {
      some: 'value',
    });
    const r = await this.client.send('hello', data).toPromise();
    return {
      msg: 'Hello World!',
      traceId: '',
      remote: r,
    };
  }
}
