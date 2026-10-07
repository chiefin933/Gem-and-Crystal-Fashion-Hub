import React, { useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Header } from "./components/layout/Header";
import { MobileMenu } from "./components/layout/MobileMenu";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/home/HeroSection";
import { BenefitsStrip } from "./components/home/BenefitsStrip";
import { CategoryGrid } from "./components/home/CategoryGrid";
import { EditorialBanner } from "./components/home/EditorialBanner";
import { TrendingSection } from "./components/home/TrendingSection";
import { ProductGrid } from "./components/product/ProductGrid";
import { ProductDetailPage } from "./components/product/ProductDetailPage";
import { ProductQuickView } from "./components/product/ProductQuickView";
import { CartDrawer } from "./components/cart/CartDrawer";
import { CheckoutModal } from "./components/checkout/CheckoutModal";
import { OrderConfirmation } from "./components/checkout/OrderConfirmation";
import { BilingualAiChat } from "./components/chat/BilingualAiChat";
import { FloatingSupport } from "./components/common/FloatingSupport";
import { WomenPage } from "./pages/WomenPage";
import { MenPage } from "./pages/MenPage";
import { dataService } from "./utils/dataService";
import { Product, Order } from "./types/ecommerce";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Heart,
  ArrowRight,
} from "lucide-react";
import { ProductCard } from "./components/product/ProductCard";

const MainAppContent: React.FC = () => {
  const { filters, setFilters, toasts, wishlist } = useStore();

  const [currentTab, setCurrentTab] = useState<string>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Checkout & Order State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const allProducts = dataService.getProducts();
  const filteredProducts = dataService.getProducts(filters);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentTab("product-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
    setCurrentTab("order-confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setFilters({
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
    });
  };

  return (
    <div className="storefront min-h-screen flex flex-col">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Mobile Drawer Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {/* HOMEPAGE VIEW */}
        {currentTab === "home" && (
          <>
            <HeroSection setCurrentTab={setCurrentTab} />
            <BenefitsStrip />
            <CategoryGrid setCurrentTab={setCurrentTab} />
            <TrendingSection
              products={allProducts}
              onSelectProduct={handleSelectProduct}
              setCurrentTab={setCurrentTab}
            />
            <EditorialBanner
              setCurrentTab={setCurrentTab}
              setFilters={setFilters}
            />
          </>
        )}

        {/* WOMEN DEPARTMENT PAGE */}
        {currentTab === "women-page" && (
          <WomenPage
            products={allProducts}
            filters={filters}
            setFilters={setFilters}
            onSelectProduct={handleSelectProduct}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* MEN DEPARTMENT PAGE */}
        {currentTab === "men-page" && (
          <MenPage
            products={allProducts}
            filters={filters}
            setFilters={setFilters}
            onSelectProduct={handleSelectProduct}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* SHOP CATALOGUE VIEW */}
        {currentTab === "shop" && (
          <ProductGrid
            products={filteredProducts}
            filters={filters}
            setFilters={setFilters}
            onSelectProduct={handleSelectProduct}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* PRODUCT DETAIL VIEW */}
        {currentTab === "wishlist" && (
          <section className="wishlist-section">
            <div className="section-heading">
              <div>
                <p>Made for your next visit</p>
                <h1>Your wishlist</h1>
              </div>
              <span>
                {wishlist.length} saved{" "}
                {wishlist.length === 1 ? "piece" : "pieces"}
              </span>
            </div>
            {allProducts.some((product) => wishlist.includes(product.id)) ? (
              <div className="wishlist-grid">
                {allProducts
                  .filter((product) => wishlist.includes(product.id))
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleSelectProduct}
                    />
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <Heart size={32} />
                <h2>
                  {wishlist.length
                    ? "Your saved pieces are unavailable right now"
                    : "A place for your favourites"}
                </h2>
                <p>
                  {wishlist.length
                    ? "Your wishlist is saved. Check again when the collection is available."
                    : "Save the pieces you love and come back to them here."}
                </p>
                <button
                  className="shop-button"
                  onClick={() => setCurrentTab("shop")}
                >
                  Explore the collection <ArrowRight size={18} />
                </button>
              </div>
            )}
          </section>
        )}
        {currentTab === "product-detail" && selectedProduct && (
          <ProductDetailPage
            key={selectedProduct.id}
            product={selectedProduct}
            allProducts={allProducts}
            onBack={() => setCurrentTab("shop")}
            onSelectProduct={handleSelectProduct}
            onBuyNow={handleBuyNow}
          />
        )}

        {/* ORDER CONFIRMATION VIEW */}
        {currentTab === "order-confirmation" && confirmedOrder && (
          <OrderConfirmation
            order={confirmedOrder}
            onContinueShopping={() => setCurrentTab("shop")}
          />
        )}

        {/* ABOUT US PAGE */}
        {currentTab === "about-us" && (
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
              <span className="text-sm text-gem-pink block">The boutique</span>
              <h1 className="font-serif text-4xl sm:text-5xl text-gem-ink">
                Gem &amp; Crystal Fashion Hub
              </h1>
              <p className="text-sm text-gem-ink font-light leading-relaxed">
                Clothing, footwear and accessories for women and men, from
                everyday denim to occasion dresses. Explore the collection
                online or speak to our Nairobi boutique about finding your fit.
              </p>
              <div className="p-8 rounded-sm crystal-card border border-gem-pink/30 text-left space-y-4">
                <h3 className="font-serif text-xl font-bold text-gem-ink">
                  Visit us in Nairobi
                </h3>
                <p className="text-xs text-gem-ink leading-relaxed">
                  Find us in Roysambu, Nairobi. Contact the boutique for
                  directions, opening hours and delivery arrangements. Online
                  orders support M-Pesa checkout.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CONTACT US PAGE */}
        {currentTab === "contact-us" && (
          <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4 crystal-card p-8 rounded-sm border border-gem-pink/40 space-y-6">
              <h1 className="font-serif text-3xl font-bold text-gem-ink">
                Let's find your next favourite.
              </h1>
              <p className="text-xs text-gem-muted">
                Have a question about sizing, delivery, or custom orders? Reach
                out to our boutique team.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-sm bg-white border border-gem-border">
                  <span className="font-bold text-gem-pink block mb-1">
                    Phone & WhatsApp
                  </span>
                  <a
                    href="https://wa.me/254718796296"
                    target="_blank"
                    rel="noreferrer"
                    className="text-gem-ink font-bold"
                  >
                    +254 718 796 296
                  </a>
                </div>
                <div className="p-4 rounded-sm bg-white border border-gem-border">
                  <span className="font-bold text-gem-pink block mb-1">
                    Visit the boutique
                  </span>
                  <p className="text-gem-ink">Roysambu, Nairobi</p>
                  <p>Message us for directions and opening hours.</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Persistent Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Global Modals & Drawers */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onContinueShopping={() => setCurrentTab("shop")}
      />

      <ProductQuickView />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Customer support dialog */}
      <BilingualAiChat />
      <FloatingSupport />

      {/* Global Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none mb-28 sm:mb-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-sm shadow-2xl border flex items-center space-x-2 text-xs font-semibold -short ${
              t.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500"
                : t.type === "error"
                  ? "bg-rose-950/90 text-rose-200 border-rose-500"
                  : "bg-gem-card text-gem-ink border-gem-pink"
            }`}
          >
            {t.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            )}
            {t.type === "error" && (
              <AlertCircle className="w-4 h-4 text-gem-pink shrink-0" />
            )}
            {t.type === "info" && (
              <Info className="w-4 h-4 text-gem-pink shrink-0" />
            )}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
};

export default App;
