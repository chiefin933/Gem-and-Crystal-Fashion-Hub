import React from "react";
import { X, Phone, MapPin } from "lucide-react";
import { FilterState } from "../../types/ecommerce";
import { useModalDialog } from "../../utils/useModalDialog";
import { useStore } from "../../context/useStore";
import { openGemAssistant } from "../../utils/support";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
}) => {
  const { setFilters } = useStore();
  useModalDialog(isOpen, "navigation", onClose);

  if (!isOpen) return null;

  const navigateTo = (tab: string, filterObj?: Partial<FilterState>) => {
    if (filterObj) {
      setFilters((prev) => ({
        ...prev,
        searchQuery: "",
        sizes: [],
        colors: [],
        onSaleOnly: false,
        newArrivalsOnly: false,
        ...filterObj,
      }));
    }
    setCurrentTab(tab);
    onClose();
    window.scrollTo(0, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        data-dialog="navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="relative w-full max-w-xs bg-white border-r border-gem-border/80 h-full flex flex-col z-10 overflow-y-auto p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-6 border-b border-gem-border">
          <button className="wordmark" onClick={() => navigateTo("home")}>
            <span>
              Gem &amp; Crystal<span className="brand-dot">.</span>
            </span>
            <small>Fashion Hub</small>
          </button>

          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-2 text-gem-muted hover:text-gem-ink"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Mobile navigation"
          className="py-6 space-y-4 font-serif text-xl font-medium"
        >
          <button
            className="block w-full text-left"
            onClick={() =>
              navigateTo("shop", { gender: "all", category: "All" })
            }
          >
            Shop all
          </button>
          <button
            className="block w-full text-left"
            onClick={() => navigateTo("wishlist")}
          >
            Wishlist
          </button>
          <button
            onClick={() => navigateTo("home")}
            className={`block w-full text-left transition-colors ${
              currentTab === "home" ? "text-gem-pink font-bold" : "text-gem-ink"
            }`}
          >
            Home
          </button>

          <button
            onClick={() =>
              navigateTo("women-page", { gender: "women", category: "All" })
            }
            className={`block w-full text-left transition-colors ${
              currentTab === "women-page"
                ? "text-gem-pink font-bold"
                : "text-gem-ink"
            }`}
          >
            Women
          </button>

          <button
            onClick={() =>
              navigateTo("men-page", { gender: "men", category: "All" })
            }
            className={`block w-full text-left transition-colors ${
              currentTab === "men-page"
                ? "text-gem-pink font-bold"
                : "text-gem-ink"
            }`}
          >
            Men
          </button>

          <button
            onClick={() => navigateTo("about-us")}
            className={`block w-full text-left transition-colors ${
              currentTab === "about-us"
                ? "text-gem-pink font-bold"
                : "text-gem-ink"
            }`}
          >
            Our story
          </button>

          <button
            onClick={() => navigateTo("contact-us")}
            className={`block w-full text-left transition-colors ${
              currentTab === "contact-us"
                ? "text-gem-pink font-bold"
                : "text-gem-ink"
            }`}
          >
            Contact us
          </button>
          <button
            className="block w-full text-left"
            onClick={() => {
              onClose();
              openGemAssistant();
            }}
          >
            Gem AI assistant
          </button>
        </nav>

        {/* Contact Info Footer */}
        <div className="mt-auto pt-6 border-t border-gem-border space-y-3">
          <div className="pt-4 text-xs text-gem-muted space-y-2">
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-gem-pink" />
              <span>+254 718 796 296</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-gem-pink" />
              <span>Roysambu, Nairobi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
