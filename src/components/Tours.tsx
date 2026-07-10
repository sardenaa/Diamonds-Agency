import React, { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Compass, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layers, MessageSquare, ChevronDown, RefreshCw, X, Trash2, Camera, Image } from 'lucide-react';
import { Tour, CurrencyConfig, AppLanguage, LocalizedText, Review } from '../types.js';
import { translations } from '../translations.js';
import LazyImage from './LazyImage.js';
import ResponsiveItineraryImage from './ResponsiveItineraryImage.js';
import TourCatalogSkeleton from './Skeleton/TourCatalogSkeleton.js';
import { CacheManager } from '../utils/CacheManager.js';

// Fully Localized Helper functions and dictionaries
const matchText = (localized: LocalizedText | undefined, keyword: string): boolean => {
  if (!localized) return false;
  const kw = keyword.toLowerCase();
  return Object.values(localized).some(val => 
    typeof val === 'string' && val.toLowerCase().includes(kw)
  );
};

const compareAlerts: Record<AppLanguage, string> = {
  en: 'You can compare up to 3 tours.',
  ar: 'يمكنك مقارنة ما يصل إلى 3 رحلات كحد أقصى.',
  de: 'Sie können bis zu 3 Touren vergleichen.',
  pl: 'Możesz porównać maksymalnie 3 wycieczki.',
  cs: 'Můžete porovnat maximálně 3 výlety.'
};

const searchPlaceholders: Record<AppLanguage, string> = {
  en: 'Search titles, descriptions, itineraries, or FAQs...',
  ar: 'ابحث في العناوين، الوصف، خطوط السير، أو الأسئلة الشائعة...',
  de: 'Suche in Titeln, Beschreibungen, Reiseverläufen oder FAQs...',
  pl: 'Szukaj w tytułach, opisach, planach podróży lub FAQ...',
  cs: 'Hledat v názvech, popisech, itinerářích nebo FAQ...'
};

const destTranslations: Record<AppLanguage, Record<string, string>> = {
  en: { all: 'All Destinations', cairo: 'Cairo', luxor: 'Luxor', aswan: 'Aswan', sharm: 'Sharm El Sheikh', hurghada: 'Hurghada' },
  ar: { all: 'جميع الوجهات والمحافظات', cairo: 'القاهرة', luxor: 'الأقصر', aswan: 'أسوان', sharm: 'شرم الشيخ', hurghada: 'الغردقة' },
  de: { all: 'Alle Reiseziele', cairo: 'Kairo', luxor: 'Luxor', aswan: 'Assuan', sharm: 'Scharm El-Scheich', hurghada: 'Hurghada' },
  pl: { all: 'Wszystkie Kierunki', cairo: 'Kair', luxor: 'Luksor', aswan: 'Asuan', sharm: 'Szarm el-Szejk', hurghada: 'Hurgada' },
  cs: { all: 'Všechny Destinace', cairo: 'Káhira', luxor: 'Luxor', aswan: 'Asuán', sharm: 'Šarm aš-Šajch', hurghada: 'Hurghada' }
};

const maxPriceLabels: Record<AppLanguage, string> = {
  en: 'Max Price Range',
  ar: 'الحد الأقصى للسعر',
  de: 'Maximaler Preisbereich',
  pl: 'Maksymalny przedział cenowy',
  cs: 'Maximální cenové rozpětí'
};

const filterTagsLabels: Record<AppLanguage, string> = {
  en: 'Filter by Tag Features',
  ar: 'تصفية حسب الوسوم والسمات',
  de: 'Nach Tag-Eigenschaften filtern',
  pl: 'Filtruj według cech tagów',
  cs: 'Filtrovat podle vlastností tagů'
};

const allLabels: Record<AppLanguage, string> = {
  en: 'All',
  ar: 'الكل',
  de: 'Alle',
  pl: 'Wszystkie',
  cs: 'Vše'
};

const perTravelerLabels: Record<AppLanguage, string> = {
  en: 'PER TRAVELER',
  ar: 'الاستثمار الفردي',
  de: 'PRO REISENDEN',
  pl: 'ZA PODRÓŻNEGO',
  cs: 'ZA CESTUJÍCÍHO'
};

