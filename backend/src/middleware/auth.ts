import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { createError } from '../lib/http-error';
import { prisma } from '../config/prisma';

interface TokenPayload {
  userId: string;
  branchId?: string | null;
  role: string;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(createError(401, 'Authorization header missing'));
  }

  try {
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branchId: true,
      },
    });

    if (!user) {
      return next(createError(401, 'Invalid token'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(createError(401, 'Invalid token', error));
  }
}

