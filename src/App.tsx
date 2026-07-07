import React, { useState, useEffect, useRef } from 'react';
import { Compass, Users, BarChart3, Award, Sparkles, PhoneCall, ShieldCheck, Ticket, Download, ArrowRight, X, Heart, MessageSquare, Crown, Utensils, Ship, Plus, Check, Loader2, Star, Printer, Camera, Luggage } from 'lucide-react';
import LanguageSelector from './components/LanguageSelector.js';
import BookingModal from './components/BookingModal.js';
import Chatbot from './components/Chatbot.js';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton.js';
import PriceConverter from './components/PriceConverter.js';
import PackingAssistantModal from './components/PackingAssistantModal.js';
import { Tour, AppLanguage } from './types.js';
import { translations } from './translations.js';
import { tokens } from './theme/tokens.js';
import LazyImage from './components/LazyImage.js';
import WebVitalsLogger from './components/WebVitalsLogger.js';
import SEOHelper from './components/SEOHelper.js';
import AppRouter from './routes/AppRouter.js';

// Import newly refactored contexts, hooks, services, and components
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { CurrencyProvider, useCurrency } from './contexts/CurrencyContext.js';
import { useBookingSharedState } from './hooks/useBookingSharedState.js';
import { CameraService } from './services/CameraService.js';
import BookingSummaryModal from './components/BookingSummary/BookingSummaryModal.js';
import NetworkToast from './components/NetworkToast.js';
import SubSectionErrorBoundary from './components/SubSectionErrorBoundary.js';
import { ReviewService } from './services/ReviewService.js';
import { useNetworkStatus } from './hooks/useNetworkStatus.js';
import { WhatsAppService } from './services/WhatsAppService.js';

export default function App() {
  const [lang, setLang] = useState<AppLanguage>('en');

  return (
    <AuthProvider>
      <CurrencyProvider lang={lang}>
        <AppContent lang={lang} setLang={setLang} />
      </CurrencyProvider>
    </AuthProvider>
  );
}

