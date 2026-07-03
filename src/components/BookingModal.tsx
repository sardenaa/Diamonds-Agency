import React, { useState, useEffect } from 'react';
import { X, CreditCard, ChevronRight, ChevronLeft, ShieldCheck, Ticket, Calendar, UserCheck, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Tour, CurrencyConfig, Traveler } from '../types.js';
import { translations } from '../translations.js';
import SignaturePad from './SignaturePad.js';

interface BookingModalProps {
  tour: Tour;
  lang: 'en' | 'ar';
  currency: string;
  currencies: CurrencyConfig[];
  onClose: () => void;
  onSuccess: (result: { booking: any; whatsappAlert: string }) => void;
}

export default function BookingModal({
  tour,
  lang,
  currency,
  currencies,
  onClose,
  onSuccess
}: BookingModalProps) {
  const t = translations[lang];
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNationality, setCustomerNationality] = useState('United States');
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [date, setDate] = useState(tour.availableDates[0] || '');
  const [travelerCount, setTravelerCount] = useState(1);
  const [travelers, setTravelers] = useState<Traveler[]>([{ name: '', ageGroup: 'adult' }]);
  const [pickupHotel, setPickupHotel] = useState(tour.hotels[0] || '');
  const [roomNumber, setRoomNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0); // percentage
  const [couponMessage, setCouponMessage] = useState('');
  const [couponValid, setCouponValid] = useState<boolean | null>(null);

  // Sync travelers list when count changes
  useEffect(() => {
    const count = Math.max(1, travelerCount);
    setTravelers((prev) => {
      const next = [...prev];
      if (next.length < count) {
        for (let i = next.length; i < count; i++) {
          next.push({ name: '', ageGroup: 'adult' });
        }
      } else if (next.length > count) {
        return next.slice(0, count);
      }
      return next;
    });
  }, [travelerCount]);

  // Convert USD to local currency
  const toLocalPrice = (usdPrice: number) => {
    return parseFloat((usdPrice * activeCurrency.rateToUSD).toFixed(2));
  };

  const formatLocalPrice = (usdPrice: number) => {
    const price = toLocalPrice(usdPrice);
    return lang === 'ar' 
      ? `${price} ${activeCurrency.symbol}`
      : `${activeCurrency.symbol}${price}`;
  };

  // Cost calculations
  const baseCostUSD = tour.priceUSD * travelerCount;
  const extrasCostUSD = selectedExtras.reduce((sum, extId) => {
    const ext = tour.extras.find(e => e.id === extId);
    return sum + (ext ? ext.priceUSD : 0);
  }, 0);

  const subtotalUSD = baseCostUSD + extrasCostUSD;
  const discountUSD = subtotalUSD * (couponDiscount / 100);
  const totalUSD = subtotalUSD - discountUSD;

  // Verify Coupon Code via API
  const handleVerifyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch('/api/coupons/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (data.valid) {
        setCouponDiscount(data.discountPercent);
        setCouponValid(true);
        setCouponMessage(`${t.couponValid} (-${data.discountPercent}%)`);
      } else {
        setCouponDiscount(0);
        setCouponValid(false);
        setCouponMessage(t.couponInvalid);
      }
    } catch (e) {
      console.error(e);
      setCouponMessage('Error verifying coupon.');
    }
  };

  const toggleExtra = (extId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extId) ? prev.filter((id) => id !== extId) : [...prev, extId]
    );
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: any) => {
    setTravelers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Submit Booking Checkout
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    if (!signatureUrl) {
      alert(lang === 'ar' 
        ? 'الرجاء توقيع اتفاقية الخدمة الفاخرة رقمياً قبل متابعة الدفع.' 
        : 'Please sign the digital luxury service agreement before finalizing your reservation.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour.id,
          customerName,
          customerEmail,
          customerPhone,
          customerNationality,
          date,
          travelerCount,
          travelers,
          pickupHotel,
          roomNumber,
          specialRequests,
          paymentMethod,
          couponCode: couponValid ? couponCode : undefined,
          selectedExtras,
          currency: currency,
          signatureUrl
        })
      });

      if (res.status === 211) {
        const result = await res.json();
        onSuccess(result);
      } else {
        alert('Booking transaction encountered an error. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error checking out booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{t.brandName}</span>
            <h3 className="text-base md:text-lg font-bold font-sans tracking-tight">
              {lang === 'ar' ? tour.title.ar : tour.title.en}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-100 h-1 w-full relative">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300 absolute top-0" 
            style={{ 
              width: `${(step / 4) * 100}%`,
              left: lang === 'ar' ? 'auto' : 0,
              right: lang === 'ar' ? 0 : 'auto'
            }}
          />
        </div>

        {/* Form Body */}
        <form onSubmit={handleCheckout} className="flex-1 overflow-y-auto p-6 flex flex-col">
          
          {/* Step 1: Lead Customer Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'ar' ? 'تفاصيل الاتصال الأساسية' : 'Contact Information'}</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={lang === 'ar' ? 'الاسم الثلاثي' : 'e.g. John Doe'}
                    className="w-full text-slate-900 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input
                    required
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full text-slate-900 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === 'ar' ? 'رقم الهاتف (واتساب)' : 'Phone Number (WhatsApp)'}</label>
                  <input
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 415-555-2671"
                    className="w-full text-slate-900 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === 'ar' ? 'الجنسية' : 'Nationality'}</label>
                  <input
                    required
                    type="text"
                    value={customerNationality}
                    onChange={(e) => setCustomerNationality(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full text-slate-900 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date, Pickup & Companions */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'ar' ? 'خيارات الجدولة والمرافقين' : 'Select Date & Travelers'}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === 'ar' ? 'تاريخ المغادرة' : 'Departure Date'}</label>
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-slate-900 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {tour.availableDates.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{lang === 'ar' ? 'فندق الاصطحاب' : 'Pickup Hotel Venue'}</label>
                  <select
                    value={pickupHotel}
                    onChange={(e) => setPickupHotel(e.target.value)}
                    className="w-full text-slate-900 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {tour.hotels.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.roomNo}</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Suite 408"
                    className="w-full text-slate-900 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">{lang === 'ar' ? 'عدد المسافرين' : 'Number of Travelers'}</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={travelerCount <= 1}
                      onClick={() => setTravelerCount(prev => Math.max(1, prev - 1))}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold px-2">{travelerCount}</span>
                    <button
                      type="button"
                      disabled={travelerCount >= tour.capacity}
                      onClick={() => setTravelerCount(prev => Math.min(tour.capacity, prev + 1))}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Travelers Info List */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl max-h-40 overflow-y-auto border border-slate-100">
                  {travelers.map((tr, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <span className="text-xs font-bold text-slate-500">{lang === 'ar' ? `المسافر ${idx + 1}` : `Traveler ${idx + 1}`}</span>
                      <input
                        required
                        type="text"
                        placeholder={idx === 0 ? customerName || 'Lead Name' : `Name`}
                        value={tr.name}
                        onChange={(e) => updateTraveler(idx, 'name', e.target.value)}
                        className="text-slate-900 text-xs border border-slate-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <select
                          value={tr.ageGroup}
                          onChange={(e) => updateTraveler(idx, 'ageGroup', e.target.value as any)}
                          className="text-slate-900 text-xs border border-slate-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none flex-1"
                        >
                          <option value="adult">{lang === 'ar' ? 'بالغ (12+)' : 'Adult (12+)'}</option>
                          <option value="child">{lang === 'ar' ? 'طفل (2-11)' : 'Child (2-11)'}</option>
                          <option value="infant">{lang === 'ar' ? 'رضيع (0-2)' : 'Infant (0-2)'}</option>
                        </select>
                        <input
                          type="text"
                          placeholder={t.passportOptional}
                          value={tr.passportNumber || ''}
                          onChange={(e) => updateTraveler(idx, 'passportNumber', e.target.value)}
                          className="text-slate-900 text-xs border border-slate-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none flex-1 max-w-[100px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: VIP Extras */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.selectExtras}</span>
              </h4>

              <div className="space-y-3">
                {tour.extras.map((ext) => {
                  const isSelected = selectedExtras.includes(ext.id);
                  return (
                    <div
                      key={ext.id}
                      onClick={() => toggleExtra(ext.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/5' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // toggled on container div click
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300"
                        />
                        <div>
                          <p className="text-xs md:text-sm font-bold text-slate-800">
                            {lang === 'ar' ? ext.name.ar : ext.name.en}
                          </p>
                          <p className="text-[10px] text-amber-500 font-bold uppercase mt-0.5">{lang === 'ar' ? 'تعديل سيادي كبار الشخصيات' : 'VIP UPGRADE'}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 font-sans">
                        +{formatLocalPrice(ext.priceUSD)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.specialRequests}</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: نظام غذائي نباتي، خادم ناطق بالألمانية...' : 'e.g. Vegetarian diet, German-speaking escort, private wheel chair...'}
                  rows={2}
                  className="w-full text-slate-900 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Payments and Final Summary */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>{t.payMethod}</span>
              </h4>

              {/* Promo Coupon Module */}
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.couponCode}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. MASGOLD"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-sm focus:outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCoupon}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    {t.couponApply}
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs font-bold mt-2 ${couponValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Payment Methods selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Credit Card', 'Google Pay', 'PayPal', 'Pay at Pickup'].map(method => (
                  <label
                    key={method}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer text-center transition-all ${
                      paymentMethod === method 
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <CreditCard className="w-4 h-4 mb-1 text-slate-500" />
                    <span className="text-xs font-bold whitespace-nowrap">{method}</span>
                  </label>
                ))}
              </div>

              {/* Final Receipt Specs Ledger */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-slate-700 font-medium text-xs md:text-sm">
                <h5 className="font-bold text-slate-800 uppercase tracking-wide text-[10px] mb-2">{t.confirmBooking}</h5>
                <div className="flex justify-between">
                  <span>{t.duration}</span>
                  <span className="font-bold text-slate-900">{tour.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'سعر المقعد' : 'Seat Price'} ({travelerCount}x)</span>
                  <span className="font-bold text-slate-900 font-sans">{formatLocalPrice(tour.priceUSD * travelerCount)}</span>
                </div>
                {extrasCostUSD > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{lang === 'ar' ? 'الميزات الإضافية كبار الشخصيات' : 'VIP Extras'}</span>
                    <span className="font-bold font-sans">+{formatLocalPrice(extrasCostUSD)}</span>
                  </div>
                )}
                <div className="h-[1px] bg-slate-200 my-1" />
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-bold text-slate-900 font-sans">{formatLocalPrice(subtotalUSD)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{t.discount} (-{couponDiscount}%)</span>
                    <span className="font-bold font-sans">-{formatLocalPrice(discountUSD)}</span>
                  </div>
                )}
                <div className="h-[1px] bg-slate-200 my-1" />
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>{t.total}</span>
                  <span className="text-emerald-600 font-sans">{formatLocalPrice(totalUSD)}</span>
                </div>
              </div>

              {/* Sovereign Luxury Agreement Signature */}
              <SignaturePad lang={lang} onSave={setSignatureUrl} />
            </div>
          )}

        </form>

        {/* Footer controls */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-emerald-500/10 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>{lang === 'ar' ? 'جاري تأمين المعاملة...' : 'Booking...'}</span>
            ) : (
              <>
                <span>{step === 4 ? t.checkoutBtn : lang === 'ar' ? 'الخطوة التالية' : 'Continue'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
