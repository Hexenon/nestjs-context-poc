import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { context } from '../context';
import { NatsPropagator } from '../nats-propagator';

const propagator = new NatsPropagator();

@Injectable()
export class ContextDataPipe implements PipeTransform<any> {
  async transform(value: any, argumentMeta: ArgumentMetadata) {
    if (value.data && value.context) {
      const ctx = propagator.extract(value.context);
      console.log('PIPE CTX', ctx, argumentMeta);
      value = value.data;
      return context.withContext(ctx, () => {
        context.bind(argumentMeta, ctx);
        return value;
      });
    }
    return value;
  }
}
