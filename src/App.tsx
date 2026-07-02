import React, { useState, useEffect } from 'react';
import { Compass, Users, BarChart3, Award, Sparkles, PhoneCall, ShieldCheck, Ticket, Download, ArrowRight, X, Heart, MessageSquare, Crown, Utensils, Ship, Plus, Check, Loader2 } from 'lucide-react';
import LanguageSelector from './components/LanguageSelector.js';
import Hero from './components/Hero.js';
import Tours from './components/Tours.js';
import BookingModal from './components/BookingModal.js';
import Dashboard from './components/Dashboard.js';
import AdminDashboard from './components/AdminDashboard.js';
import Chatbot from './components/Chatbot.js';
import EgyptMap from './components/EgyptMap.js';
import PriceConverter from './components/PriceConverter.js';
import VerifiedReviews from './components/VerifiedReviews.js';
import { Tour, CurrencyConfig } from './types.js';
import { translations } from './translations.js';
import { tokens } from './theme/tokens.js';

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [currency, setCurrency] = useState('USD');
  const [role, setRole] = useState<'guest' | 'customer' | 'admin'>('guest');
  const [searchFilters, setSearchFilters] = useState({ query: '', destination: '', date: '' });
  
  // Dialog controls
  const [selectedBookTour, setSelectedBookTour] = useState<Tour | null>(null);
  const [successBookingResult, setSuccessBookingResult] = useState<any | null>(null);

  // App metrics & rates (stateful to support dynamic mock live API rate synchronization!)
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([
    { code: 'USD', symbol: '$', rateToUSD: 1 },
    { code: 'EUR', symbol: '€', rateToUSD: 0.92 },
    { code: 'GBP', symbol: '£', rateToUSD: 0.79 },
    { code: 'EGP', symbol: 'EGP ', rateToUSD: 48.15 },
    { code: 'SAR', symbol: 'SAR ', rateToUSD: 3.75 },
    { code: 'AED', symbol: 'AED ', rateToUSD: 3.67 }
  ]);

  // Load live initial rates from backend on mount
  useEffect(() => {
    const fetchInitialRates = async () => {
      try {
        const response = await fetch('/api/currencies');
        if (response.ok) {
          const data = await response.json();
          setCurrencies(data);
        }
      } catch (err) {
        console.error('Failed to load initial rates from live feed:', err);
      }
    };
    fetchInitialRates();
  }, []);

  // Primary VIP user email context
  const userEmail = 'diamond.entertainment70@gmail.com';

  // Luxury Add-ons states
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [upgradedAddonId, setUpgradedAddonId] = useState<string | null>(null);
  const [upgradeLoadingId, setUpgradeLoadingId] = useState<string | null>(null);

  // Auto-fetch upgrades when booking success is triggered
  useEffect(() => {
    if (successBookingResult && successBookingResult.booking) {
      const fetchRecommendations = async () => {
        setRecLoading(true);
        setUpgradedAddonId(null);
        try {
          const res = await fetch(`/api/bookings/${successBookingResult.booking.id}/recommendations`);
          if (res.ok) {
            const data = await res.json();
            setRecommendations(data);
          }
        } catch (e) {
          console.error('Error fetching luxury recommendations:', e);
        } finally {
          setRecLoading(false);
        }
      };
      fetchRecommendations();
    }
  }, [successBookingResult]);

  const handleApplyUpgrade = async (addon: any) => {
    if (!successBookingResult || !successBookingResult.booking) return;
    setUpgradeLoadingId(addon.id);
    try {
      const res = await fetch(`/api/bookings/${successBookingResult.booking.id}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addonId: addon.id,
          title: addon.title,
          priceUSD: addon.priceUSD,
          icon: addon.icon
        })
      });
      if (res.ok) {
        const updatedBooking = await res.json();
        setUpgradedAddonId(addon.id);
        
        // Update the success booking result in state so the summary and price update in real-time
        setSuccessBookingResult((prev: any) => ({
          ...prev,
          booking: updatedBooking,
          whatsappAlert: lang === 'ar'
            ? `👑 تأكيد الترقية السيادية: تمت إضافة ترقية "${addon.title.ar || addon.title.en}" للحجز ${updatedBooking.id}! تم تحديث الفاتورة والمجموع النهائي.`
            : `👑 MAS Sovereign Upgrade: Secured "${addon.title.en}" for booking ${updatedBooking.id}! Luxury scheduling updated.`
        }));
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to secure upgrade.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating booking details.');
    } finally {
      setUpgradeLoadingId(null);
    }
  };

  const toLocalPrice = (usdPrice: number) => {
    const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
    return parseFloat((usdPrice * activeCurrency.rateToUSD).toFixed(2));
  };

  const formatLocalPrice = (usdPrice: number) => {
    const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
    const price = toLocalPrice(usdPrice);
    return lang === 'ar' 
      ? `${price} ${activeCurrency.symbol}`
      : `${activeCurrency.symbol}${price}`;
  };

  const renderAddonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Helicopter':
        return <Helicopter className="w-5 h-5 text-amber-500" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-500" />;
      case 'Ship':
        return <Ship className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const t = translations[lang];

  // Dynamic layout direction synchronization
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Handle successful reservation transaction
  const handleBookingSuccess = (result: { booking: any; whatsappAlert: string }) => {
    setSelectedBookTour(null);
    setSuccessBookingResult(result);
    // Switch to Customer VIP Portal view so they immediately see their active booking!
    setRole('customer');
  };

  return (
    <div className={`min-h-screen ${tokens.colors.background} ${tokens.colors.textMain} selection:bg-emerald-500 selection:text-white flex flex-col justify-between overflow-x-hidden ${tokens.typography.familySans}`}>
      
      {/* 1. Global Premium Top Bar Navigation Header */}
      <header className={`sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-100 ${tokens.shadows.sm} px-4 md:px-8 py-3.5 flex items-center justify-between`}>
        
        {/* Luxury Brand Logo */}
        <div className="flex items-center gap-2">
          <div className={`bg-gradient-to-tr from-emerald-600 to-emerald-700 p-2.5 ${tokens.borderRadius.button} text-white shadow-md shadow-emerald-600/10 flex items-center justify-center`}>
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className={`text-sm md:text-base font-black uppercase tracking-tight ${tokens.colors.textMain} ${tokens.typography.familySans}`}>
                {t.brandName}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block -mt-0.5">
              PREMIUM LUXURY TOURS
            </span>
          </div>
        </div>

        {/* Pivot View Controller & Locale Selectors */}
        <div className="flex items-center gap-3 md:gap-6">
          
          {/* User Role Switching Rail */}
          <div className={`hidden lg:flex items-center ${tokens.colors.bgMuted} p-1 ${tokens.borderRadius.button} border border-slate-200`}>
            {[
              { id: 'guest', label: lang === 'ar' ? 'كتالوج الرحلات' : 'Tours', icon: Compass },
              { id: 'customer', label: lang === 'ar' ? 'بوابة العميل VIP' : 'My Bookings', icon: Users },
              { id: 'admin', label: lang === 'ar' ? 'وحدة التحكم الإدارية' : 'Admin Dashboard', icon: BarChart3 }
            ].map(item => {
              const Icon = item.icon;
              const isActive = role === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setRole(item.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 ${tokens.borderRadius.input} text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? `${tokens.colors.bgCard} ${tokens.colors.textMain} ${tokens.shadows.sm} border border-slate-200` 
                      : `${tokens.colors.textMuted} hover:text-slate-800`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick mobile dropdown role pivots */}
          <div className="flex lg:hidden">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className={`${tokens.colors.bgMuted} border border-slate-200 text-slate-800 text-xs font-bold ${tokens.borderRadius.input} px-2 py-1.5 focus:outline-none`}
            >
              <option value="guest">{lang === 'ar' ? 'كتالوج الرحلات' : 'Tours'}</option>
              <option value="customer">{lang === 'ar' ? 'بوابة العميل VIP' : 'My Bookings'}</option>
              <option value="admin">{lang === 'ar' ? 'وحدة التحكم' : 'Admin'}</option>
            </select>
          </div>

          {/* Luxury Dropdowns selector component */}
          <LanguageSelector
            lang={lang}
            currency={currency}
            currencies={currencies}
            setLang={setLang}
            setCurrency={setCurrency}
          />

        </div>
      </header>

      {/* 2. Main Content Body Router */}
      <main className="flex-1">
        {role === 'guest' && (
          <div className="space-y-16 pb-20">
            {/* Cinematic Entrance */}
            <Hero 
              lang={lang} 
              onSearch={setSearchFilters} 
            />

            {/* Catalog Grid Section */}
            <div className={`${tokens.spacing.container} space-y-6`}>
              <div className="text-center md:text-left">
                <span className={`${tokens.typography.subtitle} mb-2`}>{t.exploreTours}</span>
                <h2 className={tokens.typography.sectionTitle}>
                  {lang === 'ar' ? 'رحلاتنا الاستكشافية الملكية التوقيعية' : 'Our Signature Tours'}
                </h2>
              </div>
              
              <Tours
                lang={lang}
                currency={currency}
                currencies={currencies}
                searchFilters={searchFilters}
                onSelectBookTour={setSelectedBookTour}
              />
            </div>

            {/* Interactive Egypt Map Navigator */}
            <div className={tokens.spacing.container}>
              <EgyptMap lang={lang} />
            </div>

            {/* Verified Sovereign Reviews Carousel */}
            <div className={tokens.spacing.container}>
              <VerifiedReviews lang={lang} />
            </div>
          </div>
        )}

        {role === 'customer' && (
          <div className={`${tokens.spacing.container} py-10`}>
            <Dashboard
              lang={lang}
              currency={currency}
              currencies={currencies}
              userEmail={userEmail}
              onRefreshAll={() => {}}
            />
          </div>
        )}

        {role === 'admin' && (
          <div className={`${tokens.spacing.containerWide} py-10`}>
            <AdminDashboard
              lang={lang}
              currency={currency}
              currencies={currencies}
              onRefreshAll={() => {}}
            />
          </div>
        )}
      </main>

      {/* 3. Global Premium Footer */}
      <footer className={`${tokens.colors.bgDark} ${tokens.colors.textLight} py-16 px-4 md:px-8 border-t border-slate-900 ${tokens.typography.familySans}`}>
        <div className={`${tokens.spacing.container} grid grid-cols-1 md:grid-cols-4 gap-12 text-xs md:text-sm`}>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Compass className="w-6 h-6 text-emerald-500" />
              <span className="font-black uppercase tracking-wider text-base">{t.brandName}</span>
            </div>
            <p className="leading-relaxed text-slate-500 text-xs font-semibold">
              Your premier gateway to luxury private tours in Egypt. We provide customized journeys with expert guides and premium vehicles. Established in 1994.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">{lang === 'ar' ? 'الخدمات السيادية' : 'Our Fleet'}</h4>
            <ul className="space-y-2 font-medium text-slate-500">
              <li>Mercedes-Benz Vans & Cars</li>
              <li>Luxury Private Yachts</li>
              <li>Professional Tour Guides</li>
              <li>Helicopter Tours</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">{lang === 'ar' ? 'شركاء النخبة' : 'Our Partners'}</h4>
            <ul className="space-y-2 font-medium text-slate-500">
              <li>Four Seasons Resorts Egypt</li>
              <li>Marriott Mena House</li>
              <li>Sofitel Legend Old Cataract</li>
              <li>Cairo Heliport</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">{lang === 'ar' ? 'الاتصال والخدمة' : 'Contact Us'}</h4>
            <div className="space-y-1 font-semibold text-slate-500 text-xs">
              <p>Hotline: +20 (2) 555-MASVIP</p>
              <p>Email: luxury.operations@mas.agency</p>
              <p>Address: Terminal 4, Cairo Airport</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg inline-flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">All Systems Online</span>
            </div>
          </div>

        </div>

        <div className={`${tokens.spacing.container} h-[1px] bg-slate-900 my-12`} />

        <div className={`${tokens.spacing.container} flex flex-col sm:flex-row justify-between items-center text-slate-600 text-xs font-medium gap-4`}>
          <p>© 2026 MAS Agency. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* 4. Luxury Floating Digital Butler Chatbot & Price Converter */}
      <Chatbot lang={lang} />
      <PriceConverter lang={lang} currencies={currencies} onUpdateRates={setCurrencies} />

      {/* 5. Interactive Checkout Booking Modal Dialog */}
      {selectedBookTour && (
        <BookingModal
          tour={selectedBookTour}
          lang={lang}
          currency={currency}
          currencies={currencies}
          onClose={() => setSelectedBookTour(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* 6. Sovereign Ticket Checkout Success Dialog */}
      {successBookingResult && (
        <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in ${tokens.typography.familySans}`}>
          <div className={`${tokens.colors.bgCard} rounded-3xl ${tokens.shadows.xl} max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col md:grid md:grid-cols-12`}>
            
            {/* Left Column: Confirmation & Invoice Details (5 cols) */}
            <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
              <div className={`${tokens.colors.primaryBg} text-white p-6 text-center space-y-2 relative`}>
                <div className="bg-white/20 p-3 rounded-full inline-flex items-center justify-center mb-1 animate-pulse">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black tracking-tight">{lang === 'ar' ? 'تم تأكيد المعاملة الملكية' : 'Booking Confirmed!'}</h3>
                <p className="text-emerald-100 text-xs font-semibold">{lang === 'ar' ? 'تم إرسال تذكرتك عبر واتساب الموثق' : 'We have sent your ticket details to your WhatsApp.'}</p>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className={`${tokens.colors.bgMuted} p-4 ${tokens.borderRadius.button} border border-slate-100 space-y-2.5 text-xs md:text-sm font-medium`}>
                    <div className="flex justify-between">
                      <span className={tokens.colors.textLight}>{lang === 'ar' ? 'معرف الحجز' : 'Booking ID'}</span>
                      <span className={`font-bold ${tokens.colors.textMain} ${tokens.typography.familyMono}`}>{successBookingResult.booking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={tokens.colors.textLight}>{lang === 'ar' ? 'النقل الخاص' : 'Private Car'}</span>
                      <span className={`font-bold ${tokens.colors.textMain}`}>Mercedes-Benz Private Car</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={tokens.colors.textLight}>{lang === 'ar' ? 'رمز التذكرة' : 'Ticket Code'}</span>
                      <span className={`font-bold ${tokens.colors.primaryText} ${tokens.typography.familyMono}`}>{successBookingResult.booking.qrCode}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/60 pt-2.5 mt-1">
                      <span className={tokens.colors.textLight}>{lang === 'ar' ? 'المجموع النهائي' : 'Total Invoice'}</span>
                      <span className={`font-black ${tokens.colors.primaryText}`}>
                        {formatLocalPrice(successBookingResult.booking.totalAmountUSD)}
                      </span>
                    </div>
                    {successBookingResult.booking.luxuryAddon && (
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 mt-2 space-y-1">
                        <span className="block text-[10px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          {lang === 'ar' ? 'الترقية النشطة' : 'Active Sovereign Upgrade'}
                        </span>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">
                            {lang === 'ar' ? successBookingResult.booking.luxuryAddon.title.ar : successBookingResult.booking.luxuryAddon.title.en}
                          </span>
                          <span className="font-bold text-amber-600">
                            +{formatLocalPrice(successBookingResult.booking.luxuryAddon.priceUSD)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp notification log highlight preview */}
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-1">
                    <span className="block text-[9px] text-emerald-800 font-bold uppercase tracking-widest">WhatsApp Message Sent</span>
                    <p className="text-xs text-emerald-700 italic font-semibold leading-relaxed">
                      "{successBookingResult.whatsappAlert}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => {
                      alert(`Downloading Secure PDF invoice/vouchers for booking ${successBookingResult.booking.id}`);
                    }}
                    className={`${tokens.colors.secondaryBg} ${tokens.colors.secondaryHover} text-white font-bold text-xs py-3 ${tokens.borderRadius.button} cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تحميل التذكرة (PDF)' : 'Download PDF'}</span>
                  </button>
                  <button
                    onClick={() => setSuccessBookingResult(null)}
                    className={`${tokens.colors.primaryBg} ${tokens.colors.primaryHover} text-white font-bold text-xs py-3 ${tokens.borderRadius.button} cursor-pointer flex items-center justify-center gap-1`}
                  >
                    <span>{lang === 'ar' ? 'دخول بوابة العميل' : 'My Bookings'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Custom Personalized "Luxury Add-ons" Recommendation Engine (7 cols) */}
            <div className="md:col-span-7 bg-slate-50/50 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Crown className="w-5 h-5 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                      {lang === 'ar' ? 'ترقيات سيادية مخصصة لك' : 'Bespoke Sovereign Upgrades'}
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        MAS Curated
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {lang === 'ar' 
                        ? 'استنادًا إلى تاريخ معاملاتك الفاخرة، نوصي بإضافة هذه الترقيات الحصرية لرحلتك الجديدة'
                        : 'Curated by our Lead Experience Architect based on your royal travel history.'}
                    </p>
                  </div>
                </div>

                {recLoading ? (
                  <div className="space-y-4 py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase animate-pulse">
                        {lang === 'ar' ? 'جاري استشارة منسق الرحلات الملكية...' : 'Consulting Lead Architect...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((addon) => {
                      const isUpgraded = successBookingResult.booking.luxuryAddon?.id === addon.id;
                      return (
                        <div 
                          key={addon.id} 
                          className={`border rounded-2xl p-4 transition-all duration-300 relative overflow-hidden ${
                            isUpgraded 
                              ? 'border-emerald-500/30 bg-emerald-500/[0.02] shadow-sm' 
                              : 'border-amber-500/10 hover:border-amber-500/25 bg-gradient-to-tr from-amber-500/[0.01] to-amber-500/[0.03]'
                          }`}
                        >
                          {/* Reason badge */}
                          <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-block mb-2.5 ${
                            isUpgraded 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-500/10 text-amber-800'
                          }`}>
                            💡 {lang === 'ar' ? addon.reason.ar : addon.reason.en}
                          </div>

                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl mt-0.5 ${isUpgraded ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {isUpgraded ? <Check className="w-5 h-5 text-emerald-600" /> : renderAddonIcon(addon.icon)}
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="font-bold text-slate-800 text-xs md:text-sm">
                                  {lang === 'ar' ? addon.title.ar : addon.title.en}
                                </h5>
                                <span className={`font-black text-xs md:text-sm shrink-0 ${isUpgraded ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {isUpgraded ? (lang === 'ar' ? 'تم الإدراج' : 'Secured') : `+${formatLocalPrice(addon.priceUSD)}`}
                                </span>
                              </div>
                              <p className="text-slate-500 text-[11px] leading-relaxed">
                                {lang === 'ar' ? addon.description.ar : addon.description.en}
                              </p>
                            </div>
                          </div>

                          {/* Upgrade Action Button */}
                          <div className="mt-3 flex justify-end">
                            {isUpgraded ? (
                              <div className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 bg-emerald-100/60 px-3 py-1 rounded-full">
                                <Check className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'تمت إضافة الترقية للحجز' : 'Bespoke Upgrade Integrated'}</span>
                              </div>
                            ) : (
                              <button
                                disabled={upgradeLoadingId !== null}
                                onClick={() => handleApplyUpgrade(addon)}
                                className={`font-bold text-[11px] px-4 py-1.5 rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                                  upgradeLoadingId === addon.id 
                                    ? 'bg-slate-100 border-slate-200 text-slate-400' 
                                    : 'border-amber-500/30 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500'
                                }`}
                              >
                                {upgradeLoadingId === addon.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>{lang === 'ar' ? 'جاري التأكيد...' : 'Securing Clearance...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>{lang === 'ar' ? 'تأكيد هذه الترقية' : 'Integrate Upgrade'}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Trust Badge at the bottom of recommendation section */}
              <div className="pt-4 border-t border-slate-200/60 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>🛡️ {lang === 'ar' ? 'ترقيات معتمدة من وزارة السياحة' : 'MAS Guaranteed Sovereign Clearances'}</span>
                <span>✨ Elite Travel Desk</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
