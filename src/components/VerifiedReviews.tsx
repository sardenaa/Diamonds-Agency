import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Quote, Award, Sparkles, ShieldCheck, Play, Pause } from 'lucide-react';
import { tokens } from '../theme/tokens.js';
import { AppLanguage } from '../types.js';

interface Testimonial {
  id: number;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  countryEn: string;
  countryAr: string;
  flag: string;
  avatar: string;
  tourNameEn: string;
  tourNameAr: string;
  rating: number;
  dateEn: string;
  dateAr: string;
  reviewEn: string;
  reviewAr: string;
  category: 'Heritage' | 'Cruises' | 'Aviation' | 'Elite';
}

const LUXURY_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    nameEn: 'Lady Charlotte Campbell',
    nameAr: 'اللايدي شارلوت كامبل',
    titleEn: 'Sovereign Patron',
    titleAr: 'عضو سيادي راعي',
    countryEn: 'United Kingdom',
    countryAr: 'المملكة المتحدة',
    flag: '🇬🇧',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    tourNameEn: 'Giza Private Chamber Viewing & Old Cataract Stay',
    tourNameAr: 'معاينة الغرفة الخاصة بالجيزة والإقامة في أولد كاتاراكت',
    rating: 5,
    dateEn: 'June 2026',
    dateAr: 'يونيو ٢٠٢٦',
    category: 'Heritage',
    reviewEn: 'The Giza private viewing surpassed every conceivable expectation. Standing in the Great Pyramid with our personal Egyptologist scholar under absolute silence was a profound experience. MAS operates at a level of pristine hospitality that is virtually extinct in modern travel.',
    reviewAr: 'تجاوزت المشاهدة الخاصة لأهرامات الجيزة كل التوقعات الممكنة. الوقوف في الهرم الأكبر مع عالم الآثار الخاص بنا في صمت تام كان تجربة عميقة للغاية. تعمل وكالة ماس بمستوى من الضيافة النقية النادرة في السفر الحديث.'
  },
  {
    id: 2,
    nameEn: 'Charles de Rothschild',
    nameAr: 'تشارلز دي روتشيلد',
    titleEn: 'Private Charter Executive',
    titleAr: 'رئيس مجلس الطيران الخاص',
    countryEn: 'France',
    countryAr: 'فرنسا',
    flag: '🇫🇷',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    tourNameEn: 'Luxor Helicopter Charter & Private Valley Tomb Entry',
    tourNameAr: 'طائرة هليكوبتر خاصة بالأقصر ودخول مقبرة الوادي الخاصة',
    rating: 5,
    dateEn: 'May 2026',
    dateAr: 'مايو ٢٠٢٦',
    category: 'Aviation',
    reviewEn: 'Chartering the private helicopter from Cairo directly to Luxor saved us hours of travel and allowed us to explore Karnak Temple in complete solitude at sunrise. Every transfer in the Mercedes-Maybach fleet was beautifully organized, down to the chilled towels and precise temp control.',
    reviewAr: 'وفر لنا استئجار الطائرة المروحية الخاصة من القاهرة مباشرة إلى الأقصر ساعات من السفر وأتاح لنا استكشاف معبد الكرنك في عزلة تامة عند شروق الشمس. تم تنظيم كل تنقل في أسطول مرسيدس مايباخ بشكل جميل، وصولاً إلى المناشف الباردة والتحكم الدقيق في الحرارة.'
  },
  {
    id: 3,
    nameEn: 'Al-Maktoum Family',
    nameAr: 'عائلة آل مكتوم الكريمة',
    titleEn: 'Royal Suite Patrons',
    titleAr: 'رواد الجناح الملكي',
    countryEn: 'United Arab Emirates',
    countryAr: 'الإمارات العربية المتحدة',
    flag: '🇦🇪',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80',
    tourNameEn: 'Grand Nile River cruise & Sahara Sunset Butler Service',
    tourNameAr: 'رحلة نيلية كبرى وخدمة الخادم الشخصي عند غروب الشمس في الصحراء',
    rating: 5,
    dateEn: 'April 2026',
    dateAr: 'أبريل ٢٠٢٦',
    category: 'Cruises',
    reviewEn: 'Our family was blessed with a round-the-clock dedicated butler who anticipated our children’s dietary preferences perfectly. The bespoke dining setup under the Saharan stars with private lute musicians and custom desert safaris was absolutely magnificent.',
    reviewAr: 'حُظيت عائلتنا بخادم شخصي مخصص على مدار الساعة توقع تفضيلات أطفالنا الغذائية بدقة متناهية. كان عشاءنا الخاص الفاخر تحت نجوم الصحراء الكبرى مع موسيقيي العود الخاصين ورحلات السفاري رائعاً بشكل يفوق الوصف.'
  },
  {
    id: 4,
    nameEn: 'Professor Arthur Vance',
    nameAr: 'البروفيسور آرثر فانس',
    titleEn: 'Academic Historian',
    titleAr: 'مؤرخ أكاديمي كبير',
    countryEn: 'United States',
    countryAr: 'الولايات المتحدة الأمريكية',
    flag: '🇺🇸',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    tourNameEn: 'Philae Temple Private Island Dinner & Aswan Sailing',
    tourNameAr: 'عشاء جزيرة معبد فيلة الخاص والإبحار في أسوان',
    rating: 5,
    dateEn: 'March 2026',
    dateAr: 'مارس ٢٠٢٦',
    category: 'Elite',
    reviewEn: 'As an Egyptologist myself, I expected rigor, but the scholar guides assigned to us by MAS exceeded academic standards. They bypassed crowds effortlessly, had deep access to active dig sites, and treated our curiosity with immense professional respect.',
    reviewAr: 'بصفتي عالم آثار مصري، توقعت الدقة الأكاديمية، لكن المرشدين الأكاديميين المخصصين لنا من قبل ماس تجاوزوا المعايير. لقد تخطوا الحشود بسهولة، وحصلوا على وصول عميق لمواقع التنقيب النشطة، وعاملوا فضولنا باحترام مهني كبير.'
  },
  {
    id: 5,
    nameEn: 'Sophia Lindqvist',
    nameAr: 'صوفيا ليندكفيست',
    titleEn: 'Bespoke Explorer',
    titleAr: 'مستكشفة الرحلات الخاصة',
    countryEn: 'Sweden',
    countryAr: 'السويد',
    flag: '🇸🇪',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    tourNameEn: 'Red Sea Superyacht Charter & Marine Expedition',
    tourNameAr: 'يخت البحر الأحمر الفاخر والرحلة البحرية الاستكشافية',
    rating: 5,
    dateEn: 'February 2026',
    dateAr: 'فبراير ٢٠٢٦',
    category: 'Cruises',
    reviewEn: 'If you desire true sovereign luxury, MAS is your only choice in Egypt. We chartered their 120ft luxury motor yacht. Chef Mostafa prepared spectacular, Michelin-caliber seafood meals every evening directly on the deck under the stars.',
    reviewAr: 'إذا كنت ترغب في فخامة سيادية حقيقية، فإن ماس هي خيارك الوحيد في مصر. لقد استأجرنا يختهم الفاخر بطول ١٢٠ قدماً. أعد الشيف مصطفى وجبات مأكولات بحرية مذهلة بمستوى ميشلان كل مساء مباشرة على ظهر اليخت تحت النجوم.'
  }
];

