/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { context } from '../context';
import { NatsPropagator } from '../nats-propagator';

const propagator = new NatsPropagator();

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
        if (rpcData.context) {
          const zeusCtx = propagator.extract(rpcData.context);
          return context.withContext(zeusCtx, () => {
            context.bind(executionCtx, zeusCtx);
            return from([executionCtx.getHandler()(rpcData.data)]).pipe(
              tap(() => console.log(`After... ${Date.now() - now}ms`)),
            );
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
