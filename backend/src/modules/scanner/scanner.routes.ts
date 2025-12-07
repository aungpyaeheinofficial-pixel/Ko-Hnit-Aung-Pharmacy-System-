import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { createError } from '../../lib/http-error';
import { requireAuth } from '../../middleware/auth';

const scanSchema = z.object({
  branchId: z.string().uuid(),
  gtin: z.string().optional(),
  productName: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  quantity: z.number().int().optional(),
  unit: z.string().optional(),
  rawData: z.string().min(4),
});

export const scannerRouter = Router();

scannerRouter.use(requireAuth);

scannerRouter.get('/', async (req, res, next) => {
  try {
    const { branchId } = req.query;
    const scans = await prisma.scannerHistory.findMany({
      where: branchId ? { branchId: String(branchId) } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ scans });
  } catch (error) {
    next(error);
  }
});

scannerRouter.post('/verify', async (req, res, next) => {
  try {
    const payload = scanSchema.parse(req.body);
    const scan = await prisma.scannerHistory.create({
      data: {
        ...payload,
        expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : undefined,
        quantity: payload.quantity ?? 0,
        userId: req.user?.id,
        syncStatus: 'PENDING',
      },
    });
    res.status(201).json({ scan });
  } catch (error) {
    next(error);
  }
});

scannerRouter.post('/:id/confirm', async (req, res, next) => {
  try {
    const payload = z
      .object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        batchNumber: z.string().optional(),
        expiryDate: z.string().optional(),
        unit: z.string().optional(),
      })
      .parse(req.body);

    const scan = await prisma.scannerHistory.findUnique({ where: { id: req.params.id } });
    if (!scan) {
      throw createError(404, 'Scan not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: payload.productId },
        data: {
          stockLevel: { increment: payload.quantity },
        },
      });

      if (payload.batchNumber) {
        await tx.productBatch.upsert({
          where: {
            productId_batchNumber: {
              productId: payload.productId,
              batchNumber: payload.batchNumber,
            },
          },
          update: {
            quantity: { increment: payload.quantity },
            expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : undefined,
          },
          create: {
            productId: payload.productId,
            batchNumber: payload.batchNumber,
            expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : new Date(),
            quantity: payload.quantity,
            costPrice: 0,
          },
        });
      }

      await tx.scannerHistory.update({
        where: { id: req.params.id },
        data: {
          verified: true,
          syncStatus: 'SYNCED',
          syncMessage: 'Stock updated',
        },
      });

      await tx.syncLog.create({
        data: {
          scanId: req.params.id,
          action: 'UPDATE',
          productName: scan.productName,
          oldQuantity: null,
          newQuantity: payload.quantity,
        },
      });
    });

    res.json({ message: 'Scan confirmed' });
  } catch (error) {
    next(error);
  }
});

