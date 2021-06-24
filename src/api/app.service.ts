import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as context from '../lib/context';
import { TraceId } from '../lib/context';

@Injectable()
export class AppService {
  constructor(@Inject('MS_CLIENT') private readonly client: ClientProxy) {}
  async getHello(): Promise<{
    msg: string;
    traceId: string;
    remote: unknown;
  }> {
    const ctx = context.active();
    const r = await this.client.send('hello', '').toPromise();
    return {
      msg: 'Hello World!',
      traceId: ctx ? ctx.get(TraceId) : '',
      remote: r,
    };
  }
}
