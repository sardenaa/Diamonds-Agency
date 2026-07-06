import React, { useState, useEffect } from 'react';
import { Compass, Users, BarChart3, Award, Sparkles, PhoneCall, ShieldCheck, Ticket, Download, ArrowRight, X, Heart, MessageSquare, Crown, Utensils, Ship, Plus, Check, Loader2, Star, Printer, Camera, Luggage, Wifi, WifiOff } from 'lucide-react';
import LanguageSelector from './components/LanguageSelector.js';
import Hero from './components/Hero.js';
import Tours from './components/Tours.js';
import BookingModal from './components/BookingModal.js';
import Dashboard from './components/Dashboard.js';
import AdminSecurityGate from './components/AdminSecurityGate.js';
import Chatbot from './components/Chatbot.js';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton.js';
import PriceConverter from './components/PriceConverter.js';
import VerifiedReviews from './components/VerifiedReviews.js';
import PackingAssistantModal from './components/PackingAssistantModal.js';
import { Tour, CurrencyConfig, AppLanguage } from './types.js';
import { translations } from './translations.js';
import { tokens } from './theme/tokens.js';
import LazyImage from './components/LazyImage.js';
import WebVitalsLogger from './components/WebVitalsLogger.js';
import SEOHelper from './components/SEOHelper.js';

// Code splitting optimization for production performance
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard.js'));
const EgyptMap = React.lazy(() => import('./components/EgyptMap.js'));

// Custom Suspense Spinner fallback for premium experience
const SuspenseFallback = ({ message }: { message: string }) => (
  <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse font-mono">
      {message}
    </span>
  </div>
);


