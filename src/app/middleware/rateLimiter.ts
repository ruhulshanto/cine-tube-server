import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

export const rateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: Number(env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
    errorSources: [
      {
        path: 'rate-limit',
        message: 'Request limit exceeded'
      }
    ]
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
