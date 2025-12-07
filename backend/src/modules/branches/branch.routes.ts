import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { createError } from '../../lib/http-error';
import { requireAuth } from '../../middleware/auth';

const branchSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  managerName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export const branchRouter = Router();

branchRouter.use(requireAuth);

branchRouter.get('/', async (_req, res, next) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ branches });
  } catch (error) {
    next(error);
  }
});

branchRouter.post('/', async (req, res, next) => {
  try {
    const input = branchSchema.parse(req.body);
    const branch = await prisma.branch.create({ data: input });
    res.status(201).json({ branch });
  } catch (error) {
    next(error);
  }
});

branchRouter.patch('/:id', async (req, res, next) => {
  try {
    const input = branchSchema.partial().parse(req.body);
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: input,
    });
    res.json({ branch });
  } catch (error) {
    next(error);
  }
});

branchRouter.delete('/:id', async (req, res, next) => {
  try {
    const exists = await prisma.branch.findUnique({ where: { id: req.params.id } });
    if (!exists) {
      throw createError(404, 'Branch not found');
    }
    await prisma.branch.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

