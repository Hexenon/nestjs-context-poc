import TraceIdProvider from './trace-id-provider';
import UUIDTraceIdProvider from './uuid-trace-id-provider';

describe(UUIDTraceIdProvider, () => {
  let provider: TraceIdProvider;
  beforeEach(() => {
    provider = new UUIDTraceIdProvider();
  });

  describe('#create', () => {
    it('looks like a UUID', () => {
      expect(provider.create()).toHaveLength(16);
    });

    it('returns a random UUID', () => {
      expect(provider.create()).not.toEqual(provider.create());
    });
  });

  describe('#extend', () => {
    it('appends some characters to the end', () => {
      expect(provider.extend('wat')).toHaveLength(3 + 7);
    });

    it('is separated by a semicolon', () => {
      expect(provider.extend('wat').split(';')).toHaveLength(2);
    });

    it('extension should be random', () => {
      expect(provider.extend('wat')).not.toEqual(provider.extend('wat'));
    });

    it('retains the original prefix', () => {
      expect(provider.extend('wat')).toStrictEqual(
        expect.stringMatching(/wat;.+/),
      );
    });
  });
});
