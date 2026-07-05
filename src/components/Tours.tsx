import React, { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Compass, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layers, MessageSquare, ChevronDown, RefreshCw, X, Trash2 } from 'lucide-react';
import { Tour, CurrencyConfig, AppLanguage } from '../types.js';
import { translations } from '../translations.js';

interface ToursProps {
  lang: AppLanguage;
  currency: string;
  currencies: CurrencyConfig[];
  searchFilters: { query: string; destination: string; date: string };
  onSelectBookTour: (tour: Tour) => void;
}

export default function Tours({
  lang,
  currency,
  currencies,
  searchFilters,
  onSelectBookTour
}: ToursProps) {
  const t = translations[lang];
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'itinerary' | 'faqs' | 'aiFeedback'>('overview');

  // Tour spec comparison state
  const [compareList, setCompareList] = useState<Tour[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // AI Review Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tours');
      const data = await res.json();
      setTours(data);
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
    if (searchFilters.destination && tour.destination.toLowerCase() !== searchFilters.destination.toLowerCase()) return false;

    // Date check (if specified, ensure it is available)
    if (searchFilters.date && !tour.availableDates.includes(searchFilters.date)) return false;

    // Search input keyword check
    if (searchFilters.query) {
      const keyword = searchFilters.query.toLowerCase();
      const titleMatch = (tour.title.en.toLowerCase().includes(keyword) || tour.title.ar.toLowerCase().includes(keyword));
      const descMatch = (tour.description.en.toLowerCase().includes(keyword) || tour.description.ar.toLowerCase().includes(keyword));
      return titleMatch || descMatch;
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
        alert(lang === 'ar' ? 'يمكنك مقارنة ما يصل إلى 3 رحلات كحد أقصى.' : 'You can compare up to 3 tours.');
        return prev;
      }
      return [...prev, tour];
    });
  };

  return (
    <div id="excursions-grid" className="space-y-8 font-sans scroll-mt-10">
      
      {/* Selection Filter Bar & Compare Button */}
      {!selectedTour && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-6">
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
                  <img
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
                      {lang === 'ar' ? tour.title.ar : tour.title.en}
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm line-clamp-3 font-medium leading-relaxed">
                      {lang === 'ar' ? tour.description.ar : tour.description.en}
                    </p>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-4" />

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'الاستثمار الفردي' : 'PER TRAVELER'}</span>
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
              <span>{lang === 'ar' ? 'العودة لكتالوج الرحلات الفاخرة' : 'Back to Tours'}</span>
            </button>
          </div>

          {/* Banner Photo Section */}
          <div className="relative h-64 md:h-[400px] overflow-hidden">
            <img
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
                {lang === 'ar' ? selectedTour.title.ar : selectedTour.title.en}
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
                  {lang === 'ar' ? selectedTour.description.ar : selectedTour.description.en}
                </p>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wider">{lang === 'ar' ? 'ما تشمله هذه التجربة الاستكشافية الملكية' : 'What is Included'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { en: 'Private, custom schedule', ar: 'جدول زمني مخصص وخاص بالكامل' },
                      { en: 'Private car transfer', ar: 'توصيل مخصص بسيارات مرسيدس V-Class فاخرة' },
                      { en: 'Expert tour guide', ar: 'مرشد مخصص متخصص في الآثار الفرعونية' },
                      { en: 'Skip-the-line tickets', ar: 'جميع تذاكر الدخول السريع وتجاوز الانتظار' },
                      { en: 'Lunch and refreshments', ar: 'وجبات غداء فاخرة ومشروبات ومناشف مبردة' },
                      { en: '24/7 customer support', ar: 'تنسيق كامل مع خادمك الشخصي المخصص 24/7' }
                    ].map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{lang === 'ar' ? inc.ar : inc.en}</span>
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
                        lang === 'ar' 
                          ? `مرحباً، أود الاستفسار من الكونسيرج الملكي حول تفاصيل جولة "${selectedTour.title.ar || selectedTour.title.en}".` 
                          : `Hello, I would like to inquire with the Royal Concierge regarding the "${selectedTour.title.en}" expedition.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3.5 rounded-full shadow-lg shadow-emerald-500/10 hover:scale-[1.02] transition-transform cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                      <span>{lang === 'ar' ? 'استفسار واتساب' : 'WhatsApp Inquiry'}</span>
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
                {selectedTour.itinerary.map((day) => (
                  <div key={day.day} className="flex gap-4 border-l-2 border-emerald-500 pb-6 pl-4 relative last:pb-0">
                    <div className="absolute -left-[9px] top-0 bg-emerald-500 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px] shadow" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
                        {lang === 'ar' ? day.title.ar : day.title.en}
                      </h4>
                      <p className="text-slate-500 leading-relaxed mt-1">
                        {lang === 'ar' ? day.description.ar : day.description.en}
                      </p>
                    </div>
                  </div>
                ))}
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
                        <span>{lang === 'ar' ? faq.question.ar : faq.question.en}</span>
                      </h4>
                      <p className="text-slate-500 mt-1.5 leading-relaxed pl-6">
                        {lang === 'ar' ? faq.answer.ar : faq.answer.en}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* AI Review Summary panel */}
            {activeDetailTab === 'aiFeedback' && (
              <div className="space-y-4 animate-fade-in font-medium text-xs md:text-sm">
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

                {/* Simulated original reviews logs list */}
                <div className="space-y-4">
                  <h5 className="font-extrabold text-slate-900 text-xs md:text-sm uppercase tracking-wider font-sans">{t.customerFeedback}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { 
                        name: 'Sterling B.', 
                        flag: '🇬🇧', 
                        badge: 'VIP Customer', 
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
                        review: 'Flawless execution. Our private Mercedes V-Class chauffeur was impeccable. The yacht charter was pristine, and our private lunch freshly prepared on-deck by the head chef was simply unforgettable.' 
                      },
                      { 
                        name: 'Genevieve M.', 
                        flag: '🇫🇷', 
                        badge: 'VIP Customer', 
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
                        review: 'Bypassing the massive public lines to enter the burial chamber of the Great Pyramid with our dedicated Egyptology doctor was a transcendent experience. Highly recommend the bespoke option.' 
                      }
                    ].map((rev, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 shadow-sm text-xs leading-relaxed flex items-start gap-4 hover:border-slate-300 transition-colors">
                        <img 
                          src={rev.avatar} 
                          alt={rev.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <span>{rev.name}</span>
                                <span title="Nationality">{rev.flag}</span>
                              </div>
                              <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest block mt-0.5">{rev.badge}</span>
                            </div>
                            <span className="text-amber-500 font-bold">★★★★★</span>
                          </div>
                          <p className="text-slate-600 italic font-medium leading-relaxed">"{rev.review}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <div>{lang === 'ar' ? 'الاستثمار المالي' : 'Investment'}</div>
                    <div>{lang === 'ar' ? 'الوجهة' : 'Destination'}</div>
                    <div>{lang === 'ar' ? 'المدة' : 'Duration'}</div>
                    <div>{lang === 'ar' ? 'التقييم' : 'Quality Audited'}</div>
                    <div>{lang === 'ar' ? 'سعة المجموعة الفردية' : 'Group Capacity'}</div>
                    <div>{lang === 'ar' ? 'الميزات والترقيات' : 'Elite Extras'}</div>
                  </div>

                  {/* Comparisons */}
                  {compareList.map((c) => (
                    <div key={c.id} className="border border-slate-150 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                      <div className="text-center pb-4 border-b border-slate-200">
                        <div className="h-20 w-full overflow-hidden rounded-lg mb-2">
                          <img src={c.images[0]} alt={c.title.en} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <h4 className="font-extrabold text-slate-800 line-clamp-2 h-10">{lang === 'ar' ? c.title.ar : c.title.en}</h4>
                      </div>

                      <div className="space-y-12 text-center py-6 text-slate-800 font-bold font-sans">
                        <div className="text-emerald-600 text-base font-black">{formatLocalPrice(c.priceUSD)}</div>
                        <div>{c.destination}</div>
                        <div>{c.duration}</div>
                        <div className="text-amber-500">{c.rating}★</div>
                        <div>{c.capacity} guests</div>
                        <div className="text-[10px] text-slate-500 text-left space-y-1">
                          {c.extras.map(e => (
                            <div key={e.id} className="flex gap-1 items-start truncate">
                              <span className="text-emerald-500">✓</span>
                              <span className="truncate">{lang === 'ar' ? e.name.ar : e.name.en}</span>
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

    </div>
  );
}
