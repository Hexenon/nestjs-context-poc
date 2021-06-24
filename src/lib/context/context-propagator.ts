import { Context } from './context';

export interface ContextPropagator<T> {
  inject: (target: T, ctx: Context) => void;
  extract: (target: T) => Context;
}
