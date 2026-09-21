// API client for the Gem & Crystal storefront
// Development: Vite proxies /api → localhost:4000 (no VITE_API_URL needed)
// Production: set VITE_API_URL=https://api.gemandcrystal.co.ke
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '') || '/api';

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    signal: options?.signal ?? AbortSignal.timeout(15_000),
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    const message = typeof err.error === 'string'
      ? err.error
      : err.error?.message || `API error ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

// ── Products ──────────────────────────────────────────────────────────────

export interface ApiProduct {
  id: string;
  title: string;
  slug: string;
  gender: 'women' | 'men' | 'unisex';
  category: string;
  subcategory: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  fabricCare: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  isActive: boolean;
  createdAt: string;
  variants: ApiVariant[];
}

export interface ApiVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
}

export interface ProductFilters {
  gender?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  sortBy?: string;
}

export async function fetchProducts(filters?: ProductFilters): Promise<ApiProduct[]> {
  const params = new URLSearchParams();
  if (filters?.gender && filters.gender !== 'all') params.set('gender', filters.gender);
  if (filters?.category && filters.category !== 'All') params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters?.onSale) params.set('onSale', 'true');
  if (filters?.inStock) params.set('inStock', 'true');
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);

  const qs = params.toString();
  return apiFetch<ApiProduct[]>(`/products${qs ? '?' + qs : ''}`);
}

export async function fetchProduct(id: string): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/products/${id}`);
}

// ── Orders ────────────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    county: string;
    townCity: string;
    address: string;
    notes?: string;
  };
  items: {
    variantId: string;
    quantity: number;
  }[];
  couponCode?: string;
  paymentMethod: 'MPESA' | 'CARD';
  mpesaPhone?: string;
  requestedDeliveryDate?: string;
}

export async function placeOrder(payload: PlaceOrderPayload) {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
}

export async function fetchOrderByNumber(orderNumber: string, trackingToken: string) {
  return apiFetch(`/orders/${encodeURIComponent(orderNumber)}`, {
    headers: { 'X-Order-Tracking-Token': trackingToken },
  });
}

// ── Checkout Session (C2B Till payment flow) ──────────────────────────────

export interface CheckoutSessionResponse {
  trackingToken: string;
  sessionRef: string;
  total: number;
  deliveryFee: number;
  discount: number;
  couponCode: string | null;
  expiresAt: string;
  tillNumber: string | null;
  status: string;
  message: string;
}

export interface CheckoutSessionStatus {
  order: import('../types/ecommerce').Order | null;
  sessionRef: string;
  status: 'AWAITING_PAYMENT' | 'PAID' | 'EXPIRED' | 'FAILED';
  total: number;
  expiresAt: string;
  orderNumber: string | null;
  mpesaReceipt: string | null;
}

export async function createCheckoutSession(payload: PlaceOrderPayload): Promise<CheckoutSessionResponse> {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
}

export async function pollCheckoutSession(ref: string, trackingToken: string): Promise<CheckoutSessionStatus> {
  return apiFetch(`/orders/checkout-session/${encodeURIComponent(ref)}`, { headers: { 'X-Order-Tracking-Token': trackingToken } });
}

// ── Coupons ───────────────────────────────────────────────────────────────

export async function validateCoupon(code: string, orderTotal: number) {
  return apiFetch<{
    valid: boolean;
    coupon?: { code: string; discountType: string; discountValue: number; discountAmount: number };
    error?: string;
  }>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, orderTotal }),
  });
}
