import React, { useState } from 'react';
import { Award, ShieldCheck, Sparkles, Trophy, CheckCircle2, Lock, ArrowRight, Gem, Compass, Check, HelpCircle } from 'lucide-react';
import { Booking, AppLanguage } from '../types.js';
import { tokens } from '../theme/tokens.js';

interface LoyaltyTierProps {
  lang: AppLanguage;
  bookings: Booking[];
  totalSpent: number;
}

interface TierConfig {
  nameEn: string;
  nameAr: string;
  colorClass: string;
  badgeBg: string;
  glowClass: string;
  spendRequired: number;
  perksEn: string[];
  perksAr: string[];
  cardGradient: string;
  icon: React.ComponentType<any>;
}

const TIER_DESCRIPTIONS = {
  Bronze: {
    en: 'Welcome to the inner circle of MAS travelers. Your premium voyage begins here.',
    ar: 'مرحباً بك في الدائرة الداخلية لمسافري ماس. رحلتك المتميزة تبدأ من هنا.'
  },
  Silver: {
    en: 'Stepping into enhanced hospitality. Experience elevated comfort and premium touches on every transfer.',
    ar: 'خطوة نحو ضيافة محسنة. استمتع براحة فائقة ولمسات ممتازة في كل جولة.'
  },
  Gold: {
    en: 'Distinguished status for avid explorers. Enjoy dedicated assistance, premium guides, and high-tier flexibility.',
    ar: 'مكانة مميزة للمستكشفين الشغوفين. استمتع بمساعدة مخصصة ومرشدين متميزين ومرونة عالية المستوى.'
  },
  Diamond: {
    en: 'The absolute pinnacle of Sovereign Luxury. Your own round-the-clock dedicated butler, customized VIP access, and elite dining.',
    ar: 'القمة المطلقة للفخامة السيادية. خادمك الشخصي المخصص على مدار الساعة، ودخول VIP مخصص، وعشاء فاخر.'
  }
};

export const TIER_CONFIGS: Record<string, TierConfig> = {
  Bronze: {
    nameEn: 'Bronze Elite',
    nameAr: 'البرونزية النخبة',
    spendRequired: 0,
    colorClass: 'text-amber-700',
    badgeBg: 'bg-amber-700/10 text-amber-700 border-amber-700/20',
    glowClass: 'shadow-amber-900/10 border-amber-900/20',
    cardGradient: 'from-amber-900/40 via-slate-900 to-slate-950',
    icon: Compass,
    perksEn: [
      'Standard Premium Mercedes V-Class transfer',
      '24/7 Digital Concierge access',
      'Access to standard seasonal catalog'
    ],
    perksAr: [
      'نقل قياسي متميز بسيارة مرسيدس V-Class',
      'الوصول إلى المساعد الرقمي على مدار الساعة',
      'الوصول إلى كتالوج الرحلات الموسمية القياسي'
    ]
  },
  Silver: {
    nameEn: 'Silver Sovereign',
    nameAr: 'الفضية السيادية',
    spendRequired: 1500,
    colorClass: 'text-slate-300',
    badgeBg: 'bg-slate-300/10 text-slate-300 border-slate-300/20',
    glowClass: 'shadow-slate-400/10 border-slate-400/20',
    cardGradient: 'from-slate-700/30 via-slate-900 to-slate-950',
    icon: Award,
    perksEn: [
      'Complimentary Egyptian Dates & hibiscus welcoming platter',
      'Priority airport premium meet-and-assist service',
      '5% permanent discount on additional bespoke bookings'
    ],
    perksAr: [
      'طبق ترحيبي مجاني من التمور المصرية الفاخرة والكركديه',
      'أولوية خدمة الاستقبال والمساعدة الممتازة بالمطار',
      'خصم دائم 5% على الحجوزات الإضافية المخصصة'
    ]
  },
  Gold: {
    nameEn: 'Gold Majesty',
    nameAr: 'الذهبية المهيبة',
    spendRequired: 5000,
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    glowClass: 'shadow-amber-400/10 border-amber-400/20',
    cardGradient: 'from-amber-500/20 via-slate-900 to-slate-950',
    icon: Trophy,
    perksEn: [
      'Guaranteed late checkout (up to 4:00 PM) at partner hotels',
      'Complimentary private expert photographer companion (1 Hour)',
      '10% permanent discount with coupon code WELCOME10'
    ],
    perksAr: [
      'تسجيل مغادرة متأخر مضمون (حتى الساعة 4:00 مساءً) في الفنادق الشريكة',
      'مصور محترف خاص مجاني مرافق للرحلة (لمدة ساعة واحدة)',
      'خصم دائم 10% مع الرمز الترويجي WELCOME10'
    ]
  },
  Diamond: {
    nameEn: 'Royal Diamond Executive',
    nameAr: 'الماسية الملكية التنفيذية',
    spendRequired: 12000,
    colorClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    glowClass: 'shadow-emerald-400/20 border-emerald-400/30',
    cardGradient: 'from-emerald-950/50 via-slate-900 to-slate-950',
    icon: Gem,
    perksEn: [
      '24/7 dedicated personal travel butler and scholar escort',
      'Bespoke private dinner curated by Michelin chefs at Pyramids',
      'Unlimited vehicle class selection & private helicopter shuttles'
    ],
    perksAr: [
      'خادم سفر شخصي مخصص على مدار الساعة ومرافق أكاديمي طوال الرحلة',
      'عشاء خاص مخصص يشرف عليه طهاة حائزون على نجمة ميشلان أمام الأهرامات مباشرة',
      'حرية اختيار فئة السيارة بلا حدود وميزة النقل بالطائرات المروحية الخاصة'
    ]
  }
};

