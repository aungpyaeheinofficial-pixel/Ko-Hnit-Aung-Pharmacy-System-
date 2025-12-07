import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { requireAuth } from '../../middleware/auth';

const customerSchema = z.object({
  branchId: z.string().uuid(),
  name: z.string().min(2),
  phone: z.string().min(6),
  points: z.number().int().nonnegative().default(0),
  tier: z.string().default('Silver'),
});

export const customerRouter = Router();

customerRouter.use(requireAuth);

customerRouter.get('/', async (req, res, next) => {
  try {
    const { branchId, search } = req.query;
    const customers = await prisma.customer.findMany({
      where: {
        branchId: branchId ? String(branchId) : undefined,
        OR: search
          ? [
              { name: { contains: String(search) } },
              { phone: { contains: String(search) } },
            ]
          : undefined,
      },
      orderBy: { name: 'asc' },
    });
    res.json({ customers });
  } catch (error) {
    next(error);
  }
});

customerRouter.post('/', async (req, res, next) => {
  try {
    const input = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({ data: input });
    res.status(201).json({ customer });
  } catch (error) {
    next(error);
  }
});

customerRouter.patch('/:id', async (req, res, next) => {
  try {
    const input = customerSchema.partial().parse(req.body);
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: input,
    });
    res.json({ customer });
  } catch (error) {
    next(error);
  }
});

customerRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

