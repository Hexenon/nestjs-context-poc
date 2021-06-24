import express from 'express';

import * as context from '../../../context';
import { createContextMiddleware } from '../context-middleware';

import Request from './mocks/Request';
import Response from './mocks/Response';

describe('ContextMiddleware', () => {
  let middleware: express.RequestHandler;
  let next: jest.MockedFunction<express.NextFunction>;
  let request: Request;
  let response: Response;

  beforeEach(() => {
    next = jest.fn();
    middleware = createContextMiddleware();
    context.init({ providerType: 'node' });
  });

  afterEach(() => {
    context.disable();
  });

  describe('without a propagated context', () => {
    beforeEach(() => {
      request = new Request('/');
      response = new Response(200);
    });

    it('has no keys', (done) => {
      next.mockImplementation(() => {
        expect(context.get('myValue')).toBe(undefined);
        done();
      });
      middleware(request.asRequest(), response.asResponse(), next);
    });
  });

  describe('with a propagated context', () => {
    beforeEach(() => {
      request = new Request('/', {
        headers: {
          'zeus-trace-id': 'request-1234',
          'zeus-user-id': 'user-1234',
          'zeus-propagated-my-value': 'test-1234',
          accepts: 'text/plain',
          'zeus-not-valid': 'invalid',
        },
      });
      response = new Response(200);
    });

    it('extracts the propagated headers', (done) => {
      next.mockImplementation(() => {
        expect(context.get('myValue')).toBe('test-1234');
        done();
      });
      middleware(request.asRequest(), response.asResponse(), next);
    });

    it('extracts the well-known headers', (done) => {
      next.mockImplementation(() => {
        expect(context.get(context.TraceId)).toBe('request-1234');
        done();
      });
      middleware(request.asRequest(), response.asResponse(), next);
    });

    it('ignores non zeus- prefixed headers', (done) => {
      next.mockImplementation(() => {
        expect(context.get('accepts')).toBe(undefined);
        done();
      });
      middleware(request.asRequest(), response.asResponse(), next);
    });

    it('does not allow arbitrary zeus- headers', (done) => {
      next.mockImplementation(() => {
        expect(context.get('notValid')).toBe(undefined);
        done();
      });
      middleware(request.asRequest(), response.asResponse(), next);
    });

    it('still has the keys async', (done) => {
      next.mockImplementation(() => {
        setTimeout(() => {
          expect(context.get(context.TraceId)).toBe('request-1234');
          done();
        }, 100);
      });
      middleware(request.asRequest(), response.asResponse(), next);
    });

    it('still has the keys on response end', (done) => {
      next.mockImplementation(() => {
        response.on('finish', () => {
          expect(context.get(context.TraceId)).toBe('request-1234');
          done();
        });
        setImmediate(() => {
          response.close();
        });
      });
      middleware(request.asRequest(), response.asResponse(), next);
    });
  });
});
