import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Sparkles, Compass, MapPin, Ticket, Timer, ShieldCheck, HelpCircle } from 'lucide-react';
import { Booking, AppLanguage } from '../types.js';
import ProfileModal from './ProfileModal.js';

interface BookingCountdownProps {
  bookings: Booking[];
  lang: AppLanguage;
}

interface SimulatedVoyage {
  titleEn: string;
  titleAr: string;
  durationEn: string;
  durationAr: string;
  daysOffset: number;
  pickupEn: string;
  pickupAr: string;
  driverEn: string;
  driverAr: string;
  guideEn: string;
  guideAr: string;
}

const PRESET_VOYAGES: Record<string, SimulatedVoyage> = {
  pyramids: {
    titleEn: 'Private VIP Pyramids & Great Sphinx Royal Expedition',
    titleAr: 'رحلة استكشاف ملكية خاصة للأهرامات وأبي الهول',
    durationEn: 'Full Day (8 Hours)',
    durationAr: 'يوم كامل (٨ ساعات)',
    daysOffset: 2,
    pickupEn: 'Four Seasons Nile Plaza - 08:00 AM',
    pickupAr: 'فور سيزونز نايل بلازا - ٠٨:٠٠ صباحًا',
    driverEn: 'Sherif (Mercedes-Benz S-Class Chauffeur)',
    driverAr: 'شريف (سائق مرسيدس S-Class الخاص)',
    guideEn: 'Dr. Tariq (Senior Egyptology Curator)',
    guideAr: 'د. طارق (أمين عام علم المصريات الأثري)'
  },
  nile: {
    titleEn: 'Luxury Nile Dahabiya Royal Cruise',
    titleAr: 'رحلة نيلية ملكية فاخرة على متن الذهبية',
    durationEn: '3 Days / 2 Nights',
    durationAr: '٣ أيام / ليلتين',
    daysOffset: 5,
    pickupEn: 'Luxor International Airport VIP Terminal - 11:30 AM',
    pickupAr: 'مطار الأقصر الدولي صالة كبار الشخصيات - ١١:٣٠ صباحًا',
    driverEn: 'Amr (Mercedes V-Class Private Shuttle)',
    driverAr: 'عمرو (حافلة مرسيدس V-Class الخاصة)',
    guideEn: 'Professor Nadia (Archaeological Scholar)',
    guideAr: 'أ.د. نادية (عالمة آثار وباحثة مرافقة)'
  },
  helicopter: {
    titleEn: 'Luxor Helicopter Charter & Private Valley Access',
    titleAr: 'طيران خاص بالهليكوبتر فوق الأقصر ووادي الملوك',
    durationEn: '6 Hours VIP Expedition',
    durationAr: 'رحلة استكشاف ملكية ٦ ساعات',
    daysOffset: 8,
    pickupEn: 'Downtown Heliport Terminal 2 - 07:00 AM',
    pickupAr: 'مهبط هليكوبتر وسط المدينة مبنى ٢ - ٠٧:٠٠ صباحًا',
    driverEn: 'Captain Hany (Private Pilot Service)',
    driverAr: 'كابتن هاني (خدمة الطيار الخاص)',
    guideEn: 'Dr. Mahmoud (Director of Archaeological Digs)',
    guideAr: 'د. محمود (مدير عمليات التنقيب الأثرية)'
  },
  redsea: {
    titleEn: 'Sovereign Red Sea Private Yacht Charter',
    titleAr: 'إبحار يخت خاص بالبحر الأحمر الملكي',
    durationEn: 'Full Day (7 Hours Ocean Cruise)',
    durationAr: 'يوم كامل (٧ ساعات إبحار بالمحيط)',
    daysOffset: 12,
    pickupEn: 'Sharm Marina Gate 4 - 09:15 AM',
    pickupAr: 'بوابة مارينا شرم الشيخ رقم ٤ - ٠٩:١٥ صباحًا',
    driverEn: 'Youssef (Mercedes V-Class Executive Pickup)',
    driverAr: 'يوسف (سيارة مرسيدس V-Class التنفيذية)',
    guideEn: 'Captain Khaled (Marine Master Mariner)',
    guideAr: 'كابتن خالد (قبطان بحري محترف)'
  }
};

