export type Product = {
  id: string;
  category: string;
  subcategory: string;
  nameKo: string;
  nameEn?: string;
  slug: string;
  priceKrw: number;
  reviewCount: number;
  thumbnailUrl?: string | null;
  isActive: boolean;
  createdAt: string;
};

/**
 * Convert snake_case object keys from the database to camelCase.
 */
export function camelize<T extends Record<string, any>>(row: Record<string, any>): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}
