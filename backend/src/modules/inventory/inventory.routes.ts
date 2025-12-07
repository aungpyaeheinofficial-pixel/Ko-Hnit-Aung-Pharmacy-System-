import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { createError } from '../../lib/http-error';
import { requireAuth } from '../../middleware/auth';

const stockEntrySchema = z.object({
  entries: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      unit: z.string().optional(),
      batchNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      costPrice: z.number().int().nonnegative().optional(),
      location: z.string().optional(),
    }),
  ),
});

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth);

inventoryRouter.post('/stock-entry', async (req, res, next) => {
  try {
    const { entries } = stockEntrySchema.parse(req.body);

    await prisma.$transaction(
      entries.map((entry) =>
        prisma.product.update({
          where: { id: entry.productId },
          data: {
            stockLevel: { increment: entry.quantity },
            location: entry.location ?? undefined,
            batches: entry.batchNumber
              ? {
                  upsert: {
                    where: {
                      productId_batchNumber: {
                        productId: entry.productId,
                        batchNumber: entry.batchNumber,
                      },
                    },
                    update: {
                      quantity: { increment: entry.quantity },
                      expiryDate: entry.expiryDate ? new Date(entry.expiryDate) : undefined,
                      costPrice: entry.costPrice ?? undefined,
                    },
                    create: {
                      batchNumber: entry.batchNumber,
                      quantity: entry.quantity,
                      expiryDate: entry.expiryDate ? new Date(entry.expiryDate) : new Date(),
                      costPrice: entry.costPrice ?? 0,
                    },
                  },
                }
              : undefined,
          },
        }),
      ),
    );

    res.json({ message: 'Stock entries recorded' });
  } catch (error) {
    next(error);
  }
});

