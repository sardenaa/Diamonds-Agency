import React, { useState, useEffect } from 'react';
import { Coins, RefreshCw, X, ArrowUpDown, ChevronDown, Check, TrendingUp, Info } from 'lucide-react';
import { CurrencyConfig } from '../types.js';

interface PriceConverterProps {
  lang: 'en' | 'ar';
  currencies: CurrencyConfig[];
  onUpdateRates: (newRates: CurrencyConfig[]) => void;
}

export default function PriceConverter({ lang, currencies, onUpdateRates }: PriceConverterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EGP');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Auto-refresh rate loader
  const refreshRates = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/currencies');
      if (response.ok) {
        const data = await response.json();
        onUpdateRates(data);
        setLastUpdated(new Date().toLocaleTimeString());
        
        const successMsg = lang === 'ar' 
          ? 'تم تحديث أسعار الصرف الحية من نظام الصرافة السيادي بنجاح!'
          : 'Live exchange rates fetched successfully from Sovereign Operations Portal!';
        
        setAlertMsg(successMsg);
        setTimeout(() => setAlertMsg(null), 3000);
      }
    } catch (e) {
      console.error('Error fetching live rates:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Convert calculations
  const getConvertedValue = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return '0.00';
    
    const fromConfig = currencies.find(c => c.code === fromCurrency);
    const toConfig = currencies.find(c => c.code === toCurrency);
    
    if (!fromConfig || !toConfig) return '0.00';
    
    // amount is in fromCurrency. Convert fromCurrency to USD first, then to toCurrency.
    // rateToUSD means: 1 USD = rateToUSD unit (e.g. 1 USD = 48.5 EGP).
    // So to get USD value: amount / fromConfig.rateToUSD
    // Then to get toCurrency value: (amount / fromConfig.rateToUSD) * toConfig.rateToUSD
    const valueInUSD = numAmount / fromConfig.rateToUSD;
    const finalValue = valueInUSD * toConfig.rateToUSD;
    
    return finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Translations object
  const t = {
    title: { en: 'Sovereign Rate Feed', ar: 'أسعار الصرف السيادية' },
    calculator: { en: 'Luxury Price Converter', ar: 'محول الأسعار الفاخرة' },
    syncNow: { en: 'Fetch Live Forex Rates', ar: 'تحديث الأسعار الآن' },
    syncedAt: { en: 'Synced at', ar: 'آخر تحديث في' },
    amount: { en: 'Amount to convert', ar: 'المبلغ المراد تحويله' },
    from: { en: 'From', ar: 'من' },
    to: { en: 'To', ar: 'إلى' },
    result: { en: 'Converted Premium Value', ar: 'القيمة الفاخرة المحولة' },
    triggerBtn: { en: 'Price Converter', ar: 'محول الأسعار' },
    rateList: { en: 'Current Exchange Rates (Base: 1 USD)', ar: 'أسعار الصرف الحالية (الأساس: 1 دولار)' }
  };

  return (
    <div className="fixed bottom-6 left-6 z-45 font-sans" id="price-converter-root">
      {/* Trigger floating button */}
      {!isOpen && (
        <button
          id="price-converter-trigger"
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 border border-slate-700/50 group cursor-pointer"
        >
          <Coins className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black tracking-wide hidden sm:inline-block pr-1">
            {t.triggerBtn[lang]}
          </span>
          <span className="flex h-2 w-2 relative -top-2 -right-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Expanded converter card */}
      {isOpen && (
        <div 
          id="price-converter-card" 
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-[350px] w-[90vw] overflow-hidden animate-fade-in flex flex-col"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-tr from-amber-500 to-amber-300 p-2 rounded-xl text-slate-950 shadow">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">
                  {t.calculator[lang]}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    {t.title[lang]}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sync status feed bar */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>{t.syncedAt[lang]}: {lastUpdated}</span>
            </span>

            <button
              onClick={refreshRates}
              disabled={isRefreshing}
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-black"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t.syncNow[lang]}</span>
            </button>
          </div>

          {/* Inner Content Body */}
          <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
            {/* Status alerts */}
            {alertMsg && (
              <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2 animate-pulse">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{alertMsg}</span>
              </div>
            )}

            {/* Form inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">
                  {t.amount[lang]}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Currency Selects grid */}
              <div className="grid grid-cols-7 gap-1 items-center">
                <div className="col-span-3">
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">
                    {t.from[lang]}
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-extrabold text-slate-700 cursor-pointer"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol.trim()})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={swapCurrencies}
                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-800 border border-slate-200 bg-white shadow-sm"
                    title="Swap Currencies"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="col-span-3">
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">
                    {t.to[lang]}
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-extrabold text-slate-700 cursor-pointer"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol.trim()})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculation Result */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-5 pointer-events-none">
                  <Coins className="w-16 h-16 text-white" />
                </div>
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {t.result[lang]}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl md:text-2xl font-black text-amber-400">
                    {getConvertedValue()}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {toCurrency}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-medium">
                  1 {fromCurrency} = {((currencies.find(c => c.code === toCurrency)?.rateToUSD || 1) / (currencies.find(c => c.code === fromCurrency)?.rateToUSD || 1)).toFixed(4)} {toCurrency}
                </p>
              </div>
            </div>

            {/* List of current rates */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="block text-[9px] text-slate-400 uppercase font-black tracking-wider">
                {t.rateList[lang]}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                {currencies.map(c => {
                  if (c.code === 'USD') return null;
                  return (
                    <div key={c.code} className="bg-slate-50/70 p-2 rounded-xl border border-slate-100 flex justify-between items-center">
                      <span className="text-slate-800">{c.code}</span>
                      <span className="font-mono text-emerald-600">{c.rateToUSD.toFixed(3)} {c.symbol}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center gap-1.5 justify-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Sovereign Financial Ledger v1.4</span>
          </div>

        </div>
      )}
    </div>
  );
}
