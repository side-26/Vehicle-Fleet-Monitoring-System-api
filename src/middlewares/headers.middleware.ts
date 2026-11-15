import cors from 'cors';
import helmet from 'helmet';

import type { RequestHandler } from 'express';

import { HTTP_METHODS } from '#/configs/constants';
import { env } from '#/configs/env.config';

const allowedOrigins = ['http://localhost:3000'] as const;

export const headersMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
        connectSrc: ["'self'"],
      },
    },
  }),
  cors({
    origin: env.NODE_ENV === 'production' ? false : [...allowedOrigins],
    methods: [...HTTP_METHODS],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  }),
] satisfies RequestHandler[];
