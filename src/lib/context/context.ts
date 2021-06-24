export interface Context {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  keys: () => IterableIterator<string>;
  values: () => IterableIterator<string>;
  entries: () => IterableIterator<[string, string]>;
  clear: () => void;
}

export const TraceId = 'traceId';
export const Auth = 'authorization';
export const UserId = 'userId';
export const Synthetic = 'synthetic';

export const WellKnownKeys = [TraceId, UserId, Synthetic, Auth];
