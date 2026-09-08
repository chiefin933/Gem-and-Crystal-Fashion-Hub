import {
  Product,
  ProductVariant,
  Order,
  InventoryMovement,
  Coupon,
  Branch,
  FilterState,
  CartItem
} from '../types/ecommerce';
import { PRODUCTS, INITIAL_COUPONS, INITIAL_BRANCHES } from './demoData';
import { fetchProducts as apiFetchProducts, placeOrder as apiPlaceOrder, validateCoupon as apiValidateCoupon } from '../api/client';

class DataService {
  private products: Product[] = [];
  private orders: Order[] = [];
  private inventoryMovements: InventoryMovement[] = [];
  private coupons: Coupon[] = INITIAL_COUPONS;
  private branches: Branch[] = INITIAL_BRANCHES;
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Attempt live API fetch first
    try {
      const liveProducts = await apiFetchProducts();
      if (Array.isArray(liveProducts)) {
        this.products = liveProducts as unknown as Product[];
        this.isLoaded = true;
        return;
      }
    } catch {
      console.warn('API unavailable — checking demo fallback policy');
    }

    // Demo data fallback is ONLY permitted in development.
    // In production the storefront shows an empty catalog so customers
    // never see stale/incorrect prices or phantom stock.
    const demoFallbackEnabled = import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true';
    const isDev = import.meta.env.DEV;

    if (isDev || demoFallbackEnabled) {
      console.warn('Using local demo dataset (dev/demo-fallback mode)');
      this.products = PRODUCTS;
      this.coupons = INITIAL_COUPONS;
      this.branches = INITIAL_BRANCHES;
    } else {
      // Production: leave products empty — UI will show "store unavailable"
      console.error('API unavailable in production. Demo fallback is disabled. Products will not load.');
      this.products = [];
    }
    this.isLoaded = true;
  }

  public async refreshProducts(): Promise<Product[]> {
    try {
      const liveProducts = await apiFetchProducts();
      if (Array.isArray(liveProducts)) {
        this.products = liveProducts as unknown as Product[];
      }
    } catch {
      // keep current products
    }
    return this.products;
  }

  // --- PRODUCTS API ---
  public getProducts(filters?: Partial<FilterState>): Product[] {
    let result = [...this.products];

    if (!filters) return result;

    if (filters.gender && filters.gender !== 'all') {
      result = result.filter(p => p.gender === filters.gender || p.gender === 'unisex');
    }

    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (filters.sizes && filters.sizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => filters.sizes!.includes(s)));
    }

    if (filters.colors && filters.colors.length > 0) {
      result = result.filter(p => p.colors.some(c => filters.colors!.includes(c.name)));
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(p => (p.salePrice ?? p.price) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(p => (p.salePrice ?? p.price) <= filters.maxPrice!);
    }

    if (filters.onSaleOnly) {
      result = result.filter(p => p.onSale);
    }

    if (filters.inStockOnly) {
      result = result.filter(p => p.variants && p.variants.some(v => v.stockQuantity > 0));
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'price-low':
          result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
          break;
        case 'price-high':
          result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
          break;
        case 'bestselling':
          result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
          break;
        case 'featured':
        default:
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return result;
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.products.find(p => p.slug === slug);
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public saveProduct(product: Product): Product {
    const idx = this.products.findIndex(p => p.id === product.id);
    if (idx >= 0) this.products[idx] = product;
    else this.products.unshift(product);
    return product;
  }

  public deleteProduct(id: string): boolean {
    this.products = this.products.filter(p => p.id !== id);
    return true;
  }

  // --- INVENTORY API ---
  public getInventoryMovements(): InventoryMovement[] {
    return this.inventoryMovements;
  }

  public getLowStockVariants(threshold = 5): { product: Product; variant: ProductVariant }[] {
    const lowStock: { product: Product; variant: ProductVariant }[] = [];
    this.products.forEach(p => {
      (p.variants || []).forEach(v => {
        if (v.stockQuantity <= threshold) {
          lowStock.push({ product: p, variant: v });
        }
      });
    });
    return lowStock;
  }

  public adjustStock(
    productId: string,
    variantId: string,
    delta: number,
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'DAMAGED',
    reason: string,
    branchId = 'br-main'
  ): boolean {
    const p = this.getProductById(productId);
    if (!p) return false;
    const v = (p.variants || []).find(varItem => varItem.id === variantId);
    if (!v) return false;
    v.stockQuantity = Math.max(0, v.stockQuantity + delta);
    return true;
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public saveCoupon(coupon: Coupon): Coupon {
    const idx = this.coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (idx >= 0) this.coupons[idx] = coupon;
    else this.coupons.push(coupon);
    return coupon;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; coupon?: Coupon; message: string } {
    const c = this.coupons.find(cp => cp.code.toUpperCase() === code.trim().toUpperCase());
    if (!c || !c.isActive) return { valid: false, discount: 0, message: 'Invalid or inactive promo code.' };
    const discount = c.discountType === 'PERCENTAGE' ? Math.round((subtotal * c.discountValue) / 100) : c.discountValue;
    return { valid: true, discount, coupon: c, message: `Promo code ${c.code} applied!` };
  }

  // --- ORDER MANAGEMENT & CHECKOUT API ---
  public async createOrderAsync(data: {
    customer: Order['customer'];
    items: CartItem[];
    paymentMethod: 'MPESA' | 'CARD';
    couponCode?: string;
    mpesaPhone?: string;
  }): Promise<{ success: boolean; order?: any; error?: string }> {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Shopping cart is empty.' };
    }

    try {
      const order = await apiPlaceOrder({
        customer: data.customer,
        items: data.items.map(i => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        couponCode: data.couponCode,
        paymentMethod: data.paymentMethod,
        mpesaPhone: data.mpesaPhone,
      });

      // Refresh product stock live after placing order
      await this.refreshProducts();

      return { success: true, order: order as Order };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to place order.' };
    }
  }

  public updateOrderStatus(orderId: string, fulfillmentStatus?: Order['fulfillmentStatus'], paymentStatus?: Order['paymentStatus'], receiptRef?: string): Order | undefined {
    const order = this.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;
    if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (receiptRef) order.mpesaReceipt = receiptRef;
    return order;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getBranches(): Branch[] {
    return INITIAL_BRANCHES;
  }
}

export const dataService = new DataService();