const backToToursLabels: Record<AppLanguage, string> = {
  en: 'Back to Tours',
  ar: 'العودة لكتالوج الرحلات الفاخرة',
  de: 'Zurück zu den Touren',
  pl: 'Powrót do Wycieczek',
  cs: 'Zpět na Výlety'
};

const whatIncludedLabels: Record<AppLanguage, string> = {
  en: 'What is Included',
  ar: 'ما تشمله هذه التجربة الاستكشافية الملكية',
  de: 'Was ist inbegriffen',
  pl: 'Co jest wliczone',
  cs: 'Co je zahrnuto'
};

const includedItems: Record<AppLanguage, string[]> = {
  en: [
    'Private, custom schedule',
    'Private car transfer',
    'Expert tour guide',
    'Skip-the-line tickets',
    'Lunch and refreshments',
    '24/7 customer support'
  ],
  ar: [
    'جدول زمني مخصص وخاص بالكامل',
    'توصيل مخصص بسيارات مرسيدس V-Class فاخرة',
    'مرشد مخصص متخصص في الآثار الفرعونية',
    'جميع تذاكر الدخول السريع وتجاوز الانتظار',
    'وجبات غداء فاخرة ومشروبات ومناشف مبردة',
    'تنسيق كامل مع خادمك الشخصي المخصص 24/7'
  ],
  de: [
    'Privater, individueller Zeitplan',
    'Privater Autotransfer',
    'Experten-Reiseleiter',
    'Keine Warteschlangen-Tickets',
    'Mittagessen und Erfrischungen',
    'Kundenservice rund um die Uhr'
  ],
  pl: [
    'Prywatny, niestandardowy harmonogram',
    'Prywatny transfer samochodem',
    'Ekspercki przewodnik',
    'Bilety bez kolejki',
    'Lunch i przekąski',
    'Wsparcie klienta 24/7'
  ],
  cs: [
    'Soukromý plán na míru',
    'Soukromý transfer vozem',
    'Odborný průvodce',
    'Vstupenky bez front',
    'Oběd a občerstvení',
    'Nepřetržitá podpora 24/7'
  ]
};

const waBtnLabels: Record<AppLanguage, string> = {
  en: 'WhatsApp Inquiry',
  ar: 'استفسار واتساب',
  de: 'WhatsApp-Anfrage',
  pl: 'Zapytanie WhatsApp',
  cs: 'Dotaz přes WhatsApp'
};

const waMessage = (lang: AppLanguage, tourTitle: string) => {
  const msgs: Record<AppLanguage, string> = {
    en: `Hello, I would like to inquire with the Royal Concierge regarding the "${tourTitle}" expedition.`,
    ar: `مرحباً، أود الاستفسار من الكونسيرج الملكي حول تفاصيل جولة "${tourTitle}".`,
    de: `Hallo, ich möchte mich beim Royal Concierge bezüglich der Expedition "${tourTitle}" erkundigen.`,
    pl: `Dzień dobry, chciałbym zapytać Królewskiego Konsjerża o szczegóły wyprawy "${tourTitle}".`,
    cs: `Dobrý den, chtěl bych se zeptat Královského Concierge na podrobnosti o expedici "${tourTitle}".`
  };
  return msgs[lang] || msgs.en;
};

const compareHeaders: Record<AppLanguage, string[]> = {
  en: ['Investment', 'Destination', 'Duration', 'Quality Audited', 'Group Capacity', 'Elite Extras'],
  ar: ['الاستثمار المالي', 'الوجهة', 'المدة', 'التقييم', 'سعة المجموعة الفردية', 'الميزات والترقيات'],
  de: ['Investition', 'Reiseziel', 'Dauer', 'Geprüfte Qualität', 'Gruppenkapazität', 'Elite-Extras'],
  pl: ['Inwestycja', 'Kierunek', 'Czas trwania', 'Kontrola jakości', 'Maks. liczba osób', 'Ekskluzywne dodatki'],
  cs: ['Investice', 'Destinace', 'Doba trvání', 'Ověřená kvalita', 'Kapacita skupiny', 'Elitní doplňky']
};

