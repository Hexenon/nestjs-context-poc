import { context, HttpPropagator } from '../../context';
import express from 'express';

const propagator = new HttpPropagator();

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
