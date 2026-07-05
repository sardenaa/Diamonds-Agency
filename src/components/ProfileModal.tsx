import React from 'react';
import { X, Award, Globe, ShieldCheck, Star, Clock, Heart } from 'lucide-react';
import { getStaffProfile } from '../data/profiles.js';
import { AppLanguage } from '../types.js';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  role: 'guide' | 'driver';
  lang: AppLanguage;
}

export default function ProfileModal({
  isOpen,
  onClose,
  staffName,
  role,
  lang
}: ProfileModalProps) {
  if (!isOpen || !staffName) return null;

  const profile = getStaffProfile(staffName, role);
  const isAr = lang === 'ar';

  const titleText = isAr 
    ? (role === 'guide' ? 'بطاقة تعريف المرشد الأثري' : 'بطاقة تعريف السائق الخاص') 
    : (role === 'guide' ? 'Scholar Egyptologist Profile' : 'Executive Chauffeur Profile');

  const ratingLabel = isAr ? 'التقييم العام' : 'Overall Rating';
  const experienceLabel = isAr ? 'سنوات الخبرة' : 'Experience';
  const bioLabel = isAr ? 'السيرة الذاتية المهنية' : 'Professional Biography';
  const languagesLabel = isAr ? 'اللغات المتقنة' : 'Languages Spoken';
  const credentialsLabel = isAr ? 'الاعتمادات والتراخيص' : 'Credentials & Licensing';
  const closeLabel = isAr ? 'إغلاق' : 'Close';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop with elegant blur */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white text-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-fade-in z-10"
        dir={isAr ? 'rtl' : 'ltr'}
        id="staff-profile-modal"
      >
        {/* Banner Pattern */}
        <div className="h-28 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 relative">
          <button
            onClick={onClose}
            className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all cursor-pointer`}
            aria-label={closeLabel}
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-md">
              <img 
                src={profile.avatar} 
                alt={profile.name[lang]} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Profile Details Content */}
        <div className="pt-12 px-6 pb-6 text-center space-y-5">
          {/* Name & Title */}
          <div>
            <h3 className="text-lg font-black text-slate-900 font-sans tracking-tight">
              {profile.name[lang]}
            </h3>
            <span className={`inline-block mt-1 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${
              profile.role === 'guide' 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isAr 
                ? (profile.role === 'guide' ? 'مرشد أثري معتمد' : 'سائق خاص معتمد')
                : (profile.role === 'guide' ? 'Certified Egyptologist' : 'Executive Chauffeur')
              }
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100 text-xs">
            <div className="flex flex-col items-center justify-center space-y-0.5">
              <span className="text-slate-400 font-bold uppercase text-[8px] tracking-widest">{ratingLabel}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-black text-slate-800">{profile.rating} / 5.0</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-0.5 border-l border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[8px] tracking-widest">{experienceLabel}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-black text-slate-800">{profile.experienceYears} {isAr ? 'سنوات' : 'Years'}</span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="text-right space-y-1.5" dir={isAr ? 'rtl' : 'ltr'}>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{bioLabel}</span>
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              {profile.bio[lang]}
            </p>
          </div>

          {/* Languages spoken */}
          <div className="text-right space-y-1.5" dir={isAr ? 'rtl' : 'ltr'}>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>{languagesLabel}</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.languages[lang].map((langItem, idx) => (
                <span 
                  key={idx} 
                  className="bg-slate-50 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/60"
                >
                  {langItem}
                </span>
              ))}
            </div>
          </div>

          {/* Professional Credentials */}
          <div className="text-right space-y-1.5 pb-2" dir={isAr ? 'rtl' : 'ltr'}>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{credentialsLabel}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              {profile.credentials[lang].map((cred, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-tight text-right">{cred}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-850 text-white font-black text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all shadow"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
