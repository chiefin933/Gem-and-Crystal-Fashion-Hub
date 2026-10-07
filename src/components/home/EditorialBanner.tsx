import { ArrowRight } from "lucide-react";
import { FilterState } from "../../types/ecommerce";
export const EditorialBanner = ({
  setCurrentTab,
  setFilters,
}: {
  setCurrentTab: (tab: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}) => (
  <section className="boutique-band">
    <div>
      <p>Gem &amp; Crystal, Nairobi</p>
      <h2>Good style is personal.</h2>
      <p>
        Discover your fit, put a look together, or ask us about a piece you've
        spotted.
      </p>
    </div>
    <a
      className="shop-button"
      href="https://wa.me/254718796296"
      target="_blank"
      rel="noreferrer"
    >
      Talk to the boutique <ArrowRight size={18} />
    </a>
    <button
      className="text-link"
      onClick={() => {
        setFilters((prev) => ({
          ...prev,
          gender: "all",
          category: "All",
          searchQuery: "",
          sizes: [],
          colors: [],
          onSaleOnly: true,
        }));
        setCurrentTab("shop");
        window.scrollTo(0, 0);
      }}
    >
      Browse current offers <ArrowRight size={18} />
    </button>
  </section>
);
