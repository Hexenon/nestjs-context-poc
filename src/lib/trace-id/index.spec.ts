import * as context from '../context';

import * as traceId from './index';

describe('traceId module', () => {
  beforeEach(async () => {
    await context.init({ providerType: 'node' });
  });

  afterEach(() => {
    context.disable();
  });

  describe('#current', () => {
    it('has no current traceId', () => {
      expect(traceId.current()).toBe(undefined);
    });

    it('pulls the current traceId from the context', () => {
      context.withContext(
        new Map<string, string>([['traceId', '1234']]),
        () => {
          expect(traceId.current()).toBe('1234');
        },
      );
    });
  });

  describe('#ensure', () => {
    it('creates a new traceId when there is none', () => {
      context.withContext(new Map<string, string>(), () => {
        expect(traceId.ensure()).toHaveLength(16);
      });
    });

    it('extends a traceId when there is one already set', () => {
      context.withContext(new Map<string, string>(), () => {
        traceId.ensure();
        expect(traceId.ensure().split(';')).toHaveLength(2);
      });
    });
  });

  describe('#setProvider', () => {
    let oldProvider: traceId.TraceIdProvider;
    beforeEach(() => {
      oldProvider = traceId.getProvider();
      traceId.setProvider({
        create: () => 'mock',
        extend: (id) => `${id};extended`,
      });
    });
    afterEach(() => {
      traceId.setProvider(oldProvider);
    });

    it('uses the mock provider for creates', () => {
      expect(traceId.create()).toBe('mock');
    });

    it('uses the mock provider for extends', () => {
      expect(traceId.extend('mock')).toBe('mock;extended');
    });
  });
});