export default function LoyaltyTier({ lang, bookings, totalSpent }: LoyaltyTierProps) {
  // Determine actual loyalty tier based on total spend
  let actualTier = 'Bronze';
  if (totalSpent >= 12000) actualTier = 'Diamond';
  else if (totalSpent >= 5000) actualTier = 'Gold';
  else if (totalSpent >= 1500) actualTier = 'Silver';

  // State to simulate or test other tiers in the dashboard
  const [selectedTier, setSelectedTier] = useState<string>(actualTier);
  const [claimedPerk, setClaimedPerk] = useState<string | null>(null);
  const [prefVehicle, setPrefVehicle] = useState<'V-Class' | 'S-Class' | 'Maybach'>('V-Class');

  const config = TIER_CONFIGS[selectedTier] || TIER_CONFIGS.Bronze;
  const IconComponent = config.icon;
  const isActual = selectedTier === actualTier;

  // Next tier computation
  const getNextTier = () => {
    if (selectedTier === 'Bronze') return { name: 'Silver', spend: 1500 };
    if (selectedTier === 'Silver') return { name: 'Gold', spend: 5000 };
    if (selectedTier === 'Gold') return { name: 'Diamond', spend: 12000 };
    return null;
  };

  const nextTier = getNextTier();

  // Helper to calculate exact smooth percentage progress across milestones
  const getProgressPercentage = (spend: number) => {
    if (spend <= 0) return 0;
    if (spend < 1500) {
      return (spend / 1500) * 33.3;
    } else if (spend < 5000) {
      return 33.3 + ((spend - 1500) / (5000 - 1500)) * 33.3;
    } else if (spend < 12000) {
      return 66.6 + ((spend - 5000) / (12000 - 5000)) * 33.3;
    } else {
      return 100;
    }
  };

  const smoothPercentage = getProgressPercentage(totalSpent);

  // Translations
  const trans = {
    title: { en: 'Sovereign Royal Club', ar: 'نادي السيادة الملكي' },
    subtitle: { en: 'Your Elite Spend Ledger & Unlocked Perks', ar: 'سجل الإنفاق المتميز والامتيازات المفتوحة' },
    bookingHistory: { en: 'Spend Level Tracker', ar: 'متابع مستوى الإنفاق' },
    bookingCountLabel: { en: `$${totalSpent.toLocaleString()} Total Premium Spend`, ar: `إجمالي الإنفاق المتميز $${totalSpent.toLocaleString()}` },
    spendCounter: { en: 'Total Premium Spend', ar: 'إجمالي الإنفاق المتميز' },
    actualTierBadge: { en: 'Your Current Status', ar: 'حالتك الحالية' },
    simulationNotice: { en: 'Connoisseur Sandbox: Select a tier to preview privileges', ar: 'صندوق النخبة: اختر فئة لاستعراض الامتيازات والمزايا' },
    unlockedPerksTitle: { en: 'Personalized VIP Privileges', ar: 'امتيازات كبار الشخصيات المخصصة لك' },
    lockedPerksTitle: { en: 'Upcoming Privileges (Locked)', ar: 'الامتيازات القادمة (مغلقة)' },
    claimButton: { en: 'Dispatch Concierge Notification', ar: 'إرسال إشعار للخادم الشخصي' },
    claimedSuccess: { en: 'Request sent! Butler will confirm shortly via WhatsApp.', ar: 'تم إرسال الطلب! سيؤكد خادم السفر الشخصي معك عبر واتساب قريبًا.' },
    customizeHeader: { en: 'Active VIP Flight & Vehicle Preferences', ar: 'تفضيلات الطيران والسيارات النشطة لكبار الشخصيات' },
    vehicleLabel: { en: 'Preferred Chauffeur Vehicle', ar: 'سيارة السائق المفضلة' },
    savePreferences: { en: 'Update Chauffeur Dispatch Order', ar: 'تحديث أمر إرسال السائق' },
    pointsText: { en: 'MAS Points Balance', ar: 'رصيد نقاط ماس' }
  };

  const handleClaim = (perk: string) => {
    setClaimedPerk(perk);
    setTimeout(() => {
      setClaimedPerk(null);
      alert(lang === 'ar' 
        ? 'تم التنسيق مع فريق الدعم والخدمة الشخصية الخاص بك لتجهيز هذه الميزة لرحلتك القادمة.'
        : 'Your Personal Travel Butler has logged this request and will configure it for your next trip.'
      );
    }, 2000);
  };

  // Milestones helper for rendering custom badge icons along the progress bar
  const milestones = [
    { key: 'Bronze', labelEn: 'Bronze', labelAr: 'البرونزية', spend: 0, icon: Compass },
    { key: 'Silver', labelEn: 'Silver', labelAr: 'الفضية', spend: 1500, icon: Award },
    { key: 'Gold', labelEn: 'Gold', labelAr: 'الذهبية', spend: 5000, icon: Trophy },
    { key: 'Diamond', labelEn: 'Diamond', labelAr: 'الماسية', spend: 12000, icon: Gem },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header and Sandbox selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className={`${tokens.typography.subtitle}`}>{trans.title[lang]}</span>
          <h3 className={`${tokens.typography.cardTitle} mt-1 text-slate-900`}>{trans.subtitle[lang]}</h3>
        </div>
        
        {/* Connoisseur Sandbox / Simulation Switch */}
        <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex flex-wrap gap-1 items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-2 hidden lg:inline">
            {trans.simulationNotice[lang]}:
          </span>
          {Object.keys(TIER_CONFIGS).map((tKey) => {
            const isActive = selectedTier === tKey;
            const isUsersActual = tKey === actualTier;
            return (
              <button
                key={tKey}
                onClick={() => setSelectedTier(tKey)}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-amber-400 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                } flex items-center gap-1`}
              >
                <span>{lang === 'ar' ? TIER_CONFIGS[tKey].nameAr : TIER_CONFIGS[tKey].nameEn}</span>
                {isUsersActual && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Your Actual Tier" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Sovereign Loyalty Card representation */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`bg-gradient-to-br ${config.cardGradient} text-white rounded-3xl p-6 border ${config.glowClass} shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px] transform hover:scale-[1.02] transition-all duration-300`}>
            {/* Holographic glowing emblem backdrop */}
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
              <IconComponent className="w-48 h-48 text-white" />
            </div>

            {/* Top row */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest text-slate-300">
                  {trans.actualTierBadge[lang]}
                </span>
                <h4 className="text-xl md:text-2xl font-black tracking-wide text-white flex items-center gap-2 mt-2 font-serif">
                  <IconComponent className={`w-6 h-6 ${config.colorClass}`} />
                  <span>{lang === 'ar' ? config.nameAr : config.nameEn}</span>
                </h4>
              </div>
              
              {isActual && (
                <span className="bg-emerald-500 text-white text-[8px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider animate-pulse">
                  ACTIVE
                </span>
              )}
            </div>

            {/* Middle description */}
            <p className="text-xs text-slate-300 leading-relaxed font-medium mt-4">
              {TIER_DESCRIPTIONS[selectedTier as keyof typeof TIER_DESCRIPTIONS]?.[lang] || ''}
            </p>

            {/* Card footer metadata */}
            <div className="border-t border-white/10 pt-4 mt-6 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    {trans.pointsText[lang]}
                  </span>
                  <span className="text-base font-bold text-amber-400">
                    {Math.round(totalSpent * 0.5).toLocaleString()} pts
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    {trans.spendCounter[lang]}
                  </span>
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    ${totalSpent.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Spend-based Progress Bar with Custom Badge Icons */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-[9px] font-bold text-slate-300 uppercase">
                  <span>{lang === 'ar' ? `إنفاق العميل: $${totalSpent.toLocaleString()}` : `Total Spend: $${totalSpent.toLocaleString()}`}</span>
                  {nextTier && (
                    <span>{lang === 'ar' ? `التالي: ${nextTier.name} ($${nextTier.spend})` : `Next: ${nextTier.name} ($${nextTier.spend})`}</span>
                  )}
                </div>
                
                {/* Unified Horizontal Milestone Stepper */}
                <div className="relative pt-4 pb-2 px-1">
                  {/* Track line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${smoothPercentage}%` }}
                    />
                  </div>
                  
                  {/* Milestones badge markers */}
                  <div className="flex justify-between items-center relative z-10">
                    {milestones.map((m, idx) => {
                      const isUnlocked = totalSpent >= m.spend;
                      const MIcon = m.icon;
                      
                      // Calculate approximate percentage alignment
                      const percentLeft = idx * 33.3;
                      
                      return (
                        <div key={m.key} className="flex flex-col items-center relative">
                          <div 
                            title={`${m.key} Milestone ($${m.spend})`}
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-500 ${
                              isUnlocked 
                                ? 'bg-slate-900 border-amber-400 text-amber-400 shadow-md shadow-amber-400/20'
                                : 'bg-slate-950 border-slate-800 text-slate-600'
                            }`}
                          >
                            <MIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-[8px] font-bold mt-1 tracking-tighter ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`}>
                            ${m.spend >= 1000 ? `${m.spend/1000}k` : '0'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Interactive VIP Preferences customizer */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                {trans.customizeHeader[lang]}
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  {trans.vehicleLabel[lang]}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['V-Class', 'S-Class', 'Maybach'].map((veh) => {
                    const isMaybachLocked = totalSpent < 12000 && veh === 'Maybach';
                    const isSClassLocked = totalSpent < 5000 && veh === 'S-Class';
                    const isLocked = isMaybachLocked || isSClassLocked;

                    return (
                      <button
                        key={veh}
                        disabled={isLocked}
                        onClick={() => setPrefVehicle(veh as any)}
                        className={`py-2 px-1 text-[10px] font-bold border rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          prefVehicle === veh 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                      >
                        <span>{veh}</span>
                        {isLocked ? <Lock className="w-2.5 h-2.5 text-slate-400" /> : <Check className="w-2.5 h-2.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  {lang === 'ar' 
                    ? 'سيارات المرسيدس S-Class و Maybach تتطلب عضوية ذهبية أو ماسية للطلب الفوري.'
                    : 'Mercedes S-Class and Maybach fleets require Gold or Diamond tier status for automatic deployment.'
                  }
                </p>
              </div>

              <button
                onClick={() => alert(lang === 'ar' ? 'تم تحديث تفضيلات النقل الملكي لك في سجل كبار الشخصيات.' : 'Chauffeur deployment ledger updated with your private preferences.')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase py-2 rounded-lg transition-colors cursor-pointer"
              >
                {trans.savePreferences[lang]}
              </button>
            </div>
          </div>

        </div>

        {/* 2. Perks Details list */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                {trans.unlockedPerksTitle[lang]}
              </h4>
              <p className="text-xs text-slate-400">
                {lang === 'ar' 
                  ? `هذه المزايا والامتيازات حصرية لفئة ${lang === 'ar' ? config.nameAr : config.nameEn}.` 
                  : `These customized benefits are fully operational for ${config.nameEn} tier members.`
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(lang === 'ar' ? config.perksAr : config.perksEn).map((perk, idx) => (
                <div key={idx} className="bg-slate-50/60 hover:bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between transition-all group">
                  <div className="space-y-3">
                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700 h-7 w-7 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                      {perk}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/50">
                    <button
                      onClick={() => handleClaim(perk)}
                      disabled={claimedPerk !== null}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{claimedPerk === perk ? trans.claimedSuccess[lang] : trans.claimButton[lang]}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tier Comparison Chart */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {lang === 'ar' ? 'مقارنة فئات العضوية السيادية' : 'Sovereign Membership Hierarchy'}
              </h5>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="py-2 pr-4">{lang === 'ar' ? 'الفئة' : 'Tier'}</th>
                      <th className="py-2 px-2 text-center">{lang === 'ar' ? 'الحد الأدنى للإنفاق' : 'Required Spend'}</th>
                      <th className="py-2 px-2">{lang === 'ar' ? 'ميزة النقل الأساسية' : 'Primary Fleet Privilege'}</th>
                      <th className="py-2 pl-4 text-right">{lang === 'ar' ? 'الخصم الدائم' : 'Permanent Discount'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {Object.entries(TIER_CONFIGS).map(([key, value]) => {
                      const isCurrent = key === selectedTier;
                      return (
                        <tr key={key} className={`hover:bg-slate-50 transition-colors ${isCurrent ? 'bg-amber-400/5 text-slate-900 font-bold' : 'text-slate-500'}`}>
                          <td className="py-3 pr-4 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-amber-400' : 'bg-slate-300'}`} />
                            <span>{lang === 'ar' ? value.nameAr : value.nameEn}</span>
                          </td>
                          <td className="py-3 px-2 text-center font-mono">${value.spendRequired.toLocaleString()} USD</td>
                          <td className="py-3 px-2">
                            {key === 'Diamond' ? (lang === 'ar' ? 'مرسيدس S-Class / هليكوبتر' : 'Mercedes S-Class / Helicopter') : (lang === 'ar' ? 'مرسيدس V-Class فاخرة' : 'Mercedes V-Class Luxury')}
                          </td>
                          <td className="py-3 pl-4 text-right text-emerald-600 font-bold">
                            {key === 'Diamond' ? '20%' : key === 'Gold' ? '10%' : key === 'Silver' ? '5%' : '0%'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
