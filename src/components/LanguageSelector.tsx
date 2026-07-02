import React, { useEffect } from 'react';
import { Globe, Coins } from 'lucide-react';
import { CurrencyConfig } from '../types.js';

interface LanguageSelectorProps {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  currency: string;
  setCurrency: (code: string) => void;
  currencies: CurrencyConfig[];
}

export default function LanguageSelector({
  lang,
  setLang,
  currency,
  setCurrency,
  currencies
}: LanguageSelectorProps) {

  // Dynamically set dir="rtl" or "ltr" on html element based on current language selection
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang);
  }, [lang]);

  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
      {/* Language Switcher */}
      <div className="flex items-center gap-1.5">
        <Globe className="w-4 h-4 text-emerald-600" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as 'en' | 'ar')}
          className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer border-none p-0 pr-6 select-none"
          style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231e293b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundPosition: lang === 'ar' ? 'left 0 center' : 'right 0 center', backgroundRepeat: 'no-repeat', backgroundSize: '12px' }}
        >
          <option value="en" className="text-slate-900 bg-white">English</option>
          <option value="ar" className="text-slate-900 bg-white">العربية (RTL)</option>
        </select>
      </div>

      <div className="w-[1px] h-4 bg-slate-200" />

      {/* Currency Switcher */}
      <div className="flex items-center gap-1.5">
        <Coins className="w-4 h-4 text-amber-500" />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer border-none p-0 pr-6 select-none"
          style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231e293b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundPosition: lang === 'ar' ? 'left 0 center' : 'right 0 center', backgroundRepeat: 'no-repeat', backgroundSize: '12px' }}
        >
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code} className="text-slate-900 bg-white">
              {curr.code} ({curr.symbol.trim()})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

