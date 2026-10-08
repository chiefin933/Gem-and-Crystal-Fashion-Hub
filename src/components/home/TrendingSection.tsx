import { ArrowUpRight } from "lucide-react";
import { Product } from "../../types/ecommerce";
import { ProductCard } from "../product/ProductCard";
import { useStore } from "../../context/useStore";

interface TrendingSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  setCurrentTab: (tab: string) => void;
}

export const TrendingSection = ({
  products,
  onSelectProduct,
  setCurrentTab,
}: TrendingSectionProps) => {
  const { catalogueStatus, setFilters } = useStore();
  return (
    <section className="collection-section live-assortment">
      <div className="section-heading">
        <div>
          <p>From the boutique</p>
          <h2>The latest pieces.</h2>
        </div>
        <button
          className="text-link"
          onClick={() => {
            setFilters((previous) => ({
              ...previous,
              gender: "all",
              category: "All",
              sizes: [],
              colors: [],
              searchQuery: "",
              onSaleOnly: false,
              newArrivalsOnly: false,
            }));
            setCurrentTab("shop");
            window.scrollTo(0, 0);
          }}
        >
          Shop the collection <ArrowUpRight size={18} />
        </button>
      </div>
      {products.length ? (
        <div className="wishlist-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="catalogue-message" role="status">
          <p>
            {catalogueStatus === "loading"
              ? "Loading the latest collection..."
              : catalogueStatus === "error"
                ? "The online collection is temporarily unavailable."
                : "New pieces will appear here as they become available."}
          </p>
          <a href="https://wa.me/254718796296" target="_blank" rel="noreferrer">
            Ask the boutique about available styles <ArrowUpRight size={16} />
          </a>
        </div>
      )}
    </section>
  );
};