const guestsLabels: Record<AppLanguage, string> = {
  en: 'guests',
  ar: 'ضيوف',
  de: 'Gäste',
  pl: 'osób',
  cs: 'hostů'
};

interface ToursProps {
  lang: AppLanguage;
  currency: string;
  currencies: CurrencyConfig[];
  searchFilters: { query: string; destination: string; date: string };
  onSelectBookTour: (tour: Tour) => void;
  onCategoryChange?: (category: string) => void;
  onSelectedTourChange?: (tour: Tour | null) => void;
}

export default function Tours({
  lang,
  currency,
  currencies,
  searchFilters,
  onSelectBookTour,
  onCategoryChange,
  onSelectedTourChange
}: ToursProps) {
  const t = translations[lang];
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategory);
    }
  }, [selectedCategory, onCategoryChange]);

  useEffect(() => {
    if (onSelectedTourChange) {
      onSelectedTourChange(selectedTour);
    }
  }, [selectedTour, onSelectedTourChange]);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'itinerary' | 'faqs' | 'aiFeedback'>('overview');

  // Local real-time full-text search & catalog filters
  const [localQuery, setLocalQuery] = useState(searchFilters.query || '');
  const [localLocation, setLocalLocation] = useState(searchFilters.destination || '');
  const [selectedTag, setSelectedTag] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(2500);

  // Sync with global filters from Hero
  useEffect(() => {
    if (searchFilters.query !== undefined) setLocalQuery(searchFilters.query);
    if (searchFilters.destination !== undefined) setLocalLocation(searchFilters.destination);
  }, [searchFilters]);

  // Tour spec comparison state
  const [compareList, setCompareList] = useState<Tour[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // AI Review Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Reviews and Guest Photos state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; caption: string; author: string; rating: number; date: string } | null>(null);

  useEffect(() => {
    if (selectedTour) {
      setReviewsLoading(true);
      fetch('/api/reviews')
        .then((res) => res.json())
        .then((data) => {
          const tourReviews = data.filter((r: any) => r.tourId === selectedTour.id);
          setReviews(tourReviews);
        })
        .catch((err) => console.error('Error fetching reviews:', err))
        .finally(() => setReviewsLoading(false));
    }
  }, [selectedTour]);

  const getTourGuestPhotos = () => {
    const reviewPhotos = reviews
      .filter((r) => r.photoUri)
      .map((r) => ({
        url: r.photoUri!,
        caption: r.comment,
        author: r.customerName,
        rating: r.rating,
        date: r.date
      }));

    const defaultPhotosMap: Record<string, { url: string; caption: string; author: string; rating: number; date: string; }[]> = {
      'tour-1': [
        { url: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=800', caption: 'Standing right in front of the Great Sphinx. Breathtaking view, zero crowds.', author: 'Marcus Aurelius', rating: 5, date: '2026-06-25' },
        { url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=800', caption: 'The stunning Pyramids of Giza during sunset. Absolute majesty.', author: 'Fatima Al-Hashimi', rating: 5, date: '2026-06-28' },
        { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800', caption: 'An unforgettable panoramic look from our VIP dining deck.', author: 'Sterling B.', rating: 5, date: '2026-06-15' },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', caption: 'Cruising through Giza in our pristine private Mercedes V-Class.', author: 'Genevieve M.', rating: 5, date: '2026-06-18' }
      ],
      'tour-2': [
        { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800', caption: 'Waking up on our private luxury Dahabiya sailing boat.', author: 'Alexandra Dupont', rating: 5, date: '2026-06-20' },
        { url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800', caption: 'Nile sunset from the premium deck chairs. Pure tranquil bliss.', author: 'Lady Charlotte', rating: 5, date: '2026-06-10' },
        { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800', caption: 'Navigating the calm river bends in full, quiet elegance.', author: 'Charles de Rothschild', rating: 5, date: '2026-06-12' },
        { url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800', caption: 'Our private candle-lit dinner setup on a silent island beach.', author: 'Al-Maktoum Family', rating: 5, date: '2026-06-14' }
      ]
    };

    const defaultPhotos = defaultPhotosMap[selectedTour?.id || ''] || [
      { url: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=800', caption: 'A majestic glance at the ancient landmarks.', author: 'Bespoke Guest', rating: 5, date: '2026-06-01' },
      { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800', caption: 'Sailing under the gorgeous summer sun.', author: 'Elite Explorer', rating: 5, date: '2026-06-05' }
    ];

    const combined = [...reviewPhotos];
    defaultPhotos.forEach((p) => {
      if (!combined.some((item) => item.url === p.url)) {
        combined.push(p);
      }
    });

    return combined;
  };

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tours');
      const data = await res.json();
      setTours(data);
      // Prefetch high-resolution tour imagery for offline premium experiences
      CacheManager.prefetchTourImages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [searchFilters]);

  // Convert USD to local currency
  const toLocalPrice = (usdPrice: number) => {
    return parseFloat((usdPrice * activeCurrency.rateToUSD).toFixed(2));
  };

  const formatLocalPrice = (usdPrice: number) => {
    const price = toLocalPrice(usdPrice);
    return lang === 'ar' 
      ? `${price} ${activeCurrency.symbol}`
      : `${activeCurrency.symbol}${price}`;
  };

  // Run AI review synthesis on the selected tour
  const handleSynthesizeFeedback = async (tourId: string) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/summarize-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId })
      });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch (e) {
      console.error(e);
      setAiSummary('Failed to compile feedback. Please retry.');
    } finally {
      setAiLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredTours = tours.filter((tour) => {
    // Category check
    if (selectedCategory !== 'All' && tour.category !== selectedCategory) return false;

    // Destination check
    if (localLocation && tour.destination.toLowerCase() !== localLocation.toLowerCase()) return false;

    // Date check (if specified, ensure it is available)
    if (searchFilters.date && !tour.availableDates.includes(searchFilters.date)) return false;

    // Price range check
    if (tour.priceUSD > maxPrice) return false;

    // Tag check
    if (selectedTag !== 'All') {
      const tagLower = selectedTag.toLowerCase();
      const tagInTitle = matchText(tour.title, tagLower);
      const tagInDesc = matchText(tour.description, tagLower);
      const tagInCat = tour.category.toLowerCase().includes(tagLower);
      if (!tagInTitle && !tagInDesc && !tagInCat) return false;
    }

    // Full-text keyword search check across titles, descriptions, itinerary, and FAQs
    if (localQuery) {
      const keyword = localQuery.toLowerCase();
      const titleMatch = matchText(tour.title, keyword);
      const descMatch = matchText(tour.description, keyword);
      const destMatch = tour.destination.toLowerCase().includes(keyword);
      const catMatch = tour.category.toLowerCase().includes(keyword);
      
      // Deep itinerary search
      const itineraryMatch = tour.itinerary.some(item => 
        matchText(item.title, keyword) || 
        matchText(item.description, keyword)
      );

      // Deep FAQ search
      const faqMatch = tour.faqs.some(faq => 
        matchText(faq.question, keyword) || 
        matchText(faq.answer, keyword)
      );

      if (!titleMatch && !descMatch && !destMatch && !catMatch && !itineraryMatch && !faqMatch) {
        return false;
      }
    }

    return true;
  });

  const categories = ['All', 'Historical Tours', 'Luxury Cruises', 'VIP Yacht Charters', 'Desert Safaris'];

  // Toggle comparison selections
  const toggleCompare = (tour: Tour) => {
    setCompareList((prev) => {
      const exists = prev.some(t => t.id === tour.id);
      if (exists) {
        return prev.filter(t => t.id !== tour.id);
      }
      if (prev.length >= 3) {
        alert(compareAlerts[lang] || compareAlerts.en);
        return prev;
      }
      return [...prev, tour];
    });
  };

  if (loading) {
    return <TourCatalogSkeleton />;
  }

  return (
    <div id="excursions-grid" className="space-y-8 font-sans scroll-mt-10">
      
      {/* Selection Filter Bar & Compare Button */}
      {!selectedTour && (
        <div className="space-y-4 border-b border-slate-200 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat === 'All' ? t.filterAll : cat}
                </button>
              ))}
            </div>

            {compareList.length > 0 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{t.compareBtn} ({compareList.length})</span>
              </button>
            )}
          </div>

          {/* Real-time Search, Location, Price Slider, & Features Tags Panel */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 md:p-6 space-y-5 shadow-xs">
            {/* First Row: Search input and Location Selector */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Live Typing Full-Text Search */}
              <div className="md:col-span-7 relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Compass className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder={searchPlaceholders[lang] || searchPlaceholders.en}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-2xs"
                />
                {localQuery && (
                  <button
                    onClick={() => setLocalQuery('')}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Location Filter Dropdown */}
              <div className="md:col-span-5 relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </span>
                <select
                  value={localLocation}
                  onChange={(e) => setLocalLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer shadow-2xs appearance-none"
                >
                  <option value="">{destTranslations[lang]?.all || destTranslations.en.all}</option>
                  <option value="Cairo">{destTranslations[lang]?.cairo || destTranslations.en.cairo}</option>
                  <option value="Luxor">{destTranslations[lang]?.luxor || destTranslations.en.luxor}</option>
                  <option value="Aswan">{destTranslations[lang]?.aswan || destTranslations.en.aswan}</option>
                  <option value="Sharm El Sheikh">{destTranslations[lang]?.sharm || destTranslations.en.sharm}</option>
                  <option value="Hurghada">{destTranslations[lang]?.hurghada || destTranslations.en.hurghada}</option>
                </select>
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </span>
              </div>
            </div>

            {/* Second Row: Price Range Slider & Features Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-t border-slate-200/60 pt-4">
              {/* Price Range Slider */}
              <div className="lg:col-span-4 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-700">
                  <span>{maxPriceLabels[lang] || maxPriceLabels.en}</span>
                  <span className="text-emerald-600 text-[13px]">
                    {formatLocalPrice(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>{formatLocalPrice(100)}</span>
                  <span>{formatLocalPrice(2500)}</span>
                </div>
              </div>

              {/* Smart Feature Tags */}
              <div className="lg:col-span-8 space-y-1.5">
                <span className="block text-xs font-extrabold text-slate-700">
                  {filterTagsLabels[lang] || filterTagsLabels.en}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'VIP', 'Private', 'Gourmet', 'Historical', 'Adventure'].map((tag) => {
                    const isActive = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 border-amber-500 text-slate-950 font-black shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {tag === 'All' ? (allLabels[lang] || allLabels.en) : tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excursion Cards Grid */}
      {!selectedTour ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => {
            const isComparing = compareList.some(t => t.id === tour.id);
            return (
              <div 
                key={tour.id} 
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-slate-300 transition-all duration-300 relative group"
              >
                {/* Excursion Banner */}
                <div className="relative h-56 overflow-hidden">
                  <LazyImage
                    src={tour.images[0] || 'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=1200'}
                    alt={tour.title.en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating Specs */}
                  <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-white/10">
                    {tour.destination}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow font-bold text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{tour.rating}</span>
                  </div>
                </div>

                {/* Excursion Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">{tour.category}</span>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 line-clamp-2 leading-snug font-serif tracking-tight">
                      {tour.title[lang] || tour.title.en}
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm line-clamp-3 font-medium leading-relaxed">
                      {tour.description[lang] || tour.description.en}
                    </p>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-4" />

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">{perTravelerLabels[lang] || perTravelerLabels.en}</span>
                      <span className="text-lg md:text-xl font-black text-slate-900 font-sans">{formatLocalPrice(tour.priceUSD)}</span>
                    </div>

                    <div className="flex gap-2">
                      {/* Compare Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleCompare(tour)}
                        className={`p-2.5 rounded-full transition-all border ${
                          isComparing 
                            ? 'bg-slate-900 border-slate-900 text-amber-400' 
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-400'
                        } cursor-pointer`}
                        title="Compare tours"
                      >
                        <Layers className="w-4 h-4" />
                      </button>

                      {/* Explore Button */}
                      <button
                        onClick={() => {
                          setSelectedTour(tour);
                          setAiSummary('');
                          setActiveDetailTab('overview');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/10 hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        {t.details}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Tour Drawer */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
          {/* Back to Catalog button */}
          <div className="bg-slate-50 border-b border-slate-200/60 px-6 py-4">
            <button
              onClick={() => setSelectedTour(null)}
              className="text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backToToursLabels[lang] || backToToursLabels.en}</span>
            </button>
          </div>

          {/* Banner Photo Section */}
          <div className="relative h-64 md:h-[400px] overflow-hidden">
            <LazyImage
              src={selectedTour.images[0]}
              alt={selectedTour.title.en}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {selectedTour.video && (
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
              >
                <source src={selectedTour.video} type="video/mp4" />
              </video>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">{selectedTour.category}</span>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-1 mb-2 font-serif">
                {selectedTour.title[lang] || selectedTour.title.en}
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{selectedTour.rating} ({selectedTour.reviewCount} {t.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{selectedTour.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{selectedTour.destination}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Tabs */}
          <div className="flex border-b border-slate-200 px-6 overflow-x-auto gap-4 no-scrollbar">
            {[
              { id: 'overview', label: t.details },
              { id: 'itinerary', label: t.itinerary },
              { id: 'faqs', label: t.faqs },
              { id: 'aiFeedback', label: t.aiFeedbackSummary }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveDetailTab(tab.id as any);
                  if (tab.id === 'aiFeedback' && !aiSummary) {
                    handleSynthesizeFeedback(selectedTour.id);
                  }
                }}
                className={`py-4 px-2 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === tab.id 
                    ? 'border-emerald-600 text-emerald-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="p-6 md:p-8 min-h-[250px]">
            
            {/* Overview panel */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-6 animate-fade-in text-slate-700 font-medium text-xs md:text-sm leading-relaxed">
                <p className="text-base text-slate-800 font-sans leading-relaxed">
                  {selectedTour.description[lang] || selectedTour.description.en}
                </p>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wider">{whatIncludedLabels[lang] || whatIncludedLabels.en}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(includedItems[lang] || includedItems.en).map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">{t.subtotal}</span>
                    <span className="text-2xl md:text-3xl font-black text-slate-900 font-sans">{formatLocalPrice(selectedTour.priceUSD)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <a
                      href={`https://wa.me/201202181834?text=${encodeURIComponent(
                        waMessage(lang, selectedTour.title[lang] || selectedTour.title.en)
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3.5 rounded-full shadow-lg shadow-emerald-500/10 hover:scale-[1.02] transition-transform cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                      <span>{waBtnLabels[lang] || waBtnLabels.en}</span>
                    </a>
                    <button
                      onClick={() => onSelectBookTour(selectedTour)}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm px-8 py-3.5 rounded-full shadow-lg shadow-amber-500/10 hover:scale-[1.02] transition-transform cursor-pointer"
                    >
                      {t.bookNow}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Itinerary panel */}
            {activeDetailTab === 'itinerary' && (
              <div className="space-y-6 animate-fade-in font-medium text-xs md:text-sm">
                {selectedTour.itinerary.map((day) => {
                  const dayImg = selectedTour.images[(day.day - 1) % selectedTour.images.length] || selectedTour.images[0] || 'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=1200';
                  return (
                    <div key={day.day} className="flex flex-col md:flex-row gap-5 border-l-2 border-emerald-500 pb-6 pl-4 relative last:pb-0 items-start">
                      <div className="absolute -left-[9px] top-0 bg-emerald-500 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px] shadow" />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
                          {day.title[lang] || day.title.en}
                        </h4>
                        <p className="text-slate-500 leading-relaxed text-xs md:text-sm">
                          {day.description[lang] || day.description.en}
                        </p>
                      </div>
                      <div className="w-full md:w-48 shrink-0">
                        <ResponsiveItineraryImage
                          src={dayImg}
                          alt={day.title.en || 'Destination highlight'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* FAQs panel */}
            {activeDetailTab === 'faqs' && (
              <div className="space-y-4 animate-fade-in font-medium text-xs md:text-sm">
                {selectedTour.faqs.length === 0 ? (
                  <p className="text-slate-500 italic">No FAQs logged for this excursion yet.</p>
                ) : (
                  selectedTour.faqs.map((faq, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-800 flex gap-2 items-start text-xs md:text-sm">
                        <AlertCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{faq.question[lang] || faq.question.en}</span>
                      </h4>
                      <p className="text-slate-500 mt-1.5 leading-relaxed pl-6">
                        {faq.answer[lang] || faq.answer.en}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* AI Review Summary panel */}
            {activeDetailTab === 'aiFeedback' && (
              <div className="space-y-6 animate-fade-in font-medium text-xs md:text-sm">
                <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-amber-800 uppercase text-[10px] tracking-wider">{t.aiFeedbackSummary}</h4>
                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-slate-400 py-3">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                        <span>Summarizing traveler reviews with Gemini...</span>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">{aiSummary}</p>
                    )}
                  </div>
                </div>

                {/* Guest Photo Submissions Grid (Social Proof) */}
                <div className="space-y-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <h5 className="font-extrabold text-slate-900 text-xs md:text-sm uppercase tracking-wider font-sans">
                      {lang === 'ar' ? 'معرض صور ضيوفنا الملوك' : 'Sovereign Guest Moments'}
                    </h5>
                  </div>
                  <p className="text-slate-500 text-xs font-sans">
                    {lang === 'ar' 
                      ? 'لقطات حقيقية تمت مشاركتها بواسطة ضيوفنا خلال رحلاتهم الاستكشافية الاستثنائية.' 
                      : 'Real, unfiltered snapshots shared by our esteemed guests during their royal expeditions.'}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                    {getTourGuestPhotos().map((photo, i) => (
                      <div 
                        key={i} 
                        onClick={() => setLightboxPhoto(photo)}
                        className="group relative h-28 sm:h-32 rounded-2xl overflow-hidden cursor-pointer border border-slate-200 shadow-sm bg-slate-100 hover:shadow-md hover:border-emerald-500/30 transition-all active:scale-[0.98]"
                      >
                        <LazyImage 
                          src={photo.url} 
                          alt={`Guest moment by ${photo.author}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        
                        {/* Overlay info */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end text-[10px] text-white font-sans">
                          <span className="font-bold truncate max-w-[75%]">{photo.author}</span>
                          <span className="flex items-center gap-0.5 text-amber-400 bg-slate-900/40 px-1 rounded">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>{photo.rating}</span>
                          </span>
                        </div>

                        {/* Zoom overlay Icon */}
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <Camera className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guest Reviews Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <h5 className="font-extrabold text-slate-900 text-xs md:text-sm uppercase tracking-wider font-sans">
                      {t.customerFeedback}
                    </h5>
                  </div>
                  
                  {reviewsLoading ? (
                    <div className="flex items-center justify-center gap-2 text-slate-400 py-6">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                      <span>Loading verified guest reviews...</span>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reviews.map((rev) => {
                        const nationalityFlag = rev.language === 'ar' ? '🇸🇦' : '🇬🇧';
                        const badge = rev.rating >= 5 ? 'Royal Guest' : 'VIP Customer';
                        const avatar = `https://images.unsplash.com/photo-${rev.language === 'ar' ? '1507003211169-0a1dd7228f2d' : '1494790108377-be9c29b29330'}?auto=format&fit=crop&q=80&w=120`;

                        return (
                          <div key={rev.id} className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 shadow-sm text-xs leading-relaxed flex flex-col gap-3 hover:border-slate-300 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-slate-200">
                                <LazyImage 
                                  src={avatar} 
                                  alt={rev.customerName} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer" 
                                />
                              </div>
                              <div className="space-y-1.5 flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                      <span>{rev.customerName}</span>
                                      <span title="Nationality">{nationalityFlag}</span>
                                    </div>
                                    <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest block mt-0.5">{badge}</span>
                                  </div>
                                  <div className="flex text-amber-500 font-bold gap-0.5">
                                    {Array.from({ length: Math.round(rev.rating) }).map((_, idx) => (
                                      <span key={idx}>★</span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-slate-600 italic font-medium leading-relaxed mt-2">"{rev.comment}"</p>
                              </div>
                            </div>
                            
                            {rev.photoUri && (
                              <div className="pl-14">
                                <div 
                                  onClick={() => setLightboxPhoto({
                                    url: rev.photoUri!,
                                    caption: rev.comment,
                                    author: rev.customerName,
                                    rating: rev.rating,
                                    date: rev.date
                                  })}
                                  className="relative inline-block w-24 h-16 rounded-xl overflow-hidden cursor-pointer border border-slate-200 group"
                                >
                                  <LazyImage 
                                    src={rev.photoUri} 
                                    alt="Attached moment" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Camera className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-center py-6">
                      {lang === 'ar' ? 'لا توجد مراجعات مسجلة بعد لهذا المسار.' : 'No reviews recorded for this expedition yet.'}
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Excursion Comparison overlay Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base md:text-lg font-bold font-sans tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>{t.compareTitle}</span>
              </h3>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto p-6">
              {compareList.length === 0 ? (
                <p className="text-slate-500 text-center py-12 italic">{t.compareEmpty}</p>
              ) : (
                <div className="grid grid-cols-4 gap-4 text-xs md:text-sm font-medium border-collapse min-w-[600px]">
                  {/* Row titles */}
                  <div className="space-y-12 text-slate-400 font-bold uppercase text-[10px] pt-40">
                    {(compareHeaders[lang] || compareHeaders.en).map((h, idx) => (
                      <div key={idx}>{h}</div>
                    ))}
                  </div>

                  {/* Comparisons */}
                  {compareList.map((c) => (
                    <div key={c.id} className="border border-slate-150 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                      <div className="text-center pb-4 border-b border-slate-200">
                        <div className="h-20 w-full overflow-hidden rounded-lg mb-2">
                          <LazyImage src={c.images[0]} alt={c.title.en} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <h4 className="font-extrabold text-slate-800 line-clamp-2 h-10">{c.title[lang] || c.title.en}</h4>
                      </div>

                      <div className="space-y-12 text-center py-6 text-slate-800 font-bold font-sans">
                        <div className="text-emerald-600 text-base font-black">{formatLocalPrice(c.priceUSD)}</div>
                        <div>{c.destination}</div>
                        <div>{c.duration}</div>
                        <div className="text-amber-500">{c.rating}★</div>
                        <div>{c.capacity} {guestsLabels[lang] || guestsLabels.en}</div>
                        <div className="text-[10px] text-slate-500 text-left space-y-1">
                          {c.extras.map(e => (
                            <div key={e.id} className="flex gap-1 items-start truncate">
                              <span className="text-emerald-500">✓</span>
                              <span className="truncate">{e.name[lang] || e.name.en}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-center mt-4 border-t border-slate-200 pt-4">
                        <button
                          onClick={() => {
                            setShowCompareModal(false);
                            onSelectBookTour(c);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-full transition-colors cursor-pointer"
                        >
                          {t.bookNow}
                        </button>
                        <button
                          onClick={() => toggleCompare(c)}
                          className="text-rose-500 hover:bg-rose-50 p-2 rounded-full cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200">
              <button
                onClick={() => setShowCompareModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-colors cursor-pointer"
              >
                {t.compareClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Sovereign Lightbox Modal for Guest Moments */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-center items-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 text-white p-2.5 rounded-full transition-all cursor-pointer hover:rotate-90 duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          <div 
            className="relative bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden max-w-3xl w-full flex flex-col sm:flex-row shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image side */}
            <div className="relative w-full sm:w-[60%] h-64 sm:h-[400px] bg-black">
              <LazyImage 
                src={lightboxPhoto.url} 
                alt="Enlarged Guest Moment" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Content side */}
            <div className="w-full sm:w-[40%] p-6 flex flex-col justify-between text-slate-100 bg-slate-900/40">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-white text-sm tracking-tight">{lightboxPhoto.author}</h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{lightboxPhoto.date}</span>
                  </div>
                  <div className="flex text-amber-400 text-xs font-bold gap-0.5">
                    {Array.from({ length: Math.round(lightboxPhoto.rating) }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Verified Guest Review</span>
                  <p className="text-xs text-slate-300 leading-relaxed italic font-medium">"{lightboxPhoto.caption}"</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>MAS Sovereign Experience</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-sans">Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
