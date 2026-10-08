import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import campaign from "../../assets/gem-crystal-campaign-v2.webp";
import dresses from "../../assets/cat_dresses_1787579504483.webp";
import sneakers from "../../assets/gem-crystal-sneakers-campaign.webp";
import { useStore } from "../../context/useStore";
import { dataService } from "../../utils/dataService";
import { Product } from "../../types/ecommerce";

const slides = [
  {
    id: "women",
    title: "Women's clothing",
    copy: "From everyday denim to occasion dresses. Find the pieces that feel like you.",
    cta: "Shop women",
    fallback: dresses,
  },
  {
    id: "men",
    title: "Men's clothing",
    copy: "A considered wardrobe, from relaxed essentials to a sharper finish.",
    cta: "Shop men",
    fallback: campaign,
  },
  {
    id: "sneakers",
    title: "Sneakers",
    copy: "Your next everyday pair. Explore sneakers for women and men.",
    cta: "Shop sneakers",
    fallback: sneakers,
  },
  {
    id: "arrivals",
    title: "New arrivals",
    copy: "A fresh look at the boutique. Explore pieces marked new in our current collection.",
    cta: "Explore new arrivals",
    fallback: campaign,
  },
] as const;

function matchesSlide(product: Product, id: (typeof slides)[number]["id"]) {
  if (id === "arrivals") return product.isNew;
  if (id === "sneakers") return product.category.toLowerCase() === "sneakers";
  return product.gender === id;
}

export const HeroSection = ({
  setCurrentTab,
}: {
  setCurrentTab: (tab: string) => void;
}) => {
  const { setFilters } = useStore();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [focused, setFocused] = useState(false);
  const keyboardNavigation = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const slide = slides[active];
  const liveProduct = dataService
    .getProducts()
    .find(
      (product) =>
        matchesSlide(product, slide.id) && product.images.some(Boolean),
    );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReducedMotion(media.matches);
    const visibility = () => setPageVisible(!document.hidden);
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const frame = requestAnimationFrame(() => {
      motion();
      visibility();
    });
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || focused || reducedMotion || !pageVisible) return;
    const timer = window.setInterval(
      () => setActive((previous) => (previous + 1) % slides.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [playing, focused, reducedMotion, pageVisible]);

  const choose = (index: number, focusTab = false) => {
    const next = (index + slides.length) % slides.length;
    setActive(next);
    if (focusTab) tabs.current[next]?.focus();
  };
  const shop = () => {
    const gender =
      slide.id === "women" || slide.id === "men" ? slide.id : "all";
    setFilters((previous) => ({
      ...previous,
      gender,
      category: slide.id === "sneakers" ? "Sneakers" : "All",
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 30000,
      searchQuery: "",
      onSaleOnly: false,
      newArrivalsOnly: slide.id === "arrivals",
      inStockOnly: false,
      sortBy: slide.id === "arrivals" ? "newest" : "featured",
    }));
    setCurrentTab(gender === "all" ? "shop" : `${gender}-page`);
    window.scrollTo(0, 0);
  };

  return (
    <section
      className={`campaign showcase showcase-${slide.id} ${liveProduct ? "showcase-live" : ""}`}
      aria-roledescription="carousel"
      aria-label="Gem and Crystal collection showcase"
      onPointerDownCapture={() => {
        keyboardNavigation.current = false;
        setFocused(false);
      }}
      onKeyDownCapture={() => {
        keyboardNavigation.current = true;
        setFocused(true);
      }}
      onFocusCapture={(event) =>
        setFocused(
          keyboardNavigation.current || event.target.matches(":focus-visible"),
        )
      }
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div
        id="showcase-panel"
        role="tabpanel"
        aria-labelledby={`showcase-tab-${active}`}
      >
        <div
          className="showcase-image-rail"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((item, index) => {
            const product = dataService
              .getProducts()
              .find(
                (candidate) =>
                  matchesSlide(candidate, item.id) &&
                  candidate.images.some(Boolean),
              );
            return (
              <img
                key={item.id}
                className={`campaign-image showcase-photo-${item.id}`}
                style={{ left: `${index * 100}%` }}
                src={product?.images.find(Boolean) || item.fallback}
                alt={product?.title || `${item.title} campaign inspiration`}
                aria-hidden={active !== index}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            );
          })}
        </div>
        <div className="campaign-content">
          <p className="campaign-kicker">The boutique showcase</p>
          <h1>
            Gem &amp; Crystal<span>Fashion Hub</span>
          </h1>
          <div className="showcase-copy" aria-live={playing ? "off" : "polite"}>
            <h2>{slide.title}</h2>
            <p className="campaign-copy">{slide.copy}</p>
          </div>
          <div className="campaign-actions">
            <button className="shop-button" onClick={shop}>
              {slide.cta}
              <ArrowRight size={18} />
            </button>
          </div>
          <p className="campaign-signature">Be bold. Be bright. Be you.</p>
        </div>
      </div>
      <div className="showcase-controls">
        <div
          className="showcase-dots"
          role="tablist"
          aria-label="Showcase collections"
        >
          {slides.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              id={`showcase-tab-${index}`}
              role="tab"
              aria-label={`Show ${item.title}`}
              aria-selected={active === index}
              aria-controls="showcase-panel"
              tabIndex={active === index ? 0 : -1}
              onClick={() => choose(index)}
              onKeyDown={(event) => {
                if (
                  ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  choose(
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? slides.length - 1
                        : active + (event.key === "ArrowRight" ? 1 : -1),
                    true,
                  );
                }
              }}
            >
              <span />
            </button>
          ))}
        </div>
        <span className="showcase-counter" aria-hidden="true">
          {String(active + 1).padStart(2, "0")} / 04
        </span>
        <div className="showcase-tools">
          <button
            className="icon-button"
            aria-label="Previous showcase slide"
            title="Previous slide"
            onClick={() => choose(active - 1)}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="icon-button"
            aria-label={playing ? "Pause showcase" : "Play showcase"}
            title={playing ? "Pause showcase" : "Play showcase"}
            disabled={reducedMotion}
            onClick={() => {
              setPlaying((value) => !value);
              setFocused(false);
            }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            className="icon-button"
            aria-label="Next showcase slide"
            title="Next slide"
            onClick={() => choose(active + 1)}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
};
