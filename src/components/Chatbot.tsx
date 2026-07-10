import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, X, Bot, Sparkles, Crown, Lock, ArrowRight, 
  Volume2, VolumeX, Mic, MicOff, CloudSun, Compass, CheckSquare, 
  Square, RefreshCw, Landmark, ShieldCheck, Star, Calendar, MapPin, 
  MessageCircle, LifeBuoy, Inbox, History, UserCheck, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations.js';
import { AppLanguage, Tour } from '../types.js';
import { useAuth } from '../contexts/AuthContext.js';
import { db, auth } from '../lib/firebase.js';
import { 
  collection, doc, getDocs, setDoc, query, orderBy, onSnapshot, serverTimestamp 
} from 'firebase/firestore';

interface ChatbotProps {
  lang: AppLanguage;
  onSelectTour?: (tour: Tour) => void;
  onOpenPackingAssistant?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  type?: 'text' | 'weather' | 'tours' | 'packing' | 'vip_privileges' | 'converter';
  meta?: any;
}

const vipActions = [
  { 
    labelEn: '🚁 Helicopter Charter', 
    labelAr: '🚁 مروحية خاصة', 
    msgEn: 'I would like to request a private helicopter transfer from Cairo Airport directly to my hotel.',
    msgAr: 'أود طلب نقل خاص بطائرة مروحية من مطار القاهرة مباشرة إلى الفندق الخاص بي.'
  },
  { 
    labelEn: '⛵ Sunset Yacht Dinner', 
    labelAr: '⛵ عشاء يخت فاخر', 
    msgEn: 'Can you coordinate an exclusive private sunset yacht dinner with a personal chef?',
    msgAr: 'هل يمكنك تنسيق عشاء غروب حصري على يخت خاص مع طاهٍ شخصي؟'
  },
  { 
    labelEn: '📸 Elite Scholar Guide', 
    labelAr: '📸 مرشد أثري كبير', 
    msgEn: 'Please assign Dr. Zahi or a top Egyptology scholar for my upcoming Pyramids expedition.',
    msgAr: 'يرجى تعيين الدكتور زاهي أو أحد كبار علماء الآثار لجولتي القادمة في الأهرامات.'
  },
  { 
    labelEn: '📞 Driver Dispatch', 
    labelAr: '📞 مكالمة من السائق', 
    msgEn: 'I need my private Mercedes-Maybach chauffeur to contact me regarding my luggage requirements.',
    msgAr: 'أحتاج من سائق المرسيدس مايباخ الخاص بي الاتصال بي بخصوص تفاصيل أمتعتي.'
  }
];

