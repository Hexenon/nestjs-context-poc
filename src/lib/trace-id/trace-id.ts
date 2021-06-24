import * as context from '../context';
import { TraceIdProvider } from './trace-id-provider';
import { UUIDTraceIdProvider } from './uuid-trace-id-provider';

let provider = new UUIDTraceIdProvider();

/**
 * Returns the current requestId from the active context (if
 * there is one)
 */
export const current = (): string | undefined => {
  return context.get(context.TraceId);
};

/**
 * If there is no current requestId, it creates one and sets it
 * on the active context. If there is a requestId, it extends it
 * and updates the active context.
 *
 * Returns the newly created or extended requestId.
 */
export const ensure = (): string => {
  let id = current();
  if (id) {
    id = extend(id);
  } else {
    id = create();
  }
  context.set(context.TraceId, id);
  return id;
};

/**
 * Returns a new requestId. This should only be used if
 * you are maintaining a requestId stack outside of the
 * context API.
 */
export const create = (): string => {
  return provider.create();
};

/**
 * Returns an extended requestId. This should only be used if
 * you are maintaining a requestId stack outside of the
 * context API.
 */
export const extend = (id: string): string => {
  return provider.extend(id);
};

/**
 * Updates the global provider. This could be useful in testing
 * if you want to provide a mock implementation.
 */
export const setProvider = (newProvider: TraceIdProvider): void => {
  provider = newProvider;
};

/**
 * Gets the global provider, this can be useful if you
 * don't want to use the context API for maintaining
 * a requestId chain.
 */
export const getProvider = (): TraceIdProvider => {
  return provider;
};
