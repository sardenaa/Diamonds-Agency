import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Smile, Crown, Lock, Unlock, ArrowRight, ChevronRight, PhoneCall, Sparkle } from 'lucide-react';
import { translations } from '../translations.js';
import { AppLanguage } from '../types.js';

interface ChatbotProps {
  lang: AppLanguage;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const userEmail = 'diamond.entertainment70@gmail.com';

const vipActions = [
  { 
    labelEn: '🚁 Private Helicopter', 
    labelAr: '🚁 طائرة مروحية خاصة', 
    msgEn: 'I would like to request a private helicopter transfer from Cairo Airport directly to my hotel.',
    msgAr: 'أود طلب نقل خاص بطائرة مروحية من مطار القاهرة مباشرة إلى الفندق الخاص بي.'
  },
  { 
    labelEn: '⛵ VIP Yacht Dinner', 
    labelAr: '⛵ عشاء يخت خاص فاخر', 
    msgEn: 'Can you coordinate an exclusive private sunset yacht dinner with a personal chef?',
    msgAr: 'هل يمكنك تنسيق عشاء غروب حصري على يخت خاص مع طاهٍ شخصي؟'
  },
  { 
    labelEn: '📸 Elite Scholar Guide', 
    labelAr: '📸 مرشد أثري كبير مخصص', 
    msgEn: 'Please assign Dr. Zahi or a top Egyptology scholar for my upcoming Pyramids expedition.',
    msgAr: 'يرجى تعيين الدكتور زاهي أو أحد كبار علماء الآثار لجولتي القادمة في الأهرامات.'
  },
  { 
    labelEn: '📞 Driver Urgent Dispatch', 
    labelAr: '📞 مكالمة عاجلة من السائق', 
    msgEn: 'I need my private Mercedes-Maybach chauffeur to contact me regarding my luggage requirements.',
    msgAr: 'أحتاج من سائق المرسيدس مايباخ الخاص بي الاتصال بي بخصوص تفاصيل أمتعتي.'
  }
];

export default function Chatbot({ lang }: ChatbotProps) {
  const t = translations[lang];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [actualTier, setActualTier] = useState<string>('Bronze');
  const [simulatedTier, setSimulatedTier] = useState<string | null>(null);
  const [vipMode, setVipMode] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: lang === 'ar' 
        ? 'مرحبًا بك يا سيدي الكريم في وكالة ماس الفاخرة. أنا "زيفير"، خادمك الرقمي المخصص. كيف يمكنني مساعدتك اليوم في التخطيط لرحلتك الملكية القادمة في مصر؟'
        : 'Hi! I am Zephyr, your digital assistant for MAS Agency. How can I help you plan your trip to Egypt today?'
    }
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch bookings dynamically when chatbot is rendered/opened to determine real status
  const fetchBookingsData = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const allBookings = await res.json();
        const userBookings = allBookings.filter((b: any) => b.customerEmail.toLowerCase() === userEmail.toLowerCase());
        setBookings(userBookings);
        
