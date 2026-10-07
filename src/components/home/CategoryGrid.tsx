import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "../../context/useStore";
import { CATEGORIES } from "../../utils/demoData";
import dresses from "../../assets/cat_dresses_1787579504483.webp";
import denim from "../../assets/prod_mom_jeans_blue_1787580129860.webp";
import heels from "../../assets/cat_heels_1787579612171.webp";
export const CategoryGrid = ({
  setCurrentTab,
}: {
  setCurrentTab: (tab: string) => void;
}) => {
  const { setFilters } = useStore();
  const [gender, setGender] = useState<"all" | "women" | "men">("all");
  const browse = (
    category: string,
    department: "all" | "women" | "men" = gender,
  ) => {
    setFilters((prev) => ({
      ...prev,
      category,
      gender: department,
      searchQuery: "",
      sizes: [],
      colors: [],
      onSaleOnly: false,
    }));
    setCurrentTab("shop");
    window.scrollTo(0, 0);
  };
  return (
    <section className="collection-section">
      <div className="section-heading">
        <div>
          <p>The wardrobe edit</p>
          <h2>Find your next favourite.</h2>
        </div>
        <button className="text-link" onClick={() => browse("All", "all")}>
          Explore everything <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="collection-features">
        {[
          { name: "Dresses", image: dresses, label: "For the occasion" },
          { name: "Mommy jeans", image: denim, label: "Your everyday denim" },
          { name: "Heels", image: heels, label: "The finishing touch" },
        ].map((item) => (
          <button
            className="collection-feature"
            key={item.name}
            onClick={() => browse(item.name, "women")}
          >
            <div className="collection-image">
              <img src={item.image} alt={item.name} loading="lazy" />
            </div>
            <div>
              <span>{item.label}</span>
              <h3>
                {item.name === "Mommy jeans" ? "Denim" : item.name}
                <ArrowUpRight size={24} />
              </h3>
            </div>
          </button>
        ))}
      </div>
      <div className="category-directory">
        <div className="directory-heading">
          <h3>Shop by category</h3>
          <div className="department-tabs" role="group" aria-label="Department">
            {(["all", "women", "men"] as const).map((value) => (
              <button
                key={value}
                aria-pressed={gender === value}
                onClick={() => setGender(value)}
              >
                {value === "all" ? "All" : value === "women" ? "Women" : "Men"}
              </button>
            ))}
          </div>
        </div>
        <div className="category-links">
          {CATEGORIES.filter(
            (cat) =>
              gender === "all" ||
              cat.gender === gender ||
              cat.gender === "unisex",
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                browse(
                  cat.name,
                  gender === "all" && cat.gender === "women" ? "women" : gender,
                )
              }
            >
              {cat.name}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