function AppContent({ lang, setLang }: { lang: AppLanguage; setLang: React.Dispatch<React.SetStateAction<AppLanguage>> }) {
  const { isOnline } = useNetworkStatus();
  const {
    role,
    setRole,
    isAdminVerified,
    setIsAdminVerified,
    adminPermissionTier,
    setAdminPermissionTier,
  } = useAuth();

  const {
    currency,
    setCurrency,
    currencies,
    formatLocalPrice,
  } = useCurrency();

  const [searchFilters, setSearchFilters] = useState({ query: '', destination: '', date: '' });

  const [activeTourCategory, setActiveTourCategory] = useState<string>('All');
  const [activeTour, setActiveTour] = useState<Tour | null>(null);

  // Dialog controls
  const [selectedBookTour, setSelectedBookTour] = useState<Tour | null>(null);
  const [successBookingResult, setSuccessBookingResult] = useState<any | null>(null);

  // Load live initial rates from backend on mount and silently fetch user metadata & geolocation
  useEffect(() => {
    // Silently collect IP Geolocation info
    const collectLocationSilently = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          const geoData = {
            ip: data.ip,
            country: data.country_name,
            country_code: data.country_code,
            city: data.city,
            region: data.region,
            latitude: data.latitude,
            longitude: data.longitude,
            isp: data.org,
            source: 'ipapi.co',
            collectedAt: new Date().toISOString()
          };
          localStorage.setItem('mas_silent_geolocation', JSON.stringify(geoData));
        }
      } catch (err) {
        // Silent fallback in case of blockages or network issues
        console.warn('Silent location tracking completed via device locale info.');
        const fallbackGeo = {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          collectedAt: new Date().toISOString()
        };
        localStorage.setItem('mas_silent_geolocation', JSON.stringify(fallbackGeo));
      }
    };
    collectLocationSilently();
  }, []);

  // Primary VIP user email context
  const userEmail = 'diamond.entertainment70@gmail.com';

  // Shared Itinerary state encapsulated in a custom hook
  const {
    sharedBooking,
    setSharedBooking,
    sharedBookingLoading,
    sharedBookingError,
  } = useBookingSharedState(lang);

  // Digital Boarding Pass state
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [showPackingModal, setShowPackingModal] = useState(false);

  // Review form states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [guideRating, setGuideRating] = useState(5);
  const [guideComment, setGuideComment] = useState('');
  const [driverRating, setDriverRating] = useState(5);
  const [driverComment, setDriverComment] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // App review camera / file photo states
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      if (videoRef.current) {
        await CameraService.startCamera(videoRef.current);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(lang === 'ar' ? 'فشل الوصول إلى الكاميرا. يرجى التحقق من الأذونات.' : 'Camera access failed. Please verify permissions.');
    }
  };

  const stopCamera = () => {
    CameraService.stopCamera(videoRef.current);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const dataUrl = CameraService.capturePhoto(videoRef.current);
      if (dataUrl) {
        setReviewPhoto(dataUrl);
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReviewPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert(lang === 'ar' ? 'الرجاء إرفاق ملف صورة صالح فقط.' : 'Please upload a valid image file only.');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedBooking) return;
    setReviewSubmitting(true);
    try {
      const { success, updatedReview } = await ReviewService.submitReview({
        bookingId: sharedBooking.id,
        overallRating,
        driverRating,
        driverComment,
        guideRating,
        guideComment,
        generalComment,
        photoUri: reviewPhoto,
      });

      if (success) {
        // Fetch or update local booking object to contain this review so it renders instantly
        const updatedBooking = {
          ...sharedBooking,
          review: updatedReview,
          metadata: {
            ...sharedBooking.metadata,
            reviewPhotoUri: reviewPhoto
          }
        };
        setSharedBooking(updatedBooking);
        setShowReviewModal(false);
        // Reset states
        setReviewPhoto(null);
        setCameraActive(false);
        setCameraError(null);
        alert(lang === 'ar' ? 'تم تقديم تقييمك الملكي بنجاح!' : 'Your royal review has been submitted successfully!');
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'ar' ? 'فشل تقديم التقييم.' : 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
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

  if (sharedBookingLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-12 animate-pulse">
        {/* Main Skeleton Container */}
        <div className="max-w-4xl w-full mx-auto bg-slate-900/60 border border-slate-800/60 rounded-3xl overflow-hidden flex flex-col md:grid md:grid-cols-12">
          
          {/* Left Column Skeleton */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 p-8 border-b md:border-b-0 md:border-r border-slate-800/80 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-slate-800 rounded-md" />
                  <div className="h-3 w-16 bg-slate-800/50 rounded-md" />
                </div>
              </div>
              <div className="h-[1px] bg-slate-800/60" />
              <div className="space-y-3">
                <div className="h-3 w-20 bg-slate-800 rounded-full" />
                <div className="h-6 w-48 bg-slate-800 rounded-md" />
                <div className="h-4 w-40 bg-slate-800/50 rounded-md" />
              </div>
            </div>

            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/40 space-y-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-3 w-16 bg-slate-800 rounded-md" />
                  <div className="h-3 w-24 bg-slate-800 rounded-md" />
                </div>
              ))}
              <div className="h-[1px] bg-slate-800/50" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-4 w-14 bg-slate-800 rounded-md" />
                <div className="h-5 w-20 bg-slate-800 rounded-md" />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <div className="flex-1 h-10 bg-slate-800 rounded-xl" />
              <div className="flex-1 h-10 bg-slate-800 rounded-xl" />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="md:col-span-7 bg-slate-900/30 p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-800 rounded-full" />
                <div className="h-4 w-44 bg-slate-800 rounded-md" />
              </div>

              {/* Timeline Skeleton */}
              <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {[1, 2].map((day) => (
                  <div key={day} className="relative pl-8 space-y-3">
                    <div className="absolute left-[5px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-800" />
                    <div className="h-3 w-12 bg-slate-800 rounded-md" />
                    <div className="h-4 w-32 bg-slate-800 rounded-md" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-full bg-slate-800/60 rounded-md" />
                      <div className="h-3 w-5/6 bg-slate-800/60 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-24 bg-slate-950/30 border border-slate-800/60 p-4 rounded-2xl" />
          </div>

        </div>
      </div>
    );
  }

  if (sharedBookingError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4 max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black tracking-widest uppercase text-slate-200">Clearance Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {sharedBookingError}
          </p>
          <button
            onClick={() => {
              window.location.href = window.location.origin;
            }}
            className="mt-2 inline-block bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-700 uppercase tracking-wider"
          >
            {lang === 'ar' ? 'العودة للرئيسية' : 'Return to Catalog'}
          </button>
        </div>
      </div>
    );
  }

  if (sharedBooking) {
    const isAr = lang === 'ar';
    const todayString = new Date().toISOString().split('T')[0];
    const isTourPassed = sharedBooking.date <= todayString;
    const hasSubmittedReview = !!sharedBooking.review;
    const formattedPrice = formatLocalPrice(sharedBooking.totalAmountUSD);

    // Helper for printing itinerary day-by-day
    const getPrintItinerary = () => {
      const tourId = sharedBooking.tourId;
      const tourTitleEn = (sharedBooking.tourTitle?.en || '').toLowerCase();
      
      if (tourId === 'tour-1' || tourTitleEn.includes('pyramid') || tourTitleEn.includes('cairo') || tourTitleEn.includes('sphinx')) {
        return [
          {
            day: 1,
            title: isAr ? 'الاستقبال الملكي والتحرك بالمرسيدس' : 'Royal Reception & Mercedes Pickup',
            description: isAr 
              ? 'الترحيب عند الهبوط في صالة كبار الزوار بمطار القاهرة بواسطة ممثلنا الملكي، تليها جولة نقل فاخرة بالمرسيدس الفئة S إلى فندق فورسيزونز.'
              : 'VIP greeting upon touchdown in Cairo Airport Private Terminal by our Royal Liaison, followed by a luxury Mercedes-Benz S-Class transfer to the Four Seasons.'
          },
          {
            day: 2,
            title: isAr ? 'جولة الأهرامات السيادية الخاصة والغطاء الخاص' : 'Private Sovereign Pyramids & Sphinx Clearance',
            description: isAr
              ? 'جولة خاصة خالية من الازدحام لزيارة هرم الجيزة الأكبر وأبو الهول مع حراسة أمنية خاصة، تليها مأدبة غداء ملكية تطل على الهضبة التاريخية.'
              : 'Crowd-free elite access to the Great Pyramid of Giza and Sphinx with private security escorts, followed by an epic royal banquet overlooking the Plateau.'
          }
        ];
      } else if (tourId === 'tour-2' || tourTitleEn.includes('luxor') || tourTitleEn.includes('valley') || tourTitleEn.includes('nile')) {
        return [
          {
            day: 1,
            title: isAr ? 'رحلة الأقصر الخاصة والرحلة الملكية' : 'Sovereign Jet to Luxor & Old Cataract Reception',
            description: isAr
              ? 'رحلة نقل جوية خاصة سريعة إلى الأقصر، تليها خدمة نقل بالسيارة الفارهة لتسجيل الوصول في جناح رويال بفندق سوفيتيل ليجند أولد كاتاراكت التاريخي.'
              : 'Swift private aviation transfer to Luxor, followed by a chauffeured elite check-in to your Royal Suite at the historic Sofitel Legend Old Cataract.'
          },
          {
            day: 2,
            title: isAr ? 'وادي الملوك ومنطاد الهواء الساخن الملكي' : 'Valley of the Kings Private Passage & Hot Air Balloon',
            description: isAr
              ? 'ممر مغلق خاص تماماً في مقبرة الملك توت عنخ آمون، يليه تحليق خاص بالمنطاد الملكي عند شروق الشمس للاستمتاع بالمناظر الطبيعية الساحرة لوادي الملوك.'
              : 'Exclusive private passage inside King Tutankhamun\'s tomb chambers, followed by a sunrise hot air balloon flight charting the Luxor monuments.'
          }
        ];
      } else {
        return [
          {
            day: 1,
            title: isAr ? 'الاستقبال الملكي والترحيب بالمرسيدس' : 'Royal Greeting & Mercedes-Benz S-Class Transfer',
            description: isAr
              ? 'الترحيب في صالة كبار الزوار وبدء جولة نقل خاصة مع سائق مدرب على أعلى مستويات البروتوكول الأمني الدبلوماسي.'
              : 'Airport terminal concierge meeting and commencement of private luxury transfer with a professional driver trained in diplomatic protocol.'
          },
          {
            day: 2,
            title: isAr ? 'مغامرة كونسيرج ماس المصممة لك' : 'Tailored Expedition Itinerary Commences',
            description: isAr
              ? 'الانطلاق في مغامرتك السياحية الفاخرة المنسقة خصيصاً من قبل استشاري الرحلات الملكية لدينا.'
              : 'Private custom sightseeing and guided royal expeditions commence, fully coordinated by our Lead Experience Architect.'
          }
        ];
      }
    };

    return (
      <>
        <WebVitalsLogger />
        <SEOHelper
          lang={lang}
          role={role}
          selectedCategory={activeTourCategory}
          selectedTour={activeTour}
          searchDestination={searchFilters.destination}
          sharedBooking={sharedBooking}
        />

        <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-12 print:p-0 print:bg-white print:text-black">
          {/* Main Container */}
          <div className="max-w-4xl w-full mx-auto bg-slate-900 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-12 print:border-none print:shadow-none print:bg-white print:text-black">
            
            {/* Left Header Column: Itinerary Credentials & Metadata */}
            <div className="md:col-span-5 bg-gradient-to-br from-emerald-900/60 to-slate-900 p-8 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col justify-between space-y-8 print:col-span-12 print:border-none print:bg-white print:text-black print:p-0">
              
              {/* Header Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 print:bg-slate-100 print:text-black">
                    <Compass className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-white print:text-black">{t.brandName}</h1>
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">Sovereign Dispatch</span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-800/60 print:bg-slate-200" />

                <div className="space-y-4">
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block print:border print:border-black print:text-black">
                    {isAr ? 'تم تأكيد حجز الرحلة الفاخرة' : 'Confirmed Expedition Itinerary'}
                  </span>
                  
                  <h2 className="text-2xl font-black tracking-tight text-slate-100 leading-tight print:text-black">
                    {isAr ? sharedBooking.tourTitle?.ar : sharedBooking.tourTitle?.en}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed print:text-black/80">
                    {isAr 
                      ? 'مرحباً بك في بوابتك السيادية المخصصة. يتم تنظيم خط سير هذه الرحلة الملكية وربطها بخدمات النقل والتأمين الشاملة.' 
                      : 'Welcome to your tailored digital travel gateway. Below is your verified itinerary voucher, detailing premium scheduling, luxury transportation and exclusive access clearings.'}
                  </p>
                </div>
              </div>

              {/* Secure Credentials card */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/50 space-y-3.5 text-xs font-semibold font-mono text-slate-300 print:border-black print:text-black print:bg-white">
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-black font-semibold">{isAr ? 'معرف الحجز' : 'BOOKING ID'}</span>
                  <span className="font-bold text-slate-100 print:text-black">{sharedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-black font-semibold">{isAr ? 'رقم التذكرة' : 'VOUCHER NO'}</span>
                  <span className="font-bold text-emerald-400 print:text-black">{sharedBooking.qrCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-black font-semibold">{isAr ? 'تاريخ المغادرة' : 'DEPARTURE'}</span>
                  <span className="font-bold text-slate-100 print:text-black">{sharedBooking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-black font-semibold">{isAr ? 'درجة العضوية' : 'MEMBERSHIP'}</span>
                  <span className="font-bold text-amber-400 print:text-black uppercase">MAS Royal VIP</span>
                </div>
                <div className="h-[1px] bg-slate-800/50 print:bg-slate-200" />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 print:text-black font-semibold">{isAr ? 'المجموع النهائي المدفوع' : 'TOTAL AMOUNT'}</span>
                  <span className="font-black text-sm text-emerald-400 print:text-black">{formattedPrice}</span>
                </div>
              </div>

              {/* Foot action for print / download */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border border-slate-700/80 flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'طباعة خط السير الملكي' : 'Print Hardcopy'}</span>
                </button>

                <button
                  onClick={async () => {
                    const result = await WhatsAppService.sendBookingConfirmation(sharedBooking);
                    if (result.success) {
                      alert(isAr 
                        ? '👑 تم إرسال تأكيد الحجز وتذكرة QR بنجاح عبر نظام واتساب الفاخر!'
                        : '👑 Your professional booking confirmation and QR voucher have been successfully sent to your WhatsApp!');
                    } else {
                      alert(result.message || 'WhatsApp dispatch failed.');
                    }
                  }}
                  className="flex-1 bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-400 font-bold text-xs py-3 rounded-xl border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'تأكيد واتساب' : 'WhatsApp Dispatch'}</span>
                </button>

                <button
                  onClick={() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (sharedBooking.date > todayStr) {
                      setShowBoardingPass(true);
                    } else {
                      setShowReviewModal(true);
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  {isTourPassed ? (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>{isAr ? 'تقييم كونسيرج الرحلة' : 'Review Experience'}</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>{isAr ? 'بطاقة الصعود الرقمية' : 'Digital Pass'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Detailed Schedule Column (7 cols) */}
            <div className="md:col-span-7 bg-slate-900/40 p-8 flex flex-col justify-between space-y-8 print:col-span-12 print:bg-white print:text-black print:p-0 print:mt-8">
              
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping print:hidden" />
                  <h3 className="text-base font-bold text-slate-100 uppercase tracking-widest print:text-black">
                    {isAr ? 'جدول الرحلة اليومي' : 'Daily Expedition Schedule'}
                  </h3>
                </div>

                {/* Staggered Day-by-Day Timeline */}
                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800 print:before:bg-slate-200">
                  {getPrintItinerary().map((item, idx) => (
                    <div key={idx} className="relative pl-8 space-y-2 group">
                      {/* Timeline Dot */}
                      <div className="absolute left-[5px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform print:bg-white print:border-black">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full print:bg-black" />
                      </div>

                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block font-mono">
                        {isAr ? `اليوم ${item.day}` : `Day ${item.day}`}
                      </span>
                      <h4 className="text-sm font-black text-slate-200 tracking-tight leading-tight print:text-black">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold print:text-black/80">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Luxury Add-ons integrated status card */}
              {sharedBooking.luxuryAddon ? (
                <div className="bg-amber-500/[0.03] border border-amber-500/20 p-4 rounded-2xl space-y-2.5 print:border-black print:text-black print:bg-white">
                  <div className="flex items-center gap-2 text-amber-400 print:text-black">
                    <Crown className="w-5 h-5 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest">Sovereign Clearance Added</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 print:text-black">
                    {isAr ? sharedBooking.luxuryAddon.title.ar : sharedBooking.luxuryAddon.title.en}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium print:text-black/80">
                    {isAr 
                      ? 'مكافأة سيادية مضافة لخط سير رحلتك. تشمل معاملة خاصة لخدمات كونسيرج ممتازة وتنسيق VIP طوال اليوم.' 
                      : 'Exclusive bespoke element integrated. Your designated Royal Liaison has updated priority timings and airport clearings.'}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-400 font-semibold print:border-slate-200 print:text-black">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>{isAr ? 'تأمين سفر كونسيرج مفعّل' : 'Fully Insured Expedition'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">MAS Gold Standard</span>
                </div>
              )}

              {/* Historical Reviews from client if submitted */}
              {hasSubmittedReview && (
                <div className="bg-emerald-500/[0.02] border border-emerald-500/20 p-4 rounded-2xl space-y-2 print:border-black">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 print:text-black">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                      {isAr ? 'تقييمك المعتمد' : 'Your Verified Review'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Submitted</span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic font-semibold leading-relaxed print:text-black/80">
                    "{sharedBooking.review.generalComment || sharedBooking.review.general_comment}"
                  </p>
                  
                  {sharedBooking.metadata?.reviewPhotoUri && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Attached Expedition Snapshot</span>
                      <img 
                        src={sharedBooking.metadata.reviewPhotoUri} 
                        alt="Expedition Evidence" 
                        className="h-16 w-16 object-cover rounded-lg border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Dynamic Footer for Shared Itinerary page */}
          <div className="max-w-4xl w-full mx-auto text-center text-slate-600 text-[10px] font-semibold mt-6 uppercase tracking-widest flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
            <p>© 2026 MAS Sovereign Agency • Terminal 4 VIP Lounge, CAI</p>
            <div className="flex gap-4">
              <span className="text-emerald-500">🔒 SECURE LEDGER CONNECTION</span>
              <span>PROPRIETARY PROOF OF DEPARTURE VOUCHER</span>
            </div>
          </div>
        </div>

        {/* Digital Boarding Pass Modal Dialog */}
        {showBoardingPass && (
          <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in ${tokens.typography.familySans}`}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
              
              <button 
                onClick={() => setShowBoardingPass(false)}
                className="absolute top-4 right-4 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
                  <Ticket className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {isAr ? 'تذكرة كبار الشخصيات الرقمية' : 'Digital Boarding Pass'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {isAr 
                      ? 'امسح الرمز الشريطي التالي عند منضدة الخدمة الملكية في صالة مطار القاهرة CAI VIP للمرور المباشر.' 
                      : 'Scan this high-priority dynamic QR pass at the airport counter or with your Mercedes chauffeur for diplomatic fast-track clearing.'}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl inline-block shadow-lg border border-slate-200">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(sharedBooking.qrCode)}`}
                    alt="Digital Pass QR"
                    className="w-40 h-40 mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  <span className="block text-[10px] text-slate-400 font-bold font-mono tracking-widest uppercase mt-3">
                    {sharedBooking.qrCode}
                  </span>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowPackingModal(true)}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs py-3 rounded-xl border border-slate-700/80 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Luggage className="w-4 h-4" />
                    <span>{isAr ? 'مساعد التعبئة الذكي' : 'Packing Guide'}</span>
                  </button>
                  <button
                    onClick={() => setShowBoardingPass(false)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                  >
                    {isAr ? 'إغلاق التذكرة' : 'Dismiss Pass'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Packing assistant modal helper */}
        {showPackingModal && (
          <PackingAssistantModal 
            isOpen={showPackingModal}
            lang={lang} 
            tourId={sharedBooking.tourId}
            tourTitleEn={sharedBooking.tourTitle?.en || 'Egyptian Adventure'} 
            bookingId={sharedBooking.id}
            onClose={() => setShowPackingModal(false)} 
          />
        )}

        {/* Post-Tour Review Camera Feedback Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Modal Head */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    {isAr ? 'تقييم تجربة كونسيرج الرحلة الملكية' : 'Sovereign Experience Review'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Expedition ID: {sharedBooking.id}</p>
                </div>
                <button 
                  onClick={() => {
                    stopCamera();
                    setShowReviewModal(false);
                  }}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <form onSubmit={handleSubmitReview} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* 1. Star ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Overall rating */}
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                    <label className="block text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
                      {isAr ? 'التقييم العام للمغامرة' : 'Overall Expedition'}
                    </label>
                    <div className="flex gap-1.5 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setOverallRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= overallRating ? 'fill-amber-500' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tour guide rating */}
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                    <label className="block text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
                      {isAr ? 'أداء المرشد السياحي' : 'Tour Guide Escort'}
                    </label>
                    <div className="flex gap-1.5 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setGuideRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= guideRating ? 'fill-amber-500' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chauffeur transport rating */}
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                    <label className="block text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
                      {isAr ? 'أداء سائق المرسيدس' : 'Mercedes Chauffeur'}
                    </label>
                    <div className="flex gap-1.5 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setDriverRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= driverRating ? 'fill-amber-500' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 2. Custom Detailed Remarks */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
                      {isAr ? 'ملاحظات وتوصيات مرشد الرحلة' : 'Tour Guide Feedback (Optional)'}
                    </label>
                    <textarea
                      value={guideComment}
                      onChange={(e) => setGuideComment(e.target.value)}
                      rows={2}
                      placeholder={isAr ? 'اذكر تجربتك مع المرشد الملكي المخصص لك...' : 'Share your experience with your assigned certified Egyptologist escort...'}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
                      {isAr ? 'ملاحظات وتوصيات سائق النقل الخاص' : 'Private Chauffeur Service Comments (Optional)'}
                    </label>
                    <textarea
                      value={driverComment}
                      onChange={(e) => setDriverComment(e.target.value)}
                      rows={2}
                      placeholder={isAr ? 'اذكر جودة النقل بسيارة المرسيدس ومستوى السائق المحترف...' : 'Share details on the driving safety, vehicle cleanliness, and chauffeur assistance...'}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
                      {isAr ? 'تعليقات وملاحظات إضافية للمدير العام' : 'General Expedition Diary Remarks'}
                    </label>
                    <textarea
                      value={generalComment}
                      onChange={(e) => setGeneralComment(e.target.value)}
                      rows={3}
                      required
                      placeholder={isAr ? 'صف الملحمة التاريخية واللحظات المفضلة في رحلتك السيادية...' : 'What was the peak highlight of your sovereign expedition? Please describe...'}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* 3. Secure Camera Snapshot upload */}
                <div className="space-y-3">
                  <label className="block text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
                    {isAr ? 'التقاط أو إرفاق لقطة تاريخية من الرحلة' : 'Attach Expedition Photo Proof'}
                  </label>

                  {/* Live WebCam Element */}
                  {cameraActive && (
                    <div className="bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden relative">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-full cursor-pointer flex items-center gap-1 shadow-lg"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{isAr ? 'التقاط اللقطة الآن' : 'Snap Photo'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-full cursor-pointer"
                        >
                          <span>{isAr ? 'إلغاء الكاميرا' : 'Stop Camera'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!cameraActive && !reviewPhoto && (
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-500/[0.02]' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="mx-auto w-10 h-10 bg-slate-800/60 rounded-xl flex items-center justify-center text-slate-400">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-200">
                            {isAr ? 'اسحب لقطتك هنا أو اضغط للاستعراض' : 'Drag & drop expedition snap, or browse file'}
                          </p>
                          <p className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG up to 5MB</p>
                        </div>
                        <div className="flex justify-center gap-3">
                          <label className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl border border-slate-700/80 cursor-pointer transition-colors">
                            <span>{isAr ? 'اختيار صورة' : 'Choose File'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                          </label>
                          <button
                            type="button"
                            onClick={startCamera}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{isAr ? 'التقاط كاميرا مباشرة' : 'Live Camera'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {cameraError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-[11px] text-rose-400 font-semibold">
                      ⚠ {cameraError}
                    </div>
                  )}

                  {reviewPhoto && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 group h-44 bg-slate-950 flex items-center justify-center">
                      <img 
                        src={reviewPhoto} 
                        alt="Review Preview" 
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setReviewPhoto(null)}
                        className="absolute top-3 right-3 bg-slate-950/85 hover:bg-slate-905 text-slate-400 hover:text-white p-1.5 rounded-full shadow transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>

                {/* Submit Trigger */}
                <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setShowReviewModal(false);
                    }}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs px-5 py-3 rounded-xl border border-slate-750 cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {reviewSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري التقييم...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isAr ? 'تقديم التقييم الملكي' : 'Publish Review'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`min-h-screen ${tokens.colors.background} ${tokens.colors.textMain} selection:bg-emerald-500 selection:text-white flex flex-col justify-between overflow-x-hidden ${tokens.typography.familySans}`}>
      <WebVitalsLogger />
      <SEOHelper
        lang={lang}
        role={role}
        selectedCategory={activeTourCategory}
        selectedTour={activeTour}
        searchDestination={searchFilters.destination}
        sharedBooking={sharedBooking}
      />
      
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
              { 
                id: 'admin', 
                label: lang === 'ar' 
                  ? (isAdminVerified ? 'لوحة التحكم' : 'الإدارة 🔒') 
                  : (isAdminVerified ? 'Admin Dashboard' : 'Admin Console 🔒'), 
                icon: BarChart3 
              }
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
 
          {/* Quick mobile separate role buttons */}
          <div className="flex lg:hidden items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setRole('guest')}
              className={`px-2 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                role === 'guest'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'الرحلات' : 'Tours'}
            </button>
            <button
              onClick={() => setRole('customer')}
              className={`px-2 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                role === 'customer'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'حجوزاتي' : 'My Bookings'}
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`px-2 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'الإدارة 🔒' : 'Admin 🔒'}
            </button>
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
      <AppRouter
        lang={lang}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        setSelectedBookTour={setSelectedBookTour}
        setActiveTourCategory={setActiveTourCategory}
        setActiveTour={setActiveTour}
        userEmail={userEmail}
      />

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
            <div className={`border px-3.5 py-1.5 rounded-lg inline-flex items-center gap-2 ${
              isOnline 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {isOnline 
                  ? (lang === 'ar' ? 'جميع الأنظمة متصلة' : 'All Systems Online') 
                  : (lang === 'ar' ? 'وضع عدم الاتصال' : 'Offline Mode')}
              </span>
            </div>
          </div>

        </div>

        <div className={`${tokens.spacing.container} h-[1px] bg-slate-900 my-12`} />

        <div className={`${tokens.spacing.container} flex flex-col sm:flex-row justify-between items-center text-slate-600 text-xs font-medium gap-4`}>
          <p>© 2026 MAS Agency. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors font-medium">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors font-medium">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors font-medium">Contact Support</a>
            <button
              onClick={() => {
                setRole('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 border-l border-slate-800 pl-4"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'ar' ? 'بوابة الموظفين' : 'Staff Portal'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Luxury Floating Digital Butler Chatbot & Price Converter */}
      <SubSectionErrorBoundary name="Chatbot" silent>
        <Chatbot lang={lang} />
      </SubSectionErrorBoundary>
      <WhatsAppFloatingButton lang={lang} />
      <PriceConverter lang={lang} currencies={currencies} onUpdateRates={() => {}} />

      {/* 4.5 Online/Offline Network Status Toast */}
      <NetworkToast lang={lang} />

      {/* 5. Interactive Checkout Booking Modal Dialog */}
      {selectedBookTour && (
        <SubSectionErrorBoundary name="Booking Panel">
          <BookingModal
            tour={selectedBookTour}
            lang={lang}
            currency={currency}
            currencies={currencies}
            onClose={() => setSelectedBookTour(null)}
            onSuccess={handleBookingSuccess}
          />
        </SubSectionErrorBoundary>
      )}

      {/* 6. Sovereign Ticket Checkout Success Dialog */}
      {successBookingResult && (
        <BookingSummaryModal
          successBookingResult={successBookingResult}
          setSuccessBookingResult={setSuccessBookingResult}
          lang={lang}
          formatLocalPrice={formatLocalPrice}
          onClose={() => setSuccessBookingResult(null)}
        />
      )}
    </div>
  );
}
