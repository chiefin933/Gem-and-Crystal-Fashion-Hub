import { Heart, Eye, ShoppingBag } from "lucide-react";
import { Product } from "../../types/ecommerce";
import { useStore } from "../../context/useStore";
export const ProductCard = ({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (product: Product) => void;
}) => {
  const { toggleWishlist, isInWishlist, setQuickViewProduct, addToCart } =
    useStore();
  const available = product.variants.filter(
    (variant) => variant.stockQuantity > 0,
  );
  const saved = isInWishlist(product.id);
  const quickAdd = () => {
    if (product.variants.length === 1 && available[0])
      addToCart(product, available[0].size, available[0].color);
    else setQuickViewProduct(product);
  };
  return (
    <article className="product-card">
      <div className="product-card-image">
        <button
          className="product-image-link"
          onClick={() => onSelect(product)}
          aria-label={`View ${product.title}`}
        >
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.title} loading="lazy" />
          ) : (
            <span>Image unavailable</span>
          )}
        </button>
        <div className="product-badges">
          {product.onSale && <span>Sale</span>}
          {product.isNew && <span>New</span>}
        </div>
        <button
          className="product-save icon-button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={`${saved ? "Remove" : "Save"} ${product.title} ${saved ? "from" : "to"} wishlist`}
          aria-pressed={saved}
          title="Save to wishlist"
        >
          <Heart size={19} fill={saved ? "currentColor" : "none"} />
        </button>
        <div className="product-actions">
          <button
            onClick={() => setQuickViewProduct(product)}
            title="Quick view"
            aria-label={`Quick view ${product.title}`}
          >
            <Eye size={18} />
          </button>
          <button onClick={quickAdd} disabled={!available.length}>
            <ShoppingBag size={16} />
            <span>
              {product.variants.length > 1 ? "Choose options" : "Add to bag"}
            </span>
          </button>
        </div>
      </div>
      <div className="product-card-info">
        <p>{product.category}</p>
        <button onClick={() => onSelect(product)}>{product.title}</button>
        <div className="product-price">
          KSh {(product.salePrice ?? product.price).toLocaleString()}
          {product.salePrice != null && product.salePrice < product.price && (
            <del>KSh {product.price.toLocaleString()}</del>
          )}
        </div>
        <div className="product-swatches">
          {product.colors.map((color) => (
            <span
              key={color.name}
              title={color.name}
              style={{ backgroundColor: color.hex }}
            />
          ))}
          {!available.length && <small>Out of stock</small>}
        </div>
      </div>
    </article>
  );
};
