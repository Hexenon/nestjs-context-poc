import * as context from '../../context';
import express from 'express';

const propagator = new context.HttpPropagator();

export const createContextMiddleware = (): express.RequestHandler => {
  return function contextPropagator(req, res, next) {
    const ctx = propagator.extract(req.headers);
    return context.withContext(ctx, () => {
      context.bind(req, ctx);
      context.bind(res, ctx);
      return next();
    });
  };
};
