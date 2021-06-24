import { ConsumerDeserializer, IncomingRequest } from '@nestjs/microservices';
import * as context from '../context';

const propagator = new context.NatsPropagator();
export class InboundMessageIdentityDeserializer
  implements ConsumerDeserializer
{
  deserialize(
    value: IncomingRequest,
    options?: Record<string, unknown>,
  ): IncomingRequest {
    void options;
    const extractedCtx = propagator.extract(value);
    if (extractedCtx) {
      // small hack to send context to interceptor, the idea is to execute handle function with data only...
      // would be awesome if context can be set up here.
      console.log('Extracted Ctx', extractedCtx);
      const ctx = {};
      propagator.inject(ctx, extractedCtx);
      value.data = {
        data: value.data,
        context: ctx,
      };
    }
    console.log('VALUE=>', value);
    return value;
  }
}
