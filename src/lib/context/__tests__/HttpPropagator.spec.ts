/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpPropagator } from '../http-propagator';
import {
  Context,
  TraceId,
  UserId,
  WellKnownKeys,
  Synthetic,
  Auth,
} from '../context';

describe('HttpPropagator', () => {
  let propagator: HttpPropagator;
  let context: Context;
  beforeEach(() => {
    propagator = new HttpPropagator();

    // Set up context
    context = new Map<string, string>();
    WellKnownKeys.forEach((key) => context.set(key, key));
    context.set('myRandomKey', 'myRandomValue');
  });

  describe('#inject', () => {
    it('prefixes well known keys without "propagated"', () => {
      const headers = {};
      propagator.inject(headers, context);
      expect(headers).toMatchObject({
        'zeus-trace-id': TraceId,
        'zeus-user-id': UserId,
        'zeus-authorization': Auth,
      });
    });

    it('prefixes other keys with "propagated"', () => {
      const headers = {};
      propagator.inject(headers, context);
      expect(headers).toMatchObject({
        'zeus-propagated-my-random-key': 'myRandomValue',
      });
    });

    it('works with map types as well', () => {
      const headers = new Map<string, string>();
      propagator.inject(headers, context);
      expect(headers.get('zeus-trace-id')).toBe(TraceId);
      expect(headers.get('zeus-user-id')).toBe(UserId);
      expect(headers.get('zeus-propagated-my-random-key')).toBe(
        'myRandomValue',
      );
    });
  });

  describe('#extract', () => {
    let headers: any;
    let mapHeaders: Map<string, string>;
    beforeEach(() => {
      headers = {
        'zeus-trace-id': TraceId,
        'zeus-user-id': UserId,
        'zeus-synthetic': Synthetic,
        'zeus-authorization': Auth,
        'zeus-propagated-my-random-key': 'myRandomValue',
      };
      mapHeaders = new Map<string, string>();
      mapHeaders.set('zeus-trace-id', TraceId);
      mapHeaders.set('zeus-user-id', UserId);
      mapHeaders.set('zeus-synthetic', Synthetic);
      mapHeaders.set('zeus-authorization', Auth);
      mapHeaders.set('zeus-propagated-my-random-value', 'myRandomValue');
    });

    it('pulls out well known keys', () => {
      const context = propagator.extract(headers);
      WellKnownKeys.forEach((key) => expect(context.get(key)).toBe(key));
    });

    it('pulls out other keys', () => {
      const context = propagator.extract(headers);
      expect(context.get('myRandomKey')).toBe('myRandomValue');
    });

    it('works with map types as well', () => {
      const context = propagator.extract(mapHeaders);
      WellKnownKeys.forEach((key) => expect(context.get(key)).toBe(key));
    });
  });
});
