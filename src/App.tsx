import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { MobileMenu } from './components/layout/MobileMenu';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { BenefitsStrip } from './components/home/BenefitsStrip';
import { CategoryGrid } from './components/home/CategoryGrid';
import { EditorialBanner } from './components/home/EditorialBanner';
import { ProductGrid } from './components/product/ProductGrid';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { ProductQuickView } from './components/product/ProductQuickView';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderConfirmation } from './components/checkout/OrderConfirmation';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { FloatingHomeButton } from './components/common/FloatingHomeButton';
import { BilingualAiChat } from './components/chat/BilingualAiChat';
import { WomenPage } from './pages/WomenPage';
import { MenPage } from './pages/MenPage';
import { dataService } from './utils/dataService';
import { Product, Order } from './types/ecommerce';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { filters, setFilters, toasts } = useStore();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Checkout & Order State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const allProducts = dataService.getProducts();
  const filteredProducts = dataService.getProducts(filters);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentTab('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
    setCurrentTab('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({
      gender: 'all',
      category: 'All',
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 30000,
      onSaleOnly: false,
      inStockOnly: false,
      searchQuery: '',
      sortBy: 'featured',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-slate-100">
      
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
        {currentTab === 'home' && (
          <>
            <HeroSection setCurrentTab={setCurrentTab} />
            <BenefitsStrip />
            <CategoryGrid setCurrentTab={setCurrentTab} />
            <EditorialBanner setCurrentTab={setCurrentTab} setFilters={setFilters} />
          </>
        )}

        {/* WOMEN DEPARTMENT PAGE */}
        {currentTab === 'women-page' && (
          <WomenPage
            products={allProducts}
            filters={filters}
            setFilters={setFilters}
            onSelectProduct={handleSelectProduct}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* MEN DEPARTMENT PAGE */}
        {currentTab === 'men-page' && (
          <MenPage
            products={allProducts}
            filters={filters}
            setFilters={setFilters}
            onSelectProduct={handleSelectProduct}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* SHOP CATALOGUE VIEW */}
        {currentTab === 'shop' && (
          <ProductGrid
            products={filteredProducts}
            filters={filters}
            setFilters={setFilters}
            onSelectProduct={handleSelectProduct}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* PRODUCT DETAIL VIEW */}
        {currentTab === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={allProducts}
            onBack={() => setCurrentTab('shop')}
            onSelectProduct={handleSelectProduct}
            onBuyNow={handleBuyNow}
          />
        )}

        {/* ORDER CONFIRMATION VIEW */}
        {currentTab === 'order-confirmation' && confirmedOrder && (
          <OrderConfirmation
            order={confirmedOrder}
            onContinueShopping={() => setCurrentTab('shop')}
          />
        )}


        {/* ABOUT US PAGE */}
        {currentTab === 'about-us' && (
          <section className="py-20 bg-[#09090b]">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-gem-pink block">Our Brand Identity</span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">BE BOLD. BE BRIGHT. BE YOU.</h1>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Gem & Crystal Fashion Hub was born out of a passion for modern luxury fashion, high-waisted mom jeans, contour crop tops, tailored blazers, and luxury footwear. We believe every piece of fashion you wear should express your confidence, individuality and radiance.
              </p>
              <div className="p-8 rounded-2xl crystal-card border border-gem-pink/30 text-left space-y-4">
                <h3 className="font-serif text-xl font-bold text-white">Our Heritage in Kenya</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based in Nairobi, Kenya, our boutique curates the finest apparel and shoes with nationwide 24-hour delivery and seamless Safaricom M-PESA checkout.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CONTACT US PAGE */}
        {currentTab === 'contact-us' && (
          <section className="py-20 bg-[#09090b]">
            <div className="max-w-3xl mx-auto px-4 crystal-card p-8 rounded-2xl border border-gem-pink/40 space-y-6">
              <h1 className="font-serif text-3xl font-bold text-white">Contact Gem &amp; Crystal Fashion Hub Concierge</h1>
              <p className="text-xs text-slate-400">Have a question about sizing, delivery, or custom orders? Reach out to our boutique team.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#121215] border border-gem-border">
                  <span className="font-bold text-gem-pink block mb-1">Phone & WhatsApp</span>
                  <p className="text-white font-mono font-bold">+254 718 796 296</p>
                </div>
                <div className="p-4 rounded-xl bg-[#121215] border border-gem-border">
                  <span className="font-bold text-gem-pink block mb-1">Email Concierge</span>
                  <p className="text-white font-mono font-bold">info@gemandcrystal.co.ke</p>
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
        onContinueShopping={() => setCurrentTab('shop')}
      />

      <ProductQuickView />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Floating Home Navigation Button */}
      <FloatingHomeButton
        currentTab={currentTab}
        onGoHome={() => setCurrentTab('home')}
      />

      {/* Floating Customer Support Channels */}
      <WhatsAppButton />
      <BilingualAiChat />

      {/* Global Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none mb-28 sm:mb-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border flex items-center space-x-2 text-xs font-semibold animate-bounce-short ${
              t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500'
                : t.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500'
                : 'bg-gem-card text-slate-200 border-gem-pink'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-gem-pink shrink-0" />}
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
