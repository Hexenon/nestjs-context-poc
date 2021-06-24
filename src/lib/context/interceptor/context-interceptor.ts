/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as context from '../../context';

const propagator = new context.NatsPropagator();

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(
    executionCtx: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    console.log('Before...');
    const now = Date.now();
    switch (executionCtx.getType()) {
      case 'http': {
        return next
          .handle()
          .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
      }
      case 'rpc': {
        const rpcCtx = executionCtx.switchToRpc();
        const rpcData = rpcCtx.getData();
        const ctx = context.active();
        console.log('ZEUS CTX', ctx);
        if (rpcData.context) {
          const zeusCtx = propagator.extract(rpcData.context);
          return context.withContext(zeusCtx, () => {
            context.bind(executionCtx, zeusCtx);
            return next
              .handle()
              .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
          });
        }
        return next
          .handle()
          .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
      }
      case 'ws': {
        return next
          .handle()
          .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
      }
    }
  }
}
