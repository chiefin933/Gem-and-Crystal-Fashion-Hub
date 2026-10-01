import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchOrderByNumber,
  fetchProducts,
  pollCheckoutSession,
  validateCoupon,
} from './client';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('storefront API client', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('encodes catalogue filters without adding unrestricted parameters', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse([]));
    await fetchProducts({
      gender: 'women',
      category: 'Dresses & Sets',
      search: 'silk dress',
      minPrice: 1000,
      maxPrice: 5000,
      onSale: true,
      inStock: true,
      sortBy: 'price-low',
    });

    const url = String(vi.mocked(fetch).mock.calls[0][0]);
    const parsed = new URL(url, 'https://shop.example.com');
    expect(parsed.pathname).toBe('/api/products');
    expect(Object.fromEntries(parsed.searchParams)).toEqual({
      gender: 'women',
      category: 'Dresses & Sets',
      search: 'silk dress',
      minPrice: '1000',
      maxPrice: '5000',
      onSale: 'true',
      inStock: 'true',
      sortBy: 'price-low',
    });
  });

  it('keeps order tracking behind the per-order tracking token', async () => {
    vi.mocked(fetch).mockImplementation(async () => jsonResponse({ orderNumber: 'GC-1' }));

    await fetchOrderByNumber('GC/1', 'tracking-token');
    await pollCheckoutSession('SESSION/1', 'tracking-token');

    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/orders/GC%2F1');
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe('/api/orders/checkout-session/SESSION%2F1');
    for (const [, request] of vi.mocked(fetch).mock.calls) {
      expect(request?.headers).toEqual(expect.objectContaining({
        'X-Order-Tracking-Token': 'tracking-token',
      }));
    }
  });

  it('surfaces a safe API error and preserves the coupon request body', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ error: { message: 'Coupon is unavailable.' } }, 400))
      .mockResolvedValueOnce(jsonResponse({ valid: true }));

    await expect(validateCoupon('OLD', 1500)).rejects.toThrow('Coupon is unavailable.');
    await validateCoupon('NEW10', 2500);
    const [, request] = vi.mocked(fetch).mock.calls[1];
    expect(JSON.parse(String(request?.body))).toEqual({ code: 'NEW10', orderTotal: 2500 });
  });
});
