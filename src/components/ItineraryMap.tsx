import React, { useState } from 'react';
import { Compass, MapPin, Plane, Globe, Navigation, Sparkles, Activity, Info, X, ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon } from 'lucide-react';
import { Booking } from '../types.js';

interface ItineraryMapProps {
  booking: Booking;
  lang: 'en' | 'ar' | 'pl' | 'cs' | 'de';
}

// Coordinate mappings for Egypt standard projection
// Lng 28.5 to 35.5 -> X (10% to 90%)
// Lat 23.5 to 31.5 -> Y (90% to 10%)
const getEgyptCoords = (lat: number, lng: number) => {
  const minLng = 28.5;
  const maxLng = 35.5;
  const minLat = 23.5;
  const maxLat = 31.5;

  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

  return {
    x: `${Math.max(8, Math.min(92, x))}%`,
    y: `${Math.max(8, Math.min(92, y))}%`
  };
};

const localT = {
  en: {
    origin: "Origin Port",
    destination: "Egypt Destination",
    itineraryMap: "Sovereign Dispatch Map",
    flightRoute: "Private Flight Route",
    connectingTo: "Connecting to",
    dayLabel: "Day",
    dispatchPort: "VIP Dispatch Port",
    liveCoordinates: "Live Coordinates",
    milestones: "Milestones",
    activeTracking: "Active Satellite Link",
    radarSweep: "RADAR ACTIVE: SECURE COMMS LINKED",
    clickPin: "Select bespoke pins to preview daily schedules",
    departureCity: "Departure City",
    flightPath: "Jet Flight Path",
    curatedGallery: "Bespoke Photo Gallery",
    viewGallery: "EXPAND IMMERSIVE GALLERY",
    close: "Close",
    prev: "Previous",
    next: "Next",
    imageOf: "Image",
    photoClearance: "OFFICIAL LANDMARK CLEARANCE",
  },
  ar: {
    origin: "ميناء الانطلاق",
    destination: "وجهة مصر الفاخرة",
    itineraryMap: "خريطة المسار السيادية",
    flightRoute: "مسار الرحلة الخاص",
    connectingTo: "جارٍ الاتصال بـ",
    dayLabel: "اليوم",
    dispatchPort: "منفذ الإرسال VIP",
    liveCoordinates: "الإحداثيات الحية",
    milestones: "المحطات الرئيسية",
    activeTracking: "رابط القمر الصناعي النشط",
    radarSweep: "الرادار نشط: تم تأمين قنوات الاتصال الملكية",
    clickPin: "انقر على النقاط الذهبية لعرض مسار اليوم",
    departureCity: "مدينة المغادرة",
    flightPath: "مسار الطائرة الخاصة",
    curatedGallery: "معرض الصور الملكي المنسق",
    viewGallery: "توسيع المعرض الغامر",
    close: "إغلاق",
    prev: "السابق",
    next: "التالي",
    imageOf: "صورة",
    photoClearance: "تصريح رسمي للمعالم البارزة",
  },
  de: {
    origin: "Abflughafen",
    destination: "Ägypten Reiseziel",
    itineraryMap: "Souveräne Reiseroute-Karte",
    flightRoute: "Private Flugroute",
    connectingTo: "Verbindung nach",
    dayLabel: "Tag",
    dispatchPort: "VIP-Sendehafen",
    liveCoordinates: "Live-Koordinaten",
    milestones: "Meilensteine",
    activeTracking: "Aktive Satellitenverbindung",
    radarSweep: "RADAR AKTIV: SICHERE SATELLITEN-VERBINDUNG",
    clickPin: "Wählen Sie Pins aus, um den Tagesablauf anzuzeigen",
    departureCity: "Abflugstadt",
    flightPath: "Jet-Flugbahn",
    curatedGallery: "Exklusive Fotogalerie",
    viewGallery: "IMMERSIVE GALERIE ÖFFNEN",
    close: "Schließen",
    prev: "Zurück",
    next: "Weiter",
    imageOf: "Bild",
    photoClearance: "OFFIZIELLE WAHRZEICHEN-FREIGABE",
  },
  pl: {
    origin: "Port Początkowy",
    destination: "Cel w Egipcie",
    itineraryMap: "Satelitarna Mapa Podróży",
    flightRoute: "Prywatna Trasa Lotu",
    connectingTo: "Połączenie z",
    dayLabel: "Dzień",
    dispatchPort: "Port Nadawczy VIP",
    liveCoordinates: "Współrzędne GPS",
    milestones: "Kamienie Milowe",
    activeTracking: "Satelita Aktywny",
    radarSweep: "RADAR AKTYWNY: BEZPIECZNE ŁĄCZA",
    clickPin: "Kliknij punkty, aby zobaczyć plan dnia",
    departureCity: "Miasto Wylotu",
    flightPath: "Trasa Odrzutowca",
    curatedGallery: "Królewska Galeria Zdjęć",
    viewGallery: "ROZWIŃ PEŁNĄ GALERIĘ",
    close: "Zamknij",
    prev: "Poprzednie",
    next: "Następne",
    imageOf: "Zdjęcie",
    photoClearance: "OFICJALNE ZDJĘCIA PREMIUM",
  },
  cs: {
    origin: "Výchozí Port",
    destination: "Cíl v Egyptě",
    itineraryMap: "Satelitní Mapa Trasy",
    flightRoute: "Soukromá Letová Trasa",
    connectingTo: "Připojení k",
    dayLabel: "Den",
    dispatchPort: "Port VIP Odeslání",
    liveCoordinates: "Živé GPS Souřadnice",
    milestones: "Milníky Cesty",
    activeTracking: "Satelitní Spojení",
    radarSweep: "RADAR AKTIVNÍ: ZABEZPEČENÉ SPOJENÍ",
    clickPin: "Kliknutím na body zobrazíte denní plán",
    departureCity: "Město Odletu",
    flightPath: "Trasa Soukromého Letu",
    curatedGallery: "Kurátorská Galerie Fotografií",
    viewGallery: "ZOBRAZIT VELKOU GALERII",
    close: "Zavřít",
    prev: "Předchozí",
    next: "Další",
    imageOf: "Obrázek",
    photoClearance: "OFICIÁLNÍ PREMIUM FOTOGRAFIE",
  }
};

