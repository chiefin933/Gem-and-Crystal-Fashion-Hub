import { Product, CategoryItem, Branch, Coupon } from '../types/ecommerce';

// Set to empty string to hide the AI-generated model image and show the brand card instead
export const HERO_REAL_IMAGE = '';

export const INITIAL_COUPONS: Coupon[] = [];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-main',
    name: 'Gem & Crystal Main Store',
    code: 'GC-NBO-01',
    city: 'Roysambu, Nairobi',
    phone: '+254 718 796 296',
    isMainStore: true,
  }
];

export const PRODUCTS: Product[] = [];

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-dresses',
    name: 'Dresses',
    slug: 'dresses',
    gender: 'women',
    image: '',
    description: 'Glamorous evening gowns, silk slip dresses, and chic cocktail attire.',
    itemCount: 0,
  },
  {
    id: 'cat-two-piece',
    name: 'Two piece (skirt/trouser)',
    slug: 'two-piece',
    gender: 'women',
    image: '',
    description: 'Coordinated crop top with matching skirt or wide-leg trouser sets.',
    itemCount: 0,
  },
  {
    id: 'cat-three-piece',
    name: 'Three piece',
    slug: 'three-piece',
    gender: 'women',
    image: '',
    description: 'Luxury 3-piece tailored suit sets, vest, blazer & trouser combinations.',
    itemCount: 0,
  },
  {
    id: 'cat-straight-jeans',
    name: 'Straight jeans',
    slug: 'straight-jeans',
    gender: 'unisex',
    image: '',
    description: 'Classic straight leg denim jeans in vintage blue and dark wash.',
    itemCount: 0,
  },
  {
    id: 'cat-mommy-jeans',
    name: 'Mommy jeans',
    slug: 'mommy-jeans',
    gender: 'women',
    image: '',
    description: 'High-waisted vintage mom jeans with flattering contour fit.',
    itemCount: 0,
  },
  {
    id: 'cat-hoodies',
    name: 'Hoodies',
    slug: 'hoodies',
    gender: 'unisex',
    image: '',
    description: 'Heavyweight fleece streetwear hoodies & oversized pullovers.',
    itemCount: 0,
  },
  {
    id: 'cat-leather-jackets',
    name: 'Leather jackets',
    slug: 'leather-jackets',
    gender: 'unisex',
    image: '',
    description: 'Sleek vegan and genuine leather biker jackets.',
    itemCount: 0,
  },
  {
    id: 'cat-crop-jackets',
    name: 'Crop jackets',
    slug: 'crop-jackets',
    gender: 'women',
    image: '',
    description: 'Tailored cropped blazers, denim crop coats, and bomber jackets.',
    itemCount: 0,
  },
  {
    id: 'cat-trench-coats',
    name: 'Trench coats',
    slug: 'trench-coats',
    gender: 'unisex',
    image: '',
    description: 'Double-breasted long trench coats in camel, beige, and jet black.',
    itemCount: 0,
  },
  {
    id: 'cat-heels',
    name: 'Heels',
    slug: 'heels',
    gender: 'women',
    image: '',
    description: 'Stiletto pumps, strappy sandals, block heels, and platform mules.',
    itemCount: 0,
  },
  {
    id: 'cat-sneakers',
    name: 'Sneakers',
    slug: 'sneakers',
    gender: 'unisex',
    image: '',
    description: 'Low-top retro sneakers, chunky platform trainers, and streetwear kicks.',
    itemCount: 0,
  },
  {
    id: 'cat-torte-bags',
    name: 'Torte Bags',
    slug: 'torte-bags',
    gender: 'women',
    image: '',
    description: 'Structured leather tote bags, shoulder bags, and luxury handbags.',
    itemCount: 0,
  },
];
