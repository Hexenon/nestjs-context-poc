import * as context from '../index';

describe('context module', () => {
  describe('with the noop context manager', () => {
    beforeEach(async () => {
      await context.init();
    });

    afterEach(() => {
      context.disable();
    });

    it('never has an active context', (done) => {
      context.withContext(new Map<string, string>(), () => {
        expect(context.active()).toBe(undefined);
        return done();
      });
    });

    it('never returns a value synchronously', (done) => {
      context.withContext(new Map<string, string>(), () => {
        context.set('testing', '1234');
        expect(context.get('testing')).toBe(undefined);
        return done();
      });
    });

    it('always returns an identity when it binds', () => {
      const randomNumberGenerator = () => 4;
      expect(
        context.bind(randomNumberGenerator, new Map<string, string>()),
      ).toBe(randomNumberGenerator);
    });

    it('never returns a value asyncronously', (done) => {
      context.withContext(new Map<string, string>(), () => {
        context.set('testing', '1234');
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(null);
          }, 100);
        }).then(() => {
          expect(context.get('testing')).toBe(undefined);
          return done();
        });
      });
    });
  });

  describe('with the async hook context manager', () => {
    beforeEach(async () => {
      await context.init({ providerType: 'node' });
    });
    afterEach(() => {
      context.disable();
    });

    it('has an active context', (done) => {
      const ctx = new Map<string, string>([['test', '1234']]);
      context.withContext(ctx, () => {
        expect(context.active()).toEqual(ctx);
        return done();
      });
    });

    it('returns a value syncronously', (done) => {
      context.withContext(new Map<string, string>(), () => {
        context.set('testing', '1234');
        expect(context.get('testing')).toBe('1234');
        return done();
      });
    });

    it('returns a value asyncronously', (done) => {
      context.withContext(new Map<string, string>(), () => {
        context.set('testing', '1234');
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(null);
          }, 100);
        }).then(() => {
          expect(context.get('testing')).toBe('1234');
          return done();
        });
      });
    });
  });
});
