import React from 'react';
import { Star, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      id: 1,
      name: 'Amina Mohamed',
      location: 'Nairobi, Kilimani',
      rating: 5,
      comment: 'The Vintage Mom Jeans fit like an absolute dream! Fast M-PESA payment and delivered to my doorstep in less than 24 hours. The packaging felt super premium.',
      item: 'Vintage High-Waisted Mom Jeans',
    },
    {
      id: 2,
      name: 'Sharon Otieno',
      location: 'Mombasa, Nyali',
      rating: 5,
      comment: 'Wore the Crystal Stiletto Heels to an awards gala and received endless compliments all night. Unbelievable comfort and high luxury finish!',
      item: 'Crystal Ankle-Strap Stiletto Heels',
    },
    {
      id: 3,
      name: 'David Kiprop',
      location: 'Nairobi, Lavington',
      rating: 5,
      comment: 'Bought the Vintage Leather Biker Jacket. Exceptional leather quality and stitching. Very smooth order process and top-notch customer support.',
      item: "Men's Vintage Leather Biker Jacket",
    },
  ];

  return (
    <section className="py-16 bg-[#09090b] border-b border-gem-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-gem-pink block mb-1">
            Real Customer Reviews
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-wide">
            WHAT OUR CLIENTS SAY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {reviews.map((r) => (
            <div key={r.id} className="crystal-card p-5 sm:p-6 rounded-xl flex flex-col justify-between relative h-full">
              <Quote className="w-8 h-8 text-gem-pink/20 absolute top-4 right-4 pointer-events-none" />
              
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed mb-4">
                  "{r.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-gem-border/60">
                <span className="text-xs font-bold text-white block">{r.name}</span>
                <span className="text-[10px] text-slate-400 block">{r.location}</span>
                <span className="text-[10px] text-gem-pink font-semibold mt-1 inline-block">
                  Verified Purchase: {r.item}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
