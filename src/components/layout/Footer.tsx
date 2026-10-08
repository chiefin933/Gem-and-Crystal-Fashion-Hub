import { ArrowUpRight } from "lucide-react";
import { useStore } from "../../context/useStore";
import { CATEGORIES } from "../../utils/storeConfig";
import { openGemAssistant } from "../../utils/support";
export const Footer = ({
  setCurrentTab,
}: {
  setCurrentTab: (tab: string) => void;
}) => {
  const { setFilters } = useStore();
  const navigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo(0, 0);
  };
  return (
    <footer className="store-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <button className="wordmark" onClick={() => navigate("home")}>
            <span>
              Gem &amp; Crystal<span className="brand-dot">.</span>
            </span>
            <small>Fashion Hub</small>
          </button>
          <p>
            Fashion and footwear for the everyday
            <br />
            and the moments that matter.
          </p>
          <a href="https://wa.me/254718796296" target="_blank" rel="noreferrer">
            +254 718 796 296 <ArrowUpRight size={16} />
          </a>
          <p>Roysambu, Nairobi</p>
        </div>
        <div>
          <h3>Explore</h3>
          <div className="footer-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    category: cat.name,
                    gender: cat.gender === "women" ? "women" : "all",
                    searchQuery: "",
                    sizes: [],
                    colors: [],
                    onSaleOnly: false,
                    newArrivalsOnly: false,
                  }));
                  navigate("shop");
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3>The boutique</h3>
          <button onClick={() => navigate("about-us")}>Our story</button>
          <button onClick={() => navigate("contact-us")}>Contact us</button>
          <button onClick={() => navigate("wishlist")}>Your wishlist</button>
          <button onClick={openGemAssistant}>Gem AI assistant</button>
          <a href="https://wa.me/254718796296" target="_blank" rel="noreferrer">
            Order &amp; delivery enquiries
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2023 Gem &amp; Crystal Fashion Hub</span>
        <span>Kenya / KSh</span>
      </div>
    </footer>
  );
};
