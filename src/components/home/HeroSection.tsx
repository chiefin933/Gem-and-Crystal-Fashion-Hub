import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import collectionRack from '../../assets/hero-collection-rack.jpg';
import footwearEdit from '../../assets/hero-footwear-edit.jpg';
import tailoredLook from '../../assets/hero-tailored-look.jpg';
import { useStore } from '../../context/useStore';
import { FilterState } from '../../types/ecommerce';

interface HeroSectionProps { setCurrentTab: (tab: string) => void; }

export const HeroSection: React.FC<HeroSectionProps> = ({ setCurrentTab }) => {
  const { setFilters } = useStore();
  const handleNavDepartment = (gender: 'women' | 'men') => {
    setFilters((prev: FilterState) => ({ ...prev, gender, category: 'All', searchQuery: '' }));
    setCurrentTab(gender === 'women' ? 'women-page' : 'men-page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative isolate overflow-hidden border-b border-[#241d18] bg-[#f5f0e8] text-[#181411]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_7%_18%,rgba(191,125,41,0.18),transparent_23%),radial-gradient(circle_at_91%_70%,rgba(112,57,37,0.12),transparent_24%)]" />
      <div className="absolute inset-x-0 top-7 -z-10 h-px bg-[#b8782d]/30" />
      <div className="mx-auto grid min-h-[680px] max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-8 lg:py-16">
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-6 lg:pr-10">
          <div className="mb-7 inline-flex items-center gap-2 border border-[#a4662b]/35 bg-[#fffaf2]/70 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#63391d]"><MapPin className="h-3.5 w-3.5 text-[#b8782d]" aria-hidden="true" />Roysambu, Nairobi</div>
          <h1 className="max-w-3xl font-serif text-[clamp(3.35rem,10vw,7.15rem)] font-bold leading-[0.78] tracking-[-0.065em] text-[#181411]">
            BE BOLD.<br />
            <span className="text-[#ad6729] italic">BE BRIGHT.</span><br />
            BE YOU.
          </h1>
          <p className="mt-8 max-w-lg border-l-2 border-[#b8782d] pl-4 text-sm leading-7 text-[#5e5147] sm:text-base">Explore high-waisted mommy jeans, crop tops, dresses, blazers, sneakers, Chelsea boots, and menswear. Built for maximum confidence and style.</p>
          <div className="mt-9 flex flex-col gap-3 min-[440px]:flex-row">
            <button onClick={() => handleNavDepartment('women')} className="group inline-flex min-h-12 items-center justify-center gap-3 bg-gem-pink px-6 py-3 text-xs font-extrabold uppercase tracking-[0.15em] text-[#fffaf2] transition-colors duration-300 hover:bg-gem-deepPink focus:outline-none focus:ring-2 focus:ring-gem-pink focus:ring-offset-2">Shop women <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></button>
            <button onClick={() => handleNavDepartment('men')} className="group inline-flex min-h-12 items-center justify-center gap-3 border border-[#332b25] bg-transparent px-6 py-3 text-xs font-extrabold uppercase tracking-[0.15em] text-[#332b25] transition-colors duration-300 hover:border-gem-pink hover:bg-gem-pink hover:text-white focus:outline-none focus:ring-2 focus:ring-gem-pink focus:ring-offset-2">Shop men <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></button>
          </div>
          <div className="mt-11 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.19em] text-[#745d4b]"><span>Curated in Nairobi</span><span className="h-1 w-1 rounded-full bg-[#b8782d]" /><span>New season</span></div>
        </div>
        <div className="relative order-1 min-h-[425px] sm:min-h-[525px] lg:order-2 lg:col-span-6 lg:min-h-[590px]">
          <div className="absolute right-[4%] top-0 h-[82%] w-[64%] overflow-hidden bg-[#31231d] shadow-[18px_20px_0_rgba(176,106,42,0.18)] sm:right-[8%] sm:w-[58%]"><img src={collectionRack} alt="Curated clothing rack with tailored jackets, dresses and denim" className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105" fetchPriority="high" decoding="async" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#17110d]/85 to-transparent px-5 pb-5 pt-16"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffdba8]">The collection edit</p><p className="font-serif text-xl italic text-white">Pieces with presence</p></div></div>
          <figure className="absolute bottom-0 left-0 w-[46%] overflow-hidden border-[6px] border-[#f5f0e8] bg-[#a25c3d] shadow-xl sm:w-[41%]"><img src={footwearEdit} alt="Metallic heels and white sneakers arranged on a studio plinth" className="aspect-[4/5] w-full object-cover object-center" loading="lazy" decoding="async" /><figcaption className="absolute inset-x-0 bottom-0 bg-[#1c1713]/85 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#fff8ed]">Footwear edit</figcaption></figure>
          <figure className="absolute bottom-[7%] right-0 w-[31%] overflow-hidden border-[5px] border-[#f5f0e8] bg-[#d6b89e] shadow-xl sm:w-[28%]"><img src={tailoredLook} alt="Tailored blazer, trousers and clean white sneakers styled as a complete look" className="aspect-[3/4] w-full object-cover object-center" loading="lazy" decoding="async" /><figcaption className="bg-[#fffaf2] px-2 py-2 text-center text-[8px] font-bold uppercase tracking-[0.12em] text-[#6a4325]">Complete looks</figcaption></figure>
          <div className="absolute left-[50%] top-[7%] h-16 w-16 -translate-x-1/2 border border-[#b8782d]/70 sm:h-20 sm:w-20" aria-hidden="true" />
          <p className="absolute right-0 top-[12%] origin-bottom-right rotate-90 text-[9px] font-bold uppercase tracking-[0.27em] text-[#8c5e37] sm:text-[10px]">Gem &amp; Crystal / Fashion Hub</p>
        </div>
      </div>
    </section>
  );
};
