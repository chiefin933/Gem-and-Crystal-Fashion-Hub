import React, { useState } from "react";
import { SlidersHorizontal, PackageSearch, X } from "lucide-react";
import { useStore } from "../../context/useStore";
import { useModalDialog } from "../../utils/useModalDialog";
import { Product, FilterState } from "../../types/ecommerce";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { CATEGORIES } from "../../utils/demoData";

export interface ProductGridProps {
  title?: string;
  department?: "women" | "men";
  products: Product[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectProduct: (product: Product) => void;
  onResetFilters: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  filters,
  setFilters,
  onSelectProduct,
  onResetFilters,
  title,
  department,
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { catalogueStatus, refreshCatalogue } = useStore();
  const availableCategories = department
    ? [
        "All",
        ...CATEGORIES.filter(
          (category) =>
            category.gender === department || category.gender === "unisex",
        ).map((category) => category.name),
      ]
    : undefined;
  const resetFilters = () => {
    onResetFilters();
    if (department)
      setFilters((previous) => ({ ...previous, gender: department }));
  };
  useModalDialog(isMobileFilterOpen, "filters", () =>
    setIsMobileFilterOpen(false),
  );

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-gem-border gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gem-ink ">
              {filters.searchQuery
                ? `Results for “${filters.searchQuery}”`
                : filters.category === "All"
                  ? title || "The collection"
                  : filters.category}
            </h1>
            <p className="text-xs text-gem-muted mt-1">
              <span className="text-gem-pink font-bold">{products.length}</span>{" "}
              {products.length === 1 ? "piece" : "pieces"} to explore
            </p>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-3.5 py-2 bg-white border border-gem-border rounded-lg text-xs font-bold text-gem-ink hover:border-gem-pink"
            >
              <SlidersHorizontal className="w-4 h-4 text-gem-pink" />
              <span>Filters</span>
            </button>

            {/* Sorting Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gem-muted hidden sm:inline">
                Sort By:
              </span>
              <select
                aria-label="Sort products"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as any,
                  }))
                }
                className="bg-white border border-gem-border rounded-lg px-3 py-2 text-xs font-semibold text-gem-ink focus:outline-none focus:border-gem-pink cursor-pointer"
              >
                <option value="featured">Featured Items</option>
                <option value="newest">Newest Arrivals</option>
                <option value="bestselling">Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 filter-sidebar p-5 sticky top-28">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              onReset={resetFilters}
              availableCategories={availableCategories}
            />
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 crystal-card rounded-sm p-8 border border-dashed border-gem-border">
                <PackageSearch className="w-10 h-10 text-gem-pink mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-gem-ink mb-2">
                  {catalogueStatus === "loading"
                    ? "Loading the collection"
                    : catalogueStatus === "error"
                      ? "The collection is temporarily unavailable"
                      : "No pieces found"}
                </h3>
                <p className="text-xs text-gem-muted max-w-sm mx-auto mb-6">
                  {catalogueStatus === "error"
                    ? "Please try again shortly, or contact the boutique on WhatsApp."
                    : catalogueStatus === "loading"
                      ? "Checking the latest styles and availability."
                      : "Try a different category or clear your filters to explore the collection."}
                </p>
                {catalogueStatus === "error" ? (
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      className="shop-button"
                      onClick={() => void refreshCatalogue()}
                    >
                      Try again
                    </button>
                    <a
                      className="text-link"
                      href="https://wa.me/254718796296"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Contact the boutique
                    </a>
                  </div>
                ) : catalogueStatus === "ready" ? (
                  <button onClick={resetFilters} className="shop-button">
                    Clear filters
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div
            data-dialog="filters"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            className="relative w-full max-w-xs bg-white border-r border-gem-border h-full p-6 overflow-y-auto z-10"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gem-border">
              <span className="font-serif text-lg font-bold text-gem-ink">
                Filters
              </span>
              <button
                aria-label="Close filters"
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-gem-muted hover:text-gem-ink text-xs font-bold"
              >
                <X size={22} />
              </button>
            </div>
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              onReset={() => {
                resetFilters();
                setIsMobileFilterOpen(false);
              }}
              availableCategories={availableCategories}
            />
          </div>
        </div>
      )}
    </section>
  );
};