export default function Chatbot({ lang, onSelectTour, onOpenPackingAssistant }: ChatbotProps) {
  const { customerUser } = useAuth();
  const t = translations[lang];

  // Resolve user profile gracefully (fallback to default diamond email for simulation)
  const activeUser = customerUser || {
    name: 'Diamond Traveler',
    email: 'diamond.entertainment70@gmail.com',
    phone: '+1 555-0199',
    nationality: 'United States',
    language: 'en',
    biography: 'Sovereign Voyager'
  };

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [actualTier, setActualTier] = useState<string>('Bronze');
  const [simulatedTier, setSimulatedTier] = useState<string | null>(null);
  const [vipMode, setVipMode] = useState(false);

  // Chat window tabs ('ai' = Zephyr AI Butler, 'tickets' = Live Chat Support Tickets)
  const [chatTab, setChatTab] = useState<'ai' | 'tickets'>('ai');

  // Personalized recommendation states
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  // Customer support ticketing states
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);
  
  // Suggested solutions using Gemini
  const [suggestedAnswers, setSuggestedAnswers] = useState<{ title: string; content: string }[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [expandedSuggestionIdx, setExpandedSuggestionIdx] = useState<number | null>(null);
  
  // Custom states for widget interactions
  const [converterAmount, setConverterAmount] = useState('100');
  const [converterDirection, setConverterDirection] = useState<'USD_EGP' | 'EGP_USD'>('USD_EGP');
  const [packingItems, setPackingItems] = useState([
    { id: '1', label: lang === 'ar' ? 'نظارات شمسية فاخرة' : 'UV Designer Sunglasses', checked: true },
    { id: '2', label: lang === 'ar' ? 'ملابس كتان مريحة' : 'Breathable Linen Outfits', checked: true },
    { id: '3', label: lang === 'ar' ? 'كريم واقي من الشمس SPF 50+' : 'SPF 50+ Sunscreen block', checked: false },
    { id: '4', label: lang === 'ar' ? 'جواز سفر مع فيزا الدخول' : 'Passport and Egyptian Visa', checked: false },
    { id: '5', label: lang === 'ar' ? 'محول كهربائي للرحلات' : 'International travel adapters', checked: false },
    { id: '6', label: lang === 'ar' ? 'كاميرا تصوير عالية الدقة' : 'Premium DSLR/Leica Camera', checked: false }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      timestamp: new Date(),
      text: lang === 'ar' 
        ? 'مرحبًا بك يا سيدي الكريم في وكالة ماس الفاخرة. أنا "زيفير"، خادمك الرقمي المخصص. كيف يمكنني مساعدتك اليوم في التخطيط لرحلتك الملكية القادمة في مصر؟'
        : 'Welcome, distinguished guest. I am Zephyr, your dedicated luxury travel travel butler for MAS Agency. How may I orchestrate your sovereign itinerary in Egypt today?'
    }
  ]);
  
  const [typing, setTyping] = useState(false);
  
  // TTS (Text to Speech) audio playing state
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speech Recognition (Speech to Text) states
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const ticketScrollRef = useRef<HTMLDivElement>(null);

  const activeTier = simulatedTier || actualTier;
  const isVipTier = activeTier === 'Diamond' || activeTier === 'Platinum';

  // Firestore Error Helper (compliant with skill guidelines)
  const logFirestoreError = (error: unknown, op: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write', path: string) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType: op,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified
      }
    };
    console.error('Firestore Security/Operation Error:', JSON.stringify(errInfo));
  };

  // PERSISTENCE: Save Chatbot message to Firestore
  const saveMessageToFirestore = async (msg: Message) => {
    if (!activeUser?.email) return;
    const userIdClean = activeUser.email.replace(/[@.]/g, '_');
    const path = `chats/${userIdClean}/messages/${msg.id}`;
    try {
      // 1. Establish parent session document first
      await setDoc(doc(db, 'chats', userIdClean), {
        id: userIdClean,
        userId: auth.currentUser?.uid || 'guest',
        userEmail: activeUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        title: `Zephyr AI Concierge - ${activeUser.name}`
      }, { merge: true });

      // 2. Write conversation turn document
      await setDoc(doc(db, 'chats', userIdClean, 'messages', msg.id), {
        id: msg.id,
        sender: msg.sender,
        text: msg.text || '',
        timestamp: serverTimestamp(),
        type: msg.type || 'text',
        meta: msg.meta ? JSON.stringify(msg.meta) : ''
      });
    } catch (err) {
      logFirestoreError(err, 'write', path);
    }
  };

  // PERSISTENCE: Load Chatbot history from Firestore
  const loadChatHistoryFromFirestore = async () => {
    if (!activeUser?.email) return;
    const userIdClean = activeUser.email.replace(/[@.]/g, '_');
    const path = `chats/${userIdClean}/messages`;
    try {
      const messagesRef = collection(db, 'chats', userIdClean, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const loadedMessages: Message[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedMessages.push({
            id: data.id,
            sender: data.sender,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            type: data.type || 'text',
            meta: data.meta ? JSON.parse(data.meta) : undefined
          });
        });
        setMessages(loadedMessages);
      }
    } catch (err) {
      logFirestoreError(err, 'list', path);
    }
  };

  // PROACTIVE CONCIERGE: Generate bespoke recommendation from Gemini
  const generatePersonalizedTourRecommendation = async () => {
    if (!activeUser?.email || loadingRec || recommendation) return;
    setLoadingRec(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingHistory: bookings,
          userPreferences: activeUser,
          lang
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.recommendation) {
          setRecommendation(data.recommendation);
        }
      }
    } catch (e) {
      console.error('Error generating proactive recommendations:', e);
    } finally {
      setLoadingRec(false);
    }
  };

  // SUPPORT TICKETS: Fetch user tickets
  const fetchCustomerTickets = async () => {
    if (!activeUser?.email) return;
    setLoadingTickets(true);
    try {
      const res = await fetch(`/api/tickets/customer/${activeUser.email}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  // SUPPORT TICKETS: Create a live ticket
  const handleCreateCustomerTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !activeUser?.email) return;
    setCreatingTicket(true);
    const initialText = lang === 'ar' 
      ? `لقد تم فتح تذكرة دعم مخصصة بخصوص: ${newTicketSubject}` 
      : `Opened support ticket lobby for inquiry: "${newTicketSubject}"`;
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: activeUser.email,
          customerName: activeUser.name || 'Sovereign Traveler',
          subject: newTicketSubject,
          category: 'VIP Operations',
          priority: 'high',
          initialMessage: initialText
        })
      });
      if (res.ok) {
        const newTicket = await res.json();
        setNewTicketSubject('');

        // Mirror support ticket to Firestore for real-time listener sync
        const ticketPath = `tickets/${newTicket.id}`;
        try {
          await setDoc(doc(db, 'tickets', newTicket.id), {
            id: newTicket.id,
            userId: auth.currentUser?.uid || 'guest',
            userEmail: activeUser.email,
            userName: activeUser.name || 'Sovereign Traveler',
            subject: newTicketSubject,
            status: 'open',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          // Write initial ticket message to Firestore subcollection
          const msgId = `msg-${Date.now()}`;
          await setDoc(doc(db, 'tickets', newTicket.id, 'messages', msgId), {
            id: msgId,
            sender: 'user',
            senderName: activeUser.name || 'Sovereign Traveler',
            text: initialText,
            timestamp: serverTimestamp()
          });
        } catch (fsErr) {
          logFirestoreError(fsErr, 'write', ticketPath);
        }

        await fetchCustomerTickets();
        setSelectedTicketId(newTicket.id);
      }
    } catch (err) {
      console.error('Error opening support ticket:', err);
    } finally {
      setCreatingTicket(false);
    }
  };

  // SUPPORT TICKETS: Send reply inside live support chat
  const handleSendTicketMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedTicketId || !activeUser?.email) return;
    const msgText = input;
    setInput('');

    try {
      // 1. Write reply to local REST API (mirrors to local JSON DB so Admin is notified)
      await fetch(`/api/tickets/${selectedTicketId}/customer-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText })
      });

      // 2. Write turn to Firestore subcollection (updates onSnapshot instantly)
      const msgId = `msg-${Date.now()}`;
      await setDoc(doc(db, 'tickets', selectedTicketId, 'messages', msgId), {
        id: msgId,
        sender: 'user',
        senderName: activeUser.name || 'Sovereign Traveler',
        text: msgText,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Error replying inside ticket room:', err);
    }
  };

  // Fetch bookings, tours & load chat history
  const fetchData = async () => {
    try {
      const bookRes = await fetch('/api/bookings');
      if (bookRes.ok) {
        const allBookings = await bookRes.json();
        const userBookings = allBookings.filter((b: any) => b.customerEmail.toLowerCase() === activeUser.email.toLowerCase());
        setBookings(userBookings);
        
        const count = userBookings.length;
        if (count >= 4) setActualTier('Diamond');
        else if (count === 3) setActualTier('Platinum');
        else if (count === 2) setActualTier('Gold');
        else if (count === 1) setActualTier('Silver');
        else setActualTier('Bronze');
      }

      const toursRes = await fetch('/api/tours');
      if (toursRes.ok) {
        const toursData = await toursRes.json();
        setTours(toursData);
      }
    } catch (e) {
      console.error('Error fetching dynamic data for chatbot widget', e);
    }
  };

  useEffect(() => {
    fetchData();
    if (activeUser?.email) {
      loadChatHistoryFromFirestore();
      fetchCustomerTickets();
    }
  }, [activeUser?.email]);

  useEffect(() => {
    if (open) {
      fetchData();
      fetchCustomerTickets();
      if (bookings.length >= 0) {
        generatePersonalizedTourRecommendation();
      }
    }
  }, [open, bookings.length]);

  // Proactive recommendation trigger on booking updates
  useEffect(() => {
    if (bookings.length > 0) {
      generatePersonalizedTourRecommendation();
    }
  }, [bookings]);

  // LIVE TICKETS SUBSCRIBER: Setup Firestore real-time listener for the active support ticket room
  useEffect(() => {
    if (!selectedTicketId) {
      setTicketMessages([]);
      return;
    }

    const path = `tickets/${selectedTicketId}/messages`;
    const messagesRef = collection(db, 'tickets', selectedTicketId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgs.push({
          id: docSnap.id,
          sender: data.sender,
          senderName: data.senderName,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });
      setTicketMessages(msgs);
    }, (error) => {
      logFirestoreError(error, 'list', path);
    });

    return () => unsubscribe();
  }, [selectedTicketId]);

  // Fetch Gemini-powered suggested answers when a customer selects a ticket
  useEffect(() => {
    if (!selectedTicketId) {
      setSuggestedAnswers([]);
      setExpandedSuggestionIdx(null);
      return;
    }

    setSuggestedAnswers([]);
    setExpandedSuggestionIdx(null);
    setLoadingSuggestions(true);

    fetch(`/api/tickets/${selectedTicketId}/suggested-answers`)
      .then(res => res.json())
      .then(data => {
        if (data.suggestions) {
          setSuggestedAnswers(data.suggestions);
        }
      })
      .catch(err => {
        console.error('Error fetching suggested answers:', err);
      })
      .finally(() => {
        setLoadingSuggestions(false);
      });
  }, [selectedTicketId]);

  const handleSendSuggestedAnswer = async (text: string) => {
    if (!selectedTicketId || !activeUser?.email) return;
    try {
      // 1. Write reply to local REST API (mirrors to local JSON DB so Admin is notified)
      await fetch(`/api/tickets/${selectedTicketId}/customer-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      // 2. Write turn to Firestore subcollection (updates onSnapshot instantly)
      const msgId = `msg-${Date.now()}`;
      await setDoc(doc(db, 'tickets', selectedTicketId, 'messages', msgId), {
        id: msgId,
        sender: 'user',
        senderName: activeUser.name || 'Sovereign Traveler',
        text: text,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Error sending suggested answer:', err);
    }
  };

  const handleSolveTicket = async (suggestionTitle: string) => {
    if (!selectedTicketId || !activeUser?.email) return;
    try {
      const closingMsg = `✅ This inquiry was successfully resolved using Sovereign AI suggestion: "${suggestionTitle}". Thank you!`;
      
      // Send the resolving message
      await handleSendSuggestedAnswer(closingMsg);

      // Update status of ticket to resolved via local API
      await fetch(`/api/tickets/${selectedTicketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });

      // Also update Firestore ticket status if active
      await setDoc(doc(db, 'tickets', selectedTicketId), { status: 'resolved' }, { merge: true });

      // Reset suggestions states and go back to channels view
      setSuggestedAnswers([]);
      setSelectedTicketId(null);
      fetchCustomerTickets();
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, chatTab, recommendation]);

  useEffect(() => {
    if (ticketScrollRef.current) {
      ticketScrollRef.current.scrollTop = ticketScrollRef.current.scrollHeight;
    }
  }, [ticketMessages, selectedTicketId, chatTab]);

  // Speech Recognition hook setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'ar' ? 'ar-EG' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? prev + ' ' + transcript : transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [lang]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert(lang === 'ar' ? 'التعرف على الصوت غير مدعوم في هذا المتصفح.' : 'Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Text to Speech logic (using server-side Gemini TTS if key is set, else web speech synthesis)
  const handleSpeak = async (text: string, msgId: string) => {
    if (playingMsgId === msgId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
      return;
    }

    setPlayingMsgId(msgId);

    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const audioUrl = `data:audio/wav;base64,${data.audio}`;
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          audio.play();
          audio.onended = () => setPlayingMsgId(null);
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini TTS was offline or returned simulated status. Falling back to browser SpeechSynthesis:', e);
    }

    // Client-side browser synthesis fallback
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(lang === 'ar' ? 'ar' : 'en'));
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onend = () => setPlayingMsgId(null);
    utterance.onerror = () => setPlayingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  const triggerVipFlow = async () => {
    setVipMode(true);
    setTyping(true);

    setTimeout(async () => {
      const vipEn = `👑 [VIP SOVEREIGN CONCIERGE CHIEF ENGAGED]
Welcome back, Sovereign Traveler! I am Sarah Amin, your Dedicated Chief Travel Steward.

Your elite status authorizes instantaneous booking confirmations, customized Mercedes-Maybach ground transfers, and exclusive temple/yacht permits.

How may I coordinate your private Egypt tour requirements today, Sir? I have also updated our operations terminal to prioritize your connection.`;

      const vipAr = `👑 [رئيس الخدمة السيادية الملكية نشط]
مرحباً بك يا سيدي الكريم في رحاب الخدمة السيادية الخاصة بكبار الشخصيات! أنا سارة أمين، رئيسة فريق الخدمة الشخصية المخصص لك.

موقعك السيادي يمنحك تأكيدات فورية للحجوزات، نقل بأسطول مرسيدس مايباخ الفاخر، وتصاريح دخول حصرية للأهرامات واليخوت.

كيف يمكنني تنسيق رغباتك الملكية وتجهيز جولتك الاستثنائية اليوم؟ لقد قمت بتحديث لوحة العمليات لدينا لتسجيل كافة متمتطلباتك فوراً.`;

      const vipWelcomeMsg: Message = {
        id: `vip-welcome-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date(),
        text: lang === 'ar' ? vipAr : vipEn
      };

      setMessages((prev) => [...prev, vipWelcomeMsg]);
      saveMessageToFirestore(vipWelcomeMsg);
      setTyping(false);

      try {
        await fetch(`/api/crm/${activeUser.email}/support`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: `[VIP CHIEF CONCIERGE CHATBOT ENGAGED] Sovereign elite assistant flow triggered for ${activeUser.email}.` 
          })
        });
      } catch (e) {
        console.error(e);
      }
    }, 800);
  };

  const handleVipActionClick = async (actionText: string) => {
    const userMsg: Message = { id: `act-usr-${Date.now()}`, sender: 'user', text: actionText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    saveMessageToFirestore(userMsg);
    setTyping(true);
    
    setTimeout(async () => {
      let reply = '';
      if (actionText.includes('helicopter') || actionText.includes('مروحية')) {
        reply = lang === 'ar'
          ? '👑 [تأكيد النخبة الملكية] تم حاز طائرة الهليكوبتر الخاصة بك. ستنسق الكابتن سارة معك عبر واتساب لتحديد وقت الإقلاع والتصاريح الأمنية.'
          : '👑 [ROYAL EXECUTIVE CONFIRMED] Your private helicopter shuttle has been chartered. Captain Sarah will confirm flight clearance and landing permissions via WhatsApp.';
      } else if (actionText.includes('yacht') || actionText.includes('يخت')) {
        reply = lang === 'ar'
          ? '👑 [تأكيد النخبة الملكية] تم التنسيق مع يخت الدهبية 80 قدمًا. الشيف مصطفى سيجهز قائمة المأكولات البحرية الطازجة والكركند لك ولعائلتك.'
          : '👑 [ROYAL EXECUTIVE CONFIRMED] Your private 80ft luxury yacht dinner is confirmed. Chef Mostafa is designing a custom lobster & fresh catch menu tailored to your preferences.';
      } else if (actionText.includes('scholar') || actionText.includes('أثري')) {
        reply = lang === 'ar'
          ? '👑 [تأكيد النخبة الملكية] يسعدنا تلبية رغبتك! تم تعيين كبير الأثريين الدكتور زاهي لمرافقتك وتسهيل دخولك الحصري الخالي من الانتظار.'
          : '👑 [ROYAL EXECUTIVE CONFIRMED] Request approved. We have assigned our senior Egyptologist scholar Dr. Zahi to guide your private expedition and coordinate private chamber access.';
      } else {
        reply = lang === 'ar'
          ? '👑 [تأكيد النخبة الملكية] تم توجيه السائق شريف للتواصل معك فورًا لتنسيق استلام الأمتعة وتجهيز المياه الباردة والمناشف المبردة في المايباخ.'
          : '👑 [ROYAL EXECUTIVE CONFIRMED] Chauffeur Sherif has been dispatched and will reach out to you within 10 minutes to coordinate luggage and pickup logistics with the Maybach.';
      }

      const botMsg: Message = { id: `act-bot-${Date.now()}`, sender: 'bot', text: reply, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      saveMessageToFirestore(botMsg);
      setTyping(false);

      try {
        await fetch(`/api/crm/${activeUser.email}/support`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `[VIP CHAT ACTION] ${actionText}` })
        });
      } catch (err) {
        console.error(err);
      }
    }, 1200);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    const userMsg: Message = { id: `msg-usr-${Date.now()}`, sender: 'user', text: userText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    saveMessageToFirestore(userMsg);
    setTyping(true);

    try {
      const modifiedMessage = vipMode 
        ? `${userText} (IMPORTANT: I am a Diamond/Platinum VIP Sovereign status customer. Be extremely polite, call me Sir/Your Excellency, confirm Mercedes-Maybach ground transfers, mention Dr. Sarah Amin has been assigned, and offer absolute elite catering/permits.)`
        : userText;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: modifiedMessage,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        })
      });

      const data = await res.json();
      let botReply = data.reply || data.error;

      if (vipMode && (!data.reply || data.reply.includes('trouble connecting'))) {
        const vipFallbacks = [
          lang === 'ar' 
            ? 'تحت أمرك يا سيدي الكريم. لقد قمت على الفور بإرسال إشارة تأكيد لسائق المايباخ شريف لترتيب النقل وتجهيز المناشف المبردة فوراً.'
            : 'At your immediate service, Your Excellency. I have logged this request on our dispatcher queue and informed Chauffeur Sherif to prepare your private Mercedes-Maybach.',
          lang === 'ar'
            ? 'بكل سرور يا فندم. تصاريح دخول المعبد الحصرية والتذاكر الخاصة بك تم تجهيزها رقمياً لتفادي أي طوابير انتظار تماماً.'
            : 'Absolutely, Sir. Your skip-the-line permits for the pyramids and private temples have been compiled and sent to your personal butler, Dr. Sarah.',
          lang === 'ar'
            ? 'تم حجز طائرة الهليكوبتر وجدولتها فوراً يا فندم. ستنسق الكابتن سارة من قسم الطيران الخاص تفاصيل خط الرحلة والإقلاع معك عبر واتساب قريباً.'
            : 'Your private helicopter shuttle booking is verified, Sir. Captain Sarah will confirm flight clearance and landing permissions with you on WhatsApp shortly.'
        ];
        botReply = vipFallbacks[Math.floor(Math.random() * vipFallbacks.length)];
      }

      const botMsg: Message = { id: `msg-bot-${Date.now()}`, sender: 'bot', text: botReply, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      saveMessageToFirestore(botMsg);
    } catch (err) {
      console.error(err);
      let errorReply = lang === 'ar'
        ? 'أعتذر بشدة يا سيدي، واجهت مشكلة في الاتصال ببرج المراقبة الخاص بي. يرجى مراجعة تذكرتك لاحقًا.'
        : 'I am sorry, but I am having trouble connecting right now. Please try again or contact our support team.';

      if (vipMode) {
        errorReply = lang === 'ar'
          ? '👑 [تحديث خط الخدمة السيادي] عذراً لخلل الاتصال البسيط يا سيدي. لقد تم تسجيل هذا الطلب يدوياً لمدير العمليات وسيتصل بك خادمك الشخصي فوراً.'
          : '👑 [SOVEREIGN SERVICE UPDATE] My apologies for the slight connection lag, Sir. Your query has been logged in our elite queue. Dr. Sarah Amin will contact you directly.';
      }

      const botErr: Message = { id: `msg-err-${Date.now()}`, sender: 'bot', text: errorReply, timestamp: new Date() };
      setMessages((prev) => [...prev, botErr]);
      saveMessageToFirestore(botErr);
    } finally {
      setTyping(false);
    }
  };

  const handleTriggerWidget = (type: 'weather' | 'tours' | 'packing' | 'vip_privileges' | 'converter') => {
    let text = '';
    if (type === 'weather') {
      text = lang === 'ar' ? 'عرض توقعات الطقس الحالية في مصر' : 'Display current weather forecast in Egypt';
    } else if (type === 'tours') {
      text = lang === 'ar' ? 'استعراض الرحلات السياحية الملكية الحصرية' : 'Browse exclusive royal travel excursions';
    } else if (type === 'packing') {
      text = lang === 'ar' ? 'عرض قائمة المساعد الذكي لتجهيز الأمتعة' : 'Display smart packing assistant checklist';
    } else if (type === 'vip_privileges') {
      text = lang === 'ar' ? 'استعراض امتيازات وفوائد العضوية السيادية' : 'Review Sovereign Membership tier privileges';
    } else if (type === 'converter') {
      text = lang === 'ar' ? 'فتح حاسبة تحويل العملات المباشرة' : 'Open instant luxury currency exchange calculator';
    }

    const userWidgetMsg: Message = { id: `wid-usr-${Date.now()}`, sender: 'user', text, timestamp: new Date() };
    const botWidgetMsg: Message = { id: `wid-bot-${Date.now()}`, sender: 'bot', text: '', timestamp: new Date(), type };

    setMessages(prev => [...prev, userWidgetMsg, botWidgetMsg]);
    saveMessageToFirestore(userWidgetMsg);
    saveMessageToFirestore(botWidgetMsg);
  };

  const togglePackingItem = (id: string) => {
    setPackingItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleConvert = (amount: string, dir: 'USD_EGP' | 'EGP_USD') => {
    setConverterAmount(amount);
    setConverterDirection(dir);
  };

  const formatCurrencyValue = () => {
    const amt = parseFloat(converterAmount) || 0;
    const rate = 48.5; // Luxury aligned stable standard rate
    if (converterDirection === 'USD_EGP') {
      return `${amt} USD = ${(amt * rate).toFixed(2)} EGP`;
    } else {
      return `${amt} EGP = ${(amt / rate).toFixed(2)} USD`;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" id="chatbot-container">
      {/* Floating Action Button */}
      {!open && (
        <button
          id="chatbot-fab"
          onClick={() => setOpen(true)}
          className="bg-gradient-to-tr from-emerald-600 via-slate-900 to-amber-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border border-emerald-500/20 group cursor-pointer animate-bounce"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        </button>
      )}

      {/* Expanded Chat Dialog */}
      {open && (
        <div id="chatbot-dialog" className="bg-slate-950/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/60 max-w-[380px] md:max-w-[420px] w-[95vw] h-[610px] flex flex-col overflow-hidden text-slate-100 animate-fade-in">
          
          {/* Elegant Luxury Header */}
          <div className={`bg-gradient-to-r ${vipMode ? 'from-amber-950 via-slate-900 to-amber-950 border-b-2 border-amber-500/30' : 'from-slate-900 via-slate-950 to-slate-900'} text-white px-5 py-3 flex items-center justify-between border-b border-slate-800 transition-colors duration-300`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-2xl shadow-lg bg-gradient-to-tr ${vipMode ? 'from-amber-500 to-amber-300' : 'from-emerald-500 to-amber-400'}`}>
                {vipMode ? <Crown className="w-4 h-4 text-slate-950 animate-pulse" /> : <Bot className="w-4 h-4 text-slate-950" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wide font-mono uppercase">
                    {vipMode ? (lang === 'ar' ? 'المساعد السيادي' : 'Sovereign Steward') : 'Zephyr Butler'}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest block font-mono ${vipMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {vipMode 
                    ? (lang === 'ar' ? 'الخدمة السيادية الملكية' : 'Sovereign VIP Mode') 
                    : (lang === 'ar' ? 'الخدمة الذكية للذكاء الاصطناعي' : 'AI Luxury Concierge')
                  }
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setOpen(false);
              }}
              className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer border border-transparent hover:border-slate-800"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Interactive VIP/Simulate Ribbon Bar */}
          <div className={`px-4 py-2 border-b flex items-center justify-between text-[10px] font-mono border-slate-900 ${
            isVipTier 
              ? 'bg-amber-500/5 text-amber-400 font-bold' 
              : 'bg-slate-900/40 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5">
              {isVipTier ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                  <span className="font-extrabold">{lang === 'ar' ? 'العضوية السيادية نشطة' : `Sovereign ${activeTier}`}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>{lang === 'ar' ? `الفئة الحالية: ${activeTier}` : `Current Tier: ${activeTier}`}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {isVipTier ? (
                !vipMode ? (
                  <button
                    onClick={triggerVipFlow}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-0.5 rounded-full hover:scale-105 transition-all text-[9px] font-black tracking-wider cursor-pointer flex items-center gap-1 shadow-md shadow-amber-500/10 animate-pulse"
                  >
                    <span>{lang === 'ar' ? 'استدعاء الخادم الملكي' : 'Call Concierge'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    <span>{lang === 'ar' ? 'الخادم متصل' : 'STEWARD ENGAGED'}</span>
                  </span>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedTier('Diamond');
                    fetchData();
                  }}
                  className="text-emerald-400 hover:text-emerald-300 underline text-[9px] font-extrabold cursor-pointer"
                >
                  {lang === 'ar' ? 'تفعيل محاكاة العضوية الماسية' : 'Try VIP Status'}
                </button>
              )}

              {simulatedTier && (
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedTier(null);
                    setVipMode(false);
                  }}
                  className="text-slate-400 hover:text-red-400 font-extrabold text-[9px] ml-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 hover:border-red-500/20"
                  title="Reset simulation"
                >
                  {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </button>
              )}
            </div>
          </div>

          {/* Premium Concierge Mode Navigation Tabs */}
          <div className="bg-slate-950 border-b border-slate-900 px-3 py-1.5 flex gap-2 shrink-0">
            <button
              onClick={() => setChatTab('ai')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border font-mono text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                chatTab === 'ai' 
                  ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-900/40 text-slate-500 border-slate-850 hover:text-slate-300'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'خادم الذكاء الاصطناعي' : 'AI Zephyr Butler'}</span>
            </button>
            <button
              onClick={() => {
                setChatTab('tickets');
                fetchCustomerTickets();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border font-mono text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                chatTab === 'tickets' 
                  ? 'bg-amber-600/10 text-amber-400 border-amber-500/30' 
                  : 'bg-slate-900/40 text-slate-500 border-slate-850 hover:text-slate-300'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'غرفة دعم كبار الشخصيات' : 'Sovereign Helpdesk'}</span>
              {tickets.length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black rounded-full text-[8px] h-4 w-4 flex items-center justify-center animate-pulse">
                  {tickets.length}
                </span>
              )}
            </button>
          </div>

          {/* --- VIEW 1: AI ZEPHYR BUTLER TAB --- */}
          {chatTab === 'ai' && (
            <>
              {/* Suggestions Quick Buttons */}
              <div className="px-3 py-1.5 border-b border-slate-900 bg-slate-950 flex gap-2 overflow-x-auto no-scrollbar scrollbar-none shrink-0">
                <button 
                  onClick={() => handleTriggerWidget('weather')}
                  className="flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 hover:text-emerald-400 text-[10px] font-mono text-slate-300 px-2.5 py-1 rounded-full border border-slate-800 transition-all whitespace-nowrap cursor-pointer"
                >
                  <CloudSun className="w-3 h-3 text-sky-400" />
                  <span>{lang === 'ar' ? 'الطقس المباشر' : 'Live Weather'}</span>
                </button>

                <button 
                  onClick={() => handleTriggerWidget('tours')}
                  className="flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 hover:text-emerald-400 text-[10px] font-mono text-slate-300 px-2.5 py-1 rounded-full border border-slate-800 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Compass className="w-3 h-3 text-amber-400 animate-spin-slow" />
                  <span>{lang === 'ar' ? 'استعراض الرحلات' : 'Luxury Tours'}</span>
                </button>

                <button 
                  onClick={() => handleTriggerWidget('packing')}
                  className="flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 hover:text-emerald-400 text-[10px] font-mono text-slate-300 px-2.5 py-1 rounded-full border border-slate-800 transition-all whitespace-nowrap cursor-pointer"
                >
                  <CheckSquare className="w-3 h-3 text-emerald-400" />
                  <span>{lang === 'ar' ? 'مساعد الأمتعة' : 'Luggage Assistant'}</span>
                </button>

                <button 
                  onClick={() => handleTriggerWidget('converter')}
                  className="flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 hover:text-emerald-400 text-[10px] font-mono text-slate-300 px-2.5 py-1 rounded-full border border-slate-800 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Landmark className="w-3 h-3 text-teal-400" />
                  <span>{lang === 'ar' ? 'حاسبة العملات' : 'Converter'}</span>
                </button>

                <button 
                  onClick={() => handleTriggerWidget('vip_privileges')}
                  className="flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 hover:text-emerald-400 text-[10px] font-mono text-slate-300 px-2.5 py-1 rounded-full border border-slate-800 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>{lang === 'ar' ? 'مزايا العضوية' : 'VIP Benefits'}</span>
                </button>
              </div>

              {/* Messages Stream Grid */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40 relative"
              >
                {/* PROACTIVE PERSONALIZED RECOMMENDATION CARD */}
                {recommendation && (
                  <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/25 rounded-2xl p-3.5 space-y-2 animate-fade-in relative overflow-hidden shadow-xl shadow-amber-950/20">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-2 text-amber-400">
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-pulse" />
                      <span className="text-[10px] uppercase font-black tracking-widest font-mono">
                        {lang === 'ar' ? 'توصيات زيفير المخصصة لك' : 'Zephyr Bespoke Recommendation'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
                      {recommendation}
                    </p>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setInput(lang === 'ar' ? `أود حجز التوصية الملكية المخصصة لي: ${recommendation}` : `I would like to reserve the personalized recommendation: "${recommendation}"`);
                        }}
                        className="text-[9px] bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        {lang === 'ar' ? 'احجز التوصية فوراً' : 'Book Bespoke Recommendation'}
                      </button>
                    </div>
                  </div>
                )}

                {loadingRec && (
                  <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-3 flex items-center gap-3 animate-pulse">
                    <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'زيفير يحلل تفضيلات السفر وتاريخ حجوزاتك...' : 'Zephyr is analyzing travel history to craft personalized recommendations...'}
                    </span>
                  </div>
                )}

                {/* Animated Messages Stream with Entrance and Exit Effects */}
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {m.text && (
                        <div className={`flex items-start gap-2 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          
                          {/* Bot Avatar */}
                          {m.sender === 'bot' && (
                            <div className={`p-1.5 rounded-xl shrink-0 ${vipMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-300'}`}>
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div
                            className={`rounded-2xl p-3 text-xs leading-relaxed relative group ${
                              m.sender === 'user'
                                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none font-sans font-medium shadow-md shadow-emerald-950/10'
                                : m.text.includes('👑')
                                ? 'bg-amber-950/40 text-amber-100 border border-amber-500/20 rounded-tl-none font-medium'
                                : 'bg-slate-900/80 text-slate-200 border border-slate-800/60 rounded-tl-none font-medium'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.text}</p>
                            
                            {/* TTS speaker trigger button */}
                            {m.sender === 'bot' && (
                              <button
                                onClick={() => handleSpeak(m.text, m.id)}
                                className="absolute -bottom-2 -right-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer"
                                title="Read aloud"
                              >
                                {playingMsgId === m.id ? (
                                  <VolumeX className="w-3 h-3 text-amber-400" />
                                ) : (
                                  <Volume2 className="w-3 h-3 text-emerald-400" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Render Interactive Custom Widgets */}
                      {m.type === 'weather' && (
                        <div className="w-full max-w-[90%] mt-2 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-3 shadow-xl text-slate-200 self-start">
                          <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1">
                            <CloudSun className="w-3 h-3 text-sky-400 animate-pulse" />
                            {lang === 'ar' ? 'تقارير الطقس الحية - مصر الملكية' : 'LIVE ENVIRONMENT TELEMETRY - ROYAL EGYPT'}
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-100 font-mono">{lang === 'ar' ? 'العاصمة القاهرة' : 'Cairo Metropolis'}</p>
                                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'مشمس وصافٍ • رطوبة 35%' : 'Sunny and Clear • Humidity 35%'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black font-mono text-amber-400">34°C</p>
                                <p className="text-[9px] font-mono text-emerald-400">{lang === 'ar' ? 'رياح خفيفة' : 'Cool Breeze'}</p>
                              </div>
                            </div>

                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-100 font-mono">{lang === 'ar' ? 'الأقصر الملكية' : 'Ancient Luxor'}</p>
                                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'شمس ساطعة • رطوبة منخفضة' : 'Glorious Sunshine • Low Humidity'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black font-mono text-amber-400">41°C</p>
                                <p className="text-[9px] font-mono text-emerald-400">{lang === 'ar' ? 'طقس جاف مثالي' : 'Perfect Dry Expedition'}</p>
                              </div>
                            </div>

                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-100 font-mono">{lang === 'ar' ? 'شرم الشيخ' : 'Sharm El Sheikh'}</p>
                                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'نسيم بحري • حرارة المياه 26°' : 'Marine Breeze • Water Temp 26°C'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black font-mono text-amber-400">31°C</p>
                                <p className="text-[9px] font-mono text-emerald-400">{lang === 'ar' ? 'مثالي لليخوت' : 'Ideal Yacht Sailing'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {m.type === 'tours' && (
                        <div className="w-full max-w-[95%] mt-2 bg-slate-900/90 border border-slate-850 p-3 rounded-2xl space-y-3 shadow-xl self-start text-slate-200">
                          <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
                            <Compass className="w-3 h-3 text-amber-400 animate-spin-slow" />
                            {lang === 'ar' ? 'رحلات استكشافية فاخرة متاحة' : 'ACTIVE EXCLUSIVE EXPEDITIONS'}
                          </span>
                          <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
                            {tours.length === 0 ? (
                              <p className="text-[10px] text-slate-400 text-center py-4">{lang === 'ar' ? 'جاري تحميل الرحلات...' : 'Loading bespoke excursions...'}</p>
                            ) : (
                              tours.map(tour => (
                                <div key={tour.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/85 space-y-2 hover:border-slate-700 transition-colors">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-xs font-black text-slate-100">{lang === 'ar' ? tour.title.ar : tour.title.en}</h4>
                                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono mt-0.5">
                                        <MapPin className="w-2.5 h-2.5 text-rose-500" />
                                        <span>{tour.destination}</span>
                                        <span>•</span>
                                        <Calendar className="w-2.5 h-2.5 text-sky-400" />
                                        <span>{tour.duration} {lang === 'ar' ? 'أيام' : 'Days'}</span>
                                      </div>
                                    </div>
                                    <span className="text-xs font-black font-mono text-amber-400 shrink-0">${tour.priceUSD}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                                    {lang === 'ar' ? tour.description.ar : tour.description.en}
                                  </p>
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => {
                                        if (onSelectTour) {
                                          onSelectTour(tour);
                                          setOpen(false);
                                        }
                                      }}
                                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-mono text-[9px] py-1.5 px-3 rounded-lg font-black transition-all hover:scale-102 flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                                      <span>{lang === 'ar' ? 'احجز الرحلة فوراً' : 'Book Expedition'}</span>
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {m.type === 'packing' && (
                        <div className="w-full max-w-[90%] mt-2 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-3 shadow-xl self-start text-slate-200">
                          <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
                            <CheckSquare className="w-3 h-3 text-emerald-400" />
                            {lang === 'ar' ? 'المساعد الذكي لتجهيز الأمتعة' : 'SMART LUGGAGE CHECKLIST'}
                          </span>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {packingItems.map(item => (
                              <button
                                key={item.id}
                                onClick={() => togglePackingItem(item.id)}
                                className="w-full text-left bg-slate-950/60 hover:bg-slate-950 p-2 rounded-lg border border-slate-850/80 flex items-center gap-2.5 transition-colors text-xs font-mono text-slate-300 cursor-pointer"
                              >
                                {item.checked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                )}
                                <span className={item.checked ? 'line-through text-slate-500 font-medium' : 'font-bold'}>{item.label}</span>
                              </button>
                            ))}
                          </div>
                          {onOpenPackingAssistant && (
                            <button
                              onClick={() => {
                                onOpenPackingAssistant();
                                setOpen(false);
                              }}
                              className="w-full bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 font-mono text-[10px] font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>{lang === 'ar' ? 'افتح المساعد التفاعلي الكامل' : 'Open Comprehensive Packing Assistant'}</span>
                              <ArrowRight className="w-3 h-3 text-emerald-400" />
                            </button>
                          )}
                        </div>
                      )}

                      {m.type === 'converter' && (
                        <div className="w-full max-w-[90%] mt-2 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-3 shadow-xl self-start text-slate-200">
                          <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
                            <Landmark className="w-3 h-3 text-teal-400" />
                            {lang === 'ar' ? 'حاسبة تحويل العملات الملكية' : 'SOVEREIGN CURRENCY CALCULATOR'}
                          </span>
                          
                          <div className="space-y-2.5">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConvert(converterAmount, 'USD_EGP')}
                                className={`flex-1 font-mono text-[10px] py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${converterDirection === 'USD_EGP' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 font-black' : 'bg-slate-950 text-slate-400 border-slate-850'}`}
                              >
                                USD → EGP
                              </button>
                              <button
                                onClick={() => handleConvert(converterAmount, 'EGP_USD')}
                                className={`flex-1 font-mono text-[10px] py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${converterDirection === 'EGP_USD' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 font-black' : 'bg-slate-950 text-slate-400 border-slate-850'}`}
                              >
                                EGP → USD
                              </button>
                            </div>

                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1.5">
                              <span className="text-[9px] text-slate-500 font-mono font-bold uppercase block">{lang === 'ar' ? 'أدخل القيمة المراد تحويلها' : 'ENTER TRANSFER AMOUNT'}</span>
                              <input
                                type="number"
                                value={converterAmount}
                                onChange={(e) => setConverterAmount(e.target.value)}
                                className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono font-black focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>

                            <div className="bg-teal-500/5 border border-teal-500/10 p-3 rounded-xl flex justify-between items-center text-teal-400 font-mono font-black">
                              <span className="text-[9px] text-teal-500 uppercase">{lang === 'ar' ? 'النتيجة الفورية' : 'CONVERTED LEDGER'}</span>
                              <span className="text-xs tracking-wide">{formatCurrencyValue()}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {m.type === 'vip_privileges' && (
                        <div className="w-full max-w-[90%] mt-2 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-3 shadow-xl self-start text-slate-200">
                          <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                            {lang === 'ar' ? 'لوحة كبار الشخصيات والامتيازات السيادية' : 'SOVEREIGN PRIVILEGES LEDGER'}
                          </span>
                          
                          <div className="space-y-2">
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-300 font-mono">{lang === 'ar' ? 'فئتك النشطة' : 'Your Active Status'}</span>
                              <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{activeTier}</span>
                            </div>

                            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/80 space-y-1.5 font-mono text-[10px] text-slate-300 leading-relaxed">
                              <p className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                                <span>{lang === 'ar' ? 'تأكيد الحجوزات فوراً عبر النظام' : 'Instant booking verification bypass.'}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                                <span>{lang === 'ar' ? 'مرافقة مرشد أثري متخصص من كبار الأكاديميين' : 'Bespoke high-level scholar assigned.'}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                                <span>{lang === 'ar' ? 'سيارة مرسيدس مايباخ مع سائق خاص متاح 24/7' : 'Private Mercedes-Maybach 24/7 dispatcher.'}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                                <span>{lang === 'ar' ? 'تصاريح أمنية وتذاكر دخول حصرية وسريعة' : 'Exquisite skip-the-line pyramid permits.'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {typing && (
                  <div className="flex justify-start items-center gap-2 animate-pulse self-start">
                    <div className="p-1.5 rounded-xl bg-slate-900 text-slate-500 border border-slate-850 shrink-0">
                      <Bot className="w-3.5 h-3.5 animate-spin-slow" />
                    </div>
                    <div className="bg-slate-900/80 text-slate-400 rounded-2xl p-3 border border-slate-800/60 flex items-center gap-1.5 text-xs font-mono">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* VIP Quick-Actions Scroll Box */}
              {vipMode && (
                <div className="px-3 py-2 border-t border-slate-900 bg-amber-500/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar shrink-0">
                  {vipActions.map((act, i) => {
                    const label = lang === 'ar' ? act.labelAr : act.labelEn;
                    const msg = lang === 'ar' ? act.msgAr : act.msgEn;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleVipActionClick(msg)}
                        className="flex-shrink-0 bg-slate-900 hover:bg-amber-500/15 text-[10px] font-mono text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/20 shadow-sm transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic input control form */}
              <form
                onSubmit={handleSend}
                className="border-t border-slate-900 p-3 bg-slate-950 flex items-center gap-2 shrink-0"
              >
                {/* STT Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListen}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    isListening 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                  }`}
                  title={isListening ? 'Listening...' : 'Dictate with your voice'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening 
                      ? (lang === 'ar' ? 'جاري الاستماع لصوتك...' : 'Listening to your voice...') 
                      : vipMode 
                        ? (lang === 'ar' ? 'اطلب رغبتك السيادية من سارة هنا...' : 'Instruct your Chief Butler Sarah...') 
                        : (lang === 'ar' ? 'اسأل زيفير عن الرحلات أو الطقس...' : 'Ask Zephyr about excursions, weather...')
                  }
                  className="flex-1 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-slate-500"
                />
                
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                    vipMode 
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10'
                  }`}
                >
                  <Send className="w-4 h-4 font-black" />
                </button>
              </form>
            </>
          )}

          {/* --- VIEW 2: SUPPORT TICKETS TAB --- */}
          {chatTab === 'tickets' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/40">
              
              {/* IF TICKET IS NOT SELECTED: SHOW TICKET LIST */}
              {selectedTicketId === null ? (
                <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
                  
                  {/* Create New Support Ticket Room Form */}
                  <form onSubmit={handleCreateCustomerTicket} className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl space-y-3 shrink-0">
                    <span className="text-[10px] font-black uppercase font-mono tracking-widest text-amber-500 flex items-center gap-1.5">
                      <LifeBuoy className="w-4 h-4 animate-spin-slow text-amber-400" />
                      {lang === 'ar' ? 'فتح تذكرة دعم سيادي جديدة' : 'Initialize Sovereign Support Channel'}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'اكتب موضوع استفسارك لإنشاء غرفة دردشة مباشرة مع فريق العمل على مدار الساعة.' : 'Establish a high-priority direct communications lobby with our luxury Guest Relations staff.'}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTicketSubject}
                        onChange={(e) => setNewTicketSubject(e.target.value)}
                        placeholder={lang === 'ar' ? 'مثال: طلب حجز يخت، نقل مايباخ...' : 'e.g. Nile yacht booking, Maybach chauffeur request'}
                        className="flex-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50 placeholder-slate-600"
                        required
                      />
                      <button
                        type="submit"
                        disabled={creatingTicket || !newTicketSubject.trim()}
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1 hover:scale-103 active:scale-97 transition-all cursor-pointer whitespace-nowrap"
                      >
                        {creatingTicket ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 font-black" />
                            <span>{lang === 'ar' ? 'إنشاء' : 'Establish'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Active Communication Channels List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    <h5 className="text-[9px] font-black uppercase font-mono tracking-widest text-slate-500">
                      {lang === 'ar' ? 'قنوات الدعم النشطة لديك' : 'Your Sovereign Channels'}
                    </h5>

                    {loadingTickets ? (
                      <div className="text-center py-8 flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'جاري تحميل قنواتك الموقرة...' : 'Loading communications ledger...'}</span>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
                        <Inbox className="w-8 h-8 text-slate-700 mx-auto" />
                        <p className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'لا توجد قنوات دعم نشطة حالياً' : 'No active support channels.'}</p>
                        <p className="text-[10px] text-slate-500 leading-normal">{lang === 'ar' ? 'يرجى كتابة موضوع فوق لفتح قناة تواصل مخصصة فوراً.' : 'Create a ticket lobby above to secure a live dedicated operations room.'}</p>
                      </div>
                    ) : (
                      tickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicketId(t.id)}
                          className="bg-slate-900/60 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-850 hover:border-amber-500/20 transition-all cursor-pointer text-left space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-mono font-black text-slate-500 tracking-wider">
                              {t.id} • {t.category || 'VIP Operations'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider ${
                              t.status === 'open' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-800 text-slate-500'
                            }`}>
                              {t.status === 'open' ? (lang === 'ar' ? 'مفتوح' : 'Active') : (lang === 'ar' ? 'مكتمل' : 'Resolved')}
                            </span>
                          </div>
                          <div>
                            <h6 className="text-xs font-extrabold text-slate-200 line-clamp-1">
                              {t.subject}
                            </h6>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-sky-400 shrink-0" />
                              <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <Inbox className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{t.messages?.length || 0} {lang === 'ar' ? 'رسائل' : 'messages'}</span>
                            </p>
                          </div>
                          <div className="flex justify-end items-center gap-1 text-[9px] font-mono font-black text-amber-400 group-hover:translate-x-1 transition-transform">
                            <span>{lang === 'ar' ? 'دخول غرفة المحادثة' : 'Enter Live Lobby'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* IF TICKET IS SELECTED: SHOW THE LIVE TICKET ROOM */
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Ticket Chat Room Title bar */}
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 shrink-0 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedTicketId(null);
                        setTicketMessages([]);
                        fetchCustomerTickets();
                      }}
                      className="text-[10px] text-slate-400 hover:text-white font-mono font-extrabold flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850 cursor-pointer"
                    >
                      <span>←</span>
                      <span>{lang === 'ar' ? 'الرجوع للقنوات' : 'Lobbies'}</span>
                    </button>
                    <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                      {selectedTicketId}
                    </span>
                  </div>

                  {/* Active Ticket Details Banner */}
                  {(() => {
                    const activeTicket = tickets.find(t => t.id === selectedTicketId);
                    if (!activeTicket) return null;
                    return (
                      <div className="bg-slate-900/30 p-3.5 border-b border-slate-900 shrink-0 space-y-1">
                        <h6 className="text-xs font-black text-slate-200">
                          {activeTicket.subject}
                        </h6>
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                          <span>{lang === 'ar' ? 'الفئة: عمليات الخدمة المتميزة' : 'Category: Sovereign Relations'}</span>
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            <span>{lang === 'ar' ? 'قناة اتصال مشفرة ومؤمنة' : 'LIVE OPERATIONAL CRYPTO-LINKED'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Sovereign AI Auto-Suggestions Panel */}
                  {suggestedAnswers.length > 0 && (
                    <div className="bg-amber-500/5 border-b border-amber-500/10 p-3 shrink-0 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>{lang === 'ar' ? '💡 حلول مقترحة فورية من الذكاء الاصطناعي' : '💡 Instant AI-Suggested Answers'}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto">
                        {suggestedAnswers.map((s, idx) => {
                          const isExpanded = expandedSuggestionIdx === idx;
                          return (
                            <div 
                              key={idx}
                              className="bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/20 rounded-xl p-2.5 transition-all text-left"
                            >
                              <div 
                                className="flex justify-between items-center cursor-pointer select-none"
                                onClick={() => setExpandedSuggestionIdx(isExpanded ? null : idx)}
                              >
                                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                                  <span className="text-amber-500 text-[10px] font-extrabold font-mono">#{idx + 1}</span>
                                  {s.title}
                                </span>
                                <span className="text-[10px] text-slate-500 hover:text-slate-300 font-mono font-bold">
                                  {isExpanded ? (lang === 'ar' ? 'إغلاق -' : 'COLLAPSE -') : (lang === 'ar' ? 'عرض +' : 'EXPAND +')}
                                </span>
                              </div>
                              {isExpanded && (
                                <div className="mt-2 text-[11px] text-slate-300 font-medium leading-relaxed font-sans border-t border-slate-850 pt-2 space-y-2">
                                  <p>{s.content}</p>
                                  <div className="flex justify-end gap-1.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSendSuggestedAnswer(s.content);
                                        setExpandedSuggestionIdx(null);
                                      }}
                                      className="text-[9px] bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 text-amber-400 font-bold px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <span>✍️</span>
                                      <span>{lang === 'ar' ? 'إرسال للمحادثة' : 'Send to Chat'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSolveTicket(s.title)}
                                      className="text-[9px] bg-amber-500 hover:bg-amber-600 border border-amber-600 text-slate-950 font-black px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-amber-500/5"
                                    >
                                      <span>✅</span>
                                      <span>{lang === 'ar' ? 'تم حل المشكلة' : 'Solved My Issue'}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live Ticket Message List */}
                  <div
                    ref={ticketScrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40"
                  >
                    {ticketMessages.map((tm, idx) => {
                      const isStaff = tm.sender === 'staff' || tm.sender === 'support';
                      return (
                        <div
                          key={tm.id || idx}
                          className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}
                        >
                          <div className={`flex items-start gap-2 max-w-[85%] ${isStaff ? '' : 'flex-row-reverse'}`}>
                            
                            {/* Avatar */}
                            <div className={`p-1.5 rounded-xl shrink-0 ${isStaff ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-slate-800 text-slate-300'}`}>
                              {isStaff ? <Crown className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[8px] font-mono font-black text-slate-500 block">
                                {isStaff ? (lang === 'ar' ? 'فريق خدمة كبار الشخصيات' : tm.senderName || 'Sovereign Steward') : tm.senderName}
                              </span>
                              <div
                                className={`rounded-2xl p-3 text-xs leading-relaxed relative ${
                                  isStaff
                                    ? 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none font-medium'
                                    : 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none font-medium'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{tm.text || tm.message}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {ticketMessages.length === 0 && (
                      <p className="text-[10px] text-slate-500 italic text-center py-4">{lang === 'ar' ? 'جاري تأسيس الاتصال المشفر...' : 'Securing dedicated operational bridge...'}</p>
                    )}
                  </div>

                  {/* Send Live message form */}
                  <form
                    onSubmit={handleSendTicketMessage}
                    className="border-t border-slate-900 p-3 bg-slate-950 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب رسالة مباشرة للموظفين...' : 'Transmit secure message to staff...'}
                      className="flex-1 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50 placeholder-slate-600"
                    />
                    
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition-all flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4 font-black" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
