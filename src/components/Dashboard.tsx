import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, ShieldAlert, Award, MessageSquare, Bell, CreditCard, Send, Plus, Sparkles, User, RefreshCw, Smartphone, ShieldCheck, Fingerprint, Lock, Unlock, Activity, CheckCircle2, UserPlus, Gift, Copy, Mail, ExternalLink, Share2, Compass, Trophy, Gem, X, Star } from 'lucide-react';
import { Booking, CurrencyConfig, CustomerCRM, SupportMessage, WhatsAppMessage, SupportTicket } from '../types.js';
import { translations } from '../translations.js';
import LoyaltyTier, { TIER_CONFIGS } from './LoyaltyTier.js';
import BookingCountdown from './BookingCountdown.js';
import ProfileModal from './ProfileModal.js';

interface DashboardProps {
  lang: 'en' | 'ar';
  currency: string;
  currencies: CurrencyConfig[];
  userEmail: string;
  onRefreshAll: () => void;
}

export default function Dashboard({
  lang,
  currency,
  currencies,
  userEmail,
  onRefreshAll
}: DashboardProps) {
  const t = translations[lang];
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const [crmProfile, setCrmProfile] = useState<CustomerCRM | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [activeTab, setActiveTab] = useState<'trips' | 'support' | 'whatsapp' | 'rewards' | 'saved' | 'security' | 'referral'>('trips');
  const [loading, setLoading] = useState(false);

  // 48-Hour Urgent Checklist Confirmation states
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(null);
  const [confirmHotel, setConfirmHotel] = useState('');
  const [confirmRoom, setConfirmRoom] = useState('');
  const [confirmRequests, setConfirmRequests] = useState('');
  const [isSavingConfirmation, setIsSavingConfirmation] = useState(false);

  // Share itinerary states
  const [sharingBooking, setSharingBooking] = useState<Booking | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [copiedShareText, setCopiedShareText] = useState(false);

  // Profile modal states
  const [selectedStaffName, setSelectedStaffName] = useState('');
  const [selectedStaffRole, setSelectedStaffRole] = useState<'guide' | 'driver'>('guide');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getShareHighlightsText = (b: Booking) => {
    const tourTitleText = lang === 'ar' ? b.tourTitle.ar : b.tourTitle.en;
    const shareUrl = `${window.location.origin}/?share-itinerary=${b.id}`;
    
    if (lang === 'ar') {
      return `👑 *تفاصيل رحلتي الملكية الفاخرة مع وكالة MAS:*

📌 *الرحلة:* ${tourTitleText}
📅 *التاريخ:* ${b.date}
🏨 *نقطة الانطلاق:* ${b.pickupHotel} ${b.roomNumber ? `(غرفة ${b.roomNumber})` : ''}
🚗 *السائق الخاص:* ${b.driverName || 'جاري التعيين...'}
🗺️ *المرشد السياحي:* ${b.guideName || 'جاري التعيين...'}
🎟️ *رمز الحجز:* ${b.id}

🔗 تابع مسار رحلتي الفاخرة وتفاصيلها التفاعلية مباشرة عبر هذا الرابط:
${shareUrl}`;
    } else {
      return `👑 *My Luxury Expedition Itinerary with MAS Agency:*

📌 *Tour:* ${tourTitleText}
📅 *Date:* ${b.date}
🏨 *Chauffeur Pickup:* ${b.pickupHotel} ${b.roomNumber ? `(Room ${b.roomNumber})` : ''}
🚗 *Personal Chauffeur:* ${b.driverName || 'Coordinating VIP driver...'}
🗺️ *Archaeological Guide:* ${b.guideName || 'Coordinating personal Egyptologist...'}
🎟️ *Reservation ID:* ${b.id}

🔗 View my full live interactive itinerary and status here:
${shareUrl}`;
    }
  };

  const handleWhatsAppShare = (b: Booking) => {
    const text = getShareHighlightsText(b);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // User Tickets state
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [selectedUserTicketId, setSelectedUserTicketId] = useState<string | null>(null);
  const [userTicketSubject, setUserTicketSubject] = useState('');
  const [userTicketCategory, setUserTicketCategory] = useState<'Chauffeur' | 'Itinerary' | 'Payment' | 'Dietary' | 'Special Request' | 'Other'>('Other');
  const [userTicketMessage, setUserTicketMessage] = useState('');
  const [userTicketReply, setUserTicketReply] = useState('');

  // Referral Program simulation states
  const [refFriendName, setRefFriendName] = useState('');
  const [refFriendEmail, setRefFriendEmail] = useState('');
  const [refRecommendedTour, setRefRecommendedTour] = useState('Giza Pyramids Private Viewing');
  const [refCustomMessage, setRefCustomMessage] = useState('');
  const [refCopied, setRefCopied] = useState(false);
  const [refSuccessMsg, setRefSuccessMsg] = useState<string | null>(null);
  const [referralHistory, setReferralHistory] = useState<{
    id: string;
    name: string;
    email: string;
    tourRecommended: string;
    status: 'Pending' | 'Completed' | 'Joined';
    bonusPoints: number;
    date: string;
  }[]>(() => {
    const saved = localStorage.getItem('referralHistory');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'ref-1', name: 'Alexander Sterling', email: 'alex.sterling@sovereign.co.uk', tourRecommended: 'Giza Pyramids Private Viewing', status: 'Completed', bonusPoints: 5000, date: 'June 18, 2026' },
      { id: 'ref-2', name: 'Sophia Lorenzi', email: 'sophia.l@milanelite.it', tourRecommended: 'Grand Nile River Cruise', status: 'Joined', bonusPoints: 1000, date: 'June 25, 2026' },
      { id: 'ref-3', name: 'Prince Faisal Al-Saud', email: 'f.saud@riyadhroyal.sa', tourRecommended: 'Luxor Helicopter Charter', status: 'Pending', bonusPoints: 5000, date: 'Just Now' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('referralHistory', JSON.stringify(referralHistory));
  }, [referralHistory]);

  // Biometric security simulation states
  const [biometricsLinked, setBiometricsLinked] = useState<boolean>(() => {
    return localStorage.getItem('biometricsLinked') === 'true';
  });
  const [highValueLock, setHighValueLock] = useState<boolean>(() => {
    return localStorage.getItem('highValueLock') === 'true';
  });
  const [selectedBiometricType, setSelectedBiometricType] = useState<'face' | 'fingerprint'>('face');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [securityLogs, setSecurityLogs] = useState<{ id: string; eventEn: string; eventAr: string; time: string; ip: string }[]>(() => {
    const saved = localStorage.getItem('securityLogs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: '1', eventEn: 'Sovereign SSL Handshake Completed', eventAr: 'اكتملت مصافحة SSL السيادية الآمنة', time: 'Just Now', ip: '197.34.112.9' },
      { id: '2', eventEn: 'Device Authorized: iOS / Safari 19.4', eventAr: 'تفويض الجهاز المتصل: iOS / Safari 19.4', time: '10 minutes ago', ip: '197.34.112.9' },
      { id: '3', eventEn: 'Sovereign Encryption Keys Generated', eventAr: 'إنشاء مفاتيح التشفير السيادية الخاصة', time: '20 minutes ago', ip: '197.34.112.9' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('biometricsLinked', String(biometricsLinked));
  }, [biometricsLinked]);

  useEffect(() => {
    localStorage.setItem('highValueLock', String(highValueLock));
  }, [highValueLock]);

  useEffect(() => {
    localStorage.setItem('securityLogs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  // Post-Expedition Component Review states
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [reviewOverallRating, setReviewOverallRating] = useState<number>(5);
  const [reviewChauffeurRating, setReviewChauffeurRating] = useState<number>(5);
  const [reviewChauffeurComment, setReviewChauffeurComment] = useState<string>('');
  const [reviewGuideRating, setReviewGuideRating] = useState<number>(5);
  const [reviewGuideComment, setReviewGuideComment] = useState<string>('');
  const [reviewItineraryRating, setReviewItineraryRating] = useState<number>(5);
  const [reviewItineraryComment, setReviewItineraryComment] = useState<string>('');
  const [reviewCateringRating, setReviewCateringRating] = useState<number>(5);
  const [reviewCateringComment, setReviewCateringComment] = useState<string>('');
  const [reviewGeneralComment, setReviewGeneralComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  const resetReviewForm = () => {
    setReviewOverallRating(5);
    setReviewChauffeurRating(5);
    setReviewChauffeurComment('');
    setReviewGuideRating(5);
    setReviewGuideComment('');
    setReviewItineraryRating(5);
    setReviewItineraryComment('');
    setReviewCateringRating(5);
    setReviewCateringComment('');
    setReviewGeneralComment('');
    setReviewSuccessMsg(null);
  };

  const handleReviewSubmit = async (bookingId: string) => {
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallRating: reviewOverallRating,
          components: {
            chauffeur: { rating: reviewChauffeurRating, comment: reviewChauffeurComment },
            guide: { rating: reviewGuideRating, comment: reviewGuideComment },
            itinerary: { rating: reviewItineraryRating, comment: reviewItineraryComment },
            catering: { rating: reviewCateringRating, comment: reviewCateringComment }
          },
          generalComment: reviewGeneralComment
        })
      });

      if (res.ok) {
        setReviewSuccessMsg(lang === 'ar' ? 'تم تسجيل تقييمك الملكي بنجاح. نشكرك على مشاركة تجربتك الاستثنائية.' : 'Your sovereign review has been registered. Thank you for sharing your elite feedback.');
        setReviewingBookingId(null);
        await fetchData(); // Refresh dashboard data to show submitted review state!
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get bookings
      const bookingsRes = await fetch('/api/bookings');
      const allBookings = await bookingsRes.json();
      // Filter for current user email
      const myBookings = allBookings.filter((b: Booking) => b.customerEmail.toLowerCase() === userEmail.toLowerCase());
      setBookings(myBookings);

      // Get CRM profile
      const crmRes = await fetch('/api/crm');
      const allCrm = await crmRes.json();
      const myCrm = allCrm.find((c: CustomerCRM) => c.email.toLowerCase() === userEmail.toLowerCase());
      if (myCrm) {
        setCrmProfile(myCrm);
      }

      // Get Tickets
      const ticketsRes = await fetch('/api/tickets');
      const allTickets = await ticketsRes.json();
      const myTickets = allTickets.filter((t: SupportTicket) => t.customerEmail.toLowerCase() === userEmail.toLowerCase());
      setUserTickets(myTickets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userEmail]);

  // Auto-detect and populate first booking within 48 hours requiring confirmation
  useEffect(() => {
    const urgent = bookings.find(b => {
      if (b.detailsConfirmed) return false;
      if (b.status === 'cancelled' || b.status === 'completed') return false;
      const bookingTime = b.date.includes('T') ? new Date(b.date).getTime() : new Date(`${b.date}T08:00:00`).getTime();
      const diffMs = bookingTime - Date.now();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours > -4 && diffHours <= 48;
    });
    if (urgent && !confirmingBookingId) {
      setConfirmingBookingId(urgent.id);
      setConfirmHotel(urgent.pickupHotel || '');
      setConfirmRoom(urgent.roomNumber || '');
      setConfirmRequests(urgent.specialRequests || '');
    }
  }, [bookings, confirmingBookingId]);

  const handleConfirmDetails = async (bookingId: string) => {
    setIsSavingConfirmation(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupHotel: confirmHotel,
          roomNumber: confirmRoom,
          specialRequests: confirmRequests,
          detailsConfirmed: true,
          detailsConfirmedAt: new Date().toISOString()
        })
      });
      if (res.ok) {
        alert(lang === 'ar' 
          ? '🎉 ممتاز! تم تأكيد تفاصيل الاصطحاب النهائية بنجاح وتأمين تصريحك الأمني لرحلتك الاستكشافية.' 
          : '👑 Expedition Clearance Verified!\nYour final pickup coordinates and special requests have been successfully registered with the central VIP dispatch ledger.'
        );
        setConfirmingBookingId(null);
        await fetchData();
        onRefreshAll();
      } else {
        alert('Failed to register details. Please check the network connection.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during verification.');
    } finally {
      setIsSavingConfirmation(false);
    }
  };

  // Send Support Butler Message
  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim() || !crmProfile) return;

    const msg = supportInput;
    setSupportInput('');

    try {
      // Post user message
      const res = await fetch(`/api/crm/${crmProfile.email}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const updatedHistory = await res.json();
      
      setCrmProfile(prev => prev ? { ...prev, supportHistory: updatedHistory } : null);

      // Trigger automatic coordinator response after 1.5 seconds for incredible feel!
      setTimeout(async () => {
        try {
          const butlerReplies = [
            "Thank you. A team member is reviewing your request and will get back to you shortly.",
            "We have received your message and our customer support team is on it.",
            "We have updated your travel preferences. Let us know if you need anything else!"
          ];
          const autoReply = butlerReplies[Math.floor(Math.random() * butlerReplies.length)];
          
          const autoRes = await fetch(`/api/crm/${crmProfile.email}/support`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: autoReply })
          });
          const finalHistory = await autoRes.json();
          setCrmProfile(prev => prev ? { ...prev, supportHistory: finalHistory } : null);
        } catch (e) {
          console.error(e);
        }
      }, 1500);

    } catch (err) {
      console.error(err);
    }
  };

  // Create support ticket from Customer Panel
  const handleCreateUserTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTicketSubject.trim() || !userTicketMessage.trim() || !crmProfile) return;
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: crmProfile.email,
          customerName: crmProfile.name,
          subject: userTicketSubject,
          category: userTicketCategory,
          priority: 'medium',
          initialMessage: userTicketMessage
        })
      });
      if (res.ok) {
        setUserTicketSubject('');
        setUserTicketMessage('');
        // Reload tickets
        const ticketsRes = await fetch('/api/tickets');
        const allTickets = await ticketsRes.json();
        const myTickets = allTickets.filter((t: SupportTicket) => t.customerEmail.toLowerCase() === userEmail.toLowerCase());
        setUserTickets(myTickets);
        alert(lang === 'ar' ? 'تم تسجيل تذكرة الدعم بنجاح.' : 'Your luxury support ticket has been registered with our Sovereign Desk.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reply to ticket from Customer Panel
  const handleSendUserTicketMessage = async (ticketId: string) => {
    if (!userTicketReply.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'customer', message: userTicketReply })
      });
      if (res.ok) {
        setUserTicketReply('');
        // Reload tickets
        const ticketsRes = await fetch('/api/tickets');
        const allTickets = await ticketsRes.json();
        const myTickets = allTickets.filter((t: SupportTicket) => t.customerEmail.toLowerCase() === userEmail.toLowerCase());
        setUserTickets(myTickets);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!crmProfile) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center border border-slate-100 max-w-lg mx-auto">
        <Smartphone className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h4 className="font-bold text-slate-800 text-lg mb-2">Loading Profile...</h4>
        <p className="text-slate-500 text-xs md:text-sm mb-4">Please wait while we load your profile information...</p>
        <button 
          onClick={fetchData}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow"
        >
          Reload
        </button>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const bookingsWithin48Hours = upcomingBookings.filter(b => {
    if (b.detailsConfirmed) return false;
    const bookingTime = b.date.includes('T') ? new Date(b.date).getTime() : new Date(`${b.date}T08:00:00`).getTime();
    const diffMs = bookingTime - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > -4 && diffHours <= 48;
  });

  const bookingCount = bookings.length;
  let currentTierName = 'Bronze Elite';
  if (lang === 'ar') {
    if (bookingCount >= 4) currentTierName = 'الماسية الملكية';
    else if (bookingCount === 3) currentTierName = 'البلاتينية الرفيعة';
    else if (bookingCount === 2) currentTierName = 'الذهبية المهيبة';
    else if (bookingCount === 1) currentTierName = 'الفضية السيادية';
    else currentTierName = 'البرونزية النخبة';
  } else {
    if (bookingCount >= 4) currentTierName = 'Royal Diamond Executive';
    else if (bookingCount === 3) currentTierName = 'Platinum Paramount';
    else if (bookingCount === 2) currentTierName = 'Gold Majesty';
    else if (bookingCount === 1) currentTierName = 'Silver Sovereign';
    else currentTierName = 'Bronze Elite';
  }

  const runBiometricSimulation = (type: 'face' | 'fingerprint') => {
    setSelectedBiometricType(type);
    setScanStatus('scanning');
    
    setTimeout(() => {
      setBiometricsLinked(true);
      setScanStatus('success');
      
      const eventEn = `Biometric Signature Verified (${type === 'face' ? 'Sovereign FaceID' : 'Sovereign TouchID'})`;
      const eventAr = `تم تأكيد التوقيع البيومتري (${type === 'face' ? 'بصمة الوجه السيادية' : 'بصمة الإصبع السيادية'})`;
      const newLog = {
        id: String(Date.now()),
        eventEn,
        eventAr,
        time: 'Just Now',
        ip: '197.34.112.9'
      };
      setSecurityLogs(prev => [newLog, ...prev]);

      // Reset scan status back to idle after 3.5 seconds
      setTimeout(() => {
        setScanStatus('idle');
      }, 3500);
    }, 2500);
  };

  return (
    <div className="bg-slate-50/50 rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Award className="w-40 h-40 text-amber-400" />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{t.brandName} My Account</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans tracking-tight">
            {lang === 'ar' ? `مرحبًا بك، ${crmProfile.name}` : `Welcome, ${crmProfile.name}`}
          </h2>
          <p className="text-slate-300 text-xs font-medium mt-1">
            {crmProfile.email} | {crmProfile.phone} | {crmProfile.nationality}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">{lang === 'ar' ? 'فئة النخبة' : 'Membership'}</p>
            <p className="text-xs md:text-sm font-black text-amber-400">{currentTierName}</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 border border-white/10 p-2.5 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Countdown Timer to next luxury booking */}
      <div className="mb-8" id="dashboard-booking-countdown-wrapper">
        <BookingCountdown bookings={bookings} lang={lang} />
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2 md:gap-4 no-scrollbar">
        {[
          { id: 'trips', label: t.upcomingTrips, icon: Ticket },
          { id: 'support', label: t.supportChat, icon: MessageSquare },
          { id: 'whatsapp', label: t.whatsappAlerts, icon: Bell },
          { id: 'rewards', label: t.loyaltyClub, icon: Award },
          { id: 'saved', label: t.savedTravelers, icon: User },
          { id: 'security', label: lang === 'ar' ? 'الملف الأمني' : 'Security Profile', icon: ShieldCheck },
          { id: 'referral', label: lang === 'ar' ? 'دعوة مسافر' : 'Refer a Traveler', icon: UserPlus }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 px-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'trips' && bookingsWithin48Hours.length > 0 && (
                <span className="flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[350px]">
        
        {/* Trips Panel */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            {/* Automated 48-Hour Urgent Checklist Notification Banners */}
            {bookingsWithin48Hours.map(b => (
              <div key={`alert-${b.id}`} className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-slate-900/5 border border-amber-500/20 rounded-2xl p-5 md:p-6 shadow-sm animate-fade-in text-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-amber-500/10">
                  <div className="flex items-start gap-2.5">
                    <span className="p-2 bg-amber-500/20 text-amber-700 rounded-lg animate-pulse shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-2 flex-wrap">
                        <span>{lang === 'ar' ? 'تصريح عاجل: تأكيد تفاصيل الرحلة مطلوب' : 'URGENT CLEARANCE: EXPEDITION CONFIRMATION REQUIRED'}</span>
                        <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                          {lang === 'ar' ? '٤٨ ساعة' : 'Within 48h'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                        {lang === 'ar' 
                          ? `تبدأ رحلتك الاستكشافية إلى [${b.tourTitle.ar}] قريبًا جدًا. يرجى مراجعة تفاصيل الاصطحاب لضمان التخليص الأمني وتنسيق سائق المرسيدس المخصص.` 
                          : `Your luxury expedition to [${b.tourTitle.en}] begins very soon. Please verify your pickup coordinates to clear royal security logs & guide dispatch.`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-800 border border-amber-500/20 px-2.5 py-1 rounded-lg font-black shrink-0">
                    ID: {b.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      {lang === 'ar' ? 'فندق الاصطحاب للسائق' : 'Chauffeur Pickup Hotel'}
                    </label>
                    <input
                      type="text"
                      value={confirmingBookingId === b.id ? confirmHotel : b.pickupHotel}
                      onChange={(e) => {
                        if (confirmingBookingId === b.id) setConfirmHotel(e.target.value);
                      }}
                      placeholder="e.g. Four Seasons Nile Plaza"
                      className="bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs w-full focus:outline-none font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      {lang === 'ar' ? 'رقم الغرفة (مهم لنداء اللوبي)' : 'Room Number (for lobby paging)'}
                    </label>
                    <input
                      type="text"
                      value={confirmingBookingId === b.id ? confirmRoom : b.roomNumber || ''}
                      onChange={(e) => {
                        if (confirmingBookingId === b.id) setConfirmRoom(e.target.value);
                      }}
                      placeholder={lang === 'ar' ? 'رقم الغرفة أو "لم أسجل الدخول بعد"' : 'e.g. Room 1402 or "Not Checked In Yet"'}
                      className="bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs w-full focus:outline-none font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      {lang === 'ar' ? 'الترتيبات الخاصة أو النظام الغذائي' : 'Dietary or Accessibility Preferences'}
                    </label>
                    <input
                      type="text"
                      value={confirmingBookingId === b.id ? confirmRequests : b.specialRequests || ''}
                      onChange={(e) => {
                        if (confirmingBookingId === b.id) setConfirmRequests(e.target.value);
                      }}
                      placeholder="e.g. Halal food, wheelchair access, extra towels"
                      className="bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs w-full focus:outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{lang === 'ar' ? 'تأكيد التفاصيل يحمي خصوصيتك ويضمن المواعيد.' : 'Verified details ensure zero delays on departure.'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfirmDetails(b.id)}
                    disabled={isSavingConfirmation}
                    className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white font-black text-[10px] py-2 px-5 rounded-lg transition-all shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-1.5 shrink-0"
                  >
                    {isSavingConfirmation ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'ar' ? 'جاري التأكيد والتوثيق...' : 'VERIFYING DETAILS...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تأكيد وتوثيق تفاصيل الرحلة' : 'CONFIRM & REGISTER DETAILS'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-slate-800">
              {/* Left/Main Column: Upcoming Trips */}
              <div className="lg:col-span-2 space-y-6">
              {upcomingBookings.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-slate-200/60 max-w-md mx-auto">
                  <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 text-base mb-1">{lang === 'ar' ? 'لا توجد حجوزات نشطة حاليًا' : 'No Bookings Found'}</h4>
                  <p className="text-slate-400 text-xs md:text-sm mb-4">{lang === 'ar' ? 'تصفح باقتنا التوقيعية المتميزة واحجز رحلتك الملكية اليوم.' : 'Browse our tours and book your next trip today!'}</p>
                </div>
              ) : (
                upcomingBookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Voyage Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-sans">
                          ID: {b.id}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {b.detailsConfirmed ? (
                            <span className="text-[10px] bg-emerald-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{lang === 'ar' ? 'تم تأكيد التفاصيل' : 'Details Verified'}</span>
                            </span>
                          ) : (
                            (() => {
                              const bookingTime = b.date.includes('T') ? new Date(b.date).getTime() : new Date(`${b.date}T08:00:00`).getTime();
                              const diffMs = bookingTime - Date.now();
                              const diffHours = diffMs / (1000 * 60 * 60);
                              if (diffHours > -4 && diffHours <= 48) {
                                return (
                                  <span className="text-[10px] bg-amber-500 text-white px-3 py-1 rounded-full font-extrabold uppercase tracking-wider animate-pulse shrink-0">
                                    {lang === 'ar' ? 'تأكيد مطلوب (٤٨ ساعة)' : 'Confirm Required (48h)'}
                                  </span>
                                );
                              }
                              return null;
                            })()
                          )}
                          <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                            b.status === 'confirmed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status === 'confirmed' ? t.confirmed : t.pending}
                          </span>
                          <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                            b.paymentStatus === 'paid' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {b.paymentStatus === 'paid' ? t.paid : t.unpaid}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base md:text-lg font-bold text-slate-800 font-sans tracking-tight">
                        {lang === 'ar' ? b.tourTitle.ar : b.tourTitle.en}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                        <div>
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">{t.searchDate}</span>
                          <span className="text-slate-800 font-bold">{b.date}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">{t.pickupHotel}</span>
                          <span className="text-slate-800 font-bold">{b.pickupHotel} {b.roomNumber ? `(${b.roomNumber})` : ''}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">{t.driver}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-emerald-700 font-bold">{b.driverName || (lang === 'ar' ? 'جاري تعيين سائق مخصص...' : 'Assigning Driver...')}</span>
                            {b.driverName && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStaffName(b.driverName || '');
                                  setSelectedStaffRole('driver');
                                  setIsProfileModalOpen(true);
                                }}
                                className="text-[10px] font-extrabold uppercase text-emerald-600 hover:text-emerald-500 hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-0.5"
                              >
                                <span>({lang === 'ar' ? 'الملف الشخصي' : 'Profile'})</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">{t.guide}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-amber-700 font-bold">{b.guideName || (lang === 'ar' ? 'جاري تعيين مرشد أثري...' : 'Assigning Tour Guide...')}</span>
                            {b.guideName && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStaffName(b.guideName || '');
                                  setSelectedStaffRole('guide');
                                  setIsProfileModalOpen(true);
                                }}
                                className="text-[10px] font-extrabold uppercase text-amber-600 hover:text-amber-500 hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-0.5"
                              >
                                <span>({lang === 'ar' ? 'الملف الشخصي' : 'Profile'})</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {b.specialRequests && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">{lang === 'ar' ? 'الطلبات والترتيبات الخاصة' : 'Special Requests'}</span>
                          <p className="text-slate-700 text-xs font-medium">{b.specialRequests}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold text-slate-500">{t.total}</span>
                        <span className="text-base font-black text-slate-800 font-sans">{formatLocalPrice(b.totalAmountUSD)}</span>
                      </div>
                    </div>

                    {/* Digital QR Ticket */}
                    <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-xl p-5 flex flex-col items-center justify-between border border-slate-700 text-center shadow-lg relative">
                      <div className="absolute top-0 left-4 w-4 h-4 bg-white rounded-b-full" />
                      <div className="absolute top-0 right-4 w-4 h-4 bg-white rounded-b-full" />
                      
                      <div className="w-full">
                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">{t.digitalVoucher}</span>
                        <div className="h-[1px] bg-slate-700 my-2" />
                      </div>

                      {/* QR Simulation Box */}
                      <div className="bg-white p-3 rounded-xl shadow-md my-4 flex flex-col items-center">
                        <div className="w-32 h-32 bg-slate-100 flex flex-col items-center justify-center p-2 border border-slate-200">
                          {/* Custom visual QR representation using simple blocks */}
                          <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80">
                            {[...Array(16)].map((_, i) => (
                              <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 5 === 1 ? 'bg-slate-900' : 'bg-transparent'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-2 tracking-widest">
                          {b.qrCode}
                        </span>
                      </div>

                      <div className="w-full space-y-2">
                        <p className="text-[9px] text-slate-400 font-medium mb-1">{lang === 'ar' ? 'يرجى تقديم رمز الـ QR لسائق المرسيدس عند الاصطحاب' : 'Scan this QR code with your driver at pickup.'}</p>
                        <a 
                          href={`/api/bookings/${b.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs w-full py-2 rounded-lg transition-colors cursor-pointer block text-center"
                        >
                          {lang === 'ar' ? 'تحميل التذكرة الإلكترونية (PDF)' : 'Download Ticket (PDF)'}
                        </a>
                        <a 
                          href={`/api/bookings/${b.id}/agreement`}
                          download={`Luxury_Service_Agreement_${b.id}.pdf`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs w-full py-2 rounded-lg transition-colors cursor-pointer block text-center flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-150" />
                          <span>{lang === 'ar' ? 'تحميل اتفاقية الخدمة الفاخرة (PDF)' : 'Luxury Agreement (PDF)'}</span>
                        </a>
                        <button 
                          onClick={() => setSharingBooking(b)}
                          className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs w-full py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'مشاركة تفاصيل الرحلة' : 'Share Itinerary'}</span>
                        </button>
                        <a 
                          href={`https://wa.me/201202181834?text=${encodeURIComponent(
                            lang === 'ar' 
                              ? `مرحباً كونسيرج MAS الملكي، أود التنسيق بخصوص حجزي رقم ${b.id} لجولة "${b.tourTitle.ar || b.tourTitle.en}".` 
                              : `Hello MAS Royal Concierge, I would like to coordinate about my booking ${b.id} for the "${b.tourTitle.en}" expedition.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs w-full py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-white" />
                          <span>{lang === 'ar' ? 'واتساب الكونسيرج الملكي' : 'WhatsApp Concierge'}</span>
                        </a>
                        {!b.detailsConfirmed && (
                          <button
                            onClick={() => {
                              setConfirmingBookingId(b.id);
                              setConfirmHotel(b.pickupHotel || '');
                              setConfirmRoom(b.roomNumber || '');
                              setConfirmRequests(b.specialRequests || '');
                              const el = document.getElementById('dashboard-booking-countdown-wrapper');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs w-full py-2.5 rounded-lg transition-colors cursor-pointer border border-white/10 flex items-center justify-center gap-1.5"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>{lang === 'ar' ? 'تحديث وتأكيد تفاصيل الموعد' : 'Verify Pickup Details'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Concluded Expeditions & Component Feedback */}
              <div className="mt-8 border-t border-slate-100 pt-8 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                    <Compass className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                      {lang === 'ar' ? 'الرحلات الاستكشافية المكتملة وتقييم التجربة' : 'Concluded Expeditions & Post-Expedition Reviews'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {lang === 'ar' ? 'مراجعة وتوثيق جودة كل عنصر من عناصر رحلتك الخاصة لتأكيد مستويات الجودة السيادية.' : 'Audit and rate individual service components of your private tours to uphold our sovereign standards.'}
                    </p>
                  </div>
                </div>

                {reviewSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 flex items-start gap-3 text-emerald-800 text-xs font-medium animate-fade-in mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{reviewSuccessMsg}</p>
                      <button 
                        onClick={() => setReviewSuccessMsg(null)}
                        className="text-[10px] text-emerald-700 underline font-bold mt-1 hover:text-emerald-950 block"
                      >
                        {lang === 'ar' ? 'إغلاق التنبيه' : 'Dismiss Alert'}
                      </button>
                    </div>
                  </div>
                )}

                {pastBookings.filter(b => b.status === 'completed').length === 0 ? (
                  <div className="bg-slate-50/50 border border-slate-150/50 rounded-xl p-6 text-center text-slate-400 italic text-xs font-medium">
                    {lang === 'ar' ? 'لا توجد رحلات استكشافية سابقة مسجلة في ملفك الشخصي حتى الآن.' : 'No completed or past expeditions recorded in your luxury itinerary yet.'}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pastBookings.filter(b => b.status === 'completed').map((b) => {
                      const isCompleted = b.status === 'completed';
                      // Consider a trip concluded at 5 PM on the day of the trip
                      const bookingTime = b.date.includes('T') ? new Date(b.date).getTime() : new Date(`${b.date}T17:00:00`).getTime();
                      const hoursSinceConclusion = (Date.now() - bookingTime) / (1000 * 60 * 60);
                      const isEligible = isCompleted && hoursSinceConclusion >= 24;
                      const hasReview = !!b.review;

                      return (
                        <div key={`concluded-${b.id}`} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
                          {/* Header of Past Trip Card */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="space-y-0.5 animate-fade-in">
                              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                                ID: {b.id}
                              </span>
                              <h4 className="text-sm font-bold text-slate-800">
                                {lang === 'ar' ? b.tourTitle.ar : b.tourTitle.en}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold">
                                {lang === 'ar' ? `تاريخ الرحلة: ${b.date}` : `Tour Date: ${b.date}`}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                {lang === 'ar' ? 'مكتملة' : 'Completed'}
                              </span>
                              {hasReview && (
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0 flex items-center gap-0.5 animate-fade-in">
                                  <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                                  <span>{lang === 'ar' ? 'تم التقييم' : 'Reviewed'}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Lock Banner / Info message if completed but < 24 hours */}
                          {!isEligible && isCompleted && (
                            <div className="bg-slate-50 border border-slate-150 rounded-lg p-3.5 flex items-start gap-2.5 text-[11px] font-medium text-slate-500 animate-fade-in">
                              <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-slate-700">
                                  {lang === 'ar' ? 'استمارة مراجعة جودة الرحلة مغلقة مؤقتاً' : 'Sovereign Review Form Currently Locked'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {lang === 'ar' 
                                    ? `سيتم فتح نموذج تقييم عناصر جودة الرحلة بعد ٢٤ ساعة من انتهائها لجمع آرائكم الأكثر دقة (يفتح خلال ${Math.max(1, Math.ceil(24 - hoursSinceConclusion))} ساعة)`
                                    : `The post-expedition review form unlocks 24 hours after your trip concludes to allow accurate reflection (unlocks in ${Math.max(1, Math.ceil(24 - hoursSinceConclusion))} hours).`}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* CASE A: Review is already submitted */}
                          {hasReview && b.review && (
                            <div className="bg-emerald-50/20 border border-emerald-500/10 rounded-xl p-4 space-y-3.5 animate-fade-in">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{lang === 'ar' ? 'آراؤكم وتقييماتكم المسجلة' : 'Your Submitted Ratings'}</span>
                                </span>
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, idx) => (
                                    <Star 
                                      key={idx} 
                                      className={`w-3.5 h-3.5 ${idx < (b.review?.overallRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                    />
                                  ))}
                                  <span className="text-xs font-black text-slate-700 ml-1">
                                    {(b.review?.overallRating || 5).toFixed(1)}/5
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-medium">
                                {/* Chauffeur Review */}
                                <div className="bg-white border border-slate-100 rounded-lg p-2.5 shadow-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-extrabold text-slate-700">
                                      {lang === 'ar' ? 'السائق وموكب المرسيدس' : 'Private Chauffeur & Fleet'}
                                    </span>
                                    <span className="text-amber-500 font-extrabold">★ {b.review.components.chauffeur.rating}/5</span>
                                  </div>
                                  {b.review.components.chauffeur.comment && (
                                    <p className="text-slate-500 italic text-[10px]">"{b.review.components.chauffeur.comment}"</p>
                                  )}
                                </div>

                                {/* Guide Review */}
                                <div className="bg-white border border-slate-100 rounded-lg p-2.5 shadow-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-extrabold text-slate-700">
                                      {lang === 'ar' ? 'المرشد الأثري والمؤرخ' : 'Scholar Guide & Historian'}
                                    </span>
                                    <span className="text-amber-500 font-extrabold">★ {b.review.components.guide.rating}/5</span>
                                  </div>
                                  {b.review.components.guide.comment && (
                                    <p className="text-slate-500 italic text-[10px]">"{b.review.components.guide.comment}"</p>
                                  )}
                                </div>

                                {/* Itinerary Review */}
                                <div className="bg-white border border-slate-100 rounded-lg p-2.5 shadow-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-extrabold text-slate-700">
                                      {lang === 'ar' ? 'المعالم والمناطق الأثرية' : 'Archaeological Sites & Pacing'}
                                    </span>
                                    <span className="text-amber-500 font-extrabold">★ {b.review.components.itinerary.rating}/5</span>
                                  </div>
                                  {b.review.components.itinerary.comment && (
                                    <p className="text-slate-500 italic text-[10px]">"{b.review.components.itinerary.comment}"</p>
                                  )}
                                </div>

                                {/* Catering Review */}
                                <div className="bg-white border border-slate-100 rounded-lg p-2.5 shadow-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-extrabold text-slate-700">
                                      {lang === 'ar' ? 'المأكولات والضيافة والخدمات' : 'Luxury Catering & Hospitality'}
                                    </span>
                                    <span className="text-amber-500 font-extrabold">★ {b.review.components.catering.rating}/5</span>
                                  </div>
                                  {b.review.components.catering.comment && (
                                    <p className="text-slate-500 italic text-[10px]">"{b.review.components.catering.comment}"</p>
                                  )}
                                </div>
                              </div>

                              {b.review.generalComment && (
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] font-medium text-slate-700">
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">
                                    {lang === 'ar' ? 'التعليقات العامة' : 'General Comments'}
                                  </span>
                                  <p className="italic">"{b.review.generalComment}"</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* CASE B: Review not submitted, and form is NOT open */}
                          {isEligible && !hasReview && reviewingBookingId !== b.id && (
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 animate-fade-in">
                              <div className="space-y-0.5">
                                <h5 className="text-xs font-bold text-slate-700">
                                  {lang === 'ar' ? 'بانتظار تقييمكم المعتمد' : 'Awaiting Sovereign Assessment'}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {lang === 'ar' ? 'يرجى مراجعة وتوثيق جودة كل قسم من أقسام خدماتنا لمواصلة الامتياز.' : 'Assess each component of your private experience to help us maintain elite hospitality.'}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  resetReviewForm();
                                  setReviewingBookingId(b.id);
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                              >
                                {lang === 'ar' ? 'تقييم عناصر الرحلة الاستكشافية' : 'Write Post-Expedition Review'}
                              </button>
                            </div>
                          )}

                          {/* CASE C: Review form is ACTIVE for this booking */}
                          {isEligible && !hasReview && reviewingBookingId === b.id && (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleReviewSubmit(b.id);
                              }}
                              className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-5 animate-fade-in text-xs font-medium text-slate-700"
                            >
                              <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
                                <span className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                  <span>{lang === 'ar' ? 'استمارة التقييم بعد الرحلة' : 'Post-Expedition Review Form'}</span>
                                </span>
                                <button 
                                  type="button"
                                  onClick={() => setReviewingBookingId(null)}
                                  className="text-slate-400 hover:text-slate-600 font-bold"
                                >
                                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                              </div>

                              {/* Overall Experience Star Rating */}
                              <div className="space-y-1.5 animate-fade-in">
                                <label className="block text-slate-700 font-extrabold">
                                  {lang === 'ar' ? '١. التقييم الإجمالي للتجربة الملكية' : '1. Overall Luxury Tour Experience'} <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-sm">
                                    {[1, 2, 3, 4, 5].map((starValue) => (
                                      <button
                                        key={starValue}
                                        type="button"
                                        onClick={() => setReviewOverallRating(starValue)}
                                        className="focus:outline-none cursor-pointer transition-all hover:scale-110"
                                      >
                                        <Star 
                                          className={`w-5 h-5 ${starValue <= reviewOverallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                                        />
                                      </button>
                                    ))}
                                  </div>
                                  <span className="text-xs font-black text-slate-500">
                                    {reviewOverallRating === 5 ? (lang === 'ar' ? 'استثنائي (٥ نجوم)' : 'Sovereign Premium (5/5)') :
                                     reviewOverallRating === 4 ? (lang === 'ar' ? 'ممتاز جداً' : 'Very Good (4/5)') :
                                     reviewOverallRating === 3 ? (lang === 'ar' ? 'جيد جداً' : 'Good (3/5)') :
                                     reviewOverallRating === 2 ? (lang === 'ar' ? 'بحاجة لتحسين' : 'Needs Work (2/5)') :
                                     (lang === 'ar' ? 'غير مقبول' : 'Unsatisfactory (1/5)')}
                                  </span>
                                </div>
                              </div>

                              {/* 4 Core Tour Components Assessment */}
                              <div className="space-y-4 pt-2 border-t border-slate-150 animate-fade-in">
                                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                                  {lang === 'ar' ? '٢. تقييم عناصر الخدمة الفردية مخصصة' : '2. Quality Ratings for Individual Tour Components'}
                                </h4>

                                {/* Component A: Chauffeur */}
                                <div className="space-y-2 bg-white border border-slate-150 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-wrap justify-between items-center gap-2">
                                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                                      {lang === 'ar' ? 'السائق وموكب المرسيدس الفاخر' : 'Private Chauffeur & Mercedes Fleet'}
                                    </span>
                                    <div className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                      {[1, 2, 3, 4, 5].map((starValue) => (
                                        <button
                                          key={`chauffeur-${starValue}`}
                                          type="button"
                                          onClick={() => setReviewChauffeurRating(starValue)}
                                          className="focus:outline-none cursor-pointer transition-all"
                                        >
                                          <Star 
                                            className={`w-4 h-4 ${starValue <= reviewChauffeurRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={reviewChauffeurComment}
                                    onChange={(e) => setReviewChauffeurComment(e.target.value)}
                                    placeholder={lang === 'ar' ? 'شارك رأيك حول سلوك السائق، جودة القيادة، ونظافة سيارة مرسيدس...' : 'Share feedback on punctuality, driving safety, vehicle comfort...'}
                                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 bg-slate-50/30"
                                  />
                                </div>

                                {/* Component B: Guide */}
                                <div className="space-y-2 bg-white border border-slate-150 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-wrap justify-between items-center gap-2">
                                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                                      {lang === 'ar' ? 'المرشد الأثري والمؤرخ الأكاديمي' : 'Scholar Guide & Egyptologist'}
                                    </span>
                                    <div className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                      {[1, 2, 3, 4, 5].map((starValue) => (
                                        <button
                                          key={`guide-${starValue}`}
                                          type="button"
                                          onClick={() => setReviewGuideRating(starValue)}
                                          className="focus:outline-none cursor-pointer transition-all"
                                        >
                                          <Star 
                                            className={`w-4 h-4 ${starValue <= reviewGuideRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={reviewGuideComment}
                                    onChange={(e) => setReviewGuideComment(e.target.value)}
                                    placeholder={lang === 'ar' ? 'كيف كانت معلومات المرشد التاريخية، أسلوب الشرح، ومرافقته؟...' : 'Historian storytelling depth, passion, scheduling care...'}
                                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 bg-slate-50/30"
                                  />
                                </div>

                                {/* Component C: Itinerary */}
                                <div className="space-y-2 bg-white border border-slate-150 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-wrap justify-between items-center gap-2">
                                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                                      {lang === 'ar' ? 'مسار الزيارة وتجربة المواقع الأثرية ومستوى الدخول' : 'Archaeological Site Access & Pacing'}
                                    </span>
                                    <div className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                      {[1, 2, 3, 4, 5].map((starValue) => (
                                        <button
                                          key={`itinerary-${starValue}`}
                                          type="button"
                                          onClick={() => setReviewItineraryRating(starValue)}
                                          className="focus:outline-none cursor-pointer transition-all"
                                        >
                                          <Star 
                                            className={`w-4 h-4 ${starValue <= reviewItineraryRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={reviewItineraryComment}
                                    onChange={(e) => setReviewItineraryComment(e.target.value)}
                                    placeholder={lang === 'ar' ? 'تجاوز طوابير الانتظار، ترتيب المعالم، والوقت المتاح...' : 'Site skip-the-line effectiveness, path selection, timing quality...'}
                                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 bg-slate-50/30"
                                  />
                                </div>

                                {/* Component D: Catering */}
                                <div className="space-y-2 bg-white border border-slate-150 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-wrap justify-between items-center gap-2">
                                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                                      {lang === 'ar' ? 'الضيافة والوجبات وخدمات الغداء الفاخر' : 'Luxury Catering & Culinary Hospitality'}
                                    </span>
                                    <div className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                      {[1, 2, 3, 4, 5].map((starValue) => (
                                        <button
                                          key={`catering-${starValue}`}
                                          type="button"
                                          onClick={() => setReviewCateringRating(starValue)}
                                          className="focus:outline-none cursor-pointer transition-all"
                                        >
                                          <Star 
                                            className={`w-4 h-4 ${starValue <= reviewCateringRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={reviewCateringComment}
                                    onChange={(e) => setReviewCateringComment(e.target.value)}
                                    placeholder={lang === 'ar' ? 'جودة المأكولات، الخدمة والمشروبات المبردة المرافقة...' : 'Taste of catering menu, dietary responsiveness, fresh towels...'}
                                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 bg-slate-50/30"
                                  />
                                </div>
                              </div>

                              {/* General Overall Review Comments */}
                              <div className="space-y-1.5 pt-2 border-t border-slate-150 animate-fade-in">
                                <label className="block text-slate-700 font-extrabold">
                                  {lang === 'ar' ? '٣. تعليقات عامة وملاحظات إضافية' : '3. Additional General Thoughts'}
                                </label>
                                <textarea
                                  rows={3}
                                  value={reviewGeneralComment}
                                  onChange={(e) => setReviewGeneralComment(e.target.value)}
                                  placeholder={lang === 'ar' ? 'ما الذي جعل هذه الرحلة استثنائية، أو أي مقترحات تفوق مستوى تطلعاتكم؟...' : 'What did you enjoy most, or how can we elevate our royal standards even further?'}
                                  className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 bg-white"
                                />
                              </div>

                              {/* Action buttons */}
                              <div className="flex justify-end gap-3 pt-3 border-t border-slate-150 animate-fade-in">
                                <button
                                  type="button"
                                  onClick={() => setReviewingBookingId(null)}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  {lang === 'ar' ? 'إلغاء وتراجع' : 'Cancel'}
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSubmittingReview}
                                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {isSubmittingReview ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  <span>{lang === 'ar' ? 'إرسال التقييم الملكي المعتمد' : 'Submit Sovereign Review'}</span>
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Mini Loyalty Tracker */}
            <div className="lg:col-span-1 space-y-6">
              {(() => {
                const actualTierKey = bookingCount >= 4 ? 'Diamond' : bookingCount === 3 ? 'Platinum' : bookingCount === 2 ? 'Gold' : bookingCount === 1 ? 'Silver' : 'Bronze';
                const config = TIER_CONFIGS[actualTierKey];
                const IconComponent = config ? config.icon : Award;
                
                // Next tier calculation
                const getNext = () => {
                  if (actualTierKey === 'Bronze') return { nameEn: 'Silver Sovereign', nameAr: 'الفضية السيادية', target: 1 };
                  if (actualTierKey === 'Silver') return { nameEn: 'Gold Majesty', nameAr: 'الذهبية المهيبة', target: 2 };
                  if (actualTierKey === 'Gold') return { nameEn: 'Platinum Paramount', nameAr: 'البلاتينية الرفيعة', target: 3 };
                  if (actualTierKey === 'Platinum') return { nameEn: 'Royal Diamond Executive', nameAr: 'الماسية الملكية التنفيذية', target: 4 };
                  return null;
                };
                const next = getNext();
                const totalSpentUSD = crmProfile?.totalSpentUSD || 0;

                return (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 relative overflow-hidden">
                    {/* Subtle aesthetic backdrop */}
                    <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none -mr-8 -mt-8">
                      <IconComponent className="w-40 h-40 text-slate-900" />
                    </div>

                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                          {lang === 'ar' ? 'مستوى الولاء والجوائز' : 'Loyalty Status Tracker'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {lang === 'ar' ? 'سجل الرحلات والميزات النخبوية' : 'Voyage ledger & dynamic privileges'}
                        </p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    </div>

                    {/* Current Tier Badge Card */}
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${config ? config.cardGradient : 'from-slate-900 to-slate-950'} text-white relative overflow-hidden border ${config ? config.glowClass : 'border-slate-800'}`}>
                      <span className="text-[8px] bg-white/10 border border-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-slate-300">
                        {lang === 'ar' ? 'فئتك الحالية' : 'CURRENT STATUS'}
                      </span>
                      <h5 className="text-base font-black tracking-wide text-white flex items-center gap-2 mt-2 font-serif">
                        <IconComponent className={`w-5 h-5 ${config ? config.colorClass : 'text-amber-400'}`} />
                        <span>{lang === 'ar' ? (config ? config.nameAr : 'البرونزية النخبة') : (config ? config.nameEn : 'Bronze Elite')}</span>
                      </h5>
                      <p className="text-[10px] text-slate-300 font-medium mt-1 leading-snug">
                        {lang === 'ar' 
                          ? `${bookingCount} رحلات فاخرة مؤكدة ومكتملة`
                          : `${bookingCount} verified elite voyage${bookingCount === 1 ? '' : 's'} logged`
                        }
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] font-bold text-slate-300">
                        <span>{lang === 'ar' ? 'نقاط ماس:' : 'MAS Points:'} {(bookingCount * 1500).toLocaleString()}</span>
                        <span>{lang === 'ar' ? 'الإنفاق:' : 'Spend:'} ${totalSpentUSD.toLocaleString()} USD</span>
                      </div>
                    </div>

                    {/* Progress to Next Milestone */}
                    {next && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                          <span>{lang === 'ar' ? `الرحلات: ${bookingCount} / ${next.target}` : `Voyages: ${bookingCount} / ${next.target}`}</span>
                          <span className="text-amber-600">{lang === 'ar' ? `التالي: ${next.nameAr}` : `Next: ${next.nameEn}`}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (bookingCount / next.target) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          {lang === 'ar' 
                            ? `احجز وأكمل ${next.target - bookingCount} رحلة أخرى لفتح فئة ${next.nameAr} والامتيازات المرافقة.`
                            : `Complete ${next.target - bookingCount} more luxury booking${next.target - bookingCount === 1 ? '' : 's'} to unlock ${next.nameEn} status benefits.`
                          }
                        </p>
                      </div>
                    )}

                    {/* Tier Privileges Summary */}
                    {config && (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                        <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                          {lang === 'ar' ? 'بعض امتيازات فئتك الحالية:' : 'Your Exclusive Tier Perks:'}
                        </h5>
                        <ul className="space-y-2 text-xs font-semibold text-slate-700">
                          {(lang === 'ar' ? config.perksAr : config.perksEn).map((perk, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Button to navigate to full rewards page */}
                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase py-3 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>{lang === 'ar' ? 'عرض تفاصيل الفئات والجوائز كاملة' : 'View Full Rewards & Sandbox'}</span>
                    </button>

                  </div>
                );
              })()}
            </div>
          </div>
          </div>
        )}

        {/* 24/7 Support Butler & Sovereign Ticketing Panel */}
        {activeTab === 'support' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {lang === 'ar' ? 'نظام التذاكر السيادي كبار الشخصيات' : 'Sovereign VIP Ticketing Room'}
                  </h4>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    {lang === 'ar' ? 'سجل تذاكر الخدمة، نسّق الترتيبات الخاصة، وتلقَّ الردود من مستشاري السفر المعتمدين ونظام الذكاء الاصطناعي.' : 'Catalog special concierge requests, upload catering requirements, or coordinate Mercedes logistics.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Active Support Tickets Queue */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    {lang === 'ar' ? 'تذاكر الخدمة النشطة' : 'Your Active Tickets'}
                  </h5>
                  
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {userTickets.map(ticket => {
                      const isSelected = selectedUserTicketId === ticket.id;
                      const statusColor = 
                        ticket.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-slate-50 text-slate-500 border-slate-100';

                      return (
                        <div
                          key={ticket.id}
                          onClick={() => {
                            setSelectedUserTicketId(ticket.id);
                            setUserTicketReply('');
                          }}
                          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-50/20 border-emerald-500 shadow-sm' 
                              : 'bg-white border-slate-200 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[9px] text-slate-400 font-extrabold">{ticket.id}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${statusColor}`}>
                              {lang === 'ar' && ticket.status === 'open' ? 'مفتوح' :
                               lang === 'ar' && ticket.status === 'in_progress' ? 'قيد التنفيذ' :
                               lang === 'ar' && ticket.status === 'resolved' ? 'تم الحل' : ticket.status}
                            </span>
                          </div>
                          <h6 className="font-bold text-xs text-slate-800 truncate">{ticket.subject}</h6>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
                            <span className="font-semibold">{ticket.category}</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}

                    {userTickets.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-6">
                        {lang === 'ar' ? 'لا يوجد تذاكر دعم نشطة حالياً.' : 'No active support tickets.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Open New Ticket Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                    {lang === 'ar' ? 'فتح تذكرة دعم جديدة' : 'Open a New Ticket'}
                  </h5>
                  <form onSubmit={handleCreateUserTicket} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[9px] uppercase text-slate-400 font-bold mb-1">
                        {lang === 'ar' ? 'موضوع الطلب' : 'Request Subject'}
                      </label>
                      <input
                        required
                        type="text"
                        value={userTicketSubject}
                        onChange={(e) => setUserTicketSubject(e.target.value)}
                        placeholder={lang === 'ar' ? 'مثال: طلب وجبة نباتية خاصة' : 'e.g. Mercedes pickup coordination'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase text-slate-400 font-bold mb-1">
                        {lang === 'ar' ? 'فئة الطلب' : 'Category'}
                      </label>
                      <select
                        value={userTicketCategory}
                        onChange={(e) => setUserTicketCategory(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="Chauffeur">{lang === 'ar' ? 'تنسيق السائق والسيارة' : 'Chauffeur Logistics'}</option>
                        <option value="Itinerary">{lang === 'ar' ? 'تعديل البرنامج السياحي' : 'Itinerary Changes'}</option>
                        <option value="Payment">{lang === 'ar' ? 'المدفوعات والفواتير' : 'Payment & Invoices'}</option>
                        <option value="Dietary">{lang === 'ar' ? 'الوجبات والمأكولات الخاصة' : 'Dietary Requests'}</option>
                        <option value="Special Request">{lang === 'ar' ? 'طلبات وترتيبات خاصة' : 'Special Request'}</option>
                        <option value="Other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase text-slate-400 font-bold mb-1">
                        {lang === 'ar' ? 'تفاصيل الطلب' : 'Detailed Query'}
                      </label>
                      <textarea
                        required
                        value={userTicketMessage}
                        onChange={(e) => setUserTicketMessage(e.target.value)}
                        placeholder={lang === 'ar' ? 'يرجى كتابة طلبك بالتفصيل...' : 'Describe your request in detail...'}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'تسجيل وإرسال التذكرة' : 'Submit Royal Request'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Columns: Active Ticket Conversation Room */}
              <div className="lg:col-span-2">
                {selectedUserTicketId ? (() => {
                  const ticket = userTickets.find(t => t.id === selectedUserTicketId);
                  if (!ticket) return null;
                  return (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between h-[450px]">
                      <div>
                        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {ticket.category}
                            </span>
                            <h4 className="text-sm font-black text-slate-800 mt-1">{ticket.subject}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Ticket ID: {ticket.id}</p>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                            ticket.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                            {lang === 'ar' && ticket.status === 'open' ? 'مفتوح' :
                             lang === 'ar' && ticket.status === 'in_progress' ? 'قيد التنفيذ' :
                             lang === 'ar' && ticket.status === 'resolved' ? 'تم الحل' : ticket.status}
                          </span>
                        </div>

                        {/* Message Stream */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto py-3 px-1 no-scrollbar my-2">
                          {ticket.messages.map((m, idx) => {
                            const isMe = m.sender === 'customer';
                            const isAi = m.sender === 'ai';
                            return (
                              <div
                                key={idx}
                                className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto'}`}
                              >
                                <span className="text-[8px] text-slate-400 font-bold mb-0.5 px-1 uppercase">
                                  {isMe ? (lang === 'ar' ? 'أنت' : 'You') : (isAi ? (lang === 'ar' ? 'مساعد الذكاء الاصطناعي' : '👑 AI Concierge') : (lang === 'ar' ? 'مدير الخدمات' : '💼 Personal Butler'))}
                                  <span> • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </span>
                                <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
                                  isMe 
                                    ? 'bg-emerald-600 border-emerald-500 text-white rounded-tr-none' 
                                    : (isAi 
                                        ? 'bg-purple-50 border-purple-100 text-purple-950 rounded-tl-none font-medium' 
                                        : 'bg-slate-50 border-slate-100 text-slate-800 rounded-tl-none font-medium')
                                }`}>
                                  <p className="whitespace-pre-wrap">{m.message}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message Input reply */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendUserTicketMessage(ticket.id);
                        }}
                        className="border-t border-slate-100 pt-3 flex gap-2"
                      >
                        <input
                          type="text"
                          value={userTicketReply}
                          onChange={(e) => setUserTicketReply(e.target.value)}
                          placeholder={lang === 'ar' ? 'اكتب ردك وملاحظاتك الإضافية...' : 'Reply to your luxury advisor...'}
                          className="flex-1 text-slate-800 text-xs bg-slate-50 border border-slate-150 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                        <button
                          type="submit"
                          disabled={!userTicketReply.trim()}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded-lg flex items-center justify-center cursor-pointer transition-all disabled:opacity-40"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  );
                })() : (
                  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 italic text-xs h-[400px] flex flex-col justify-center items-center gap-2">
                    <Ticket className="w-8 h-8 text-slate-300 animate-pulse" />
                    <span>
                      {lang === 'ar' ? 'الرجاء اختيار تذكرة دعم مخصصة لعرض المحادثة وتواصل مستشاري السفر المعتمدين.' : 'Select an active support ticket on the left column to open the secure message room.'}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Simulated WhatsApp Alerts Panel */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{lang === 'ar' ? 'تكامل واتساب الموثق للأعمال' : 'WhatsApp Notifications'}</h4>
                <p className="text-[10px] text-emerald-600 font-semibold">{lang === 'ar' ? 'تلقائيًا، ترسل هذه اللوحة إشعارات فورية بالسيارات والخدمات بمجرد اكتمال الدفع أو تعيين السائقين.' : 'Automatic updates sent to your phone (+1 415-555-2671).'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {crmProfile.whatsappHistory.map((msg, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex gap-3 relative">
                  <div className="bg-emerald-100 p-2 rounded-full h-8 w-8 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                        <span>MAS Agency Business API</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black">VERIFIED</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs md:text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loyalty Club Panel */}
        {activeTab === 'rewards' && (
          <div className="animate-fade-in">
            <LoyaltyTier 
              lang={lang} 
              bookings={bookings} 
              totalSpent={crmProfile.totalSpentUSD || 0} 
            />
          </div>
        )}

        {/* Saved Companions Panel */}
        {activeTab === 'saved' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-bold text-slate-800">{lang === 'ar' ? 'سجلات المرافقين والمسافرين' : 'Saved Travelers'}</h4>
              <button 
                onClick={() => alert('New companion record setup form')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إضافة مرافق جديد' : 'Add New Record'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crmProfile.name ? (
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-full text-slate-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{crmProfile.name}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">{lang === 'ar' ? 'العميل الأساسي' : 'Primary Traveler'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-sans">{crmProfile.nationality}</span>
                </div>
              ) : null}

              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-full text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Charlotte de-Mena</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{lang === 'ar' ? 'مرافق محفوظ' : 'Companion'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 font-sans">France</span>
              </div>
            </div>
          </div>
        )}

        {/* Security Profile Panel */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fade-in text-slate-800" id="security-profile-panel">
            {/* Header Badge & Title */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <ShieldCheck className="w-48 h-48 text-emerald-400" />
              </div>
              
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-emerald-500 text-slate-950 px-2.5 py-1 rounded font-black uppercase tracking-widest animate-pulse">
                    {lang === 'ar' ? 'درع الأمان السيادي' : 'SOVEREIGN TRUST PROTOCOL'}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                
                <h3 className="text-xl font-bold font-sans tracking-tight">
                  {lang === 'ar' ? 'الأمان البيومتري والتحقق من المعاملات' : 'Biometric Security & Transaction Protection'}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-medium">
                  {lang === 'ar' 
                    ? 'قم بإدارة وتفعيل التوقيعات البيومترية لتأمين حجوزات الطيران الخاص، واليخوت الفاخرة، والرحلات الاستكشافية الاستثنائية.'
                    : 'Configure high-assurance biometric verification to safeguard luxury private charters, elite yacht bookings, and custom archaeological expeditions.'}
                </p>

                {/* Status Indicator */}
                <div className="pt-3 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                    {lang === 'ar' ? 'مستوى الحماية الحالي للملف:' : 'SECURITY PROFILE LEVEL:'}
                  </span>
                  {biometricsLinked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold" id="biometrics-active-badge">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'ar' ? 'نشط ومحمي بالبصمة البيومترية السيادية' : 'Sovereign Biometric Vault Active'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold" id="biometrics-inactive-badge">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'ar' ? 'حماية كلمة المرور القياسية فقط' : 'Standard Password Protection Only'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Security Options Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Biometric Enrollment & Test Scanner */}
              <div className="space-y-6">
                {scanStatus === 'scanning' ? (
                  <div className="bg-slate-950 rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 animate-pulse relative overflow-hidden min-h-[220px]">
                    {/* Moving laser scan line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.8)]" style={{ animationDuration: '2s' }} />
                    
                    <div className="bg-slate-900/80 p-6 rounded-full border border-emerald-500/30 text-emerald-400 relative">
                      <Fingerprint className="w-16 h-16 animate-pulse text-emerald-400" />
                      <div className="absolute inset-0 border-2 border-dashed border-emerald-400/40 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                        {lang === 'ar' ? 'جاري محاكاة اتصال مصافحة الأمان البيومتري...' : 'SIMULATING SECURE BIOMETRIC HANDSHAKE...'}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-bold">
                        {lang === 'ar' ? 'جاري محاذاة مستشعر البصمة مع مفاتيح التشفير السيادية...' : 'Aligning biometric sensor with Sovereign hardware keys...'}
                      </p>
                    </div>
                  </div>
                ) : scanStatus === 'success' ? (
                  <div className="bg-slate-950 rounded-2xl p-8 border border-emerald-500/30 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in relative overflow-hidden min-h-[220px]">
                    <div className="bg-emerald-500/10 p-5 rounded-full border-2 border-emerald-500 text-emerald-400">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 fill-emerald-500/10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                        {lang === 'ar' ? 'تمت المصادقة بنجاح!' : 'AUTHENTICATION APPROVED!'}
                      </p>
                      <p className="text-xs text-slate-300 max-w-xs font-medium">
                        {lang === 'ar' 
                          ? 'اكتمل التحقق البيومتري بنجاح. تم تشفير التوقيع بأمان في شريحة الجهاز.'
                          : 'Biometric verification complete. Signature securely hashed in local enclave.'}
                      </p>
                    </div>
                  </div>
                ) : !biometricsLinked ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 min-h-[220px] flex flex-col justify-between" id="biometrics-linking-card">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
                        <Fingerprint className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {lang === 'ar' ? 'التسجيل البيومتري الفوري' : 'Instant Biometric Enrollment'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                          {lang === 'ar' 
                            ? 'اختر الطريقة المفضلة لديك لبدء محاكاة عملية ربط التوقيع الآمن بجهازك.' 
                            : 'Choose your preferred method to begin simulating the secure cryptographic linking with your device.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        id="link-faceid-btn"
                        onClick={() => runBiometricSimulation('face')}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'ar' ? 'ربط بصمة الوجه' : 'Link FaceID'}</span>
                      </button>
                      <button
                        id="link-touchid-btn"
                        onClick={() => runBiometricSimulation('fingerprint')}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
                      >
                        <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'ar' ? 'ربط بصمة الإصبع' : 'Link TouchID'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 min-h-[220px] flex flex-col justify-between" id="biometrics-active-card">
                    <div className="flex items-start gap-4 justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">
                            {lang === 'ar' ? 'المفتاح البيومتري مفعل ومحمي' : 'Biometric Vault Active & Protected'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {lang === 'ar' 
                              ? `النوع النشط حاليًا: ${selectedBiometricType === 'face' ? 'بصمة الوجه الملكية' : 'بصمة الإصبع السيادية'}` 
                              : `Registered credentials: ${selectedBiometricType === 'face' ? 'Sovereign FaceID' : 'Sovereign TouchID'}`}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        id="revoke-biometrics-btn"
                        onClick={() => {
                          setBiometricsLinked(false);
                          setHighValueLock(false);
                          const eventEn = 'Biometric Credentials Revoked';
                          const eventAr = 'تم إلغاء صلاحية المفاتيح البيومترية';
                          setSecurityLogs(prev => [{ id: String(Date.now()), eventEn, eventAr, time: 'Just Now', ip: '197.34.112.9' }, ...prev]);
                        }}
                        className="text-rose-600 hover:text-rose-700 font-extrabold text-[10px] uppercase tracking-wider bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200/50 transition-colors cursor-pointer"
                      >
                        {lang === 'ar' ? 'إلغاء الربط' : 'REVOKE'}
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        id="test-biometrics-btn"
                        onClick={() => runBiometricSimulation(selectedBiometricType)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-95"
                      >
                        <Activity className="w-4 h-4 text-emerald-100" />
                        <span>{lang === 'ar' ? 'اختبار مصادقة البصمة والتحقق منها' : 'Test Biometric Auth Verification'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Secure Cryptographic Activity Logs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3" id="security-logs-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      {lang === 'ar' ? 'سجل الحماية وتفويض المفاتيح الأخير' : 'Recent Hardware Security Log Ledger'}
                    </h4>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto no-scrollbar">
                    {securityLogs.map(log => (
                      <div key={log.id} className="py-2.5 flex items-center justify-between text-[11px] font-medium">
                        <div className="space-y-0.5">
                          <p className="text-slate-800 font-bold">
                            {lang === 'ar' ? log.eventAr : log.eventEn}
                          </p>
                          <p className="text-[10px] text-slate-400 font-sans">
                            {lang === 'ar' ? 'عنوان الـ IP:' : 'IP address:'} {log.ip}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {log.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Transaction Policies & Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col justify-between" id="high-value-policy-card">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-800">
                      {lang === 'ar' ? 'حماية المعاملات عالية القيمة' : 'High-Value Transaction Enclave Protection'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {lang === 'ar' 
                      ? 'تتطلب تفعيل مصادقة بيومترية صارمة عبر شريحة الحماية بهاتفك لأي معاملة، حجز، أو ترقية تتجاوز قيمتها ٥,٠٠٠ دولار لحمايتك من العمليات غير المصرح بها.'
                      : 'Require strict hardware enclave biometric signature validation for all high-value luxury bookings or custom flight charters above $5,000 USD to prevent unauthorized transfers.'}
                  </p>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        {lang === 'ar' ? 'شريحة الحماية والأجهزة المتصلة' : 'Hardware Secure Enclave Integration'}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                        {lang === 'ar'
                          ? 'تعتمد هذه الخدمة على معيار تشفير FIDO2 المعترف به دولياً لتوليد أزواج مفاتيح خاصة فريدة للجهاز، لا يمكن الوصول إليها من الخارج.'
                          : 'Our system relies on local hardware-secured key generation. Private signature hashes remain locally stored on your trusted device and are never transmitted over the network.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    {highValueLock ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-700 uppercase tracking-wide font-black text-[10px]">
                          {lang === 'ar' ? 'القفل النشط مفعل' : 'ENCLAVE ACTIVE'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        <span className="text-slate-500 uppercase tracking-wide font-black text-[10px]">
                          {lang === 'ar' ? 'غير مفعل' : 'DISABLED'}
                        </span>
                      </>
                    )}
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="high-value-lock-toggle"
                      type="checkbox"
                      checked={highValueLock}
                      onChange={(e) => {
                        if (!biometricsLinked) {
                          alert(lang === 'ar' ? 'يرجى ربط بصمتك البيومترية أولاً لتفعيل قفل الأمان للمعاملات عالية القيمة.' : 'Please link biometric authentication first to enable High-Value transaction protection.');
                          return;
                        }
                        setHighValueLock(e.target.checked);
                        
                        const eventEn = e.target.checked ? 'High-Value Transaction Lock Enabled' : 'High-Value Transaction Lock Disabled';
                        const eventAr = e.target.checked ? 'تم تفعيل قفل المعاملات عالية القيمة' : 'تم تعطيل قفل المعاملات عالية القيمة';
                        setSecurityLogs(prev => [{ id: String(Date.now()), eventEn, eventAr, time: 'Just Now', ip: '197.34.112.9' }, ...prev]);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refer a Traveler Panel */}
        {activeTab === 'referral' && (
          <div className="space-y-6 animate-fade-in text-slate-800" id="referral-program-panel">
            {/* Header Badge & Title */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden shadow-sm" id="referral-hero-banner">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Gift className="w-48 h-48 text-amber-400" />
              </div>
              
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-2.5 py-1 rounded font-black uppercase tracking-widest animate-pulse">
                    {lang === 'ar' ? 'برنامج السفير الملكي للمسافرين' : 'ROYAL TRAVELER AMBASSADOR PROGRAM'}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                </div>
                
                <h3 className="text-xl font-bold font-sans tracking-tight">
                  {lang === 'ar' ? 'شارك شغف الاستكشاف والرفاهية' : 'Share Your Passion for Extraordinary Voyages'}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-medium">
                  {lang === 'ar' 
                    ? 'ادعُ أصدقاءك النخبة للانضمام إلى رحلاتنا الفاخرة والاستكشافية. عند حجزهم لأول رحلة، ستحصل كلاهما على مكافآت متميزة وترقية لدرجة العضوية.'
                    : 'Invite fellow discerning travelers to discover our curated luxury private itineraries and archaeological journeys. Secure exclusive elite rewards and tier bonuses.'}
                </p>

                {/* Quick Stats Summary */}
                <div className="pt-3 flex flex-wrap gap-4 items-center">
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{lang === 'ar' ? 'النقاط النشطة المكتسبة' : 'Active Points Earned'}</p>
                    <p className="text-sm font-black text-amber-400">
                      {referralHistory.filter(r => r.status !== 'Pending').reduce((sum, r) => sum + r.bonusPoints, 0).toLocaleString()} PTS
                    </p>
                  </div>
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{lang === 'ar' ? 'النقاط المعلقة المحتملة' : 'Potential Pending Points'}</p>
                    <p className="text-sm font-black text-slate-300">
                      {referralHistory.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.bonusPoints, 0).toLocaleString()} PTS
                    </p>
                  </div>
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{lang === 'ar' ? 'إجمالي الدعوات المرسلة' : 'Total Invites'}</p>
                    <p className="text-sm font-black text-emerald-400">{referralHistory.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Referral Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Form to Invite & Sharing Links */}
              <div className="space-y-6">
                
                {/* Invite Form */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4" id="referral-invite-card">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <UserPlus className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">
                      {lang === 'ar' ? 'دعوة صديق جديد' : 'Invite a Fellow Explorer'}
                    </h4>
                  </div>

                  {refSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-fade-in" id="referral-success-alert">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>{refSuccessMsg}</div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-black text-slate-500 mb-1">
                        {lang === 'ar' ? 'اسم الصديق المدعو' : "Friend's Full Name"}
                      </label>
                      <input
                        id="referral-friend-name-input"
                        type="text"
                        placeholder={lang === 'ar' ? 'أدخل اسم الصديق الكامل...' : 'Enter their name...'}
                        value={refFriendName}
                        onChange={(e) => setRefFriendName(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-black text-slate-500 mb-1">
                        {lang === 'ar' ? 'البريد الإلكتروني' : "Friend's Email Address"}
                      </label>
                      <input
                        id="referral-friend-email-input"
                        type="email"
                        placeholder={lang === 'ar' ? 'friend@example.com' : 'friend@example.com'}
                        value={refFriendEmail}
                        onChange={(e) => setRefFriendEmail(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-black text-slate-500 mb-1">
                        {lang === 'ar' ? 'الرحلة أو الجولة المقترحة' : 'Recommend a Luxury Tour / Itinerary'}
                      </label>
                      <select
                        id="referral-recommended-tour-select"
                        value={refRecommendedTour}
                        onChange={(e) => setRefRecommendedTour(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors"
                      >
                        <option value="Giza Pyramids Private Viewing">
                          {lang === 'ar' ? 'مشاهدة خاصة لأهرامات الجيزة' : 'Giza Pyramids Private Viewing'}
                        </option>
                        <option value="Grand Nile River Cruise">
                          {lang === 'ar' ? 'رحلة نيلية كبرى فاخرة' : 'Grand Nile River Cruise'}
                        </option>
                        <option value="Luxor Helicopter Charter">
                          {lang === 'ar' ? 'طيران خاص بالهليكوبتر فوق الأقصر' : 'Luxor Helicopter Charter'}
                        </option>
                        <option value="Sovereign Red Sea Sailing">
                          {lang === 'ar' ? 'إبحار خاص بالبحر الأحمر الملكي' : 'Sovereign Red Sea Sailing'}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-black text-slate-500 mb-1">
                        {lang === 'ar' ? 'رسالة شخصية (اختياري)' : 'Personal message (Optional)'}
                      </label>
                      <textarea
                        id="referral-custom-message-input"
                        rows={3}
                        placeholder={lang === 'ar' ? 'أود أن أدعوك لاستكشاف هذه التجربة الاستثنائية معنا...' : 'Join me on this magnificent expedition...'}
                        value={refCustomMessage}
                        onChange={(e) => setRefCustomMessage(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors resize-none"
                      />
                    </div>

                    <button
                      id="btn-send-referral"
                      onClick={() => {
                        if (!refFriendName.trim() || !refFriendEmail.trim()) {
                          alert(lang === 'ar' ? 'يرجى إدخال اسم صديقك وبريده الإلكتروني لإرسال الدعوة.' : "Please fill in your friend's name and email.");
                          return;
                        }
                        
                        // Add live pending referral to history state
                        const newReferral = {
                          id: `ref-${Date.now()}`,
                          name: refFriendName,
                          email: refFriendEmail,
                          tourRecommended: refRecommendedTour,
                          status: 'Pending' as const,
                          bonusPoints: 5000,
                          date: 'Just Now'
                        };
                        setReferralHistory(prev => [newReferral, ...prev]);
                        setRefSuccessMsg(lang === 'ar' 
                          ? `تم إرسال دعوة سفر حصرية بنجاح إلى ${refFriendName}! ستحصل على 5,000 نقطة فور حجزهم للرحلة.`
                          : `Exclusive invitation successfully dispatched to ${refFriendName}! You will earn 5,000 bonus points upon their booking.`
                        );

                        // Clear inputs
                        setRefFriendName('');
                        setRefFriendEmail('');
                        setRefCustomMessage('');

                        setTimeout(() => {
                          setRefSuccessMsg(null);
                        }, 5000);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-95"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'ar' ? 'إرسال بطاقة الدعوة الفاخرة' : 'Send Exclusive Invitation'}</span>
                    </button>
                  </div>
                </div>

                {/* Instant Share Link Component */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4" id="referral-code-card">
                  <div className="flex items-center gap-2 pb-1">
                    <Share2 className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-800">
                      {lang === 'ar' ? 'رابط مشاركة سفير التميز' : 'Your Ambassador Share Link'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {lang === 'ar'
                      ? 'شارك رابطك المخصص مباشرة على شبكاتك المفضلة لتلقي نقاط إضافية عن أي انضمام ناجح.'
                      : 'Distribute your bespoke premium referral URL directly. Instantly credited to your sovereign ledger upon user sign-up.'}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-mono font-bold text-slate-600 flex-1 overflow-x-auto no-scrollbar whitespace-nowrap">
                      {`https://sovereign-tours.co/vip-invite?code=SOV-${crmProfile.name.split(' ')[0].toUpperCase()}-${crmProfile.nationality ? crmProfile.nationality.toUpperCase().slice(0,3) : 'VIP'}`}
                    </div>
                    <button
                      id="btn-copy-ref-link"
                      onClick={() => {
                        const link = `https://sovereign-tours.co/vip-invite?code=SOV-${crmProfile.name.split(' ')[0].toUpperCase()}-${crmProfile.nationality ? crmProfile.nationality.toUpperCase().slice(0,3) : 'VIP'}`;
                        navigator.clipboard.writeText(link);
                        setRefCopied(true);
                        setTimeout(() => setRefCopied(false), 3000);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        refCopied 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
                      }`}
                    >
                      {refCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {refCopied && (
                    <p className="text-[10px] text-emerald-600 font-bold text-right" id="ref-copied-feedback">
                      {lang === 'ar' ? 'تم نسخ الرابط الحصري للحافظة!' : 'Premium link copied to clipboard!'}
                    </p>
                  )}
                </div>

              </div>

              {/* Right Column: Reward Points & Interactive Simulation History */}
              <div className="space-y-6">

                {/* Progress Tracker toward Milestone rewards */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4" id="referral-points-tracker-card">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h4 className="text-sm font-bold text-slate-800">
                        {lang === 'ar' ? 'تتبع نقاط المكافآت والجوائز الحصرية' : 'Reward Milestones & Progression'}
                      </h4>
                    </div>
                  </div>

                  {/* Calculations */}
                  {(() => {
                    const activePoints = referralHistory.filter(r => r.status !== 'Pending').reduce((sum, r) => sum + r.bonusPoints, 0);
                    const nextMilestonePoints = activePoints < 5000 ? 5000 : activePoints < 10000 ? 10000 : activePoints < 15000 ? 15000 : 20000;
                    const pct = Math.min(100, Math.round((activePoints / nextMilestonePoints) * 100));
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              {lang === 'ar' ? 'مجموع النقاط النشطة:' : 'CURRENT REWARD LEDGER:'}
                            </span>
                            <span className="text-2xl font-black text-amber-500 font-sans tracking-tight">
                              {activePoints.toLocaleString()} <span className="text-xs font-bold text-slate-400">PTS</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              {lang === 'ar' ? 'الجائزة القادمة عند:' : 'NEXT AMBASSADOR GOAL:'}
                            </span>
                            <span className="text-xs font-extrabold text-slate-700">
                              {nextMilestonePoints.toLocaleString()} PTS
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/40 relative">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Milestone Cards list */}
                        <div className="space-y-2.5 pt-2">
                          {[
                            { points: 5000, rewardEn: 'Royal Airport VIP Lounge Access', rewardAr: 'دخول مجاني لصالات كبار الشخصيات بالمطارات', unlocked: activePoints >= 5000 },
                            { points: 10000, rewardEn: 'Premium Private Chauffeur Day Booking', rewardAr: 'خدمة سائق خاص فاخر ليوم كامل', unlocked: activePoints >= 10000 },
                            { points: 15000, rewardEn: 'Private Archaeological Curator Tour Guide', rewardAr: 'أمين متحف خاص مرشد لرحلتك الأثرية', unlocked: activePoints >= 15000 },
                          ].map((milestone, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                milestone.unlocked 
                                  ? 'bg-emerald-50/60 border-emerald-100 text-emerald-950' 
                                  : 'bg-slate-50/50 border-slate-100 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${milestone.unlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                  {milestone.unlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold font-sans">
                                    {lang === 'ar' ? milestone.rewardAr : milestone.rewardEn}
                                  </p>
                                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                                    {lang === 'ar' ? `${milestone.points} نقطة مطلوبة` : `${milestone.points.toLocaleString()} Points Needed`}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                                milestone.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {milestone.unlocked ? (lang === 'ar' ? 'مفتوح' : 'UNLOCKED') : (lang === 'ar' ? 'مغلق' : 'LOCKED')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Simulated Ledger of referred friends with interaction to complete their tour */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4" id="referral-history-card">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-600" />
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                        {lang === 'ar' ? 'سجل تتبع المسافرين المدعوين' : 'Your Ambassador Referrals Registry'}
                      </h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    {lang === 'ar' 
                      ? 'لقد دمجنا محاكيًا خاصًا يتيح لك محاكاة إتمام أصدقائك للحجز وتجربة إضافة النقاط المباشرة وتأمين الهدايا التذكارية!'
                      : 'We have integrated a live simulation so you can immediately experience booking completions, see points credit instantly, and unlock luxury milestones!'}
                  </p>

                  <div className="space-y-3 max-h-[280px] overflow-y-auto no-scrollbar">
                    {referralHistory.map((ref) => (
                      <div key={ref.id} className="p-3.5 bg-slate-50/80 border border-slate-200/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs" id={`ref-item-${ref.id}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{ref.name}</span>
                            <span className="text-[10px] text-slate-400">({ref.email})</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-slate-500">
                            <span>{lang === 'ar' ? 'الرحلة:' : 'Tour:'} {ref.tourRecommended}</span>
                            <span>•</span>
                            <span>{ref.date}</span>
                          </div>
                          
                          {/* Point values & Status badge */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              ref.status === 'Completed' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : ref.status === 'Joined' 
                                ? 'bg-teal-100 text-teal-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ref.status === 'Completed' ? (lang === 'ar' ? 'مكتمل' : 'Completed') : ref.status === 'Joined' ? (lang === 'ar' ? 'انضم' : 'Joined') : (lang === 'ar' ? 'معلق' : 'Pending')}
                            </span>
                            <span className="text-[10px] text-amber-500 font-bold">
                              {ref.status === 'Completed' ? `+${ref.bonusPoints} PTS` : ref.status === 'Joined' ? `+1,000 PTS (Sign-up bonus)` : `+${ref.bonusPoints} PTS Potential`}
                            </span>
                          </div>
                        </div>

                        {/* Interactive simulation action button */}
                        {ref.status !== 'Completed' && (
                          <button
                            id={`btn-simulate-complete-${ref.id}`}
                            onClick={() => {
                              // Update referral state to completed
                              setReferralHistory(prev => prev.map(item => {
                                if (item.id === ref.id) {
                                  return { ...item, status: 'Completed', bonusPoints: 5000 };
                                }
                                return item;
                              }));
                              
                              // Notify user with success
                              alert(lang === 'ar' 
                                ? `محاكاة ناجحة! لقد أتم ${ref.name} حجز رحلته الفاخرة. تمت إضافة 5,000 نقطة بنجاح لرصيدك الفوري!`
                                : `Simulation successful! ${ref.name} completed their custom luxury booking. 5,000 premium loyalty points credited to your Ambassador ledger!`
                              );
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] tracking-wide uppercase px-2.5 py-1.5 rounded-lg border border-emerald-500/20 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                          >
                            {ref.status === 'Joined' 
                              ? (lang === 'ar' ? 'محاكاة إتمام الحجز' : 'Simulate Complete') 
                              : (lang === 'ar' ? 'محاكاة الانضمام والحجز' : 'Simulate Sign-up & Book')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      {sharingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 overflow-hidden shadow-2xl animate-fade-in text-slate-800">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold tracking-tight">
                  {lang === 'ar' ? 'مشاركة تفاصيل الرحلة الملكية' : 'Share Luxury Expedition'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSharingBooking(null);
                  setCopiedShareLink(false);
                  setCopiedShareText(false);
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {lang === 'ar'
                  ? 'شارك تفاصيل رحلتك الفاخرة وجدول أعمالك الاستثنائي مع عائلتك وأصدقائك عبر رابط تفاعلي أو رسالة واتساب مجهزة.'
                  : 'Share your upcoming ultra-luxury expedition details, chauffeur schedules, and itinerary highlights with friends or family.'}
              </p>

              {/* Itinerary highlight card preview */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 font-sans">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{lang === 'ar' ? 'معاينة الرسالة المشاركة' : 'Share Message Preview'}</span>
                  <span className="text-amber-600">ID: {sharingBooking.id}</span>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-xs text-slate-700 whitespace-pre-wrap font-medium font-mono max-h-48 overflow-y-auto leading-relaxed">
                  {getShareHighlightsText(sharingBooking)}
                </div>
              </div>

              {/* Sharing actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Copy public link */}
                <button
                  type="button"
                  onClick={async () => {
                    const shareUrl = `${window.location.origin}/?share-itinerary=${sharingBooking.id}`;
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      setCopiedShareLink(true);
                      setTimeout(() => setCopiedShareLink(false), 2000);
                    } catch (e) {
                      const el = document.createElement('textarea');
                      el.value = shareUrl;
                      document.body.appendChild(el);
                      el.select();
                      document.execCommand('copy');
                      document.body.removeChild(el);
                      setCopiedShareLink(true);
                      setTimeout(() => setCopiedShareLink(false), 2000);
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer border border-slate-800 uppercase tracking-wider"
                >
                  {copiedShareLink ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'ar' ? 'تم نسخ الرابط!' : 'Link Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'ar' ? 'نسخ الرابط التفاعلي' : 'Copy Public Link'}</span>
                    </>
                  )}
                </button>

                {/* Copy Message Text */}
                <button
                  type="button"
                  onClick={async () => {
                    const shareText = getShareHighlightsText(sharingBooking);
                    try {
                      await navigator.clipboard.writeText(shareText);
                      setCopiedShareText(true);
                      setTimeout(() => setCopiedShareText(false), 2000);
                    } catch (e) {
                      const el = document.createElement('textarea');
                      el.value = shareText;
                      document.body.appendChild(el);
                      el.select();
                      document.execCommand('copy');
                      document.body.removeChild(el);
                      setCopiedShareText(true);
                      setTimeout(() => setCopiedShareText(false), 2000);
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer border border-slate-200 uppercase tracking-wider"
                >
                  {copiedShareText ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'ar' ? 'تم نسخ النص!' : 'Text Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>{lang === 'ar' ? 'نسخ النص المجهز' : 'Copy Raw Text'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct WhatsApp Share button */}
              <button
                type="button"
                onClick={() => handleWhatsAppShare(sharingBooking)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 px-4 rounded-xl transition-all shadow-md cursor-pointer border border-emerald-700 uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'ar' ? 'مشاركة عبر واتساب المباشر' : 'Share Directly via WhatsApp'}</span>
              </button>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSharingBooking(null);
                  setCopiedShareLink(false);
                  setCopiedShareText(false);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs py-2.5 px-5 rounded-lg transition-colors cursor-pointer uppercase"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        staffName={selectedStaffName}
        role={selectedStaffRole}
        lang={lang}
      />
    </div>
  );
}
