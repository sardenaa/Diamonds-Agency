import React, { useState } from 'react';
import { MapPin, Sun, Compass, Building2, Car, Star, Navigation } from 'lucide-react';

interface DestinationData {
  id: string;
  name: { en: string; ar: string };
  coordinates: { x: string; y: string }; // Position percentages on the custom vector map
  weather: { en: string; ar: string; temp: string };
  attractions: { en: string[]; ar: string[] };
  hotels: { en: string[]; ar: string[] };
  transport: { en: string; ar: string };
  tours: { en: string[]; ar: string[] };
}

interface EgyptMapProps {
  lang: 'en' | 'ar';
}

export default function EgyptMap({ lang }: EgyptMapProps) {
  const [selectedDestId, setSelectedDestId] = useState<string>('cairo');

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
    }
  ];

  const selectedDest = destinations.find(d => d.id === selectedDestId) || destinations[0];

  return (
    <section className="bg-slate-950 text-white rounded-3xl border border-slate-900 overflow-hidden shadow-2xl p-6 md:p-10 space-y-8 relative">
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
        <div className="lg:col-span-7 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between relative min-h-[340px] md:min-h-[460px] overflow-hidden">
          {/* Abstract Egyptian Map Graphic Design */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            {/* Styled background lines */}
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 40 10 Q 55 50 60 90" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 38 10 Q 53 50 58 90" stroke="#f59e0b" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="40" stroke="#334155" strokeWidth="0.2" />
              <circle cx="50" cy="50" r="25" stroke="#334155" strokeWidth="0.2" />
            </svg>
          </div>

          {/* Map Compass Accent */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-slate-500 text-[10px] font-mono">
            <Navigation className="w-4 h-4 text-amber-500 animate-pulse rotate-45" />
            <span>MAS NAVIGATION LEDGER v4.1</span>
          </div>

          {/* Dynamic Map Pins */}
          <div className="absolute inset-0 z-10">
            {destinations.map((dest) => {
              const isActive = dest.id === selectedDestId;
              return (
                <button
                  key={dest.id}
                  onClick={() => setSelectedDestId(dest.id)}
                  style={{ top: dest.coordinates.y, left: dest.coordinates.x }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all focus:outline-none"
                >
                  {/* Outer Ring pulse */}
                  <span className={`absolute inline-flex h-10 w-10 rounded-full bg-amber-500/30 -left-3 -top-3 transition-transform ${isActive ? 'animate-ping' : 'scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-75 duration-300'}`} />
                  
                  {/* Pin Circle */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shadow-md ${isActive ? 'bg-amber-500 border-white scale-125' : 'bg-slate-950 border-emerald-500 group-hover:bg-emerald-500'}`} />
                  
                  {/* Pin Name Tag */}
                  <div className={`absolute left-6 top-1/2 transform -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all shadow border ${
                    isActive 
                      ? 'bg-amber-500 border-amber-400 text-slate-950 scale-105 font-black' 
                      : 'bg-slate-950/90 border-slate-800 text-slate-300 group-hover:text-white'
                  }`}>
                    {lang === 'ar' ? dest.name.ar : dest.name.en}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Help Tip */}
          <div className="bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/60 max-w-xs text-[10px] font-semibold text-slate-400">
            {lang === 'ar' ? '💡 انقر على النقاط الذهبية لتغيير الوجهة الاستكشافية' : '💡 Select the golden pins to chart your itinerary'}
          </div>
        </div>

        {/* Dynamic Spec Highlight Detail Sheet (Right 5 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-slate-900/65 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden animate-fade-in">
          
          {/* Top Info Header */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-emerald-400 font-extrabold tracking-widest uppercase font-mono">
                {selectedDest.id.toUpperCase()} SECTOR ACTIVES
              </span>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                <Sun className="w-3.5 h-3.5 fill-amber-400" />
                <span>{lang === 'ar' ? selectedDest.weather.ar : selectedDest.weather.en}</span>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-black font-serif text-white tracking-tight border-b border-slate-800 pb-3">
              {lang === 'ar' ? selectedDest.name.ar : selectedDest.name.en}
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
                {(lang === 'ar' ? selectedDest.tours.ar : selectedDest.tours.en).map((tour, i) => (
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
                {(lang === 'ar' ? selectedDest.hotels.ar : selectedDest.hotels.en).map((hotel, i) => (
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
                {lang === 'ar' ? selectedDest.transport.ar : selectedDest.transport.en}
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
            <span>{lang === 'ar' ? 'تصفح جولات هذا القطاع' : `Browse Tours in ${selectedDest.name.en}`}</span>
          </button>
        </div>

      </div>
    </section>
  );
}