export default function BookingCountdown({ bookings, lang }: BookingCountdownProps) {
  // Profile modal states
  const [selectedStaffName, setSelectedStaffName] = useState('');
  const [selectedStaffRole, setSelectedStaffRole] = useState<'guide' | 'driver'>('guide');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Check if there is a real upcoming booking (status pending or confirmed)
  const realUpcoming = [...bookings]
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .map(b => {
      const t = b.date.includes('T') ? new Date(b.date).getTime() : new Date(`${b.date}T08:00:00`).getTime();
      return { booking: b, targetTime: t };
    })
    .filter(item => item.targetTime > Date.now())
    .sort((a, b) => a.targetTime - b.targetTime)[0];

  // Local storage state for simulated countdown
  const [simulatedKey, setSimulatedKey] = useState<string | null>(() => {
    return localStorage.getItem('simulated_voyage_key') || null;
  });

  const [simulatedDate, setSimulatedDate] = useState<number | null>(() => {
    const saved = localStorage.getItem('simulated_voyage_time');
    return saved ? parseInt(saved, 10) : null;
  });

  // Calculate current time state
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set simulated voyage
  const handleStartSimulation = (key: string) => {
    const preset = PRESET_VOYAGES[key];
    if (!preset) return;
    
    // Set simulated target to target days in future at 08:00 AM
    const target = new Date();
    target.setDate(target.getDate() + preset.daysOffset);
    target.setHours(8, 0, 0, 0);

    const targetMs = target.getTime();
    localStorage.setItem('simulated_voyage_key', key);
    localStorage.setItem('simulated_voyage_time', String(targetMs));
    setSimulatedKey(key);
    setSimulatedDate(targetMs);
  };

  // Clear simulated voyage
  const handleClearSimulation = () => {
    localStorage.removeItem('simulated_voyage_key');
    localStorage.removeItem('simulated_voyage_time');
    setSimulatedKey(null);
    setSimulatedDate(null);
  };

  // Resolve current active countdown (real has priority, then simulated)
  const isReal = !!realUpcoming;
  const activeTitle = isReal 
    ? (realUpcoming.booking.tourTitle[lang] || realUpcoming.booking.tourTitle.en)
    : simulatedKey && PRESET_VOYAGES[simulatedKey]
    ? (lang === 'ar' ? PRESET_VOYAGES[simulatedKey].titleAr : PRESET_VOYAGES[simulatedKey].titleEn)
    : null;

  const activeTargetTime = isReal 
    ? realUpcoming.targetTime 
    : simulatedDate;

  const activeBooking = isReal ? realUpcoming.booking : null;
  const simulatedPreset = !isReal && simulatedKey ? PRESET_VOYAGES[simulatedKey] : null;

  // Calculate time diff
  const diff = activeTargetTime ? activeTargetTime - now : 0;
  const hasFinished = diff <= 0;

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

  // Determine standard pickup/driver info for either real or simulated
  const driverName = isReal 
    ? (activeBooking?.driverName || (lang === 'ar' ? 'جاري تعيين سائق مخصص...' : 'Assigning Private Chauffeur...'))
    : simulatedPreset 
    ? (lang === 'ar' ? simulatedPreset.driverAr : simulatedPreset.driverEn)
    : '';

  const guideName = isReal
    ? (activeBooking?.guideName || (lang === 'ar' ? 'جاري تعيين مرشد أثري...' : 'Assigning Scholar Egyptologist...'))
    : simulatedPreset
    ? (lang === 'ar' ? simulatedPreset.guideAr : simulatedPreset.guideEn)
    : '';

  const pickupLocation = isReal
    ? `${activeBooking?.pickupHotel} ${activeBooking?.roomNumber ? `(Room ${activeBooking.roomNumber})` : ''}`
    : simulatedPreset
    ? (lang === 'ar' ? simulatedPreset.pickupAr : simulatedPreset.pickupEn)
    : '';

  return (
    <div className="w-full text-slate-800" id="booking-countdown-container">
      <AnimatePresence mode="wait">
        {activeTitle && activeTargetTime && !hasFinished ? (
          <motion.div
            key="countdown-active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 md:p-8 border border-amber-500/30 shadow-xl"
            id="active-countdown-card"
          >
            {/* Ambient gold/amber orb in the background */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            {/* Top header line */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500/15 p-2 rounded-xl border border-amber-500/30 text-amber-400">
                  <Timer className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black tracking-widest uppercase text-center align-middle">
                    {lang === 'ar' ? 'رحلتك السيادية القادمة' : 'YOUR NEXT SOVEREIGN VOYAGE'}
                  </span>
                  <h4 className="text-xs text-slate-400 font-semibold mt-0.5">
                    {lang === 'ar' ? 'العد التنازلي الحصري لعد الترقب' : 'Exclusive real-time anticipation log'}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isReal ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                    {lang === 'ar' ? 'حجز نشط مؤكد' : 'Confirmed Booking'}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'محاكي الرحلة التفاعلي' : 'Voyage Simulator'}
                    </span>
                    <button
                      id="btn-cancel-simulation"
                      onClick={handleClearSimulation}
                      className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'إنهاء المحاكاة' : 'End Simulator'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tour Title Banner */}
            <div className="py-5 relative z-10">
              <h3 className="text-lg md:text-2xl font-black text-white font-sans tracking-tight leading-snug">
                {activeTitle}
              </h3>
              {isReal && activeBooking && (
                <p className="text-[10px] text-amber-400 font-mono mt-1 uppercase tracking-widest">
                  {lang === 'ar' ? `رقم الحجز: ${activeBooking.id}` : `RESERVATION ID: ${activeBooking.id}`}
                </p>
              )}
              {!isReal && simulatedPreset && (
                <p className="text-[10px] text-amber-400 font-mono mt-1 uppercase tracking-widest">
                  {lang === 'ar' ? `المدة المقترحة: ${simulatedPreset.durationAr}` : `DURATION: ${simulatedPreset.durationEn}`}
                </p>
              )}
            </div>

            {/* Countdown Grid (Days, Hours, Minutes, Seconds) */}
            <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-2xl my-3 relative z-10" id="countdown-digits-grid">
              {[
                { labelEn: 'Days', labelAr: 'أيام', value: days },
                { labelEn: 'Hours', labelAr: 'ساعات', value: hours },
                { labelEn: 'Minutes', labelAr: 'دقائق', value: minutes },
                { labelEn: 'Seconds', labelAr: 'ثواني', value: seconds, isSeconds: true }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 text-center transition-all duration-300 ${
                    item.isSeconds ? 'border-amber-500/30' : ''
                  }`}
                >
                  <div className="text-xl md:text-4xl font-black font-mono tracking-tight text-white mb-1 drop-shadow-sm">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    {lang === 'ar' ? item.labelAr : item.labelEn}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress line indicator to elevate expectation */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-6 mb-5 relative">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${Math.max(10, Math.min(100, (seconds * 1.6) + 10))}%` }}
              />
            </div>

            {/* Assigned VIP VIP Chauffeur & Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/15 text-xs font-semibold text-slate-300 relative z-10">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[9px] uppercase font-black tracking-widest">{lang === 'ar' ? 'موقع الاصطحاب' : 'VIP PICKUP LOCATION'}</span>
                  <span className="text-slate-100 font-bold">{pickupLocation}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[9px] uppercase font-black tracking-widest">{lang === 'ar' ? 'السائق الخاص' : 'CHAUFFEUR SERVICE'}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-100 font-bold">{driverName}</span>
                    {driverName && !driverName.includes('...') && !driverName.includes('جاري') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStaffName(driverName);
                          setSelectedStaffRole('driver');
                          setIsProfileModalOpen(true);
                        }}
                        className="text-[9px] font-extrabold uppercase text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center"
                      >
                        <span>({lang === 'ar' ? 'الملف' : 'Profile'})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[9px] uppercase font-black tracking-widest">{lang === 'ar' ? 'المرشد الأثري الخاص' : 'EXECUTIVE SCHOLAR'}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-100 font-bold">{guideName}</span>
                    {guideName && !guideName.includes('...') && !guideName.includes('جاري') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStaffName(guideName);
                          setSelectedStaffRole('guide');
                          setIsProfileModalOpen(true);
                        }}
                        className="text-[9px] font-extrabold uppercase text-amber-400 hover:text-amber-300 hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center"
                      >
                        <span>({lang === 'ar' ? 'الملف' : 'Profile'})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="countdown-empty"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6"
            id="empty-countdown-card"
          >
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-xl text-slate-700">
                    <Compass className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      {lang === 'ar' ? 'تتبع وبث الترقب لرحلتك القادمة' : 'Vibe & Anticipation Tracker'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {lang === 'ar' 
                        ? 'تتبع وقت التحرك وعين سائقك الخاص بمجرد قيامك بأي حجز' 
                        : 'Simulate departure timers, map pickups, and coordinate elite support live.'}
                    </p>
                  </div>
                </div>
              </div>
              <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200/60 px-2.5 py-1.5 rounded font-black tracking-widest uppercase self-start md:self-auto">
                {lang === 'ar' ? 'برنامج السفير الملكي' : 'ROYAL ANTICIPATION ENGINE'}
              </span>
            </div>

            {/* Interactive Invitation Grid */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                    {lang === 'ar' ? 'متاحة للتجربة الآن' : 'SIMULATION AVAILABLE'}
                  </span>
                  <p className="text-xs font-bold text-slate-800 pt-1">
                    {lang === 'ar' ? 'لم تجدول رحلات قادمة بعد؟ جرب محاكي الرحلات الفاخرة!' : 'No upcoming bookings booked? Try our luxury real-time Countdown simulator!'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {lang === 'ar'
                      ? 'اختر إحدى تجاربنا الحصرية لتبث روح الترقب الحقيقي والعد التنازلي المباشر، لتشاهد كيف تظهر تفاصيل السائق والمرشد وتحديثات تتبع الرحلة.'
                      : 'Choose an extraordinary signature itinerary below to launch a simulated live Countdown and experience the luxury coordination flow.'}
                  </p>
                </div>
              </div>

              {/* Selection list of preset luxury experiences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'pyramids', labelEn: 'Pyramids Expedition', labelAr: 'رحلة الأهرامات', offset: '2 Days Away', offsetAr: 'بعد يومين', color: 'from-amber-500 to-amber-600' },
                  { key: 'nile', labelEn: 'Grand Nile Dahabiya', labelAr: 'رحلة الدهبية النيلية', offset: '5 Days Away', offsetAr: 'بعد ٥ أيام', color: 'from-emerald-600 to-emerald-700' },
                  { key: 'helicopter', labelEn: 'Luxor Helicopter Flight', labelAr: 'هليكوبتر الأقصر', offset: '8 Days Away', offsetAr: 'بعد ٨ أيام', color: 'from-blue-600 to-blue-700' },
                  { key: 'redsea', labelEn: 'Red Sea Yacht Cruise', labelAr: 'إبحار يخت البحر الأحمر', offset: '12 Days Away', offsetAr: 'بعد ١٢ يوم', color: 'from-rose-600 to-rose-700' }
                ].map((preset) => (
                  <button
                    key={preset.key}
                    id={`btn-preset-countdown-${preset.key}`}
                    onClick={() => handleStartSimulation(preset.key)}
                    className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-amber-500/40 rounded-2xl p-4 text-left transition-all duration-300 cursor-pointer hover:shadow-md flex flex-col justify-between h-32 active:scale-95"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-slate-100 group-hover:bg-amber-100 text-slate-600 group-hover:text-amber-800 px-2 py-0.5 rounded font-bold uppercase transition-colors">
                          {lang === 'ar' ? preset.offsetAr : preset.offset}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <p className="text-xs font-black text-slate-800 font-sans tracking-tight pt-3 line-clamp-2 leading-snug group-hover:text-amber-950">
                        {lang === 'ar' ? preset.labelAr : preset.labelEn}
                      </p>
                    </div>
                    
                    <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform self-end">
                      {lang === 'ar' ? 'تشغيل المحاكاة ←' : 'Activate Countdown →'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        staffName={selectedStaffName}
        role={selectedStaffRole}
        lang={lang}
      />
    </div>
  );
}
