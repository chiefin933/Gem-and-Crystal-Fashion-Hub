export type Gender = 'women' | 'men' | 'unisex';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  gender: Gender;
  category: string; // e.g. 'Dresses', 'Denim & Jeans', 'Tops & Crop Tops', 'Blazers & Jackets', 'Heels', 'Boots', 'Sneakers', 'Loafers'
  subcategory: string;
  price: number;
  salePrice?: number;
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
  colors: ColorOption[];
  variants: ProductVariant[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  gender: Gender;
  image: string;
  description: string;
  itemCount: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  category: string;
  size: string;
  color: string;
  image: string;
  price: number;
  quantity: number;
  maxStock: number;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  county: string;
  townCity: string;
  streetAddress: string;
  notes?: string;
  isDefault: boolean;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
export type PaymentMethod = 'MPESA' | 'CARD';

export interface OrderItemSnapshot {
  productId: string;
  variantId: string;
  title: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    county: string;
    townCity: string;
    address: string;
    notes?: string;
  };
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  currency: 'KES';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: OrderStatus;
  mpesaPhone?: string;
  mpesaReceipt?: string;
  stripePaymentId?: string;
  createdAt: string;
  branchId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  savedAddresses: ShippingAddress[];
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productTitle: string;
  variantId: string;
  size: string;
  color: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'DAMAGED';
  quantity: number;
  reason: string;
  timestamp: string;
  branchId: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  phone: string;
  isMainStore: boolean;
}

export interface FilterState {
  gender: Gender | 'all';
  category: string;
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  onSaleOnly: boolean;
  inStockOnly: boolean;
  searchQuery: string;
  sortBy: 'featured' | 'newest' | 'price-low' | 'price-high' | 'bestselling';
}
