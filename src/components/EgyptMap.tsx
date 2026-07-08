import React, { useState, useEffect } from 'react';
import { MapPin, Sun, Compass, Building2, Car, Star, Navigation, X, Crown, Sparkles } from 'lucide-react';
import { Tour, AppLanguage } from '../types.js';

interface DestinationData {
  id: string;
  name: { en: string; ar: string; de?: string; pl?: string; cs?: string };
  coordinates: { x: string; y: string }; // Position percentages on the custom vector map
  weather: { en: string; ar: string; de?: string; pl?: string; cs?: string; temp: string };
  attractions: { en: string[]; ar: string[]; de?: string[]; pl?: string[]; cs?: string[] };
  hotels: { en: string[]; ar: string[]; de?: string[]; pl?: string[]; cs?: string[] };
  transport: { en: string; ar: string; de?: string; pl?: string; cs?: string };
  tours: { en: string[]; ar: string[]; de?: string[]; pl?: string[]; cs?: string[] };
}

interface EgyptMapProps {
  lang: AppLanguage;
  onSelectBookTour?: (tour: Tour) => void;
}

export default function EgyptMap({ lang, onSelectBookTour }: EgyptMapProps) {
  const getLocalizedValue = <T,>(obj: { en: T; ar: T; [key: string]: any }): T => {
    if (lang === 'ar') return obj.ar;
    return obj[lang] !== undefined ? obj[lang] : obj.en;
  };

  const [selectedDestId, setSelectedDestId] = useState<string>('cairo');
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);

  // Fetch real tour list to map direct booking shortcuts
  useEffect(() => {
    fetch('/api/tours')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTours(data);
        }
      })
      .catch(err => console.error('Error fetching tours in EgyptMap:', err));
  }, []);

  const destinations: DestinationData[] = [
    {
      id: 'cairo',
      name: { en: 'Cairo & Giza', ar: 'القاهرة والجيزة' },
      coordinates: { x: '42%', y: '28%' },
      weather: { en: 'Sunny, 28°C', ar: 'مشمس، ٢٨ م°', temp: '28°C' },
      attractions: {
        en: ['Great Pyramids of Giza', 'The Grand Egyptian Museum', 'Khan El-Khalili Bazaar'],
        ar: ['أهرامات الجيزة العظيمة', 'المتحف المصري الكبير', 'سوق خان الخليلي']
      },
      hotels: {
        en: ['Four Seasons Nile Plaza', 'Marriott Mena House', 'The St. Regis Cairo'],
        ar: ['فور سيزونز نايل بلازا', 'ماريوت مينا هاوس', 'سانت ريجيس القاهرة']
      },
      transport: {
        en: 'Mercedes V-Class Private Fleet & Luxury Helicopter Flyovers',
        ar: 'أسطول مرسيدس V-Class الخاص وجولات الهليكوبتر الفاخرة'
      },
      tours: {
        en: ['VIP Pyramids & Great Sphinx Royal Expedition', 'Nile Dinner Cruise in Sovereign Suite'],
        ar: ['رحلة استكشاف ملكية خاصة للأهرامات وأبي الهول', 'عشاء نيلى فى الجناح السيادي']
      }
    },
    {
      id: 'luxor',
      name: { en: 'Luxor', ar: 'الأقصر' },
      coordinates: { x: '55%', y: '62%' },
      weather: { en: 'Golden Hour, 34°C', ar: 'ساعة ذهبية، ٣٤ م°', temp: '34°C' },
      attractions: {
        en: ['Valley of the Kings (KV62 Tomb)', 'Karnak Temple Complex', 'Temple of Hatshepsut'],
        ar: ['وادي الملوك (مقبرة توت عنخ آمون)', 'مجمع معابد الكرنك', 'معبد حتشبسوت']
      },
      hotels: {
        en: ['Sofitel Legend Old Cataract (Aswan Alliance)', 'Hilton Luxor Resort & Spa'],
        ar: ['سوفيتيل ليجند أولد كاتاراكت (تحالف أسوان)', 'منتجع هيلتون الأقصر']
      },
      transport: {
        en: 'Private Nile Dahabiya Royal Sailing Yachts',
        ar: 'يخوت الإبحار الملكية الخاصة (الذهبية)'
      },
      tours: {
        en: ['Luxury Nile Dahabiya Royal Cruise & Tombs', 'Valley of Kings Sunrise Hot Air Balloon'],
        ar: ['رحلة النيل الملكية الفاخرة بالذهبية', 'منطاد وادي الملوك عند شروق الشمس']
      }
    },
    {
      id: 'aswan',
      name: { en: 'Aswan', ar: 'أسوان' },
      coordinates: { x: '58%', y: '78%' },
      weather: { en: 'Clear Skies, 36°C', ar: 'سماء صافية، ٣٦ م°', temp: '36°C' },
      attractions: {
        en: ['Philae Island Temple', 'Unfinished Obelisk', 'Abu Simbel Temples Fly-in'],
        ar: ['معبد جزيرة فيلة', 'المسلة الناقصة', 'معابد أبو سمبل بالطائرة الخاصة']
      },
      hotels: {
        en: ['Sofitel Legend Old Cataract Royal Suite', 'Mövenpick Resort Aswan'],
        ar: ['جناح سوفيتيل ليجند أولد كاتاراكت الملكي', 'منتجع موفنبيك أسوان']
      },
      transport: {
        en: 'Bespoke Felucca Luxury Crafts & Private Charter Flights',
        ar: 'قوارب الفلوكة الفاخرة المخصصة ورحلات الطيران الخاصة'
      },
      tours: {
        en: ['Abu Simbel Temples Majestic Private Air Charter', 'Aswan Botanical Island Private Sail'],
        ar: ['رحلة معابد أبو سمبل الفاخرة بالطيران الخاص', 'إبحار خاص لجزيرة أسوان النباتية']
      }
    },
    {
      id: 'sharm',
      name: { en: 'Sharm El Sheikh & Red Sea', ar: 'شرم الشيخ والبحر الأحمر' },
      coordinates: { x: '68%', y: '40%' },
      weather: { en: 'Sea Breeze, 30°C', ar: 'نسيم البحر، ٣٠ م°', temp: '30°C' },
      attractions: {
        en: ['Ras Mohammed National Marine Park', 'Tiran Island Snorkeling Reefs', 'Naama Bay Yacht Port'],
        ar: ['محمية رأس محمد البحرية الوطنية', 'شعاب جزيرة تيران', 'ميناء يخوت خليج نعمة']
      },
      hotels: {
        en: ['Four Seasons Resort Sharm El Sheikh', 'Rixos Premium Seagate'],
        ar: ['منتجع فور سيزونز شرم الشيخ', 'ريكسوس بريميوم سيجيت']
      },
      transport: {
        en: 'Sovereign Yacht Fleets & Speedboats with Private Marine Biologist',
        ar: 'أساطيل اليخوت السيادية والقوارب السريعة مع عالم أحياء بحرية خاص'
      },
      tours: {
        en: ['VIP Sharm El Sheikh Private Yacht Charter', 'Ras Mohammed Snorkeling & Lobster On-Deck'],
        ar: ['رحلة يخت خاصة لكبار الشخصيات في شرم الشيخ', 'غطس رأس محمد مع وجبة الكركند على السطح']
      }
    },
    {
      id: 'hurghada',
      name: { en: 'Hurghada (Agency HQ)', ar: 'الغردقة (المقر الرئيسي)' },
      coordinates: { x: '62%', y: '48%' },
      weather: { en: 'Warm Breeze, 31°C', ar: 'نسيم دافئ، ٣١ م°', temp: '31°C' },
      attractions: {
        en: ['Giftun Island Private Beach', 'Hurghada Marina & Yacht Port', 'El Gouna Luxury Lagoons'],
        ar: ['شاطئ جزيرة جفتون الخاص', 'مارينا الغردقة وميناء اليخوت', 'بحيرات الجونة الفاخرة']
      },
      hotels: {
        en: ['The Oberoi Sahl Hasheesh', 'Steigenberger ALDAU Beach', 'Rixos Premium Magawish'],
        ar: ['أوبيروي سهل حشيش', 'شتيجنبرجر ألدو بيتش', 'ريكسوس بريميوم مجاويش']
      },
      transport: {
        en: 'VIP Speedboats, Yacht Charters & Mercedes Private Transfer Fleet (HQ Base)',
        ar: 'قوارب سريعة فاخرة، تأجير يخوت وأسطول مرسيدس الخاص للتقل الملكي (مقرنا الرئيسي)'
      },
      tours: {
        en: ['Sovereign Hurghada Private Yacht & Red Sea Safari', 'Hurghada Premium Desert Quad ATV Safari'],
        ar: ['رحلة يخت الغردقة السيادية الخاصة وسفاري البحر الأحمر', 'رحلة سفاري الغردقة الفاخرة بالدراجات الرباعية']
      }
    }
  ];

  const selectedDest = destinations.find(d => d.id === selectedDestId) || destinations[0];

  // Helper to match destination ID to database Tour ID
  const getMatchedTourForDestination = (destId: string): Tour | null => {
    let targetId = 'tour-1';
    if (destId === 'luxor' || destId === 'aswan') {
      targetId = 'tour-2';
    } else if (destId === 'sharm') {
      targetId = 'tour-3';
    } else if (destId === 'hurghada') {
      targetId = 'tour-4';
    }
    return tours.find(t => t.id === targetId) || null;
  };

  // Click on map pin: open popover and track interaction silently
  const handlePinClick = (destId: string) => {
    setSelectedDestId(destId);
    setActivePopoverId(destId);

    // Silently log viewed destination in local storage for booking checkout metadata
    try {
      const currentSessionsStr = localStorage.getItem('mas_silent_session_metrics') || '{}';
      const metrics = JSON.parse(currentSessionsStr);
      metrics.viewedDestinations = metrics.viewedDestinations || [];
      if (!metrics.viewedDestinations.includes(destId)) {
        metrics.viewedDestinations.push(destId);
      }
      metrics.lastInteraction = new Date().toISOString();
      localStorage.setItem('mas_silent_session_metrics', JSON.stringify(metrics));
    } catch (e) {
      console.warn('Silent metrics tracking write bypassed:', e);
    }
  };

  // Intelligent positioning styling to stay within map frame
  const getPopoverStyle = (dest: DestinationData) => {
    const xPct = parseFloat(dest.coordinates.x);
    const yPct = parseFloat(dest.coordinates.y);
    
    const style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 40,
    };
    
    // Vertical positioning
    if (yPct > 60) {
      style.bottom = `calc(100% - ${dest.coordinates.y} + 15px)`;
    } else {
      style.top = `calc(${dest.coordinates.y} + 15px)`;
    }
    
    // Horizontal positioning
    if (xPct > 75) {
      style.right = `calc(100% - ${dest.coordinates.x} - 25px)`;
    } else if (xPct < 25) {
      style.left = `calc(${dest.coordinates.x} - 25px)`;
    } else {
      style.left = dest.coordinates.x;
      style.transform = 'translateX(-50%)';
    }
    
    return style;
  };

  return (
    <section id="luxury-egypt-map" className="bg-slate-950 text-white rounded-3xl border border-slate-900 overflow-hidden shadow-2xl p-6 md:p-10 space-y-8 relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-emerald-950/10 pointer-events-none" />
      
      {/* Editorial Title */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-900 pb-6">
        <div>
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block mb-2">
            {lang === 'ar' ? 'رحلة عبر الأراضي السيادية' : 'VOYAGE ACROSS SOVEREIGN LANDS'}
          </span>
          <h2 className="text-2xl md:text-4xl font-black font-serif tracking-tight text-white">
            {lang === 'ar' ? 'خريطة مصر التفاعلية الفاخرة' : 'Interactive Egypt Luxury Navigator'}
          </h2>
        </div>
        <p className="text-slate-400 text-xs md:text-sm font-medium max-w-md">
          {lang === 'ar'
            ? 'انقر على أي وجهة ممتازة على الخريطة للكشف عن الفنادق المعتمدة والرحلات الجوية السيادية وأماكن الجذب السياحي الفريدة.'
            : 'Click on any premier coordinate on the map to reveal our certified hotels, private transport fleets, and exclusive excursions.'}
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Interactive Map Visual Stage (Left 7 Columns) */}
        <div className="lg:col-span-7 bg-slate-950/90 rounded-3xl border border-slate-800/90 p-4 flex flex-col justify-between relative min-h-[380px] md:min-h-[500px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95),_inset_0_1px_2px_rgba(255,255,255,0.05)] backdrop-blur-xl group/map">
          {/* Abstract Egyptian Map Graphic Design */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Styled background lines */}
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Gold Glow Filter */}
                <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Emerald Glow Filter */}
                <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.0" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Nile Gradient */}
                <linearGradient id="nile-gradient" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#047857" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.7" />
                </linearGradient>
                {/* Red Sea Gradient */}
                <linearGradient id="redsea-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#020617" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Grid Lines (Cartography Grid) */}
              <g stroke="rgba(245, 158, 11, 0.025)" strokeWidth="0.12">
                <line x1="10" y1="0" x2="10" y2="100" />
                <line x1="20" y1="0" x2="20" y2="100" />
                <line x1="30" y1="0" x2="30" y2="100" />
                <line x1="40" y1="0" x2="40" y2="100" />
                <line x1="50" y1="0" x2="50" y2="100" />
                <line x1="60" y1="0" x2="60" y2="100" />
                <line x1="70" y1="0" x2="70" y2="100" />
                <line x1="80" y1="0" x2="80" y2="100" />
                <line x1="90" y1="0" x2="90" y2="100" />

                <line x1="0" y1="10" x2="100" y2="10" />
                <line x1="0" y1="20" x2="100" y2="20" />
                <line x1="0" y1="30" x2="100" y2="30" />
                <line x1="0" y1="40" x2="100" y2="40" />
                <line x1="0" y1="50" x2="100" y2="50" />
                <line x1="0" y1="60" x2="100" y2="60" />
                <line x1="0" y1="70" x2="100" y2="70" />
                <line x1="0" y1="80" x2="100" y2="80" />
                <line x1="0" y1="90" x2="100" y2="90" />
              </g>

              {/* Elegant Grid Text Indicators */}
              <text x="3" y="21" fill="rgba(245, 158, 11, 0.12)" className="font-mono text-[3px] tracking-widest">30° N</text>
              <text x="3" y="41" fill="rgba(245, 158, 11, 0.12)" className="font-mono text-[3px] tracking-widest">28° N</text>
              <text x="3" y="61" fill="rgba(245, 158, 11, 0.12)" className="font-mono text-[3px] tracking-widest">26° N</text>
              <text x="3" y="81" fill="rgba(245, 158, 11, 0.12)" className="font-mono text-[3px] tracking-widest">24° N</text>
              
              <text x="21" y="96" fill="rgba(245, 158, 11, 0.12)" className="font-mono text-[3px] tracking-widest">30° E</text>
              <text x="41" y="96" fill="rgba(245, 158, 11, 0.12)" className="font-mono text-[3px] tracking-widest">32° E</text>
              <text x="61" y="96" fill="rgba(245, 158, 11, 0.12)" className="font-mono text-[3px] tracking-widest">34° E</text>
              <text x="81" y="96" fill="rgba(245, 158, 11, 0.12)" className="font-mono text-[3px] tracking-widest">36° E</text>

              {/* Red Sea Shaded Region */}
              <polygon 
                points="48,27 58,32 68,40 62,48 71,70 80,95 100,95 100,27" 
                fill="url(#redsea-gradient)" 
                opacity="0.35" 
              />

              {/* Gulf of Suez Line */}
              <path d="M 48 27 L 68 40" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.2" />
              {/* Gulf of Aqaba Line */}
              <path d="M 74 23 L 68 40" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="0.8" />

              {/* Nile River Flow Path */}
              {/* Lake Nasser Base */}
              <path 
                d="M 57 95 C 56 92 59 90 58 87 C 57 85 61 84 58 81 C 57 80 59 79 58 78" 
                stroke="url(#nile-gradient)" 
                strokeWidth="2.8" 
                fill="none" 
                strokeLinecap="round" 
                opacity="0.3"
              />
              {/* Main River Nile Line */}
              <path 
                d="M 58 78 C 57 73 53 66 55 62 C 57 58 52 53 53 50 C 54 47 48 44 46 42 C 44 40 44 37 43 35 C 42 33 43 31 42 28" 
                stroke="url(#nile-gradient)" 
                strokeWidth="1.5" 
                fill="none" 
                strokeLinecap="round" 
                filter="url(#emerald-glow)"
              />
              {/* Nile Delta Branches */}
              <path 
                d="M 42 28 Q 38 22 33 14" 
                stroke="#10b981" 
                strokeWidth="1.0" 
                fill="none" 
                opacity="0.75"
                filter="url(#emerald-glow)"
              />
              <path 
                d="M 42 28 Q 45 22 48 14" 
                stroke="#10b981" 
                strokeWidth="1.0" 
                fill="none" 
                opacity="0.75"
                filter="url(#emerald-glow)"
              />
              
              {/* Elegant Golden Private Sovereign Flight Route Arcs */}
              <path 
                d="M 42 28 Q 52 38 62 48" 
                stroke="#fbbf24" 
                strokeWidth="0.75" 
                strokeDasharray="3 3" 
                fill="none" 
                opacity="0.5"
                filter="url(#gold-glow)"
              />
              <path 
                d="M 42 28 Q 48 45 55 62" 
                stroke="#fbbf24" 
                strokeWidth="0.75" 
                strokeDasharray="3 3" 
                fill="none" 
                opacity="0.4"
                filter="url(#gold-glow)"
              />
              <path 
                d="M 62 48 Q 65 55 55 62" 
                stroke="#fbbf24" 
                strokeWidth="0.5" 
                strokeDasharray="2 2" 
                fill="none" 
                opacity="0.3"
              />

              {/* Geographical Text Labels */}
              <text x="12" y="52" fill="rgba(255, 255, 255, 0.08)" className="font-mono text-[4px] tracking-[0.3em] uppercase font-bold">Sahara Desert</text>
              <text x="74" y="32" fill="rgba(255, 255, 255, 0.08)" className="font-mono text-[4px] tracking-[0.25em] uppercase font-bold">Sinai</text>
              <text x="82" y="65" fill="rgba(16, 185, 129, 0.08)" className="font-mono text-[4.5px] tracking-[0.2em] uppercase font-bold">Red Sea</text>
              <text x="22" y="9" fill="rgba(255, 255, 255, 0.07)" className="font-mono text-[4px] tracking-[0.3em] uppercase font-bold">Mediterranean Sea</text>

              {/* Decorative Scale Indicator */}
              <g transform="translate(68, 92)" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.5">
                <line x1="0" y1="0" x2="16" y2="0" />
                <line x1="0" y1="-1.5" x2="0" y2="1.5" />
                <line x1="8" y1="-1" x2="8" y2="1" />
                <line x1="16" y1="-1.5" x2="16" y2="1.5" />
                <text x="3.5" y="-3.5" stroke="none" fill="rgba(255, 255, 255, 0.45)" className="font-mono text-[3px] text-center font-bold">150 KM</text>
              </g>

              {/* Compass Rose at (14, 82) with Royal Diamond Theme */}
              <g transform="translate(14, 82)" className="opacity-65">
                {/* Outer ring */}
                <circle cx="0" cy="0" r="7.5" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="0.3" strokeDasharray="1 1" />
                <circle cx="0" cy="0" r="6.2" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="0.2" />
                {/* Cross hairs */}
                <line x1="-9" y1="0" x2="9" y2="0" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="0.2" />
                <line x1="0" y1="-9" x2="0" y2="9" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="0.2" />
                {/* Diamond points */}
                <polygon points="0,-7.5 1.8,-1.8 7.5,0 1.8,1.8 0,7.5 -1.8,1.8 -7.5,0 -1.8,-1.8" fill="url(#nile-gradient)" opacity="0.75" />
                <polygon points="0,-7.5 0,0 7.5,0" fill="rgba(255, 255, 255, 0.3)" />
                <polygon points="0,7.5 0,0 -7.5,0" fill="rgba(255, 255, 255, 0.25)" />
                {/* Center Core */}
                <circle cx="0" cy="0" r="1.5" fill="#020617" stroke="#f59e0b" strokeWidth="0.5" />
                <text x="-1.5" y="-10" fill="#f59e0b" className="font-sans font-black text-[4px] tracking-normal">N</text>
              </g>
            </svg>
          </div>

          {/* Map Compass Accent */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-slate-400 text-[10px] shadow-lg backdrop-blur-md">
            <Navigation className="w-3.5 h-3.5 text-amber-500 animate-pulse rotate-45" />
            <span className="font-extrabold uppercase tracking-widest text-[8px] text-slate-300">
              {lang === 'ar' ? 'البوصلة التفاعلية للموقع' : 'DIAMONDS AGENCY GEOMAP'}
            </span>
          </div>

          {/* Dynamic Map Pins */}
          <div className="absolute inset-0 z-10">
            {destinations.map((dest) => {
              const isActive = dest.id === selectedDestId;
              return (
                <button
                  key={dest.id}
                  onClick={() => handlePinClick(dest.id)}
                  style={{ top: dest.coordinates.y, left: dest.coordinates.x }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all focus:outline-none z-20"
                >
                  {/* Outer Ring pulse - Diamond shapes for premium look */}
                  <span className={`absolute inline-flex rounded-md border border-amber-500/40 rotate-45 transition-transform ${
                    isActive 
                      ? 'h-11 w-11 -left-3.5 -top-3.5 animate-ping' 
                      : 'h-8 w-8 -left-2 -top-2 scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-100 duration-500'
                  }`} />
                  
                  {/* Luxury Nested Diamond Map Marker */}
                  {isActive ? (
                    <div className="relative flex items-center justify-center w-8 h-8 drop-shadow-[0_10px_15px_rgba(245,158,11,0.35)]">
                      {/* Outer spinning/pulsating diamond border */}
                      <div className="absolute w-6 h-6 border border-amber-400/80 rotate-45 scale-110 animate-pulse" />
                      {/* Solid luxury diamond */}
                      <div className="w-5 h-5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.65),_inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-300">
                        {/* Inner nested slate-950 diamond */}
                        <div className="w-2 h-2 bg-slate-950 rotate-45 flex items-center justify-center">
                          {/* Core diamond point */}
                          <div className="w-1 h-1 bg-amber-300 rotate-45" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center w-6 h-6 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                      {/* Subtle outer diamond shadow */}
                      <div className="absolute w-4.5 h-4.5 border border-emerald-500/40 rotate-45 group-hover:border-amber-500/60 duration-300" />
                      {/* Core diamond */}
                      <div className="w-3.5 h-3.5 bg-slate-950 border border-emerald-500 group-hover:border-amber-400 rotate-45 flex items-center justify-center transition-all duration-300">
                        <div className="w-1.5 h-1.5 bg-emerald-500 group-hover:bg-amber-400 rotate-45" />
                      </div>
                    </div>
                  )}
                  
                  {/* Pin Name Tag */}
                  <div className={`absolute left-7 top-1/2 transform -translate-y-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest transition-all duration-300 border backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.7)] ${
                    isActive 
                      ? 'bg-amber-500 border-amber-400 text-slate-950 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black' 
                      : 'bg-slate-950/90 border-slate-850 text-slate-300 group-hover:border-emerald-500/60 group-hover:text-white'
                  }`}>
                    {getLocalizedValue(dest.name)}
                  </div>
                </button>
              );
            })}

            {/* FLOATING TOUR HIGHLIGHT POPOVER CARD */}
            {activePopoverId && (() => {
              const popoverDest = destinations.find(d => d.id === activePopoverId);
              if (!popoverDest) return null;
              const matchedTour = getMatchedTourForDestination(popoverDest.id);
              
              return (
                <div 
                  style={getPopoverStyle(popoverDest)}
                  className="bg-slate-950/95 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.85),_0_0_25px_rgba(245,158,11,0.08)] w-72 md:w-80 text-white animate-fade-in space-y-3 z-40"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <div>
                        <span className="text-[8px] text-amber-400 font-extrabold tracking-widest uppercase block">
                          {lang === 'ar' ? 'معالم مميزة' : 'EXCLUSIVE HIGHLIGHT'}
                        </span>
                        <h4 className="text-xs font-black font-serif text-white">
                          {getLocalizedValue(popoverDest.name)}
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopoverId(null);
                      }}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Highlights attractions */}
                  <div className="space-y-1 text-slate-300 text-[10px]">
                    <div className="font-bold text-slate-400">
                      {lang === 'ar' ? 'الأماكن البارزة لزيارتها:' : 'Top Experiences:'}
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 leading-relaxed font-medium">
                      {getLocalizedValue(popoverDest.attractions).map((attr, idx) => (
                        <li key={idx}>{attr}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Curated Tour Booking Shortcut */}
                  {matchedTour ? (
                    <div className="pt-2 border-t border-slate-900 space-y-2">
                      <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <div className="truncate max-w-[150px] pr-2 text-left">
                          <span className="text-[7px] text-emerald-400 font-bold uppercase tracking-wider block">
                            {lang === 'ar' ? 'جولة التوقيع الموصى بها' : 'RECOMMENDED ROYAL TOUR'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-200 block truncate" title={getLocalizedValue(matchedTour.title)}>
                            {getLocalizedValue(matchedTour.title)}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[7px] text-slate-400 block uppercase font-bold">
                            {lang === 'ar' ? 'تبدأ من' : 'FROM'}
                          </span>
                          <span className="text-[11px] font-black text-amber-400">
                            ${matchedTour.priceUSD}
                          </span>
                        </div>
                      </div>

                      {onSelectBookTour ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBookTour(matchedTour);
                          }}
                          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-lg hover:shadow-amber-500/20"
                        >
                          <Crown className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{lang === 'ar' ? 'احجز فوراً الآن' : 'Instant Book Tour'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const element = document.getElementById('excursions-grid');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Compass className="w-3.5 h-3.5 text-amber-500" />
                          <span>{lang === 'ar' ? 'عرض الجولات المتاحة' : 'View Excursions'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-500 italic text-center pt-2 border-t border-slate-900">
                      {lang === 'ar' ? 'الرحلة مخصصة بالكامل' : 'Bespoke Private Itinerary Only'}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Quick Help Tip */}
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-850 max-w-xs text-[10px] font-semibold text-slate-400 shadow-md">
            {lang === 'ar' ? '💡 انقر على النقاط الذهبية لتغيير الوجهة الاستكشافية وعرض حجزها الفوري' : '💡 Select our bespoke diamond pins to chart your luxury itinerary & book instantly'}
          </div>
        </div>

        {/* Dynamic Spec Highlight Detail Sheet (Right 5 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-slate-900/65 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden animate-fade-in">
          
          {/* Top Info Header */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase">
                {lang === 'ar' ? 'تفاصيل الوجهة الملكية' : 'ROYAL EXPEDITION HUB'}
              </span>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                <Sun className="w-3.5 h-3.5 fill-amber-400" />
                <span>{getLocalizedValue(selectedDest.weather)}</span>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-black font-serif text-white tracking-tight border-b border-slate-800 pb-3">
              {getLocalizedValue(selectedDest.name)}
            </h3>
          </div>

          {/* Sub sections */}
          <div className="space-y-5 flex-1 py-1">
            
            {/* Curated Elite Tours */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                <Compass className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'ar' ? 'الرحلات الملكية التوقيعية' : 'Curated Sovereign Excursions'}</span>
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-slate-300 text-xs font-semibold">
                {getLocalizedValue(selectedDest.tours).map((tour, i) => (
                  <li key={i} className="hover:text-white transition-colors leading-relaxed">
                    {tour}
                  </li>
                ))}
              </ul>
            </div>

            {/* Approved Partner Hotels */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'ar' ? 'الفنادق والمنتجعات الشريكة' : 'Elite Partner Hotels'}</span>
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-slate-300 text-xs font-semibold">
                {getLocalizedValue(selectedDest.hotels).map((hotel, i) => (
                  <li key={i} className="hover:text-white transition-colors leading-relaxed">
                    {hotel}
                  </li>
                ))}
              </ul>
            </div>

            {/* Transportation Modes */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                <Car className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'ar' ? 'الخدمة اللوجستية والأسطول' : 'Sovereign Transport Fleets'}</span>
              </span>
              <p className="text-slate-300 text-xs leading-relaxed pl-5 font-semibold">
                {getLocalizedValue(selectedDest.transport)}
              </p>
            </div>

          </div>

          {/* Quick Filter Search CTA */}
          <button
            onClick={() => {
              const element = document.getElementById('excursions-grid');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ar' ? 'تصفح جولات هذا القطاع' : `Browse Tours in ${getLocalizedValue(selectedDest.name)}`}</span>
          </button>
        </div>

      </div>
    </section>
  );
}
