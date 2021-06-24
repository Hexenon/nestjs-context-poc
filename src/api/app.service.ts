import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TraceId, context } from '../lib/context';

@Injectable()
export class AppService {
  constructor(@Inject('MS_CLIENT') private readonly client: ClientProxy) {}
  async getHello(data: unknown): Promise<{
    msg: string;
    traceId: string;
    remote: unknown;
  }> {
    const ctx = context.active();
    const r = await this.client.send('hello', data).toPromise();
    return {
      msg: 'Hello World!',
      traceId: ctx ? ctx.get(TraceId) : '',
      remote: r,
    };
  }
}
