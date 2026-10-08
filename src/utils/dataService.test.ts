import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/client', () => ({
  fetchProducts: vi.fn(),
  placeOrder: vi.fn(),
}));

describe('live catalogue only', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('does not enable demo data when the API fails in development', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_ENABLE_DEMO_FALLBACK', 'true');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { fetchProducts } = await import('../api/client');
    vi.mocked(fetchProducts).mockRejectedValue(new Error('Offline'));
    const { dataService } = await import('./dataService');
    await vi.waitFor(() => expect(dataService.getCatalogueStatus()).toBe('error'));
    expect(dataService.getProducts()).toEqual([]);
    expect(dataService.getCoupons()).toEqual([]);
  });

  it('keeps a successful empty API catalogue empty', async () => {
    const { fetchProducts } = await import('../api/client');
    vi.mocked(fetchProducts).mockResolvedValue([]);
    const { dataService } = await import('./dataService');
    await vi.waitFor(() => expect(dataService.getCatalogueStatus()).toBe('ready'));
    expect(dataService.getProducts()).toEqual([]);
  });
});
