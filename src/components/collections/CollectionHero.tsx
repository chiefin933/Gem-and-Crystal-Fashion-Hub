import React from 'react';
import { ArrowDownRight } from 'lucide-react';

interface CollectionHeroProps {
  department: 'Women' | 'Men';
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  categories: { label: string; category: string }[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onShopCollection: () => void;
}

export const CollectionHero: React.FC<CollectionHeroProps> = ({
  department,
  image,
  eyebrow,
  title,
  description,
  categories,
  activeCategory,
  onCategoryChange,
  onShopCollection,
}) => (
  <section className="collection-hero" aria-labelledby={`${department.toLowerCase()}-collection-heading`}>
    <img className="collection-hero__image" src={image} alt={`Staged ${department.toLowerCase()}'s fashion collection`} />
    <div className="collection-hero__veil" />
    <div className="collection-hero__content">
      <p className="collection-hero__eyebrow">{eyebrow}</p>
      <h1 id={`${department.toLowerCase()}-collection-heading`} className="collection-hero__title">{title}</h1>
      <p className="collection-hero__description">{description}</p>
      <button type="button" onClick={onShopCollection} className="collection-hero__cta">
        Shop the collection <ArrowDownRight aria-hidden="true" size={18} />
      </button>
    </div>
    <nav className="collection-hero__categories" aria-label={`${department}'s categories`}>
      {categories.map((category) => (
        <button
          type="button"
          key={category.label}
          onClick={() => onCategoryChange(category.category)}
          aria-pressed={activeCategory.toLowerCase() === category.category.toLowerCase()}
          className={activeCategory.toLowerCase() === category.category.toLowerCase() ? 'is-active' : ''}
        >
          {category.label}
        </button>
      ))}
    </nav>
  </section>
);
