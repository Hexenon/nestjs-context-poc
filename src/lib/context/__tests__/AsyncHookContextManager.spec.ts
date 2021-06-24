/* eslint-disable @typescript-eslint/ban-ts-comment */
/*!
 * Copyright 2020, Mothership Authors
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EventEmitter } from 'events';

import { AsyncHooksContextManager } from '../async-hook-context-manager';

describe('AsyncHooksContextManager', () => {
  let contextManager: AsyncHooksContextManager;
  afterEach(() => {
    contextManager.disable();
  });

  describe('#enable', () => {
    beforeEach(() => {
      contextManager = new AsyncHooksContextManager();
    });

    afterEach(() => {
      contextManager.disable();
    });

    it('does not throw', () => {
      expect(() => {
        contextManager.enable();
      }).not.toThrow();
    });

    it('returns itself', () => {
      expect(contextManager.enable()).toBe(contextManager);
    });
  });

  describe('#disable', () => {
    beforeEach(() => {
      contextManager = new AsyncHooksContextManager();
      contextManager.enable();
    });

    it('does not throw', () => {
      expect(() => {
        contextManager.disable();
      }).not.toThrow();
    });

    it('returns this', () => {
      expect(contextManager.disable()).toBe(contextManager);
    });
  });

  describe('#with', () => {
    beforeEach(() => {
      contextManager = new AsyncHooksContextManager();
      contextManager.enable();
    });

    it('runs the callback (null as target)', (done) => {
      contextManager.with(undefined, done);
    });

    it('runs the callback (object as target)', (done) => {
      const context = new Map<string, string>();
      context.set('testKey', 'testValue');
      contextManager.with(context, () => {
        expect(contextManager.active()).toBe(context);
        return done();
      });
    });

    it('runs the callback (when disabled)', (done) => {
      contextManager.disable();
      contextManager.with(undefined, () => {
        contextManager.enable();
        return done();
      });
    });

    it('rethrows errors', (done) => {
      expect(() => {
        contextManager.with(undefined, () => {
          throw new Error('This should be rethrown');
        });
      }).toThrow();
      return done();
    });

    it('restores the old context on return', (done) => {
      const context1 = new Map<string, string>([['test', 'object']]);
      const context2 = new Map<string, string>([['other', 'value']]);
      contextManager.with(context1, () => {
        expect(contextManager.active()).toBe(context1);
        contextManager.with(context2, () => {
          expect(contextManager.active()).toBe(context2);
        });
        expect(contextManager.active()).toBe(context1);
        return done();
      });
    });
  });

  describe('#bind(function)', () => {
    beforeEach(() => {
      contextManager = new AsyncHooksContextManager();
      contextManager.enable();
    });

    it('returns the same target (when enabled)', () => {
      const test = { a: 1 };
      expect(contextManager.bind(test, undefined)).toBe(test);
    });

    it('returns the same target (when disabled)', () => {
      contextManager.disable();
      const test = { a: 1 };
      expect(contextManager.bind(test, undefined)).toBe(test);
      contextManager.enable();
    });

    it('returns the current context (when enabled)', (done) => {
      const context = new Map<string, string>([['test', 'object']]);
      const fn = contextManager.bind(() => {
        expect(contextManager.active()).toBe(context);
        return done();
      }, context);
      fn();
    });

    /**
     * Even if asynchooks is disabled, the context propagation will
     * still works but it might be lost after any async op.
     */
    it('returns the current context (when disabled)', (done) => {
      contextManager.disable();
      const context = new Map<string, string>([['test', 'object']]);
      const fn = contextManager.bind(() => {
        expect(contextManager.active()).toBe(context);
        contextManager.enable();
        return done();
      }, context);
      fn();
    });

    it('fails to return current context (when disabled + async op)', (done) => {
      contextManager.disable();
      const context = new Map<string, string>([['test', 'object']]);
      const fn = contextManager.bind(() => {
        setTimeout(() => {
          expect(contextManager.active()).toBe(undefined);
          return done();
        }, 100);
      }, context);
      fn();
    });

    it('returns current context (when re-enabled + async op)', (done) => {
      const context = new Map<string, string>([['test', 'object']]);
      const fn = contextManager.bind(() => {
        setTimeout(() => {
          expect(contextManager.active()).toBe(context);
          return done();
        }, 100);
      }, context);
      fn();
    });
  });

  describe('#bind(event-emitter)', () => {
    let ee: EventEmitter;
    beforeEach(() => {
      contextManager = new AsyncHooksContextManager();
      contextManager.enable();
      ee = new EventEmitter();
    });

    it('returns the same target (when enabled)', () => {
      expect(contextManager.bind(ee, undefined)).toBe(ee);
    });

    it('will not throw on double bind', () => {
      contextManager.bind(ee, undefined);
      expect(() => contextManager.bind(ee, undefined)).not.toThrow();
    });

    it('returns the same target (when disabled)', () => {
      contextManager.disable();
      expect(contextManager.bind(ee, undefined)).toBe(ee);
      contextManager.enable();
    });

    it('returns current context and removeListener (when enabled)', (done) => {
      const context = new Map<string, string>([['test', 'object']]);
      const patchedEe = contextManager.bind(ee, context);
      const handler = () => {
        expect(contextManager.active()).toBe(context);
        patchedEe.removeListener('test', handler);
        expect(patchedEe.listeners('test').length).toEqual(0);
        patchedEe.removeListener('test', handler);
        // should not blow up
        patchedEe.emit('test');
        return done();
      };
      patchedEe.on('test', handler);
      patchedEe.removeListener('wat', handler);
      expect(patchedEe.listeners('test').length).toEqual(1);
      patchedEe.emit('wat');
      patchedEe.emit('test');
    });

    it('returns current context and removeAllListener (when enabled)', (done) => {
      const context = new Map<string, string>([['test', 'object']]);
      const patchedEe = contextManager.bind(ee, context);
      const handler = () => {
        expect(contextManager.active()).toBe(context);
        patchedEe.removeAllListeners('test');
        expect(patchedEe.listeners('test').length).toEqual(0);
        return done();
      };
      patchedEe.on('test', handler);
      expect(patchedEe.listeners('test').length).toEqual(1);
      patchedEe.emit('test');
    });

    /**
     * Even if asynchooks is disabled, the context propagation will
     * still works but it might be lost after any async op.
     */
    it('returns the context (when disabled)', (done) => {
      contextManager.disable();
      const context = new Map<string, string>([['test', 'object']]);
      const patchedEe = contextManager.bind(ee, context);
      const handler = () => {
        expect(contextManager.active()).toBe(context);
        patchedEe.removeListener('test', handler);
        expect(patchedEe.listeners('test').length).toEqual(0);
        contextManager.enable();
        return done();
      };
      patchedEe.on('test', handler);
      expect(patchedEe.listeners('test').length).toEqual(1);
      patchedEe.emit('test');
    });

    it('does not return current context (when disabled + async op)', (done) => {
      contextManager.disable();
      const context = new Map<string, string>([['test', 'object']]);
      const patchedEe = contextManager.bind(ee, context);
      const handler = () => {
        setImmediate(() => {
          expect(contextManager.active()).toBe(undefined);
          patchedEe.removeAllListeners('test');
          expect(patchedEe.listeners('test').length).toEqual(0);
          return done();
        });
      };
      patchedEe.on('test', handler);
      expect(patchedEe.listeners('test').length).toEqual(1);
      patchedEe.emit('test');
    });

    it('does not blow up when messing with it', (done) => {
      const context = new Map<string, string>([['test', 'object']]);
      const patchedEe = contextManager.bind(ee, context);
      const handler = () => {
        setImmediate(() => {
          patchedEe.removeAllListeners('test');
          expect(patchedEe.listeners('test').length).toEqual(0);
          return done();
        });
      };
      // @ts-ignore
      delete patchedEe.__ot_listeners;
      patchedEe.on('test', handler);
      expect(patchedEe.listeners('test').length).toEqual(1);
      patchedEe.emit('test');
    });

    it('should return current context (when enabled + async op)', (done) => {
      contextManager.enable();
      const context = new Map<string, string>([['test', 'object']]);
      const patchedEe = contextManager.bind(ee, context);
      const handler = () => {
        setImmediate(() => {
          expect(contextManager.active()).toBe(context);
          patchedEe.removeAllListeners('test');
          patchedEe.removeAllListeners('wat');
          expect(patchedEe.listeners('test').length).toEqual(0);
          return done();
        });
      };
      patchedEe.on('test', handler);
      expect(patchedEe.listeners('test').length).toEqual(1);
      patchedEe.emit('test');
    });
  });
});
