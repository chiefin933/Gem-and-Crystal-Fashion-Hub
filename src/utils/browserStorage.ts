import type { CartItem } from '../types/ecommerce';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const boundedString = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= max;

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 200) return [];
    return parsed.filter((item): item is CartItem => isRecord(item)
      && boundedString(item.productId, 128)
      && boundedString(item.variantId, 128)
      && boundedString(item.title, 160)
      && boundedString(item.category, 80)
      && boundedString(item.size, 40)
      && boundedString(item.color, 40)
      && boundedString(item.image, 2048)
      && typeof item.price === 'number'
      && Number.isFinite(item.price)
      && item.price >= 0
      && item.price <= 10_000_000
      && Number.isInteger(item.quantity)
      && Number(item.quantity) > 0
      && Number(item.quantity) <= 1000
      && Number.isInteger(item.maxStock)
      && Number(item.maxStock) >= Number(item.quantity)
      && Number(item.maxStock) <= 100_000);
  } catch {
    return [];
  }
}

export function parseStoredStringList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 500) return [];
    return [...new Set(parsed.filter(item => boundedString(item, 128)))];
  } catch {
    return [];
  }
}
