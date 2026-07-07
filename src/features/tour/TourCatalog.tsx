import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Hero from '../../components/Hero.js';
import Tours from '../../components/Tours.js';
import VerifiedReviews from '../../components/VerifiedReviews.js';
import { Tour, AppLanguage } from '../../types.js';
import { translations } from '../../translations.js';
import { tokens } from '../../theme/tokens.js';
import { useCurrency } from '../../contexts/CurrencyContext.js';

// Code splitting optimization for production performance
const EgyptMap = React.lazy(() => import('../../components/EgyptMap.js'));

// Custom Cartography Skeleton fallback for premium experience
const SuspenseFallback = ({ message }: { message: string }) => (
  <div className="w-full bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8 space-y-6 animate-pulse">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-2">
        <div className="h-3.5 w-28 bg-slate-800 rounded-full" />
        <div className="h-5 w-48 bg-slate-800 rounded-md" />
      </div>
      <div className="h-9 w-32 bg-slate-800 rounded-xl" />
    </div>
    <div className="h-96 w-full bg-slate-950/40 rounded-2xl border border-slate-800/40 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="space-y-3 text-center z-10">
        <div className="w-10 h-10 bg-slate-800 rounded-full mx-auto animate-bounce flex items-center justify-center">
          <div className="w-4 h-4 bg-emerald-500 rounded-full" />
        </div>
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">
          {message}
        </span>
      </div>
    </div>
  </div>
);

interface TourCatalogProps {
  lang: AppLanguage;
  setSelectedBookTour: (tour: Tour | null) => void;
  onStateChange?: (state: {
    activeTour: Tour | null;
    activeTourCategory: string;
    searchFilters: { query: string; destination: string; date: string };
  }) => void;
}

export default function TourCatalog({
  lang,
  setSelectedBookTour,
  onStateChange,
}: TourCatalogProps) {
  const { currency, currencies } = useCurrency();
  const t = translations[lang] || translations.en;

  // Internal encapsulated states for catalog filtering and details
  const [searchFilters, setSearchFilters] = useState({ query: '', destination: '', date: '' });
  const [activeTourCategory, setActiveTourCategory] = useState<string>('All');
  const [activeTour, setActiveTour] = useState<Tour | null>(null);

  // Synchronize state changes with parent if callback is supplied
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        activeTour,
        activeTourCategory,
        searchFilters,
      });
    }
  }, [activeTour, activeTourCategory, searchFilters, onStateChange]);

  return (
    <div className="space-y-16 pb-20 animate-fade-in">
      {/* Cinematic Entrance Hero */}
      <Hero 
        lang={lang} 
        onSearch={setSearchFilters} 
      />

      {/* Catalog Grid Section */}
      <div className={`${tokens.spacing.container} space-y-6`}>
        <div className="text-center md:text-left">
          <span className={`${tokens.typography.subtitle} mb-2`}>{t.exploreTours}</span>
          <h2 className={tokens.typography.sectionTitle}>
            {lang === 'ar' ? 'رحلاتنا الاستكشافية الملكية التوقيعية' : 'Our Signature Tours'}
          </h2>
        </div>
        
        <Tours
          lang={lang}
          currency={currency}
          currencies={currencies}
          searchFilters={searchFilters}
          onSelectBookTour={setSelectedBookTour}
          onCategoryChange={setActiveTourCategory}
          onSelectedTourChange={setActiveTour}
        />
      </div>

      {/* Interactive Egypt Map Navigator */}
      <div className={tokens.spacing.container}>
        <React.Suspense fallback={<SuspenseFallback message={lang === 'ar' ? 'جاري رسم الخرائط الملكية لمصر الفاخرة...' : 'Laying out Sovereign Cartography Deck...'} />}>
          <EgyptMap lang={lang} onSelectBookTour={setSelectedBookTour} />
        </React.Suspense>
      </div>

      {/* Verified Sovereign Reviews Carousel */}
      <div className={tokens.spacing.container}>
        <VerifiedReviews lang={lang} />
      </div>
    </div>
  );
}
