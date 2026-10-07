import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { CartItem, Product, FilterState } from "../types/ecommerce";
import { dataService } from "../utils/dataService";
import {
  parseStoredCart,
  parseStoredStringList,
} from "../utils/browserStorage";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
}

export interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: Product | null;
  filters: FilterState;
  toasts: ToastMessage[];
  currency: "KES";
  catalogueStatus: "loading" | "ready" | "error";
  refreshCatalogue: () => Promise<void>;
  setIsCartOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  addToCart: (
    product: Product,
    size: string,
    color: string,
    quantity?: number,
  ) => boolean;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
  cartSubtotal: number;
  cartCount: number;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
}

const DEFAULT_FILTERS: FilterState = {
  gender: "all",
  category: "All",
  sizes: [],
  colors: [],
  minPrice: 0,
  maxPrice: 30000,
  onSaleOnly: false,
  inStockOnly: false,
  searchQuery: "",
  sortBy: "featured",
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = "gcf_cart_v6";
const WISH_KEY = "gcf_wish_v6";

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    return parseStoredCart(localStorage.getItem(CART_KEY));
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return parseStoredStringList(localStorage.getItem(WISH_KEY));
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [catalogueStatus, setCatalogueStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [, setCatalogueRevision] = useState(0);
  const loadCatalogue = useCallback(async () => {
    await dataService.refreshProducts();
    setCatalogueStatus(dataService.getCatalogueStatus());
    setCatalogueRevision((value) => value + 1);
  }, []);
  const refreshCatalogue = useCallback(async () => {
    setCatalogueStatus("loading");
    await loadCatalogue();
  }, [loadCatalogue]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync with live REST API (poll every 8 seconds for real-time inventory updates from Admin)
  useEffect(() => {
    void dataService.refreshProducts().then(() => {
      setCatalogueStatus(dataService.getCatalogueStatus());
      setCatalogueRevision((value) => value + 1);
    });
    const interval = setInterval(() => {
      void loadCatalogue();
    }, 8000);
    return () => clearInterval(interval);
  }, [loadCatalogue]);

  const showToast = (
    text: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = "toast-" + Date.now();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  const addToCart = (
    product: Product,
    size: string,
    color: string,
    quantity = 1,
  ): boolean => {
    const variants = product.variants || [];
    const variant = variants.find((v) => v.size === size && v.color === color);
    if (!variant) {
      showToast(`Variant unavailable.`, "error");
      return false;
    }
    if (variant.stockQuantity < 1) {
      showToast(`Out of stock.`, "error");
      return false;
    }
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > variant.stockQuantity
    ) {
      showToast(
        `Choose a quantity between 1 and ${variant.stockQuantity}.`,
        "error",
      );
      return false;
    }

    const price = variant.salePrice ?? variant.price;
    const existingIndex = cart.findIndex((c) => c.variantId === variant.id);

    if (existingIndex >= 0) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > variant.stockQuantity) {
        showToast(`Max stock is ${variant.stockQuantity}.`, "error");
        return false;
      }
      const updated = [...cart];
      updated[existingIndex].quantity = newQty;
      setCart(updated);
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          category: product.category,
          size,
          color,
          image: product.images[0],
          price,
          quantity,
          maxStock: variant.stockQuantity,
        },
      ]);
    }
    showToast(`Added "${product.title}" to cart!`, "success");
    setIsCartOpen(true);
    return true;
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.min(quantity, item.maxStock) }
          : item,
      ),
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
    showToast("Item removed.", "info");
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    const product = dataService.getProductById(productId);
    if (wishlist.includes(productId)) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast(
        `Removed ${product ? `"${product.title}"` : "item"} from wishlist.`,
        "info",
      );
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast(
        `Added ${product ? `"${product.title}"` : "item"} to wishlist!`,
        "success",
      );
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        filters,
        toasts,
        currency: "KES",
        catalogueStatus,
        refreshCatalogue,
        setIsCartOpen,
        setIsSearchOpen,
        setQuickViewProduct,
        setFilters,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        showToast,
        cartSubtotal,
        cartCount,
        appliedCoupon,
        setAppliedCoupon,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components -- Provider hook is intentionally colocated.
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
