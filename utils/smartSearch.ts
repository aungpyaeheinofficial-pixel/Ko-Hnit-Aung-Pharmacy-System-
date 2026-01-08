// Smart Search Utility - 2-3 character partial matching for Ko Hnit Aung Pharmacy

import { Product } from '../types';

/**
 * Smart search that matches with 2-3 characters
 * Searches in: nameEn, nameMm, SKU, shortCode, genericName
 */
export function smartSearch(products: Product[], searchTerm: string): Product[] {
  if (!searchTerm || searchTerm.length < 2) {
    return products;
  }

  const lowerSearch = searchTerm.toLowerCase().trim();

  return products.filter(product => {
    // Exact matches first
    if (product.shortCode?.toLowerCase() === lowerSearch) {
      return true;
    }

    if (product.sku?.toLowerCase() === lowerSearch) {
      return true;
    }

    // Partial matches
    const matchesNameEn = product.nameEn?.toLowerCase().includes(lowerSearch);
    const matchesNameMm = product.nameMm?.includes(searchTerm); // Myanmar text search
    const matchesSku = product.sku?.toLowerCase().includes(lowerSearch);
    const matchesShortCode = product.shortCode?.toLowerCase().includes(lowerSearch);
    const matchesGeneric = product.genericName?.toLowerCase().includes(lowerSearch);

    return matchesNameEn || matchesNameMm || matchesSku || matchesShortCode || matchesGeneric;
  });
}

/**
 * Get top selling products (placeholder - would need sales data)
 * For now, returns products with highest stock levels or most recent additions
 */
export function getTopSellingProducts(products: Product[], limit: number = 20): Product[] {
  // TODO: This should query actual sales data
  // For now, return products with stock, sorted by stock level (most stock = likely popular)
  return products
    .filter(p => p.stockLevel > 0)
    .sort((a, b) => b.stockLevel - a.stockLevel)
    .slice(0, limit);
}

/**
 * Search products and rank by relevance
 */
export function rankedSearch(products: Product[], searchTerm: string): Product[] {
  if (!searchTerm || searchTerm.length < 2) {
    return products;
  }

  const lowerSearch = searchTerm.toLowerCase().trim();
  const results: Array<{ product: Product; score: number }> = [];

  products.forEach(product => {
    let score = 0;

    // Exact match on shortCode (highest priority)
    if (product.shortCode?.toLowerCase() === lowerSearch) {
      score += 100;
    }

    // Exact match on SKU
    if (product.sku?.toLowerCase() === lowerSearch) {
      score += 80;
    }

    // Starts with match (higher priority)
    if (product.nameEn?.toLowerCase().startsWith(lowerSearch)) {
      score += 60;
    }

    if (product.nameMm?.startsWith(searchTerm)) {
      score += 60;
    }

    // Contains match
    if (product.nameEn?.toLowerCase().includes(lowerSearch)) {
      score += 40;
    }

    if (product.nameMm?.includes(searchTerm)) {
      score += 40;
    }

    if (product.shortCode?.toLowerCase().includes(lowerSearch)) {
      score += 30;
    }

    if (product.sku?.toLowerCase().includes(lowerSearch)) {
      score += 20;
    }

    if (product.genericName?.toLowerCase().includes(lowerSearch)) {
      score += 10;
    }

    if (score > 0) {
      results.push({ product, score });
    }
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.map(r => r.product);
}
