import React, { useState } from 'react';
import { Search, MapPin, Calendar, Compass, Star } from 'lucide-react';
import { translations } from '../translations.js';
import { AppLanguage } from '../types.js';

interface HeroProps {
  lang: AppLanguage;
  onSearch: (filters: { query: string; destination: string; date: string }) => void;
}

export default function Hero({ lang, onSearch }: HeroProps) {
  const t = translations[lang];
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, destination, date });
    
    // Smooth scroll to tours section
    const element = document.getElementById('excursions-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const destinations = [
    { en: 'Cairo', ar: 'القاهرة' },
    { en: 'Luxor', ar: 'الأقصر' },
    { en: 'Sharm El Sheikh', ar: 'شرم الشيخ' },
    { en: 'Aswan', ar: 'أسوان' },
    { en: 'Hurghada', ar: 'الغردقة' }
  ];

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white py-20 px-4 md:px-8">
      {/* Cinematic Background Image & Ambient Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* High-Resolution Majestic Sunset at Giza Pyramids */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 animate-subtle-zoom opacity-40 transition-all duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600577916048-804c9191e36c?auto=format&fit=crop&q=80&w=2000')`
          }}
        />

        {/* Cinematic Video Overlay (with Pyramids Image as poster and fallback) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-lighten pointer-events-none"
          poster="https://images.unsplash.com/photo-1600577916048-804c9191e36c?auto=format&fit=crop&q=80&w=2000"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-camels-walking-in-front-of-the-egyptian-pyramids-41846-large.mp4" type="video/mp4" />
        </video>
        
        {/* Soft elegant glowing orbs/auroras in the background for luxury ambiance */}
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[35rem] h-[35rem] bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        {/* Master Dark Overlays for pristine text legibility */}
        <div className="absolute inset-0 bg-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto flex flex-col items-center text-center">
        {/* Small Tagline with micro-glow */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md animate-fade-in">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">
            {t.tagline}
          </span>
        </div>

        {/* Large Cinematic Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-[1.1] max-w-4xl font-serif">
          {lang === 'ar' ? (
            <span>
              عش تجربة مصر بترف <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500">غير مسبوق</span>
            </span>
          ) : (
            <span>
              Experience Egypt in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500 font-serif">Unrivaled Luxury</span>
            </span>
          )}
        </h1>

        {/* Description */}
        <p className="text-base md:text-xl text-slate-300 max-w-2xl mb-12 font-medium leading-relaxed">
          {t.heroSubheadline}
        </p>

        {/* Bento Search Box */}
        <form 
          onSubmit={handleSearchSubmit}
          className="w-full max-w-4xl bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-3 md:p-4 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-3 items-center transition-all duration-500 focus-within:border-amber-500/40 focus-within:shadow-[0_0_30px_rgba(245,158,11,0.15),_inset_0_1px_0_rgba(255,255,255,0.2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),_0_20px_50px_rgba(0,0,0,0.4)]"
        >
          {/* Keyword Search Input */}
          <div className="w-full flex-1 flex items-center gap-3 px-3 py-2 border-b border-white/10 md:border-b-0 md:border-r border-white/20">
            <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                onSearch({ query: val, destination, date });
              }}
              className="bg-transparent w-full focus:outline-none text-white text-sm placeholder-slate-400 font-medium"
            />
          </div>

          {/* Destination Selector */}
          <div className="w-full md:w-56 flex items-center gap-3 px-3 py-2 border-b border-white/10 md:border-b-0 md:border-r border-white/20">
            <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="w-full relative">
              <label className="absolute -top-3.5 left-0 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                {t.searchDestination}
              </label>
              <select
                value={destination}
                onChange={(e) => {
                  const val = e.target.value;
                  setDestination(val);
                  onSearch({ query, destination: val, date });
                }}
                className="bg-transparent w-full focus:outline-none text-white text-sm font-medium cursor-pointer border-none p-0 pr-6"
                style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundPosition: lang === 'ar' ? 'left 0 center' : 'right 0 center', backgroundRepeat: 'no-repeat', backgroundSize: '12px' }}
              >
                <option value="" className="text-slate-950 bg-white">All Destinations</option>
                {destinations.map((dest) => (
                  <option key={dest.en} value={dest.en} className="text-slate-950 bg-white">
                    {lang === 'ar' ? dest.ar : dest.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selector */}
          <div className="w-full md:w-48 flex items-center gap-3 px-3 py-2 border-b border-white/10 md:border-b-0 md:border-r border-white/20">
            <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="w-full relative">
              <label className="absolute -top-3.5 left-0 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                {t.searchDate}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  const val = e.target.value;
                  setDate(val);
                  onSearch({ query, destination, date: val });
                }}
                className="bg-transparent w-full focus:outline-none text-white text-xs font-medium cursor-pointer border-none p-0 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Search Button with premium shine */}
          <button
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
            <span>{t.searchBtn}</span>
          </button>
        </form>

        {/* Premium Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full max-w-4xl text-slate-400 font-medium">
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold text-amber-400 font-sans">100%</span>
            <span className="text-xs uppercase tracking-wider mt-1">{lang === 'ar' ? 'رحلات خاصة بالكامل' : 'Private Tours'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold text-emerald-400 font-sans">5★</span>
            <span className="text-xs uppercase tracking-wider mt-1">{lang === 'ar' ? 'سائقين مرخصين ومحترفين' : 'Expert Drivers'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold text-amber-400 font-sans">24/7</span>
            <span className="text-xs uppercase tracking-wider mt-1">{lang === 'ar' ? 'مساعد خاص خادم شخصي' : 'Support Team'}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold text-emerald-400 font-sans">$0</span>
            <span className="text-xs uppercase tracking-wider mt-1">{lang === 'ar' ? 'لا عمولات أو تكاليف مخفية' : 'No Hidden Fees'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