        const count = userBookings.length;
        if (count >= 4) setActualTier('Diamond');
        else if (count === 3) setActualTier('Platinum');
        else if (count === 2) setActualTier('Gold');
        else if (count === 1) setActualTier('Silver');
        else setActualTier('Bronze');
      }
    } catch (e) {
      console.error('Error fetching bookings in chatbot status tracker', e);
    }
  };

  useEffect(() => {
    fetchBookingsData();
  }, []);

  // Also re-fetch booking logs whenever the dialog is toggled open to catch instant updates
  useEffect(() => {
    if (open) {
      fetchBookingsData();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const activeTier = simulatedTier || actualTier;
  const isVipTier = activeTier === 'Diamond' || activeTier === 'Platinum';

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

كيف يمكنني تنسيق رغباتك الملكية وتجهيز جولتك الاستثنائية اليوم؟ لقد قمت بتحديث لوحة العمليات لدينا لتسجيل كافة متطلباتك فوراً.`;

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: lang === 'ar' ? vipAr : vipEn
        }
      ]);
      setTyping(false);

      // Log elite trigger in CMS
      try {
        await fetch(`/api/crm/${userEmail}/support`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: `[VIP CHIEF CONCIERGE CHATBOT ENGAGED] Sovereign elite assistant flow triggered for ${userEmail}.` 
          })
        });
      } catch (e) {
        console.error(e);
      }
    }, 800);
  };

  const handleVipActionClick = async (actionText: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text: actionText }]);
    setTyping(true);
    
    setTimeout(async () => {
      let reply = '';
      if (actionText.includes('helicopter') || actionText.includes('مروحية')) {
        reply = lang === 'ar'
          ? '👑 [تأكيد النخبة الملكية] تم حجز طائرة الهليكوبتر الخاصة بك. ستنسق الكابتن سارة معك عبر واتساب لتحديد وقت الإقلاع والتصاريح الأمنية.'
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

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      setTyping(false);

      try {
        await fetch(`/api/crm/${userEmail}/support`, {
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
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTyping(true);

    try {
      // Enhance prompt with luxury context if in VIP mode
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

      // Handle fallback manually with exquisite text if key is missing or errored
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

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
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

      setMessages((prev) => [...prev, { sender: 'bot', text: errorReply }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" id="chatbot-container">
      {/* Floating Action Button */}
      {!open && (
        <button
          id="chatbot-fab"
          onClick={() => setOpen(true)}
          className="bg-gradient-to-tr from-emerald-600 via-emerald-700 to-amber-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border border-emerald-500/30 group animate-bounce cursor-pointer"
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
        <div id="chatbot-dialog" className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-[360px] md:max-w-[400px] w-[90vw] h-[500px] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className={`bg-gradient-to-r ${vipMode ? 'from-amber-950 via-slate-900 to-amber-950 border-b-2 border-amber-500/40' : 'from-slate-900 to-slate-800'} text-white px-5 py-4 flex items-center justify-between border-b border-slate-700 transition-colors duration-300`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full shadow-md bg-gradient-to-tr ${vipMode ? 'from-amber-500 to-amber-300' : 'from-emerald-500 to-amber-400'}`}>
                {vipMode ? <Crown className="w-4 h-4 text-slate-950 animate-pulse" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold font-sans tracking-wide">{vipMode ? (lang === 'ar' ? 'مساعد كبار الشخصيات' : 'Sovereign Concierge') : 'Zephyr'}</span>
                  <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${vipMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {vipMode 
                    ? (lang === 'ar' ? 'الوضع السيادي الملكي' : 'VIP Sovereign Mode') 
                    : (lang === 'ar' ? 'الخادم الشخصي الرقمي المخصص' : 'Digital Assistant')
                  }
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* VIP Concierge Ribbon Bar */}
          <div className={`px-4 py-2 border-b flex items-center justify-between text-[10px] font-black ${
            isVipTier 
              ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-500/10 text-amber-700 font-bold' 
              : 'bg-slate-50 border-slate-100 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              {isVipTier ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                  <span>{lang === 'ar' ? 'العضوية السيادية نشطة' : `Sovereign ${activeTier}`}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>{lang === 'ar' ? `ترقية النخبة (${activeTier})` : `${activeTier} Tier`}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Trigger Concierge Link */}
              {isVipTier ? (
                !vipMode ? (
                  <button
                    onClick={triggerVipFlow}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-2.5 py-0.5 rounded-full hover:scale-105 transition-all text-[9px] font-black tracking-wide cursor-pointer flex items-center gap-1 border border-amber-500/20 shadow-sm"
                  >
                    <span>{lang === 'ar' ? 'خادم شخصي' : 'Call Concierge'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    <span>{lang === 'ar' ? 'الخادم الشخصي متصل' : 'CONCIERGE CONNECTED'}</span>
                  </span>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedTier('Diamond');
                    alert(lang === 'ar' 
                      ? 'تم تفعيل وضع محاكاة الفئة الماسية لتجربة خدمة الخادم الملكي الخاصة بكبار الشخصيات!'
                      : 'Simulated Diamond Tier activated! You can now experience the VIP Concierge.'
                    );
                  }}
                  className="text-emerald-600 hover:text-emerald-700 underline text-[9px] font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'محاكاة الماسية' : 'Try VIP Status'}
                </button>
              )}

              {/* Reset simulator if simulated */}
              {simulatedTier && (
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedTier(null);
                    setVipMode(false);
                  }}
                  className="text-slate-400 hover:text-red-500 font-extrabold text-[9px] ml-1 bg-slate-200/50 hover:bg-slate-200 p-1 rounded-md"
                  title="Reset simulation"
                >
                  ↺
                </button>
              )}
            </div>
          </div>

          {/* Messages Grid */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs md:text-sm shadow-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-br-none'
                      : m.text.includes('👑')
                      ? 'bg-amber-50 text-slate-900 border border-amber-200/60 font-medium rounded-bl-none shadow-amber-100/30 shadow'
                      : 'bg-white text-slate-800 font-medium rounded-bl-none border border-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 rounded-2xl p-3 border border-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
          </div>

          {/* VIP Quick-Actions Scroll Box */}
          {vipMode && (
            <div className="px-3 py-2 border-t border-slate-100 bg-amber-500/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar">
              {vipActions.map((act, i) => {
                const label = lang === 'ar' ? act.labelAr : act.labelEn;
                const msg = lang === 'ar' ? act.msgAr : act.msgEn;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleVipActionClick(msg)}
                    className="flex-shrink-0 bg-white hover:bg-amber-50 text-[10px] font-black text-slate-800 px-3 py-1.5 rounded-full border border-amber-200/50 shadow-sm transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Input control form */}
          <form
            onSubmit={handleSend}
            className="border-t border-slate-100 p-3 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={vipMode ? (lang === 'ar' ? 'اطلب رغبتك الملكية هنا...' : 'Instruct your Concierge...') : (lang === 'ar' ? 'اكتب استفسارك الفاخر هنا...' : 'Ask a question...')}
              className="flex-1 bg-slate-50 rounded-full px-4 py-2.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className={`text-white p-2.5 rounded-full transition-colors flex items-center justify-center shadow-lg cursor-pointer disabled:opacity-50 ${vipMode ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/10' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'}`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
