import { TransactionType } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { createError } from '../../lib/http-error';
import { requireAuth } from '../../middleware/auth';

const saleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
  batchId: z.string().optional(),
});

const checkoutSchema = z.object({
  branchId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'KBZ_PAY', 'CREDIT']),
  items: z.array(saleItemSchema).min(1),
  total: z.number().int().nonnegative(),
});

export const salesRouter = Router();

salesRouter.use(requireAuth);

salesRouter.get('/', async (req, res, next) => {
  try {
    const { branchId } = req.query;
    const sales = await prisma.sale.findMany({
      where: branchId ? { branchId: String(branchId) } : undefined,
      include: { items: true, customer: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ sales });
  } catch (error) {
    next(error);
  }
});

salesRouter.post('/checkout', async (req, res, next) => {
  try {
    const payload = checkoutSchema.parse(req.body);

    const products = await prisma.product.findMany({
      where: { id: { in: payload.items.map((item) => item.productId) } },
      include: { batches: true },
    });

    if (products.length !== payload.items.length) {
      throw createError(400, 'One or more products could not be found');
    }

    const sale = await prisma.$transaction(async (tx) => {
      for (const item of payload.items) {
        const product = products.find((p) => p.id === item.productId)!;
        if (product.stockLevel < item.quantity) {
          throw createError(400, `Insufficient stock for ${product.nameEn}`);
        }
        await tx.product.update({
          where: { id: product.id },
          data: { stockLevel: { decrement: item.quantity } },
        });

        if (item.batchId) {
          await tx.productBatch.update({
            where: { id: item.batchId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }

      const saleRecord = await tx.sale.create({
        data: {
          branchId: payload.branchId,
          customerId: payload.customerId,
          cashierId: req.user?.id,
          total: payload.total,
          paymentMethod: payload.paymentMethod,
        },
      });

      await tx.saleItem.createMany({
        data: payload.items.map((item) => ({
          saleId: saleRecord.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          batchId: item.batchId,
        })),
      });

      await tx.transaction.create({
        data: {
          branchId: payload.branchId,
          type: TransactionType.INCOME,
          category: 'Sales',
          amount: payload.total,
          description: `POS Sale (${payload.items.length} items)`,
          paymentMethod: payload.paymentMethod,
        },
      });

      return saleRecord;
    });

    res.status(201).json({ saleId: sale.id });
  } catch (error) {
    next(error);
  }
});

