import { Injectable } from '@nestjs/common';
import * as context from '../lib/context';
import { TraceId } from '../lib/context';

@Injectable()
export class MsService {
  hello(): {
    msg: string;
    traceId: string;
  } {
    const ctx = context.active();
    return {
      msg: 'hello',
      traceId: ctx ? ctx.get(TraceId) : '',
    };
  }
}