interface PathSegmentProps {
  d: string;
  progress: number;
}

function PathSegment({ d, progress }: PathSegmentProps) {
  const pathRef = React.useRef<SVGPathElement>(null);
  const [length, setLength] = React.useState(0);

  React.useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  const strokeDashoffset = length - length * progress;

  return (
    <g>
      {/* Underlying faint track path */}
      <path
        d={d}
        stroke="rgba(245, 158, 11, 0.15)"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        fill="none"
      />
      {/* Animated drawing golden/emerald path */}
      {length > 0 && (
        <path
          ref={pathRef}
          d={d}
          stroke="url(#sat-route)"
          strokeWidth="1.5"
          strokeDasharray={length}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          filter="url(#glow-map)"
          strokeLinecap="round"
          className="transition-all duration-100 ease-out"
        />
      )}
    </g>
  );
}

export default function ItineraryMap({ booking, lang }: ItineraryMapProps) {
  const isAr = lang === 'ar';
  const t = localT[lang] || localT.en;

  // Extraction of User coordinates from booking metadata
  const userLat = booking.metadata?.location?.latitude ? parseFloat(booking.metadata.location.latitude) : 51.5074;
  const userLng = booking.metadata?.location?.longitude ? parseFloat(booking.metadata.location.longitude) : -0.1278;
  const userCity = booking.metadata?.location?.city || 'London';
  const userCountry = booking.metadata?.location?.country || 'UK';

  const [activePin, setActivePin] = useState<number | null>(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Auto-track scroll position of the timeline to animate path and active pin
  React.useEffect(() => {
    const handleScroll = () => {
      const items = document.querySelectorAll('.timeline-day-item');
      if (items.length > 1) {
        const firstRect = items[0].getBoundingClientRect();
        const lastRect = items[items.length - 1].getBoundingClientRect();
        const threshold = window.innerHeight * 0.65; // Focus point
        
        // Total scroll distance between first and last timeline items
        const totalDist = lastRect.top - firstRect.top;
        if (totalDist > 0) {
          const currentDist = threshold - firstRect.top;
          const progress = Math.max(0, Math.min(1, currentDist / totalDist));
          setScrollProgress(progress);
        }

        // Auto-focus active map pin
        let closestDay = 1;
        let minDiff = Infinity;
        items.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const diff = Math.abs(itemCenter - threshold);
          if (diff < minDiff) {
            minDiff = diff;
            const dayAttr = item.getAttribute('data-timeline-day');
            if (dayAttr) {
              closestDay = parseInt(dayAttr, 10);
            }
          }
        });
        setActivePin(closestDay);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handlePinClick = (day: number) => {
    setActivePin(day);
    const targetItem = document.querySelector(`.timeline-day-item[data-timeline-day="${day}"]`);
    if (targetItem) {
      targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Milestone list building based on tourId with real coordinates mapping
  const tourId = booking.tourId;
  const tourTitleEn = (booking.tourTitle?.en || '').toLowerCase();

  let milestones = [
    {
      day: 1,
      lat: 30.1219,
      lng: 31.3997,
      name: {
        en: 'CAI VIP Arrival Terminal',
        ar: 'مطار القاهرة صالة كبار الزوار',
        de: 'Kairo VIP-Terminal',
        pl: 'Terminal VIP w Kairze',
        cs: 'Kairo VIP Terminál'
      },
      description: {
        en: 'Diplomatic protocol reception and Mercedes S-Class chauffeured transfer.',
        ar: 'الاستقبال بالبروتوكول الدبلوماسي والنقل بالمرسيدس S-Class مع سائق خاص.',
        de: 'Diplomatischer Empfang und Transfer mit Chauffeur in der Mercedes S-Klasse.',
        pl: 'Dyplomatyczne powitanie i transfer limuzyną Mercedes Klasy S z szoferem.',
        cs: 'Diplomatické přivítání a transfer limuzínou Mercedes Třídy S s řidičem.'
      },
      images: [
        'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1483450388369-9ed95738483c?auto=format&fit=crop&q=80&w=1200'
      ]
    },
    {
      day: 2,
      lat: 29.9792,
      lng: 31.1342,
      name: {
        en: 'Giza Plateau & Pyramids',
        ar: 'هضبة الجيزة والأهرامات',
        de: 'Gizeh-Plateau & Pyramiden',
        pl: 'Płaskowyż Giza i Piramidy',
        cs: 'Náhorní Plošina Gíza a Pyramidy'
      },
      description: {
        en: 'Exclusive crowd-free security passage to Pyramids and Great Sphinx.',
        ar: 'مرور أمني حصري بدون حشود للأهرامات وأبو الهول العظيم.',
        de: 'Exklusiver, gedrängefreier Sicherheitszugang zu den Pyramiden und der Sphinx.',
        pl: 'Ekskluzywne zwiedzanie Piramid i Sfinksa bez tłumów z prywatną ochroną.',
        cs: 'Exkluzivní prohlídka pyramid a Sfingy bez davů s soukromou ochranou.'
      },
      images: [
        'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1585117814331-4115e76cdf2f?auto=format&fit=crop&q=80&w=1200'
      ]
    }
  ];

  if (tourId === 'tour-2' || tourTitleEn.includes('luxor') || tourTitleEn.includes('valley') || tourTitleEn.includes('nile')) {
    milestones = [
      {
        day: 1,
        lat: 25.6698,
        lng: 32.7095,
        name: {
          en: 'Luxor Private Air Terminal',
          ar: 'مطار الأقصر صالة الطيران الخاص',
          de: 'Privatflugplatz Luxor',
          pl: 'Prywatny Terminal Lotniczy Luxor',
          cs: 'Privátní Letiště Luxor'
        },
        description: {
          en: 'Sovereign jet touchdown and Sofitel Legend Palace check-in.',
          ar: 'هبوط الطائرة الخاصة الفاخرة ونزول جناح رويال في فندق سوفيتيل ليجند.',
          de: 'Sonderflug-Landung und Check-in im Sofitel Legend Palace.',
          pl: 'Lądowanie prywatnego odrzutowca i meldunek w pałacu Sofitel Legend.',
          cs: 'Přistání soukromého letu a ubytování v paláci Sofitel Legend.'
        },
        images: [
          'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=1200'
        ]
      },
      {
        day: 2,
        lat: 25.7402,
        lng: 32.6014,
        name: {
          en: 'Valley of the Kings Private Vault',
          ar: 'وادي الملوك المقبرة المغلقة',
          de: 'Tal der Könige Private Gruft',
          pl: 'Dolina Królów Prywatna Krypta',
          cs: 'Údolí Králů Soukromá Hrobka'
        },
        description: {
          en: 'Sealed chamber clearance inside King Tutankhamun’s tomb.',
          ar: 'ممر مغلق خاص تماماً في مقبرة الملك توت عنخ آمون.',
          de: 'Zugang zur versiegelten Grabkammer von König Tutanchamun.',
          pl: 'Wejście do zamkniętej komory grobowej króla Tutenchamona.',
          cs: 'Vstup do uzavřené hrobky krále Tutanchamona.'
        },
        images: [
          'https://images.unsplash.com/photo-1600577916048-804c9191e36c?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1599881483316-477a9017f275?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1200'
        ]
      }
    ];
  } else if (!tourId && !tourTitleEn.includes('pyramid') && !tourTitleEn.includes('luxor')) {
    // Default fallback milestones
    milestones = [
      {
        day: 1,
        lat: 30.0444,
        lng: 31.2357,
        name: {
          en: 'Sovereign VIP Hub Cairo',
          ar: 'بوابة كبار الزوار القاهرة',
          de: 'Souveränes VIP-Zentrum Kairo',
          pl: 'Centrum VIP w Kairze',
          cs: 'VIP Centrum v Káhiře'
        },
        description: {
          en: 'Diplomatic meet & greet and security transport clearing.',
          ar: 'استقبال كبار الزوار وتأمين مسار النقل الفاخر.',
          de: 'Diplomatisches Treffen und Freigabe des Sicherheitsstransports.',
          pl: 'Dyplomatyczne powitanie i odprawa luksusowego transportu.',
          cs: 'Diplomatické přivítání a odbavení luxusního transportu.'
        },
        images: [
          'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1483450388369-9ed95738483c?auto=format&fit=crop&q=80&w=1200'
        ]
      },
      {
        day: 2,
        lat: 29.9792,
        lng: 31.1342,
        name: {
          en: 'Tailored Expedition Milestone',
          ar: 'موقع الرحلة المنسقة',
          de: 'Maßgeschneiderter Meilenstein',
          pl: 'Kamień Milowy Eksploracji',
          cs: 'Individuální Milník Expedice'
        },
        description: {
          en: 'Elite sightseeing and concierge guided explorations.',
          ar: 'جولات سياحية ملكية مع مرشد مخصص رفيع المستوى.',
          de: 'Elite-Sightseeing und geführte Erkundungen mit dem Concierge.',
          pl: 'Ekskluzywne zwiedzanie z dedykowanym przewodnikiem klasy premium.',
          cs: 'Exkluzivní prohlídka s licencovaným průvodcem pro VIP hosty.'
        },
        images: [
          'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1585117814331-4115e76cdf2f?auto=format&fit=crop&q=80&w=1200'
        ]
      }
    ];
  }

  // Find destination airport for flight path representation
  const targetAirport = milestones[0];

  return (
    <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-12 min-h-[340px] relative print:hidden">
      
      {/* Decorative Cartographic Grid Background (SVG) */}
      <div className="md:col-span-8 bg-slate-950 p-4 relative min-h-[260px] md:min-h-[320px] overflow-hidden border-b md:border-b-0 md:border-r border-slate-850">
        
        {/* Subtle Satellite Mapping SVG Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sat-route" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow-map">
                <feGaussianBlur stdDeviation="1.0" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Latitude/Longitude grid overlay */}
            <g stroke="rgba(245, 158, 11, 0.015)" strokeWidth="0.12">
              <line x1="15" y1="0" x2="15" y2="100" />
              <line x1="30" y1="0" x2="30" y2="100" />
              <line x1="45" y1="0" x2="45" y2="100" />
              <line x1="60" y1="0" x2="60" y2="100" />
              <line x1="75" y1="0" x2="75" y2="100" />
              <line x1="90" y1="0" x2="90" y2="100" />
              <line x1="0" y1="20" x2="100" y2="20" />
              <line x1="0" y1="40" x2="100" y2="40" />
              <line x1="0" y1="60" x2="100" y2="60" />
              <line x1="0" y1="80" x2="100" y2="80" />
            </g>

            {/* River Nile Vector Line on Itinerary Map */}
            <path 
              d="M 52 100 C 53 85 47 70 48 55 C 49 45 42 38 41 28" 
              stroke="rgba(16, 185, 129, 0.15)" 
              strokeWidth="1.2" 
              fill="none" 
              strokeLinecap="round" 
            />
            {/* Nile Delta Branches */}
            <path d="M 41 28 Q 37 20 32 10" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="0.8" fill="none" />
            <path d="M 41 28 Q 44 20 47 10" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="0.8" fill="none" />

            {/* Dynamic, scroll-animated curved path segments */}
            {milestones.map((milestone, idx) => {
              if (idx === milestones.length - 1) return null;
              const nextMilestone = milestones[idx + 1];
              
              const start = getEgyptCoords(milestone.lat, milestone.lng);
              const end = getEgyptCoords(nextMilestone.lat, nextMilestone.lng);
              const sx = parseFloat(start.x);
              const sy = parseFloat(start.y);
              const ex = parseFloat(end.x);
              const ey = parseFloat(end.y);

              // Control point to make a beautiful slight curved travel arc
              const mx = (sx + ex) / 2;
              const my = (sy + ey) / 2;
              const dx = ex - sx;
              const dy = ey - sy;
              const len = Math.sqrt(dx * dx + dy * dy);
              const px = -dy / (len || 1) * 4; // curved offset
              const py = dx / (len || 1) * 4;
              const cx = mx + px;
              const cy = my + py;

              const pathD = `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
              
              // Calculate segment-specific progress
              // If there are M segments, this segment is index `idx`
              const mCount = milestones.length - 1;
              const segmentProgress = Math.max(0, Math.min(1, (scrollProgress - idx / mCount) * mCount));

              return (
                <PathSegment
                  key={idx}
                  d={pathD}
                  progress={segmentProgress}
                />
              );
            })}
          </svg>
        </div>

        {/* Compass Rose */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-900 rounded-lg px-2 py-1 text-[8px] font-mono font-extrabold text-slate-500 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span>EGP SATELLITE CH-12</span>
        </div>

        {/* Live Active Signal Sweep Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full text-emerald-400 text-[8px] font-mono tracking-widest font-black uppercase">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>{t.activeTracking}</span>
        </div>

        {/* Interactive Milestone Pins */}
        {milestones.map((milestone) => {
          const { x, y } = getEgyptCoords(milestone.lat, milestone.lng);
          const isActive = activePin === milestone.day;
          const isVisited = activePin !== null && activePin >= milestone.day;

          return (
            <div
              key={milestone.day}
              style={{ top: y, left: x }}
              onClick={() => handlePinClick(milestone.day)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all z-20 focus:outline-none"
            >
              {/* Outer Glow ring */}
              <span className={`absolute inline-flex rounded-full bg-amber-500/30 transition-transform ${
                isActive 
                  ? 'h-8 w-8 -left-2 -top-2 animate-ping' 
                  : 'h-6 w-6 -left-1 -top-1 scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-100 duration-300'
              }`} />

              {/* Luxury gold & emerald pin design */}
              <div className={`relative flex items-center justify-center transition-all ${
                isActive ? 'scale-110 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'hover:scale-105'
              }`}>
                {isActive ? (
                  <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 border border-white rotate-45 flex items-center justify-center shadow-lg">
                    <span className="text-[7px] font-black font-sans text-slate-950 -rotate-45">{milestone.day}</span>
                  </div>
                ) : (
                  <div className={`w-3 h-3 rotate-45 flex items-center justify-center shadow transition-all ${
                    isVisited 
                      ? 'bg-amber-500/20 border border-amber-400' 
                      : 'bg-slate-950 border border-emerald-500 hover:border-amber-400'
                  }`}>
                    <span className={`text-[6px] font-bold -rotate-45 transition-colors ${
                      isVisited ? 'text-amber-400' : 'text-emerald-400 group-hover:text-amber-400'
                    }`}>{milestone.day}</span>
                  </div>
                )}
              </div>

              {/* Day Label tooltip on hover */}
              <div className={`absolute left-5 top-1/2 transform -translate-y-1/2 bg-slate-950 border rounded-md px-2 py-0.5 whitespace-nowrap text-[8px] font-extrabold uppercase tracking-widest pointer-events-none transition-all ${
                isActive 
                  ? 'border-amber-500 text-amber-400 opacity-100 translate-x-1 scale-100' 
                  : 'border-slate-800 text-slate-400 opacity-0 -translate-x-1 scale-95 group-hover:opacity-100 group-hover:translate-x-0'
              }`}>
                {t.dayLabel} {milestone.day}: {milestone.name[lang] || milestone.name.en}
              </div>
            </div>
          );
        })}

        {/* VIP Dispatch Client Origin Port (In the Mediterranean Sea Space) */}
        <div className="absolute top-1/4 right-8 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl max-w-[150px] space-y-1 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-400 tracking-wider font-mono">
            <Globe className="w-3 h-3 text-amber-400 animate-spin-slow" />
            <span>{t.dispatchPort}</span>
          </div>
          <div className="text-[9px] font-extrabold text-slate-100 truncate">{userCity}, {userCountry}</div>
          <div className="text-[7px] text-slate-400 font-mono">
            {userLat.toFixed(4)}° N, {userLng.toFixed(4)}° W
          </div>
          <div className="flex gap-1 items-center pt-1 border-t border-slate-800 mt-1">
            <Plane className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span className="text-[7px] text-emerald-400 font-bold tracking-widest uppercase">{t.flightPath}</span>
          </div>
        </div>
      </div>

      {/* Information Panel (Right 4 columns) */}
      <div className="md:col-span-4 bg-slate-900/60 p-4 flex flex-col justify-between text-left space-y-4">
        <div className="space-y-3.5">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="font-extrabold text-[10px] uppercase text-emerald-400 tracking-widest font-sans">
              {t.itineraryMap}
            </h4>
            <p className="text-[8px] text-slate-500 font-mono mt-0.5 uppercase tracking-tight">
              {t.radarSweep}
            </p>
          </div>

          {/* Active Milestone Card */}
          {activePin !== null ? (
            <div className="space-y-2 bg-slate-950/70 border border-slate-850 p-3 rounded-xl shadow-lg relative overflow-hidden animate-scale-up">
              <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-center">
                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  {t.dayLabel} {activePin}
                </span>
                <span className="text-[7px] text-slate-500 font-mono">
                  GPS Verified
                </span>
              </div>
              <h5 className="font-extrabold text-white text-xs leading-tight tracking-tight">
                {milestones[activePin - 1]?.name[lang] || milestones[activePin - 1]?.name.en}
              </h5>
              <p className="text-[10px] text-slate-300 leading-relaxed font-semibold italic">
                "{milestones[activePin - 1]?.description[lang] || milestones[activePin - 1]?.description.en}"
              </p>
              
              <div className="pt-2 border-t border-slate-850 flex justify-between text-[7px] text-slate-500 font-mono">
                <span>Lat: {milestones[activePin - 1]?.lat}° N</span>
                <span>Lng: {milestones[activePin - 1]?.lng}° E</span>
              </div>

              {/* Curated Gallery Section */}
              {milestones[activePin - 1]?.images && milestones[activePin - 1].images.length > 0 && (
                <div className="pt-2.5 border-t border-slate-850 mt-2 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1 font-sans">
                      <ImageIcon className="w-3 h-3 text-amber-400" />
                      {t.curatedGallery}
                    </span>
                    <button 
                      onClick={() => setLightboxIndex(0)}
                      className="text-[8px] font-bold text-emerald-400 hover:text-amber-400 flex items-center gap-0.5 tracking-wider uppercase transition-colors"
                    >
                      <Maximize2 className="w-2.5 h-2.5" />
                      {t.viewGallery}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {milestones[activePin - 1].images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="aspect-[4/3] rounded-md overflow-hidden border border-slate-800/80 hover:border-amber-500/80 cursor-pointer relative group/thumb transition-all duration-300"
                      >
                        <img
                          src={imgUrl}
                          alt={`${milestones[activePin - 1].name[lang] || milestones[activePin - 1].name.en} Preview ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover/thumb:bg-transparent duration-300" />
                        <div className="absolute bottom-1 right-1 bg-slate-950/80 border border-slate-900 rounded-sm px-1 py-0.5 text-[6px] text-slate-400 font-mono">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-[9px] font-semibold italic">
              {t.clickPin}
            </div>
          )}
        </div>

        {/* Small Cartographic footnote */}
        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850 flex items-start gap-1.5 text-[8px] text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-normal">
            {lang === 'ar' 
              ? 'تتصل الطائرة الخاصة من منفذ VIP مباشرة بصالة كبار الزوار لمتابعة مسار الرحلة.' 
              : 'The elite sovereign jet links directly to Egypt Private Terminals with automated VIP dispatch clearance.'}
          </p>
        </div>
      </div>

      {/* Immersive Lightbox Modal */}
      {lightboxIndex !== null && activePin !== null && milestones[activePin - 1] && (
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[9999] flex flex-col justify-between p-4 md:p-8 animate-fade-in text-left select-none"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Header Controls */}
          <div className="flex justify-between items-center w-full max-w-6xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-0.5">
              <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                {t.photoClearance}
              </span>
              <h4 className="font-sans font-black text-white text-sm md:text-base tracking-tight leading-none mt-1">
                {milestones[activePin - 1].name[lang] || milestones[activePin - 1].name.en}
              </h4>
            </div>
            
            {/* Close button with subtle elegant hover effect */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-amber-500/60 hover:bg-slate-800 transition-all duration-300 shadow"
              aria-label={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Immersive Main Stage */}
          <div className="flex-1 flex items-center justify-center relative my-4 w-full max-w-6xl mx-auto" onClick={(e) => e.stopPropagation()}>
            {/* Left Navigation Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const total = milestones[activePin - 1].images?.length || 0;
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : total - 1));
              }}
              className="absolute left-2 md:left-6 w-10 h-10 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 shadow z-30"
              title={t.prev}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Main High-Resolution Image Container */}
            <div className="max-w-5xl max-h-[60vh] md:max-h-[68vh] w-full h-full flex items-center justify-center overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/40 relative shadow-2xl">
              <img
                src={milestones[activePin - 1].images?.[lightboxIndex]}
                alt={`${milestones[activePin - 1].name[lang] || milestones[activePin - 1].name.en} - ${lightboxIndex + 1}`}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain animate-scale-up"
              />
              {/* Absolute photo tracker */}
              <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[9px] font-bold text-amber-400 font-mono">
                {t.imageOf} {lightboxIndex + 1} / {milestones[activePin - 1].images?.length || 0}
              </div>
            </div>

            {/* Right Navigation Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const total = milestones[activePin - 1].images?.length || 0;
                setLightboxIndex((prev) => (prev !== null && prev < total - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 md:right-6 w-10 h-10 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 shadow z-30"
              title={t.next}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Footer Metadata & Indicator Bar */}
          <div className="space-y-3 w-full max-w-6xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900/60 border border-slate-800/60 p-3.5 rounded-xl max-w-2xl mx-auto backdrop-blur-sm text-center">
              <p className="text-[11px] md:text-xs text-slate-200 leading-relaxed font-medium italic">
                "{milestones[activePin - 1].description[lang] || milestones[activePin - 1].description.en}"
              </p>
              <div className="flex justify-center items-center gap-4 text-[9px] text-slate-500 font-mono mt-2 border-t border-slate-800/60 pt-2">
                <span>GPS: {milestones[activePin - 1].lat}° N, {milestones[activePin - 1].lng}° E</span>
                <span className="text-amber-500/60">•</span>
                <span className="uppercase tracking-widest">{t.dayLabel} {activePin} {lang === 'ar' ? 'مسار' : 'TRACK'}</span>
              </div>
            </div>

            {/* Slide dots indicator */}
            <div className="flex justify-center gap-1.5">
              {milestones[activePin - 1].images?.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    lightboxIndex === idx ? 'w-6 bg-amber-500' : 'w-1.5 bg-slate-800 hover:bg-slate-700'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
