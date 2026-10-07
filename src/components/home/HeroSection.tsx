import { ArrowRight } from "lucide-react";
import campaign from "../../assets/gem-crystal-campaign-v2.webp";
import { useStore } from "../../context/useStore";
export const HeroSection = ({
  setCurrentTab,
}: {
  setCurrentTab: (tab: string) => void;
}) => {
  const { setFilters } = useStore();
  const shop = (gender: "women" | "men") => {
    setFilters((prev) => ({
      ...prev,
      gender,
      category: "All",
      sizes: [],
      colors: [],
      searchQuery: "",
      onSaleOnly: false,
    }));
    setCurrentTab(`${gender}-page`);
    window.scrollTo(0, 0);
  };
  return (
    <section className="campaign">
      <img
        className="campaign-image"
        src={campaign}
        alt="Gem and Crystal style campaign with pink tailoring and black menswear"
        fetchPriority="high"
      />
      <div className="campaign-content">
        <p className="campaign-kicker">
          Fashion, with a little more character.
        </p>
        <h1>
          Gem &amp; Crystal<span>Fashion Hub</span>
        </h1>
        <p className="campaign-copy">
          Your everyday wardrobe. Your standout moments.
          <br />
          Explore fashion and footwear for women and men.
        </p>
        <div className="campaign-actions">
          <button className="shop-button" onClick={() => shop("women")}>
            Shop Women <ArrowRight size={18} />
          </button>
          <button
            className="shop-button shop-button-outline"
            onClick={() => shop("men")}
          >
            Shop Men <ArrowRight size={18} />
          </button>
        </div>
        <p className="campaign-signature">Be bold. Be bright. Be you.</p>
      </div>
    </section>
  );
};