export default function App() {
  const [lang, setLang] = useState<AppLanguage>('en');
  const [currency, setCurrency] = useState('USD');
  const [role, setRole] = useState<'guest' | 'customer' | 'admin'>('guest');
  const [searchFilters, setSearchFilters] = useState({ query: '', destination: '', date: '' });

  const [activeTourCategory, setActiveTourCategory] = useState<string>('All');
  const [activeTour, setActiveTour] = useState<Tour | null>(null);

  // Admin Security States
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(() => {
    return localStorage.getItem('mas_admin_verified') === 'true';
  });
  const [adminPermissionTier, setAdminPermissionTier] = useState<string>(() => {
    return localStorage.getItem('mas_admin_tier') || 'Sovereign Admin';
  });
  
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

  // Load live initial rates from backend on mount and silently fetch user metadata & geolocation
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

  // Shared Itinerary state
  const [sharedBooking, setSharedBooking] = useState<any | null>(null);
  const [sharedBookingLoading, setSharedBookingLoading] = useState(false);
  const [sharedBookingError, setSharedBookingError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share-itinerary') || params.get('view-itinerary');
    if (shareId) {
      const fetchSharedBooking = async () => {
        setSharedBookingLoading(true);
        setSharedBookingError(null);
        try {
          const res = await fetch(`/api/bookings/${shareId}`);
          if (res.ok) {
            const data = await res.json();
            setSharedBooking(data);
          } else {
            setSharedBookingError(lang === 'ar' 
              ? 'لم يتم العثور على حجز تفاصيل الرحلة المشارك أو انتهت صلاحيته.' 
              : 'Itinerary reservation not found or expired.');
          }
        } catch (e) {
          console.error(e);
          setSharedBookingError(lang === 'ar'
            ? 'فشل استرجاع تفاصيل الرحلة الملكية من نظام التوزيع.'
            : 'Failed to retrieve expedition itinerary.');
        } finally {
          setSharedBookingLoading(false);
        }
      };
      fetchSharedBooking();
    }
  }, [lang]);

  // Automatic Print Effect for "Prepare for Departure"
  useEffect(() => {
    if (sharedBooking) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('print') === 'true') {
        const timer = setTimeout(() => {
          window.print();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [sharedBooking]);

  // Digital Boarding Pass state
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [showPackingModal, setShowPackingModal] = useState(false);

  // Online / Offline connection state
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showNetworkToast, setShowNetworkToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    let hideTimer: any;

    const handleOnline = () => {
      setIsOnline(true);
      setToastType('online');
      setShowNetworkToast(true);
      
      // Auto-hide the "Restored" toast after 4 seconds
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setShowNetworkToast(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastType('offline');
      setShowNetworkToast(true);
      
      // Keep offline notice visible longer so the user is well informed
      if (hideTimer) clearTimeout(hideTimer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

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
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(lang === 'ar' ? 'فشل الوصول إلى الكاميرا. يرجى التحقق من الأذونات.' : 'Camera access failed. Please verify permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
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
      const res = await fetch(`/api/bookings/${sharedBooking.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          overallRating,
          components: {
            chauffeur: {
              rating: driverRating,
              comment: driverComment
            },
            guide: {
              rating: guideRating,
              comment: guideComment
            },
            itinerary: {
              rating: overallRating,
              comment: generalComment
            },
            catering: {
              rating: overallRating,
              comment: ''
            }
          },
          generalComment,
          photoUri: reviewPhoto
        })
      });
      if (res.ok) {
        // Fetch or update local booking object to contain this review so it renders instantly
        const updatedBooking = {
          ...sharedBooking,
          review: {
            submittedAt: new Date().toISOString(),
            overallRating,
            components: {
              chauffeur: { rating: driverRating, comment: driverComment },
              guide: { rating: guideRating, comment: guideComment },
              itinerary: { rating: overallRating, comment: generalComment }
            },
            generalComment
          },
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
      } else {
        alert(lang === 'ar' ? 'فشل تقديم التقييم.' : 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

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
        return <Sparkles className="w-5 h-5 text-amber-500" />;
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

  if (sharedBookingLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4 max-w-sm">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          <h2 className="text-sm font-black tracking-widest uppercase text-slate-200">Syncing Dispatch Ledger...</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Establishing secure encrypted connection with MAS central luxury dispatch ledger. Please wait...
          </p>
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
    const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
    const localTotal = (sharedBooking.totalAmountUSD * activeCurrency.rateToUSD).toFixed(2);
    const formattedPrice = isAr 
      ? `${localTotal} ${activeCurrency.symbol}`
      : `${activeCurrency.symbol}${localTotal}`;

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
              ? 'يقوم سائقنا المحترف باصطحابك من فندقك الفاخر بسيارة مرسيدس V-Class خاصة مع مناشف مبردة ومشروبات فاخرة.'
              : 'Our professional chauffeur picks you up from your luxury hotel in a private Mercedes V-Class with chilled towels and premium refreshments.'
          },
          {
            day: 2,
            title: isAr ? 'دخول حصري للهرم الأكبر' : 'Exclusive Great Pyramid Access',
            description: isAr
              ? 'تجاوز جميع خطوط الانتظار العامة. امشِ عبر الغرف الخاصة لخوفو مع مرشدك الأكاديمي المخصص لشرح الأسرار القديمة.'
              : 'Bypass all public lines. Walk through the private chambers of Khufu with your dedicated scholar guide explaining ancient secrets.'
          },
          {
            day: 3,
            title: isAr ? 'ركوب الجمال الملكي في الصحراء وغداء فاخر' : 'Royal Desert Camel Ride & Gourmet Lunch',
            description: isAr
              ? 'اركب الجمال الصحراوية الفاخرة أو الدراجات الرباعية إلى جناحنا الخاص. استمتع بقائمة طعام 5 نجوم مع خلفية الأهرامات.'
              : 'Ride premium desert camels or quad bikes to our private pavilion. Enjoy a 5-star catering menu with pyramids backdrop.'
          }
        ];
      } else if (tourId === 'tour-2' || tourTitleEn.includes('nile') || tourTitleEn.includes('dahabiya') || tourTitleEn.includes('luxor') || tourTitleEn.includes('aswan')) {
        return [
          {
            day: 1,
            title: isAr ? 'الصعود على الدهبية وجولة البر الشرقي الخاصة' : 'Boarding the Dahabiya & East Bank Private Tour',
            description: isAr
              ? 'اصعد على متن يخت الدهبية الفاخر فائق الخصوصية. تذوق مشروبات الترحيب المخصصة تليها جولة غروب ساحرة داخل معبد الكرنك.'
              : 'Embark on our ultra-private luxury Dahabiya yacht. Savor custom welcoming drinks followed by a curated twilight walk inside Karnak Temple.'
          },
          {
            day: 2,
            title: isAr ? 'وادي الملوك الفاخر ومقبرة سيتي الأول' : 'VIP Valley of the Kings & Seti I Tomb',
            description: isAr
              ? 'انزل إلى مقبرة سيتي الأول الحصرية (المغلقة عادةً أمام الجمهور العام) ومقبرة توت عنخ آمون. إبحار بعد الظهر مع شاي بعد الظهر الفاخر.'
              : 'Descend into the exclusive Tomb of Seti I (normally closed to general public) and Tutankhamun. Afternoon sail with luxury afternoon high tea.'
          },
          {
            day: 3,
            title: isAr ? 'معبد إدفو وعشاء اليخوت الملكي' : 'Temple of Edfu & Royal Gala Dinner',
            description: isAr
              ? 'قم بزيارة معبد إدفو عبر عربة تجرها الخيول الفاخرة. اختتم الرحلة بعشاء ملكي فاخر على ضوء الشموع على جزيرة في النيل.'
              : 'Visit Edfu temple via luxury horse-drawn carriage. End the journey with a candlelit royal gala dinner on an island on the Nile.'
          }
        ];
      } else {
        return [
          {
            day: 1,
            title: isAr ? 'صعود كبار الشخصيات في المارينا' : 'VIP Boarding at Marina',
            description: isAr
              ? 'الوصول عبر خدمة النقل الفاخرة الخاصة بمرسيدس. اصعد إلى يختك الخاص الرائع مع كوب مبرد من العصير الفوار الفاخر.'
              : 'Arrive via private Mercedes luxury transport. Step onto your pristine private yacht with a glass of premium sparkling juice.'
          },
          {
            day: 2,
            title: isAr ? 'الغوص ورأس محمد سنوركلينج' : 'Ras Mohammed Snorkeling & Coral Dives',
            description: isAr
              ? 'أبحر إلى يولاندا ريف. استكشف حطام السفن تحت الماء والحدائق المرجانية النابضة بالحياة برفقة عالم أحياء مائية خاص.'
              : 'Sail to Yolanda Reef. Explore underwater shipwrecks and vibrant gardens accompanied by a private marine biologist.'
          },
          {
            day: 3,
            title: isAr ? 'وليمة استاكوزا طازجة على اليخت وإبحار الغروب' : 'On-Deck Lobster Feast & Sunset Sail',
            description: isAr
              ? 'تذوق غداءً من الاستاكوزا المشوية والجمبري الطازج. ارتشف المشروبات اللذيذة على السرير الشمسي بينما نبحر عائدين على طول ساحل سيناء في الساعة الذهبية.'
              : 'Savor a freshly grilled lobster and prawn lunch. Sip cocktails on the sunbed as we cruise back along the Sinai coast during golden hour.'
          }
        ];
      }
    };

    // Gallery images selection logic
    const tourId = sharedBooking.tourId;
    const tourTitleEn = (sharedBooking.tourTitle?.en || '').toLowerCase();
    
    let galleryImages = [
      {
        url: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=600',
        title: isAr ? 'الهرم الأكبر بالجيزة' : 'The Great Pyramid of Giza',
        category: isAr ? 'موقع أثري' : 'Historical Site'
      },
      {
        url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=600',
        title: isAr ? 'الرحلة الملكية على الجمال' : 'Royal Camel Expedition',
        category: isAr ? 'سفاري الصحراء' : 'Desert Safari'
      },
      {
        url: 'https://images.unsplash.com/photo-1580834316135-26dbcc09be35?auto=format&fit=crop&q=80&w=600',
        title: isAr ? 'تمثال أبو الهول الأسطوري' : 'The Great Sphinx Guarding',
        category: isAr ? 'عجيبة قديمة' : 'Ancient Marvel'
      },
      {
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600',
        title: isAr ? 'أعمدة معبد الكرنك' : 'Karnak Temple Pillars',
        category: isAr ? 'العمارة الفرعونية' : 'Dynastic Architecture'
      },
      {
        url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=600',
        title: isAr ? 'يخت سيادي خاص بطول 80 قدمًا' : 'Sovereign 80ft Private Yacht',
        category: isAr ? 'ميثاق خاص' : 'Private Charter'
      },
      {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600',
        title: isAr ? 'سفاري الشعاب المرجانية برأس محمد' : 'Ras Mohammed Reef Safari',
        category: isAr ? 'استكشاف الأعماق' : 'Marine Exploration'
      }
    ];

    if (tourId === 'tour-1' || tourTitleEn.includes('pyramid') || tourTitleEn.includes('cairo') || tourTitleEn.includes('sphinx')) {
      galleryImages = [
        {
          url: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'الهرم الأكبر بالجيزة' : 'The Great Pyramid of Giza',
          category: isAr ? 'موقع أثري' : 'Historical Site'
        },
        {
          url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'الرحلة الملكية على الجمال' : 'Royal Camel Expedition',
          category: isAr ? 'سفاري الصحراء' : 'Desert Safari'
        },
        {
          url: 'https://images.unsplash.com/photo-1580834316135-26dbcc09be35?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'تمثال أبو الهول الأسطوري' : 'The Great Sphinx Guarding',
          category: isAr ? 'عجيبة قديمة' : 'Ancient Marvel'
        },
        {
          url: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'القاهرة ونهر النيل الذهبي' : 'Cairo & The Golden Nile',
          category: isAr ? 'إطلالة بانورامية' : 'Panoramic View'
        },
        {
          url: 'https://images.unsplash.com/photo-1601579621414-ab7e31b7be2a?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'شارع المعز التاريخي' : 'El Moez Historic Street',
          category: isAr ? 'التراث الثقافي' : 'Cultural Heritage'
        },
        {
          url: 'https://images.unsplash.com/photo-1568322422390-0ec4fc98fa35?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'غروب الشمس السيادي فوق الجيزة' : 'Sovereign Sunset Over Giza',
          category: isAr ? 'مشاهدة خاصة' : 'Elite Viewing'
        }
      ];
    } else if (tourId === 'tour-2' || tourTitleEn.includes('nile') || tourTitleEn.includes('dahabiya') || tourTitleEn.includes('luxor') || tourTitleEn.includes('aswan')) {
      galleryImages = [
        {
          url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'أعمدة معبد الكرنك' : 'Karnak Temple Pillars',
          category: isAr ? 'العمارة الفرعونية' : 'Dynastic Architecture'
        },
        {
          url: 'https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'المحاريب المقدسة' : 'The Sacred Sanctuaries',
          category: isAr ? 'جوهرة أثرية' : 'Archaeological Jewel'
        },
        {
          url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'إبحار الدهبية الخاصة في النيل' : 'Private Nile Dahabiya Sailing',
          category: isAr ? 'إبحار ملكي' : 'Sovereign Cruise'
        },
        {
          url: 'https://images.unsplash.com/photo-1502475418167-15c0f40a158e?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'معبد الملكة حتشبسوت' : 'Queen Hatshepsut Temple',
          category: isAr ? 'الإرث الفرعوني' : 'Pharaonic Legacy'
        },
        {
          url: 'https://images.unsplash.com/photo-1599818815128-444c18c187be?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'الواجهة المهيبة لأبو سمبل' : 'Abu Simbel Majestic Facade',
          category: isAr ? 'صرح ملكي' : 'Imperial Monument'
        },
        {
          url: 'https://images.unsplash.com/photo-1572252009286-268acec5a0af?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'شفق النيل الذهبي' : 'Nile River Golden Twilight',
          category: isAr ? 'أمسية خاصة' : 'Bespoke Evening'
        }
      ];
    } else if (tourId === 'tour-3' || tourTitleEn.includes('sharm') || tourTitleEn.includes('yacht') || tourTitleEn.includes('red sea') || tourTitleEn.includes('reef')) {
      galleryImages = [
        {
          url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'يخت سيادي خاص بطول 80 قدمًا' : 'Sovereign 80ft Private Yacht',
          category: isAr ? 'ميثاق خاص' : 'Private Charter'
        },
        {
          url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'سفاري الشعاب المرجانية برأس محمد' : 'Ras Mohammed Reef Safari',
          category: isAr ? 'استكشاف الأعماق' : 'Marine Exploration'
        },
        {
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'مياه سيناء الفيروزية' : 'Crystalline Sinai Waters',
          category: isAr ? 'ملاذ ساحلي' : 'Coastal Sanctuary'
        },
        {
          url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'أفق البحر الأحمر الذهبي' : 'Red Sea Golden Horizon',
          category: isAr ? 'غروب الشمس الساحر' : 'Sunbed Sunset'
        },
        {
          url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'حدائق المرجان الملونة' : 'Sub-aquatic Coral Gardens',
          category: isAr ? 'محمية طبيعية' : 'Eco-Safari VIP'
        },
        {
          url: 'https://images.unsplash.com/photo-1607627000458-210e8d261a7b?auto=format&fit=crop&q=80&w=600',
          title: isAr ? 'مرسى الخليج الخاص' : 'Private Cove Anchorage',
          category: isAr ? 'ملاذ مخصص' : 'Bespoke Escape'
        }
      ];
    }

    return (
      <>
        <WebVitalsLogger />
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans print:hidden" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Public Header */}
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl px-4 md:px-8 py-4 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-emerald-600 to-emerald-700 p-2.5 rounded-xl text-white shadow-lg flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm md:text-base font-black uppercase tracking-tight text-white">
                    {t.brandName}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block -mt-0.5">
                  EXCLUSIVE ITINERARY PORTAL
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                window.location.href = window.location.origin;
              }}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl transition-all font-bold uppercase tracking-wider border border-slate-800"
            >
              {isAr ? 'حجز مغامرة فاخرة' : 'Book a Tour'}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-1 space-y-6">
          
          {/* Welcome Banner */}
          <div className="text-center space-y-2 pb-2">
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3.5 py-1 rounded-full font-black uppercase tracking-widest font-mono">
              VIP COMPASS VOYAGE PASS
            </span>
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase">
              {isAr ? 'تفاصيل مسار الرحلة الفاخرة المعتمد' : 'EXPEDITION CLEARANCE ITINERARY'}
            </h1>
            <p className="text-xs text-slate-400 font-medium max-w-xl mx-auto">
              {isAr
                ? 'مستند تفاعلي معتمد لمسار الرحلة والتحقق من التفاصيل اللوجستية للمرافق والسائق والمرشد الأثري الخاص.'
                : 'Interactive shared VIP clearance detailing live routing, personal chauffeur updates, and archaeological guide assignment.'}
            </p>
          </div>

          {/* Ledger Main Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">RESERVATION ID</span>
                <span className="text-sm font-black font-mono text-white bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl uppercase">
                  {sharedBooking.id}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider border ${
                  sharedBooking.status === 'confirmed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {sharedBooking.status === 'confirmed' ? t.confirmed : t.pending}
                </span>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider border ${
                  sharedBooking.paymentStatus === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {sharedBooking.paymentStatus === 'paid' ? t.paid : t.unpaid}
                </span>
              </div>
            </div>

            {/* Tour Title Block */}
            <div className="space-y-2">
              <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block">VIP TOUR SELECTION</span>
              <h2 className="text-lg md:text-2xl font-black text-white font-sans tracking-tight leading-tight">
                {isAr ? sharedBooking.tourTitle.ar : sharedBooking.tourTitle.en}
              </h2>
            </div>

            {/* Grid Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{t.searchDate}</span>
                <p className="text-slate-200 text-sm font-extrabold">{sharedBooking.date}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{t.pickupHotel}</span>
                <p className="text-slate-200 text-sm font-extrabold">
                  {sharedBooking.pickupHotel} {sharedBooking.roomNumber ? `(Room ${sharedBooking.roomNumber})` : ''}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{t.driver}</span>
                <p className="text-emerald-400 text-sm font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  {sharedBooking.driverName || (isAr ? 'جاري تعيين سائق مخصص...' : 'Assigning Luxury Driver...')}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{t.guide}</span>
                <p className="text-amber-400 text-sm font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                  {sharedBooking.guideName || (isAr ? 'جاري تعيين مرشد أثري...' : 'Assigning Personal Egyptologist...')}
                </p>
              </div>
            </div>

            {/* Special Requests */}
            {sharedBooking.specialRequests && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">SPECIAL INSTRUCTIONS</span>
                <p className="text-slate-300 text-xs font-semibold leading-relaxed">{sharedBooking.specialRequests}</p>
              </div>
            )}

            {/* Luxury Upgrade Addon if present */}
            {sharedBooking.luxuryAddon && (
              <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-5 rounded-2xl border border-amber-500/20 flex items-center gap-4">
                <div className="bg-amber-500/10 p-3 rounded-xl text-amber-400">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest block">SECURED BESPOKE INTEGRATION</span>
                  <h4 className="font-extrabold text-sm text-white">
                    {isAr ? sharedBooking.luxuryAddon.title.ar : sharedBooking.luxuryAddon.title.en}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Premium private upgrade clearance certified.
                  </p>
                </div>
              </div>
            )}

            {/* Sovereign Signature visualization */}
            {sharedBooking.signatureUrl && (
              <div className="border border-slate-800 bg-slate-950 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>VIP LUXURY AGREEMENT</span>
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold max-w-sm">
                    This expedition charter agreement is digitally authorized and sealed by the traveler to confirm bespoke itinerary coordination.
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-800 shrink-0 select-none">
                  <img src={sharedBooking.signatureUrl} alt="VIP Signature Seal" className="h-12 w-40 object-contain block" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}

            {/* Total Ledger Summary */}
            <div className="flex justify-between items-center bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">TOTAL EXPEDITION VALUE</span>
              <span className="text-lg md:text-2xl font-black text-emerald-400 font-sans tracking-tight">{formattedPrice}</span>
            </div>

            {/* 24/7 VIP Emergency Assistance Desk */}
            <div className="bg-slate-950 border border-rose-500/20 p-5 rounded-2xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-500 shrink-0 mt-0.5 animate-pulse">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase">
                        {isAr ? 'دعم طوارئ كبار الشخصيات على مدار الساعة' : '24/7 VIP EMERGENCY ASSISTANCE'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-tight">
                      {isAr ? 'مكتب اتصال المساعد المباشر الفاخر' : "Diamond Agency's VIP Concierge"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      {isAr
                        ? 'تواصل مباشرة مع مندوب خدمة العملاء الفائقة لأي مساعدة أو تعديل طارئ لمسار الرحلة.'
                        : 'Immediate one-tap direct connection to your dedicated lead travel architect.'}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono font-bold uppercase shrink-0 text-left sm:text-right">
                  {isAr ? 'الخط الساخن متاح دائماً' : 'Sovereign Priority Line'}
                  <p className="text-rose-400 text-xs font-black mt-0.5 font-sans">+20 120 218 1834</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href="tel:+201202181834"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/20 uppercase tracking-wider group cursor-pointer text-center"
                >
                  <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                  <span>{isAr ? 'اتصال هاتفي بنقرة واحدة' : 'One-Tap Voice Call'}</span>
                </a>

                <a
                  href="https://wa.me/201202181834"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-800 uppercase tracking-wider group cursor-pointer text-center"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>{isAr ? 'إرسال رسالة مباشرة' : 'Direct VIP Message'}</span>
                </a>
              </div>
            </div>

            {/* Sharing & Boarding Pass Actions */}
            <div className="border-t border-slate-800/60 pt-5 mt-4 space-y-4">
              {/* Show review summary if already submitted */}
              {hasSubmittedReview && (
                <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {isAr ? 'تم تقديم تقييمك بنجاح' : 'ROYAL EXPEDITION REVIEW RECORDED'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'التقييم العام:' : 'Overall Experience:'}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (sharedBooking.review?.overallRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {sharedBooking.review?.components?.guide && (
                      <div className="text-[11px] text-slate-300">
                        <p className="font-bold text-slate-200">
                          👨‍🏫 {isAr ? 'تقييم المرشد الأثري:' : 'Certified Egyptologist:'}{' '}
                          <span className="text-amber-400 font-black">{sharedBooking.review.components.guide.rating}/5</span>
                        </p>
                        {sharedBooking.review.components.guide.comment && (
                          <p className="text-slate-400 italic mt-0.5 pl-4 border-l border-slate-800">
                            "{sharedBooking.review.components.guide.comment}"
                          </p>
                        )}
                      </div>
                    )}
                    {sharedBooking.review?.components?.chauffeur && (
                      <div className="text-[11px] text-slate-300">
                        <p className="font-bold text-slate-200">
                          🚗 {isAr ? 'تقييم السائق الخاص:' : 'Private Chauffeur:'}{' '}
                          <span className="text-amber-400 font-black">{sharedBooking.review.components.chauffeur.rating}/5</span>
                        </p>
                        {sharedBooking.review.components.chauffeur.comment && (
                          <p className="text-slate-400 italic mt-0.5 pl-4 border-l border-slate-800">
                            "{sharedBooking.review.components.chauffeur.comment}"
                          </p>
                        )}
                      </div>
                    )}
                    {sharedBooking.review?.generalComment && (
                      <div className="text-[11px] text-slate-300 border-t border-slate-800 pt-2 mt-2">
                        <span className="text-slate-400 font-bold uppercase">{isAr ? 'التعليق العام:' : 'General Comment:'}</span>
                        <p className="text-slate-200 italic mt-0.5">"{sharedBooking.review.generalComment}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    isAr
                      ? `مرحباً! إليك مسار رحلتنا الفاخرة المعتمدة لجولتنا القادمة "${sharedBooking.tourTitle.ar}" في ${sharedBooking.date}. رقم الحجز: ${sharedBooking.id}. يمكنك الاطلاع على كامل التفاصيل والمسار المباشر وسائق المرسيدس الخاص من هنا:\n\n${window.location.href}`
                      : `Hello! Here is our official luxury travel itinerary for our upcoming "${sharedBooking.tourTitle.en}" on ${sharedBooking.date}. Reservation ID: ${sharedBooking.id}. View live routing, personal chauffeur details, and digital boarding pass here:\n\n${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/20 uppercase tracking-wider group border border-emerald-500/20 cursor-pointer text-center"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current group-hover:scale-110 transition-transform shrink-0">
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.458 3.477 1.328 5.004l-1.411 5.15 5.27-1.383c1.479.807 3.14 1.231 4.801 1.231 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm5.787 14.397c-.237.669-1.189 1.228-1.642 1.277-.453.048-.901.218-2.909-.575-2.573-1.018-4.212-3.645-4.34-3.816-.128-.17-1.026-1.365-1.026-2.604 0-1.24.646-1.849.873-2.102.227-.253.495-.316.66-.316.165 0 .33.003.474.01.152.007.356-.057.557.426.206.495.706 1.724.767 1.85.061.127.102.274.018.443-.083.17-.124.274-.248.417-.124.143-.261.32-.372.43-.124.124-.253.259-.11.505.143.245.635 1.047 1.365 1.696.942.837 1.737 1.096 1.985 1.219.248.123.392.102.536-.062.144-.165.619-.723.784-.97.165-.247.33-.206.557-.123.227.082 1.444.68 1.691.804.248.124.413.186.475.294.062.108.062.624-.175 1.293z" />
                  </svg>
                  <span>{isAr ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}</span>
                </a>

                <button
                  onClick={() => setShowBoardingPass(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/20 uppercase tracking-wider group border border-amber-400/20 cursor-pointer"
                >
                  <Ticket className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                  <span>{isAr ? 'بطاقة الصعود الرقمية' : 'Digital Boarding Pass'}</span>
                </button>

                <button
                  onClick={() => setShowPackingModal(true)}
                  className="bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 text-amber-400 font-extrabold text-xs px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg border border-slate-800 hover:border-amber-500/30 cursor-pointer group"
                >
                  <Luggage className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                  <span>{isAr ? 'مساعد التعبئة الفاخر' : 'Luxury Packing Assistant'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-950/20 uppercase tracking-wider group border border-slate-700 cursor-pointer text-center"
                >
                  <Printer className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                  <span>{isAr ? 'تحميل المسار كـ PDF' : 'Download Itinerary PDF'}</span>
                </button>

                {isTourPassed && !hasSubmittedReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/20 uppercase tracking-wider group cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform shrink-0" />
                    <span>{isAr ? 'كتابة تقييم للرحلة' : 'Leave a Review'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tour Gallery Section */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-900 pb-3">
              <div>
                <span className="text-[10px] text-amber-500 font-mono font-black uppercase tracking-widest block">
                  {isAr ? 'معرض الصور الحصري' : 'EXCLUSIVE DESTINATION GALLERY'}
                </span>
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
                  {isAr ? 'معرض معالم الجولة الملكية' : 'Tour Expedition Gallery'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold max-w-xs md:text-right">
                {isAr
                  ? 'لقطات حية وحصرية من المعالم والوجهات الفاخرة المخصصة المشمولة بمسارك.'
                  : 'Candid snapshots representing the legendary destinations integrated into your itinerary.'}
              </p>
            </div>

            {/* Masonry Grid Layout */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance] box-border pt-2">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="break-inside-avoid mb-4 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 group relative cursor-pointer"
                >
                  <LazyImage
                    src={img.url}
                    alt={img.title}
                    referrerPolicy="no-referrer"
                    className="w-full object-cover rounded-3xl hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle luxurious ambient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end">
                    <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block mb-0.5">
                      {img.category}
                    </span>
                    <h4 className="text-xs font-black text-white leading-snug">
                      {img.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Box for Friends/Family */}
          <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/20 p-6 md:p-8 rounded-3xl text-center space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white tracking-tight uppercase">
              {isAr ? 'احجز مغامرتك التوقيعية الفاخرة الخاصة بك' : 'Ready to Experience Sovereign Luxury?'}
            </h3>
            <p className="text-xs text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
              {isAr
                ? 'استمتع بجولات أثرية مخصصة، وسائقين بأسطول مرسيدس حديث، وحراسة خاصة، وإقامة خمس نجوم مع وكالة MAS الاستثنائية.'
                : 'Embark on dynamic Egyptian expeditions with custom Mercedes-Maybach fleets, personal Egyptologists, and five-star private viewing passes.'}
            </p>
            <button
              onClick={() => {
                window.location.href = window.location.origin;
              }}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-8 py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-md cursor-pointer inline-block"
            >
              {isAr ? 'استكشف كتالوج الرحلات المتاحة' : 'Explore Luxury Expedition Portfolio'}
            </button>
          </div>
        </main>

        {/* Public Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider space-y-1">
          <p>© {new Date().getFullYear()} {t.brandName} ROYAL CONCIERGE DIVISION. ALL VIP RIGHTS RESERVED.</p>
          <p className="text-slate-600">CURATED EXCLUSIVELY FOR ROYAL TRAVELERS</p>
        </footer>

        {/* Boarding Pass Modal */}
        {showBoardingPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col my-8">
              {/* Premium Top Bar */}
              <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
                    ROYAL EXPEDITION BOARDING PASS
                  </span>
                </div>
                <button
                  onClick={() => setShowBoardingPass(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Boarding Pass Ticket Container */}
              <div className="p-6 space-y-6 flex-1">
                {/* Perforated design header */}
                <div className="text-center space-y-1">
                  <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-black tracking-widest uppercase">
                    {isAr ? 'تصريح مرور المسار المعتمد' : 'VERIFIED EXPEDITION ACCESS'}
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    {isAr ? 'بطاقة الصعود الرقمية الفاخرة' : 'Sovereign Boarding Pass'}
                  </h3>
                </div>

                {/* Ticket Details */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4">
                  {/* Grid */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold text-slate-400">
                    <div>
                      <span className="text-slate-500 block mb-0.5">{isAr ? 'اسم الضيف' : 'PASSENGER / GUEST'}</span>
                      <span className="text-slate-200 text-xs font-extrabold truncate block">
                        {userEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">{isAr ? 'رمز التصريح' : 'CLEARANCE ID'}</span>
                      <span className="text-amber-400 text-xs font-black font-mono block truncate">
                        {sharedBooking.id.substring(0, 13).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">{isAr ? 'تاريخ المغامرة' : 'EXPEDITION DATE'}</span>
                      <span className="text-slate-200 text-xs font-extrabold block">
                        {sharedBooking.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">{isAr ? 'حالة الدفع' : 'STATUS'}</span>
                      <span className="text-emerald-400 text-xs font-extrabold block">
                        {isAr ? 'مصادق ومعتمد' : 'VERIFIED & PAID'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-800/80 my-3" />

                  {/* Tour details */}
                  <div className="text-[10px] uppercase">
                    <span className="text-slate-500 font-bold block mb-0.5">{isAr ? 'الجولة المختارة' : 'SELECTED VOYAGE'}</span>
                    <span className="text-white text-xs font-black block leading-snug">
                      {isAr ? sharedBooking.tourTitle.ar : sharedBooking.tourTitle.en}
                    </span>
                  </div>

                  {/* Driver / Guide */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold text-slate-400 mt-2">
                    <div>
                      <span className="text-slate-500 block mb-0.5">{isAr ? 'السائق الخاص' : 'CHAUFFEUR'}</span>
                      <span className="text-slate-300 text-xs font-bold block truncate">
                        {sharedBooking.driverName || (isAr ? 'مرسيدس الفئة S الفاخرة' : 'S-Class Luxury')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">{isAr ? 'المرشد الخاص' : 'EGYPTOLOGIST'}</span>
                      <span className="text-slate-300 text-xs font-bold block truncate">
                        {sharedBooking.guideName || (isAr ? 'مرشد أثري معتمد' : 'Certified Egyptologist')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perforated lines separation */}
                <div className="relative flex items-center justify-between my-2 py-2">
                  <div className="absolute left-[-25px] w-6 h-6 bg-slate-950 rounded-full border border-slate-800 border-l-transparent border-t-transparent border-b-transparent" />
                  <div className="w-full border-t border-dashed border-slate-800" />
                  <div className="absolute right-[-25px] w-6 h-6 bg-slate-950 rounded-full border border-slate-800 border-r-transparent border-t-transparent border-b-transparent" />
                </div>

                {/* QR Code section */}
                <div className="text-center space-y-3">
                  <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl border border-slate-800">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(
                        window.location.origin + '/?view-itinerary=' + sharedBooking.id
                      )}`}
                      alt="Digital Security Verification QR Code"
                      className="w-40 h-40 object-contain mx-auto block"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest block">
                      {isAr ? 'مسح رمز الاستجابة للتحقق عند الوصول' : 'SCAN FOR VERIFICATION UPON ARRIVAL'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                      {isAr
                        ? 'يرجى تقديم هذه البطاقة الرقمية مع رمز الاستجابة السريعة لممثلي الاستقبال والمرشد عند نقطة الالتقاء.'
                        : 'Present this digital pass to your private chauffeur or Egyptologist guide for instant clearance.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close footer action */}
              <div className="bg-slate-950 border-t border-slate-800 p-4">
                <button
                  onClick={() => setShowBoardingPass(false)}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs py-3.5 rounded-2xl uppercase tracking-wider transition-all border border-slate-800 cursor-pointer"
                >
                  {isAr ? 'إغلاق البطاقة الرقمية' : 'Dismiss Boarding Pass'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Luxury Packing Assistant Modal */}
        {showPackingModal && (
          <PackingAssistantModal
            isOpen={showPackingModal}
            onClose={() => setShowPackingModal(false)}
            lang={lang}
            tourId={sharedBooking.tourId}
            tourTitleEn={sharedBooking.tourTitle?.en || ''}
            bookingId={sharedBooking.id}
          />
        )}

        {/* Leave a Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col my-8">
              {/* Top bar */}
              <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
                    {isAr ? 'تقييم مغامرة MAS الاستثنائية' : 'RATE YOUR MAS ROYAL EXPEDITION'}
                  </span>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="text-center space-y-1">
                  <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-black tracking-widest uppercase">
                    {isAr ? 'مشاركة انطباعاتك الملكية' : 'SHARE YOUR ROYAL IMPRESSIONS'}
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    {isAr ? 'تقييم تجربة الرحلة والخدمات' : 'Rate Your Luxury Experience'}
                  </h3>
                </div>

                {/* Overall Rating */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    {isAr ? 'التقييم العام للتجربة' : 'Overall Experience Rating'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setOverallRating(stars)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            stars <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guide Rating & Feedback */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      👨‍🏫 {isAr ? 'تقييم المرشد الأثري الخاص بك' : 'Certified Egyptologist Guide'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          type="button"
                          key={stars}
                          onClick={() => setGuideRating(stars)}
                          className="p-0.5 cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              stars <= guideRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={guideComment}
                    onChange={(e) => setGuideComment(e.target.value)}
                    placeholder={isAr ? 'أدخل ملاحظاتك حول مرشدك الأثري...' : 'Provide feedback on your scholar guide...'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Driver Rating & Feedback */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      🚗 {isAr ? 'تقييم السائق الخاص بك' : 'Mercedes Chauffeur & Vehicle'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          type="button"
                          key={stars}
                          onClick={() => setDriverRating(stars)}
                          className="p-0.5 cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              stars <= driverRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={driverComment}
                    onChange={(e) => setDriverComment(e.target.value)}
                    placeholder={isAr ? 'أدخل ملاحظاتك حول السائق الخاص بك والسيارة...' : 'Provide feedback on your chauffeur and Mercedes vehicle...'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* General Comment */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    {isAr ? 'تعليقات إضافية للرحلة الملكية' : 'General Comments / Tour Customization Feedback'}
                  </label>
                  <textarea
                    rows={3}
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    placeholder={isAr ? 'كيف كانت الجولة الإجمالية والخدمات الفاخرة المرافقة؟' : 'How was your overall itinerary flow and royal catering service?'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Live Camera and Photo Attachment Section */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>{isAr ? 'التقاط وإرفاق صورة للرحلة الاستكشافية' : 'Capture & Attach Experience Photo (Optional)'}</span>
                  </label>

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`bg-slate-900 rounded-xl p-5 border-2 border-dashed transition-all space-y-3 text-center relative overflow-hidden ${
                      dragActive
                        ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-[1.01]'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {dragActive ? (
                      <div className="py-6 space-y-2 animate-pulse">
                        <Plus className="w-8 h-8 text-amber-400 mx-auto" />
                        <p className="text-xs font-black text-amber-400 uppercase tracking-widest">
                          {isAr ? 'أفلت الصورة الملكية هنا الآن!' : 'DROP YOUR PHOTO HERE!'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {!reviewPhoto && !cameraActive && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[11px] font-bold text-slate-300">
                                {isAr ? 'اسحب وأفلت صورتك هنا لرفعها مباشرة' : 'Drag & drop your experience photo here'}
                              </p>
                              <p className="text-[9px] text-slate-500 font-medium">
                                {isAr ? 'يدعم الملفات بتنسيق PNG، JPG، أو JPEG' : 'Supports PNG, JPG, or JPEG formats'}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                              <button
                                type="button"
                                onClick={startCamera}
                                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>{isAr ? 'تشغيل الكاميرا والتقاط صورة' : 'Capture Live Photo'}</span>
                              </button>

                              <label className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center border border-slate-700">
                                <Plus className="w-3.5 h-3.5 text-amber-500" />
                                <span>{isAr ? 'اختيار ملف صورة' : 'Upload Image'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        )}

                        {cameraActive && (
                          <div className="space-y-2">
                            <div className="relative aspect-video max-w-sm mx-auto bg-black rounded-lg overflow-hidden border border-slate-800">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {cameraError && (
                              <p className="text-[10px] text-red-500 font-bold text-center">{cameraError}</p>
                            )}
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                              >
                                {isAr ? '📸 التقاط الصورة الآن' : '📸 Take Photo'}
                              </button>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        )}

                        {reviewPhoto && (
                          <div className="space-y-2 flex flex-col items-center animate-fade-in">
                            <div className="relative w-36 h-28 bg-slate-950 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md">
                              <img
                                src={reviewPhoto}
                                alt="Captured Experience"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setReviewPhoto(null)}
                                className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full cursor-pointer transition-colors flex items-center justify-center w-5 h-5"
                                title="Remove Photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[9px] text-amber-400 font-black uppercase tracking-wider text-center">
                              {isAr ? 'تم إرفاق الصورة وتجهيزها للتقييم الملكي' : 'Experience photo attached successfully'}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs py-3.5 rounded-2xl uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {reviewSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>{isAr ? 'جاري توثيق التقييم...' : 'RECORDING FEEDBACK...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>{isAr ? 'إرسال وتوثيق التقييم' : 'Submit Royal Review'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ==================== PRINTABLE PDF TEMPLATE ==================== */}
      <div className="hidden print:block bg-white text-slate-900 p-8 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Elegant Letterhead Header */}
        <div className="flex justify-between items-center border-b-2 border-amber-600 pb-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              {isAr ? 'وكالة ماس للرحلات الفاخرة' : 'MAS AGENCY ROYAL CONCIERGE'}
            </h1>
            <p className="text-[9px] text-amber-700 tracking-widest font-mono font-bold uppercase">
              {isAr ? 'قسم الخدمات السيادية • تصاريح المرور الملكية' : 'Sovereign Dispatch Division • Official Expedition Pass'}
            </p>
          </div>
          <div className="text-right text-[9px] text-slate-500 space-y-0.5">
            <p className="font-bold">{isAr ? 'وثيقة تصريح رسمي معتمدة' : 'OFFICIAL CLEARANCE PASS'}</p>
            <p className="font-mono">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
                        {/* Big Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            {isAr ? 'تأكيد مسار الرحلة والتحقق الأمني الرقمي' : 'Official Expedition Itinerary & Access Clearance'}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            {isAr ? `رمز الحجز: ${sharedBooking.id}` : `Reservation ID: ${sharedBooking.id}`}
          </p>
        </div>

        {/* Meta details table */}
        <table className="w-full text-xs border border-slate-300 rounded-xl overflow-hidden mb-6">
          <tbody>
            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="p-3 font-bold text-slate-500 uppercase text-[9px] w-1/3">{isAr ? 'الضيف الملكي' : 'PASSENGER / GUEST'}</td>
              <td className="p-3 font-bold text-slate-800">{sharedBooking.customerName} ({sharedBooking.customerEmail})</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-3 font-bold text-slate-500 uppercase text-[9px]">{isAr ? 'تاريخ الاستكشاف المعتمد' : 'APPROVED EXPEDITION DATE'}</td>
              <td className="p-3 font-semibold text-slate-800">{sharedBooking.date}</td>
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="p-3 font-bold text-slate-500 uppercase text-[9px]">{isAr ? 'الرحلة والخدمات المحددة' : 'SELECTED LUXURY VOYAGE'}</td>
              <td className="p-3 font-bold text-amber-800">
                {isAr ? sharedBooking.tourTitle.ar : sharedBooking.tourTitle.en}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-3 font-bold text-slate-500 uppercase text-[9px]">{isAr ? 'السائق الخاص والسيارة' : 'PRIVATE CHAUFFEUR'}</td>
              <td className="p-3 font-semibold text-slate-800">
                {sharedBooking.driverName || (isAr ? 'مرسيدس الفئة S الفاخرة' : 'S-Class Luxury')}
              </td>
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="p-3 font-bold text-slate-500 uppercase text-[9px]">{isAr ? 'المرشد الأثري الأكاديمي' : 'CERTIFIED EGYPTOLOGIST'}</td>
              <td className="p-3 font-semibold text-slate-800">
                {sharedBooking.guideName || (isAr ? 'مرشد أثري معتمد' : 'Certified Egyptologist')}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-3 font-bold text-slate-500 uppercase text-[9px]">{isAr ? 'موقع وفندق الالتقاء' : 'CHAUFFEUR PICKUP ZONE'}</td>
              <td className="p-3 font-semibold text-slate-800">{sharedBooking.pickupHotel} (Room: {sharedBooking.roomNumber || 'TBD'})</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="p-3 font-bold text-slate-500 uppercase text-[9px]">{isAr ? 'قيمة المعاملة والمصادقة' : 'TOTAL VALUE VERIFIED'}</td>
              <td className="p-3 font-black text-emerald-700 text-sm">{formattedPrice}</td>
            </tr>
          </tbody>
        </table>

        {/* Itinerary Chronology */}
        <div className="space-y-4 mb-6">
          <h3 className="text-[10px] font-black uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2 tracking-widest">
            {isAr ? 'المسار الزمني المفصل للرحلة الاستكشافية' : 'DETAILED EXPEDITION CHRONOLOGY'}
          </h3>
          <div className="space-y-3">
            {getPrintItinerary().map((item: any, idx: number) => (
              <div key={idx} className="border-l-2 border-amber-500 pl-4 space-y-1">
                <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest font-mono">
                  {isAr ? `اليوم ${item.day}` : `DAY ${item.day}`}
                </span>
                <h4 className="text-xs font-black text-slate-800 uppercase">{item.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification and signature section */}
        <div className="mt-8 border-t border-slate-300 pt-6 flex justify-between items-end">
          <div className="space-y-3 max-w-sm">
            <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-wider">
              {isAr ? 'شروط المرور والتفويض' : 'EXPEDITION ENTRY CLEARANCE'}
            </h4>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              {isAr
                ? 'تعتبر هذه الوثيقة الرقمية المطبوعة بمثابة تأكيد رسمي وتصريح دخول معتمد لجميع المعالم والخدمات السياحية المشمولة. يرجى تقديم رمز الاستجابة السريعة (QR) عند الوصول ومواقع الاستقبال للتحقق الفوري من الهوية.'
                : 'This document serves as your official luxury travel confirmation and security pass. All transfers, private VIP guides, meals, and specialized access privileges are fully pre-paid and certified.'}
            </p>
            <p className="text-[8px] text-slate-400 font-mono font-bold uppercase">
              MAS ROYAL CONCIERGE • STAMP OF AUTHENTICITY
            </p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Signature if available */}
            {sharedBooking.signatureUrl && (
              <div className="text-center space-y-1">
                <span className="text-[8px] text-slate-400 font-bold uppercase block">{isAr ? 'توقيع الضيف' : 'GUEST SIGNATURE'}</span>
                <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
                  <img src={sharedBooking.signatureUrl} alt="Signature Seal" className="h-8 w-24 object-contain block" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}

            {/* QR verification */}
            <div className="text-center space-y-1">
              <span className="text-[8px] text-slate-400 font-bold uppercase block">{isAr ? 'الرمز الرقمي' : 'SECURE PASSAGE VERIFICATION'}</span>
              <div className="bg-white p-1 border border-slate-300 rounded">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(
                    window.location.origin + '/?view-itinerary=' + sharedBooking.id
                  )}`}
                  alt="QR Clearance"
                  className="w-16 h-16 object-contain block"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
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
                onCategoryChange={setActiveTourCategory}
                onSelectedTourChange={setActiveTour}
              />
            </div>

            {/* Interactive Egypt Map Navigator */}
            <div className={tokens.spacing.container}>
              <React.Suspense fallback={<SuspenseFallback message={lang === 'ar' ? 'جاري رسم الخرائط الملكية لمصر الفاخرة...' : 'Laying out Sovereign Cartography Deck...'} />}>
                <EgyptMap lang={lang} onSelectBookTour={setSelectedBookTour} />
              </React.Suspense>
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
            {!isAdminVerified ? (
              <AdminSecurityGate
                lang={lang}
                onVerify={(tier) => {
                  setIsAdminVerified(true);
                  setAdminPermissionTier(tier);
                  localStorage.setItem('mas_admin_verified', 'true');
                  localStorage.setItem('mas_admin_tier', tier);
                }}
              />
            ) : (
              <React.Suspense fallback={<SuspenseFallback message={lang === 'ar' ? 'جاري فتح لوحة التحكم السيادية...' : 'Unlocking Sovereign Control Panel...'} />}>
                <AdminDashboard
                  lang={lang}
                  currency={currency}
                  currencies={currencies}
                  onRefreshAll={() => {}}
                  adminPermissionTier={adminPermissionTier}
                  onLogoutAdmin={() => {
                    setIsAdminVerified(false);
                    setRole('guest');
                    setAdminPermissionTier('Sovereign Admin');
                    localStorage.removeItem('mas_admin_verified');
                    localStorage.removeItem('mas_admin_tier');
                  }}
                />
              </React.Suspense>
            )}
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
      <Chatbot lang={lang} />
      <WhatsAppFloatingButton lang={lang} />
      <PriceConverter lang={lang} currencies={currencies} onUpdateRates={setCurrencies} />

      {/* 4.5 Online/Offline Network Status Toast */}
      {showNetworkToast && (
        <div 
          id="mas-network-toast"
          className={`fixed bottom-24 md:bottom-28 left-4 md:left-8 z-50 max-w-sm w-[calc(100vw-2rem)] md:w-96 rounded-2xl p-4 shadow-xl border animate-fade-in transition-all duration-300 ${
            toastType === 'offline' 
              ? 'bg-slate-900 border-rose-500/30 text-white shadow-rose-950/20' 
              : 'bg-slate-900 border-emerald-500/30 text-white shadow-emerald-950/20'
          }`}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              toastType === 'offline' 
                ? 'bg-rose-500/10 text-rose-400' 
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {toastType === 'offline' ? (
                <WifiOff className="w-5 h-5 animate-pulse" />
              ) : (
                <Wifi className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <h5 className="font-bold text-xs md:text-sm text-slate-100 flex items-center gap-1.5">
                {toastType === 'offline' ? (
                  <>
                    <span>{lang === 'ar' ? 'وضع عدم الاتصال بالإنترنت' : 'Offline Mode Active'}</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                  </>
                ) : (
                  <>
                    <span>{lang === 'ar' ? 'تمت استعادة الاتصال' : 'Connection Restored'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  </>
                )}
              </h5>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {toastType === 'offline' ? (
                  lang === 'ar' 
                    ? 'لقد انقطع اتصالك بالإنترنت. يمكنك الاستمرار في تصفح كتالوج الرحلات المتاحة محلياً.' 
                    : 'You have lost internet connectivity. You can continue browsing the cached tour catalog offline.'
                ) : (
                  lang === 'ar' 
                    ? 'تم استعادة اتصالك بالشبكة بنجاح وإعادة المزامنة مع خوادم كونسيرج ماس.' 
                    : 'Your internet connection has been restored. Re-syncing with MAS Concierge servers.'
                )}
              </p>
            </div>
            <button 
              id="close-network-toast-btn"
              onClick={() => setShowNetworkToast(false)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5 rounded transition-colors shrink-0"
              aria-label="Close Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
