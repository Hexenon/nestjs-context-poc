import { Injectable } from '@nestjs/common';
import { context, TraceId } from '../lib/context';

@Injectable()
export class MsService {
  hello(data: unknown): {
    data: unknown;
    traceId: string;
  } {
    const ctx = context.active();
    return {
      data,
      traceId: ctx ? ctx.get(TraceId) : '',
    };
  }
}
