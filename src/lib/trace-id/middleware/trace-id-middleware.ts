import express from 'express';
import { current, ensure } from '../../trace-id';

export const createTraceIdMiddleware = (): express.RequestHandler => {
  return function traceId(req, res, next) {
    // Only creates a new traceId if none was provided
    // extending traceIds should be done on outgoing
    // calls.
    if (!current()) {
      ensure();
    }
    res.append('x-zeus-trace-id', current());
    next();
  };
};
