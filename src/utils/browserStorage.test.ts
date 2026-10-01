import { describe, expect, it } from 'vitest';
import { parseStoredCart, parseStoredStringList } from './browserStorage';

const validItem = {
  productId: 'product-1',
  variantId: 'variant-1',
  title: 'Silk Dress',
  category: 'Dresses',
  size: 'M',
  color: 'Black',
  image: 'https://cdn.example.com/dress.webp',
  price: 4500,
  quantity: 1,
  maxStock: 3,
};

describe('storefront browser storage validation', () => {
  it('accepts valid cart entries and drops malformed or impossible entries', () => {
    expect(parseStoredCart(JSON.stringify([validItem]))).toEqual([validItem]);
    expect(parseStoredCart(JSON.stringify([
      validItem,
      { ...validItem, variantId: 'bad-price', price: Number.NaN },
      { ...validItem, variantId: 'too-many', quantity: 4 },
      { title: 'missing fields' },
    ]))).toEqual([validItem]);
  });

  it('fails closed on invalid JSON or an oversized cart', () => {
    expect(parseStoredCart('{bad json')).toEqual([]);
    expect(parseStoredCart(JSON.stringify(Array.from({ length: 201 }, () => validItem)))).toEqual([]);
  });

  it('bounds and de-duplicates wishlist identifiers', () => {
    expect(parseStoredStringList(JSON.stringify(['p1', 'p1', 'p2', '', 123]))).toEqual(['p1', 'p2']);
    expect(parseStoredStringList('not-json')).toEqual([]);
  });
});
