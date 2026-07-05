import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Key, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { AppLanguage } from '../types.js';

interface AdminSecurityGateProps {
  lang: AppLanguage;
  onVerify: (tier: string) => void;
}

export default function AdminSecurityGate({ lang, onVerify }: AdminSecurityGateProps) {
  const [selectedTier, setSelectedTier] = useState<'admin' | 'operations' | 'crm'>('admin');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = {
    admin: {
      titleEn: 'Sovereign Admin',
      titleAr: 'المدير السيادي المطلق',
      descEn: 'Master administrative access. Full authority over CMS, CRM, and server logs.',
      descAr: 'صلاحيات المدير العام كاملة. تحكم كامل بالمحتوى والعملاء وسجلات التدقيق والأنظمة.',
      pin: '8899',
      clearanceEn: 'Level 3 - Full Security Clearance',
      clearanceAr: 'المستوى ٣ - تصريح أمني شامل'
    },
    operations: {
      titleEn: 'Operations Manager',
      titleAr: 'مدير العمليات والرحلات',
      descEn: 'Schedule personal Egyptologists and executive chauffeurs. Manage coupons.',
      descAr: 'إدارة وتعيين المرشدين الأثريين والسائقين الخصوصيين وجدولة الحجوزات النشطة.',
      pin: '4455',
      clearanceEn: 'Level 2 - Operations Scheduling Clearance',
      clearanceAr: 'المستوى ٢ - تصريح التخطيط والتشغيل'
    },
    crm: {
      titleEn: 'Guest Relations Coordinator',
      titleAr: 'منسق علاقات كبار الشخصيات',
      descEn: 'Access CRM guest database, WhatsApp campaign dispatches, and support ticketing.',
      descAr: 'الوصول لقاعدة بيانات الضيوف، إرسال حملات واتساب المباشرة والرد على تذاكر الدعم.',
      pin: '2233',
      clearanceEn: 'Level 1 - Client Relations Clearance',
      clearanceAr: 'المستوى ١ - تصريح علاقات كبار الضيوف'
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const currentRole = roles[selectedTier];
    if (pin === currentRole.pin) {
      onVerify(currentRole.titleEn);
    } else {
      setError(
        lang === 'ar'
          ? 'رمز الوصول الأمني غير صحيح. يرجى مراجعة إدارة MAS السيادية.'
          : 'Invalid access credentials. Please consult your MAS Security System.'
      );
      setPin('');
    }
  };

  const handleKeypadClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Security Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-emerald-400 relative">
          <Lock className="w-6 h-6 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight font-sans">
          {lang === 'ar' ? 'بوابة التحقق الأمني السيادي' : 'Sovereign Access Clearance Gate'}
        </h3>
        <p className="text-[11px] md:text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          {lang === 'ar'
            ? 'هذه المنطقة محمية ببروتوكولات الأمان MAS من الجيل القادم. يرجى تحديد فئة الامتياز الخاصة بك وإدخال رمز المرور العسكري الخاص بك.'
            : 'This administrative zone is protected under next-generation MAS Security protocols. Select your clearance tier and provide your security passcode.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Tier Selector Column */}
        <div className="md:col-span-7 space-y-4">
          <label className="block text-[10px] uppercase text-slate-500 font-extrabold tracking-widest mb-1">
            {lang === 'ar' ? 'حدد مستوى التصريح المطلوب' : 'SELECT SECURITY CLEARANCE LEVEL'}
          </label>

          <div className="space-y-3">
            {(Object.keys(roles) as Array<keyof typeof roles>).map(key => {
              const r = roles[key];
              const isSelected = selectedTier === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedTier(key);
                    setPin('');
                    setError(null);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-950/40 border-slate-850 hover:border-slate-700/60 text-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500" />
                  )}
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    isSelected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 group-hover:text-slate-300'
                  }`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs md:text-sm">
                        {lang === 'ar' ? r.titleAr : r.titleEn}
                      </span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {lang === 'ar' ? r.clearanceAr : r.clearanceEn}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">
                      {lang === 'ar' ? r.descAr : r.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-850 text-[10px] text-slate-500 space-y-1 font-mono leading-relaxed">
            <span className="font-black text-slate-400 uppercase tracking-widest block mb-0.5">💡 Demo Security Keys</span>
            <p>🔑 {roles.admin.titleEn}: <span className="text-emerald-400 font-bold">{roles.admin.pin}</span></p>
            <p>🔑 {roles.operations.titleEn}: <span className="text-emerald-400 font-bold">{roles.operations.pin}</span></p>
            <p>🔑 {roles.crm.titleEn}: <span className="text-emerald-400 font-bold">{roles.crm.pin}</span></p>
          </div>
        </div>

        {/* Tactical PIN Input & Digital Keypad */}
        <div className="md:col-span-5 bg-slate-950/60 rounded-3xl p-5 border border-slate-850 space-y-4 shadow-inner">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase text-slate-400 font-black tracking-widest">
                  {lang === 'ar' ? 'إدخال رمز PIN المكون من ٤ أرقام' : 'ENTER 4-DIGIT SECURITY PIN'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? (lang === 'ar' ? 'إخفاء' : 'Hide') : (lang === 'ar' ? 'إظهار' : 'Show')}</span>
                </button>
              </div>

              {/* Secure Visual Pin Fields */}
              <div className="flex justify-between gap-2.5 py-1">
                {[0, 1, 2, 3].map((idx) => {
                  const digit = pin[idx];
                  const isFilled = !!digit;
                  return (
                    <div
                      key={idx}
                      className={`h-11 flex-1 rounded-xl flex items-center justify-center font-mono text-base font-black border transition-all duration-300 ${
                        isFilled
                          ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-700'
                      }`}
                    >
                      {isFilled ? (showPin ? digit : '●') : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10.5px] leading-relaxed flex items-start gap-2 animate-fade-in">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Keypad Layout */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadClick(num)}
                  className="h-10 text-xs font-black bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="h-10 text-[9px] font-black uppercase tracking-wider bg-slate-950 hover:bg-slate-900 active:bg-slate-850 text-slate-500 hover:text-slate-300 rounded-lg border border-slate-850 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
              <button
                type="button"
                onClick={() => handleKeypadClick('0')}
                className="h-10 text-xs font-black bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-10 text-[9px] font-black uppercase tracking-wider bg-slate-950 hover:bg-slate-900 active:bg-slate-850 text-slate-500 hover:text-slate-300 rounded-lg border border-slate-850 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                ⌫
              </button>
            </div>

            {/* Verification Trigger Button */}
            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:cursor-not-allowed border border-emerald-700/50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'ar' ? 'التحقق ومنح تصريح الوصول' : 'Verify & Request Access'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
