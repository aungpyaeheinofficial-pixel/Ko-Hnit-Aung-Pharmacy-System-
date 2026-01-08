import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../config/logger';
import { HttpError } from '../lib/http-error';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const formatted = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ message: 'Validation failed', errors: formatted });
  }

  if (err instanceof HttpError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    }
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  // Handle Prisma errors specifically
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error({ err }, 'Database error');
    if (err.code === 'P1001') {
      return res.status(503).json({ 
        message: 'Database connection failed. Please check your database configuration.',
        error: 'DATABASE_CONNECTION_ERROR'
      });
    }
    return res.status(500).json({ 
      message: 'Database operation failed',
      error: err.code
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    logger.error({ err }, 'Prisma initialization error');
      return res.status(503).json({ 
        message: 'Database connection failed. Please check database configuration.',
        error: 'DATABASE_INITIALIZATION_ERROR'
      });
  }

  // Log the actual error for debugging
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  const errorStack = err instanceof Error ? err.stack : undefined;
  
  logger.error({ err, errorMessage, errorStack }, 'Unhandled error');
  
  // In development, return more details
  const isDevelopment = process.env.NODE_ENV !== 'production';
  return res.status(500).json({ 
    message: 'Internal server error',
    ...(isDevelopment && { error: errorMessage, stack: errorStack })
  });
}

