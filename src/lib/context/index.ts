export * from './http-propagator';
export * from './async-hook-context-manager';
export * from './noop-context-manager';
export * from './context';
export * from './context-manager';
export * from './context-propagator';
export * from './nats-propagator';
export * from './middleware';
export * from './interceptor';

import { Context } from './context';
import { ContextManager } from './context-manager';
import { NoopContextManager } from './noop-context-manager';
import { AsyncHooksContextManager } from './async-hook-context-manager';

let defaultContextManager: ContextManager = new NoopContextManager();
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
export const init = async (config?: Partial<ContextConfig>): Promise<void> => {
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
export const disable = (): void => {
  if (!_init) {
    return;
  }
  _init = false;
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
export const withContext = <T extends (...args: unknown[]) => ReturnType<T>>(
  context: Context,
  fn: T,
): ReturnType<T> => {
  return defaultContextManager.with(context, fn);
};

/**
 * Undocumented method, shhh
 */
export const bind = <T>(target: T, context?: Context): T => {
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
export const set = (key: string, value: string): void => {
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
export const get = (key: string): string | undefined => {
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
export const active = (): Context | undefined => {
  return defaultContextManager.active();
};