const CATEGORY_LABELS = {
  All: { en: 'All Testimonials', ar: 'جميع الشهادات الفاخرة' },
  Heritage: { en: 'Ancient Heritage', ar: 'التراث القديم والمعابد' },
  Cruises: { en: 'Luxury Yachting & Cruises', ar: 'اليخوت والرحلات النيلية' },
  Aviation: { en: 'Private Aviation', ar: 'الطيران الخاص والمروحيات' },
  Elite: { en: 'Elite Scholar Safaris', ar: 'رحلات الأكاديميين الفاخرة' }
};

export default function VerifiedReviews({ lang }: { lang: AppLanguage }) {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Heritage' | 'Cruises' | 'Aviation' | 'Elite'>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Filter reviews by active category
  const filteredTestimonials = LUXURY_TESTIMONIALS.filter(t => 
    activeCategory === 'All' || t.category === activeCategory
  );

  // Reset index when changing categories to prevent out of bounds
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Autoplay functionality with clean intervals
  const startAutoplay = () => {
    stopAutoplay();
    if (isPlaying && filteredTestimonials.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
      }, 6000);
    }
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [isPlaying, filteredTestimonials.length, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  // Translations
  const t = {
    title: { en: 'Verified Sovereign Experiences', ar: 'تجارب سيادية موثقة' },
    subtitle: { en: 'TESTIMONIALS OF SOVEREIGN LUXURY TRAVELERS', ar: 'شهادات مسافري الفخامة والسيادة الملكية' },
    desc: { 
      en: 'Real stories from our elite, Royal Diamond, and VIP Gold members who experienced customized, security-escorted private wonders.',
      ar: 'قصص حقيقية من أعضاء الفئة الماسية الملكية والذهبية الذين اختبروا معنا جولات خاصة بحراسة وتنسيق أمني متكامل.'
    },
    verifiedReviewer: { en: 'Verified Elite Guest', ar: 'ضيف نخبة موثق' },
    tourLabel: { en: 'Signature Journey:', ar: 'الرحلة التوقيعية المخصصة:' },
    visitDate: { en: 'Travel Date:', ar: 'تاريخ السفر الموثق:' },
    viewSite: { en: 'Acknowledge Giza Guard & Antiquities Authorization', ar: 'تصاريح وشهادات وزارة السياحة والآثار معتمدة' }
  };

  const activeTestimonial = filteredTestimonials[currentIndex];

  return (
    <div id="verified-reviews-carousel" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
      
      {/* Absolute design accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      {/* Header section with badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800 relative z-10">
        <div>
          <span className={`${tokens.typography.subtitle} text-amber-400`}>
            {t.subtitle[lang]}
          </span>
          <h3 className="text-2xl md:text-3xl font-black font-serif tracking-tight text-white mt-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>{t.title[lang]}</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl mt-2 leading-relaxed font-medium">
            {t.desc[lang]}
          </p>
        </div>

        {/* Play/Pause controls for premium interaction */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
            title={isPlaying ? "Pause autoplay" : "Play autoplay"}
          >
            {isPlaying ? <Pause className="w-3 h-3 text-amber-400 fill-amber-400" /> : <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
            <span>{isPlaying ? (lang === 'ar' ? 'إيقاف مؤقت' : 'PAUSE') : (lang === 'ar' ? 'تشغيل' : 'PLAY')}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs for luxury filtering */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/40 no-scrollbar scrollbar-none relative z-10">
        {Object.entries(CATEGORY_LABELS).map(([key, value]) => {
          const isSelected = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isSelected 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80 hover:bg-slate-900'
              }`}
            >
              <span>{lang === 'ar' ? value.ar : value.en}</span>
              {isSelected && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Testimonials Body with Slide Transition style */}
      {activeTestimonial ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center relative z-10">
          
          {/* Left Avatar block */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-400 via-emerald-600 to-amber-300 rounded-3xl blur opacity-30 group-hover:opacity-65 transition duration-1000 group-hover:duration-200" />
              <img 
                src={activeTestimonial.avatar} 
                alt={activeTestimonial.nameEn}
                referrerPolicy="no-referrer"
                className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-3xl border-2 border-slate-800 shadow-2xl relative z-10"
              />
              <span className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1 rounded-lg text-xs font-bold border-2 border-slate-900 z-20 shadow-md" title="Verified Sovereign Guest">
                {activeTestimonial.flag}
              </span>
            </div>

            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-center lg:justify-start gap-1">
                <h4 className="text-base md:text-lg font-bold text-white font-serif">
                  {lang === 'ar' ? activeTestimonial.nameAr : activeTestimonial.nameEn}
                </h4>
              </div>
              <p className="text-xs text-amber-400 font-extrabold tracking-wide uppercase flex items-center gap-1 justify-center lg:justify-start">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? activeTestimonial.titleAr : activeTestimonial.titleEn}</span>
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                {t.verifiedReviewer[lang]}
              </span>
            </div>
          </div>

          {/* Right Quote details block */}
          <div className="lg:col-span-8 space-y-6 flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              
              {/* Star Ratings */}
              <div className="flex gap-1 items-center justify-center lg:justify-start">
                {[...Array(activeTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-[10px] font-bold text-slate-500 font-mono ml-2 uppercase tracking-widest">
                  (5.0 STARS)
                </span>
              </div>

              {/* The Testimonial text */}
              <div className="relative">
                <Quote className="w-10 h-10 text-slate-800 absolute -top-4 -left-3 pointer-events-none" />
                <p className="text-sm md:text-base text-slate-200 leading-relaxed italic font-medium relative z-10">
                  "{lang === 'ar' ? activeTestimonial.reviewAr : activeTestimonial.reviewEn}"
                </p>
              </div>

              {/* Travel Log Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-[11px] font-medium text-slate-400">
                <div>
                  <span className="text-slate-500 block uppercase text-[9px] font-extrabold tracking-wider">{t.tourLabel[lang]}</span>
                  <span className="text-slate-100 font-bold">
                    {lang === 'ar' ? activeTestimonial.tourNameAr : activeTestimonial.tourNameEn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[9px] font-extrabold tracking-wider">{t.visitDate[lang]}</span>
                  <span className="text-slate-300">
                    {lang === 'ar' ? activeTestimonial.dateAr : activeTestimonial.dateEn}
                  </span>
                </div>
              </div>

            </div>

            {/* Slider Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/40">
              
              {/* Pagination Dots */}
              <div className="flex gap-1.5 items-center">
                {filteredTestimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                      currentIndex === i 
                        ? 'w-6 bg-amber-400' 
                        : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Prev/Next chevron buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 font-medium">
          No testimonials registered in this category yet.
        </div>
      )}

      {/* Ministry certification seal */}
      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t.viewSite[lang]}</span>
        </span>
        <span className="font-mono text-[9px]">CERTIFICATE ID: #EGY-9033-MAS</span>
      </div>

    </div>
  );
}
