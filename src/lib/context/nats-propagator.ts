/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Context, WellKnownKeys } from './context';
import { ContextPropagator } from './context-propagator';
import { ClientRequest } from 'http';
type HeaderLike = object | Map<string, string>;

const WellKnownHeaderPrefix = 'zeus-';
const HeaderPrefix = 'zeus-propagated-';
export class NatsPropagator implements ContextPropagator<HeaderLike> {
  inject(target: HeaderLike, ctx: Context): void {
    const iter = ctx.entries();
    let item = iter.next();
    while (!item.done) {
      if (target instanceof Map) {
        target.set(fromJS(item.value[0]), item.value[1]);
      } else if (target instanceof ClientRequest) {
        target.setHeader(fromJS(item.value[0]), item.value[1]);
      } else {
        (target as any)[fromJS(item.value[0])] = item.value[1];
      }
      item = iter.next();
    }
  }

  extract(target: HeaderLike): Context {
    if (target instanceof Map) {
      return this.extractMap(target);
    }
    return this.extractObject(target);
  }

  private extractMap(target: Map<string, string>): Context {
    const values = new Map<string, string>();
    target.forEach((value, key) => {
      const normalized = toJS(key);
      if (
        (key.startsWith(HeaderPrefix) && !WellKnownKeys.includes(normalized)) ||
        (WellKnownKeys.includes(normalized) &&
          key.startsWith(WellKnownHeaderPrefix))
      ) {
        values.set(normalized, value);
      }
    });
    return values;
  }

  private extractObject(target: object): Context {
    return Object.keys(target).reduce((map, key) => {
      const normalized = toJS(key);
      if (
        (key.startsWith(HeaderPrefix) && !WellKnownKeys.includes(normalized)) ||
        (WellKnownKeys.includes(normalized) &&
          key.startsWith(WellKnownHeaderPrefix))
      ) {
        map.set(normalized, (target as any)[key]);
      }
      return map;
    }, new Map<string, string>());
  }
}

const fromJS = (key: string): string => {
  if (WellKnownKeys.includes(key)) {
    return `${WellKnownHeaderPrefix}${toHeader(key)}`;
  }
  return `${HeaderPrefix}${toHeader(key)}`;
};

const toJS = (key: string): string =>
  fromHeader(key.replace(HeaderPrefix, '').replace(WellKnownHeaderPrefix, ''));

const toHeader = (key: string) =>
  key.replace(/([A-Z])/g, (group) => `-${group.toLowerCase()}`);

const fromHeader = (str: string) =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', ''),
  );
