import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { requireAuth } from '../../middleware/auth';

const settingsSchema = z.object({
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  language: z.string().optional(),
  shopNameReceipt: z.string().optional(),
  receiptFooter: z.string().optional(),
  paperSize: z.string().optional(),
  defaultPrinter: z.string().optional(),
  autoPrint: z.boolean().optional(),
  showImages: z.boolean().optional(),
  lowStockLimit: z.number().int().optional(),
  expiryWarningDays: z.number().int().optional(),
  enableEmailReports: z.boolean().optional(),
  enableCriticalAlerts: z.boolean().optional(),
  notificationEmail: z.string().optional(),
});

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await prisma.appSetting.findUnique({ where: { id: 1 } });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

settingsRouter.put('/', async (req, res, next) => {
  try {
    const input = settingsSchema.parse(req.body);
    const settings = await prisma.appSetting.upsert({
      where: { id: 1 },
      update: input,
      create: input,
    });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

