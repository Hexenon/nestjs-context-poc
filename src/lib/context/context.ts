import { IContextManager } from './context-manager';
import { NoopContextManager } from './noop-context-manager';
import { AsyncHooksContextManager } from './async-hook-context-manager';

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

let defaultContextManager: IContextManager = new NoopContextManager();
export type ProviderType = 'node' | 'noop';

export interface ContextConfig {
  /**
   * The type of context provider that should be running.
   *
   * If provider type is not set, or set to 'noop', this will initialize a dummy
   * stack suitable for tests. When set to 'node', this will create a stack that
   * uses async_hooks.
   *
   * @default 'noop'
   */
  providerType: ProviderType;
}

export const noopContextConfig: ContextConfig = {
  providerType: 'noop',
};

export const nodeContextConfig: ContextConfig = {
  providerType: 'node',
};

export const defaultContextConfig: ContextConfig =
  process.env.NODE_ENV === 'test' ? noopContextConfig : nodeContextConfig;

let _init = false;

/**
 * Sets a global context manager and enables it. This will disable
 * any previously set context manager before installing the new one.
 *
 * @param config The context config
 */
const init = async (config?: Partial<ContextConfig>): Promise<void> => {
  if (_init) {
    return Promise.resolve();
  }

  config = config || {};
  const settings: ContextConfig = Object.assign(
    {},
    defaultContextConfig,
    config,
  );

  _init = true;
  if (settings.providerType === 'node') {
    defaultContextManager = new AsyncHooksContextManager();
  } else {
    defaultContextManager = new NoopContextManager();
  }
  defaultContextManager.enable();
};

/**
 * Disables the global context manager and any patches it installed
 */
const disable = (): IContextManager => {
  if (!_init) {
    return;
  }
  _init = false;
  return defaultContextManager;
};

/**
 * Run the callback with object set as the current active context
 *
 * @example
 * withContext(new Map<string, string>(['key', 'value']), () => {
 *  setTimeout(() => {
 *    // returns 'Value'
 *    get('key')
 *  })
 * })
 *
 * @param context The active context
 * @param fn A callback to be immediately run within a specific context
 */
const withContext = <T extends (...args: unknown[]) => ReturnType<T>>(
  context: Context,
  fn: T,
): ReturnType<T> => {
  return defaultContextManager.with(context, fn);
};

/**
 * Undocumented method, shhh
 */
const bind = <T>(target: T, context?: Context): T => {
  return defaultContextManager.bind(target, context);
};

/**
 * Sets a value in the current active context. If there is no active
 * context, this is a noop.
 *
 * Keys should always be camelCaseValues
 *
 * @param key camelCase key for the metadata
 * @param value The string value
 */
const set = (key: string, value: string): void => {
  const context = defaultContextManager.active();
  if (!context) {
    return;
  }
  context.set(key, value);
};

/**
 * Returns a value from the active context. If there is
 * no active context, this returns undefined.
 *
 * @param key camelCase key for the metadata
 * @returns {string | undefined} The value or undefined
 */
const get = (key: string): string | undefined => {
  const context = defaultContextManager.active();
  if (!context) {
    return undefined;
  }
  return context.get(key);
};

/**
 * Returns the full active context or undefined if there
 * is no active context.
 *
 * @example
 * const ctx = active() || new Map<string, string>()
 * // Returns an iterator over all values in the context
 * cont iter = ctx.entries()
 *
 * @returns {Context | undefined} The active context or undefined
 */
const active = (): Context | undefined => {
  return defaultContextManager.active();
};

export const context = {
  init,
  disable,
  withContext,
  bind,
  set,
  get,
  active,
};
