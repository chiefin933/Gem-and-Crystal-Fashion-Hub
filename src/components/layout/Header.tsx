import { useState } from "react";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useStore } from "../../context/useStore";
import { openGemAssistant } from "../../utils/support";
interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
}
export const Header = ({
  currentTab,
  setCurrentTab,
  onOpenMobileMenu,
}: HeaderProps) => {
  const { cartCount, wishlist, setIsCartOpen, setFilters } = useStore();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = (tab: string) => {
    if (tab === "shop" || tab.endsWith("-page"))
      setFilters((prev) => ({
        ...prev,
        gender:
          tab === "women-page" ? "women" : tab === "men-page" ? "men" : "all",
        category: "All",
        searchQuery: "",
        sizes: [],
        colors: [],
        onSaleOnly: false,
        newArrivalsOnly: false,
      }));
    setCurrentTab(tab);
    window.scrollTo(0, 0);
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilters((prev) => ({
      ...prev,
      searchQuery: query.trim(),
      gender: "all",
      category: "All",
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 30000,
      onSaleOnly: false,
      newArrivalsOnly: false,
      inStockOnly: false,
    }));
    setCurrentTab("shop");
    setSearchOpen(false);
    window.scrollTo(0, 0);
  };
  return (
    <header className="store-header">
      <div className="header-main">
        <button
          className="icon-button mobile-menu-button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
          title="Menu"
        >
          <Menu size={22} />
        </button>
        <button className="wordmark" onClick={() => navigate("home")}>
          <span>
            Gem &amp; Crystal<span className="brand-dot">.</span>
          </span>
          <small>Fashion Hub</small>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {[
            ["home", "Home"],
            ["women-page", "Women"],
            ["men-page", "Men"],
            ["shop", "Shop All"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              aria-current={currentTab === tab ? "page" : undefined}
              onClick={() => navigate(tab)}
            >
              {label}
            </button>
          ))}
          <button onClick={openGemAssistant}>Help</button>
        </nav>
        <div className="header-tools">
          <button
            className="icon-button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search products"
            aria-expanded={searchOpen}
            title="Search"
          >
            {searchOpen ? <X size={21} /> : <Search size={21} />}
          </button>
          <button
            className="icon-button"
            onClick={() => navigate("wishlist")}
            aria-label={`Wishlist, ${wishlist.length} saved items`}
            title="Wishlist"
          >
            <Heart size={21} />
            {wishlist.length > 0 && (
              <span className="tool-count">{wishlist.length}</span>
            )}
          </button>
          <button
            className="icon-button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Shopping bag, ${cartCount} items`}
            title="Shopping bag"
          >
            <ShoppingBag size={21} />
            {cartCount > 0 && <span className="tool-count">{cartCount}</span>}
          </button>
        </div>
      </div>
      {searchOpen && (
        <form className="header-search" onSubmit={submit}>
          <Search size={20} />
          <input
            autoFocus
            aria-label="Search catalogue"
            placeholder="Search clothing, shoes and accessories"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="shop-button" type="submit">
            Search
          </button>
        </form>
      )}
    </header>
  );
};
