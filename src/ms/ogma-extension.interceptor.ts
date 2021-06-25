import { ExecutionContext, Injectable } from '@nestjs/common';
import { OgmaInterceptor } from '@ogma/nestjs-module';

@Injectable()
export class OgmaExtensionInterceptor extends OgmaInterceptor {
  generateRequestId(context: ExecutionContext) {
    if (context.getType() === 'rpc') {
      const ctx = context.switchToRpc();
      return ctx.getData().traceId;
    }
    return super.generateRequestId(context);
  }
}
