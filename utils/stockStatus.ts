// Stock Status Utilities - Traffic Light System for Ko Hnit Aung Pharmacy

import { Product, Batch } from '../types';

export type StockStatus = 'good' | 'low' | 'out' | 'expired';

export interface StockStatusInfo {
  status: StockStatus;
  color: string;
  bgColor: string;
  text: string;
  icon: '🟢' | '🟡' | '🔴';
}

/**
 * Get stock status based on stock level and min stock level
 */
export function getStockStatus(
  product: Product,
  expiryWarningDays: number = 90,
  expiryCriticalDays: number = 180
): StockStatusInfo {
  // Check if expired
  const isExpired = checkIfExpired(product, expiryCriticalDays);
  if (isExpired) {
    return {
      status: 'expired',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      text: 'သက်တမ်းကုန်',
      icon: '🔴'
    };
  }

  // Check if out of stock
  if (product.stockLevel <= 0) {
    return {
      status: 'out',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      text: 'ကုန်ပြီ',
      icon: '🔴'
    };
  }

  // Check if low stock
  if (product.stockLevel <= (product.minStockLevel || 10)) {
    return {
      status: 'low',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      text: 'နည်းနေပြီ',
      icon: '🟡'
    };
  }

  // Good stock
  return {
    status: 'good',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    text: 'အလုံအလောက်ရှိ',
    icon: '🟢'
  };
}

/**
 * Check if product has expired batches
 */
function checkIfExpired(product: Product, criticalDays: number = 180): boolean {
  if (!product.batches || product.batches.length === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if any batch is expired or expiring soon (within critical days)
  return product.batches.some(batch => {
    const expiryDate = new Date(batch.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Expired or expiring within critical days
    return daysUntilExpiry <= 0 || daysUntilExpiry <= criticalDays;
  });
}

/**
 * Check if product is near expiry (within warning days)
 */
export function isNearExpiry(product: Product, warningDays: number = 90): boolean {
  if (!product.batches || product.batches.length === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return product.batches.some(batch => {
    const expiryDate = new Date(batch.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry > 0 && daysUntilExpiry <= warningDays;
  });
}

/**
 * Check if product is fully expired (all batches expired)
 */
export function isFullyExpired(product: Product): boolean {
  if (!product.batches || product.batches.length === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // All batches must be expired
  return product.batches.every(batch => {
    const expiryDate = new Date(batch.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  });
}

/**
 * Get products expiring within specified days
 */
export function getExpiringProducts(
  products: Product[],
  days: number = 90
): Product[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return products.filter(product => {
    if (!product.batches || product.batches.length === 0) {
      return false;
    }

    return product.batches.some(batch => {
      const expiryDate = new Date(batch.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysUntilExpiry > 0 && daysUntilExpiry <= days;
    });
  });
}

/**
 * Get days until expiry for a product (earliest batch)
 */
export function getDaysUntilExpiry(product: Product): number | null {
  if (!product.batches || product.batches.length === 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilExpiry = product.batches
    .map(batch => {
      const expiryDate = new Date(batch.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      return Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    })
    .filter(days => days > 0)
    .sort((a, b) => a - b)[0];

  return daysUntilExpiry !== undefined ? daysUntilExpiry : null;
}
