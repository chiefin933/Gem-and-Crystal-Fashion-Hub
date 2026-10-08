import {
  Product,
  ProductVariant,
  Order,
  Coupon,
  Branch,
  FilterState,
  CartItem,
} from "../types/ecommerce";
import { INITIAL_BRANCHES } from "./storeConfig";
import {
  fetchProducts as apiFetchProducts,
  placeOrder as apiPlaceOrder,
} from "../api/client";

/**
 * PAYMENT_CAPABILITIES — single source of truth for which payment methods
 * are currently active. When a gateway is integrated, flip the flag here
 * and the backend accepts it simultaneously.
 *
 * The storefront type still allows 'CARD' so the UI can show it as "coming
 * soon", but any CARD order attempt is rejected by the backend.
 */
export const PAYMENT_CAPABILITIES: Record<"MPESA" | "CARD", boolean> = {
  MPESA: true,
  CARD: false, // Enable when card gateway is integrated
};

class DataService {
  private products: Product[] = [];
  private coupons: Coupon[] = [];
  private isLoaded = false;
  private catalogueStatus: "loading" | "ready" | "error" = "loading";

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
        this.catalogueStatus = "ready";
        return;
      }
    } catch {
      console.warn("Catalogue API unavailable");
    }

    this.products = [];
    this.isLoaded = true;
    this.catalogueStatus = "error";
  }

  public async refreshProducts(): Promise<Product[]> {
    try {
      const liveProducts = await apiFetchProducts();
      if (Array.isArray(liveProducts)) {
        this.products = liveProducts as unknown as Product[];
        this.catalogueStatus = "ready";
      }
    } catch {
      this.catalogueStatus = "error";
      // keep current products
    }
    return this.products;
  }
  public getCatalogueStatus() {
    return this.catalogueStatus;
  }

  // --- PRODUCTS API ---
  public getProducts(filters?: Partial<FilterState>): Product[] {
    let result = [...this.products];

    if (!filters) return result;

    if (filters.gender && filters.gender !== "all") {
      result = result.filter(
        (p) => p.gender === filters.gender || p.gender === "unisex",
      );
    }

    if (filters.category && filters.category !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === filters.category!.toLowerCase(),
      );
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (filters.sizes && filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => filters.sizes!.includes(s)),
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => filters.colors!.includes(c.name)),
      );
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(
        (p) => (p.salePrice ?? p.price) >= filters.minPrice!,
      );
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(
        (p) => (p.salePrice ?? p.price) <= filters.maxPrice!,
      );
    }

    if (filters.onSaleOnly) {
      result = result.filter((p) => p.onSale);
    }

    if (filters.inStockOnly) {
      result = result.filter(
        (p) => p.variants && p.variants.some((v) => v.stockQuantity > 0),
      );
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "newest":
          result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case "price-low":
          result.sort(
            (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price),
          );
          break;
        case "price-high":
          result.sort(
            (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price),
          );
          break;
        case "bestselling":
          result.sort(
            (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0),
          );
          break;
        case "featured":
        default:
          result.sort(
            (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0),
          );
          break;
      }
    }

    return result;
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  // --- INVENTORY API ---
  public getLowStockVariants(
    threshold = 5,
  ): { product: Product; variant: ProductVariant }[] {
    const lowStock: { product: Product; variant: ProductVariant }[] = [];
    this.products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        if (v.stockQuantity <= threshold) {
          lowStock.push({ product: p, variant: v });
        }
      });
    });
    return lowStock;
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public validateCoupon(
    code: string,
    subtotal: number,
  ): { valid: boolean; discount: number; coupon?: Coupon; message: string } {
    const c = this.coupons.find(
      (cp) => cp.code.toUpperCase() === code.trim().toUpperCase(),
    );
    if (!c || !c.isActive)
      return {
        valid: false,
        discount: 0,
        message: "Invalid or inactive promo code.",
      };
    const discount =
      c.discountType === "PERCENTAGE"
        ? Math.round((subtotal * c.discountValue) / 100)
        : c.discountValue;
    return {
      valid: true,
      discount,
      coupon: c,
      message: `Promo code ${c.code} applied!`,
    };
  }

  // --- ORDER MANAGEMENT & CHECKOUT API ---
  public async createOrderAsync(data: {
    customer: Order["customer"];
    items: CartItem[];
    paymentMethod: "MPESA" | "CARD";
    couponCode?: string;
    mpesaPhone?: string;
  }): Promise<{ success: boolean; order?: any; error?: string }> {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Shopping cart is empty." };
    }

    try {
      const order = await apiPlaceOrder({
        customer: data.customer,
        items: data.items.map((i) => ({
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
      return { success: false, error: err.message || "Failed to place order." };
    }
  }

  public getBranches(): Branch[] {
    return INITIAL_BRANCHES;
  }
}

export const dataService = new DataService();
