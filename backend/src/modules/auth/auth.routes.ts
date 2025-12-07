import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { createError } from '../../lib/http-error';
import { requireAuth } from '../../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const switchBranchSchema = z.object({
  branchId: z.string().uuid(),
});

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true, role: true, branchId: true },
    });

    if (!user) {
      throw createError(401, 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw createError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, branchId: user.branchId, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '12h' },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
      },
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        branch: true,
      },
    });

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/switch-branch', requireAuth, async (req, res, next) => {
  try {
    const { branchId } = switchBranchSchema.parse(req.body);
    const branchExists = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branchExists) {
      throw createError(404, 'Branch not found');
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { branchId },
    });

    const token = jwt.sign(
      { userId: req.user!.id, branchId, role: req.user!.role },
      env.JWT_SECRET,
      { expiresIn: '12h' },
    );

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

