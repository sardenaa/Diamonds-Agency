import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  lang: 'en' | 'ar';
}

export default function WhatsAppFloatingButton({ lang }: WhatsAppFloatingButtonProps) {
  const [hovered, setHovered] = useState(false);
  
  const whatsappNumber = '201202181834';
  const textMessage = lang === 'ar' 
    ? 'مرحباً كونسيرج MAS الملكي، أود الاستفسار عن تفاصيل وحجوزات الرحلات الفاخرة.'
    : 'Hello MAS Royal Concierge, I would like to inquire about your bespoke luxury expeditions.';
  
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textMessage)}`;

  return (
    <div 
      className="fixed bottom-24 right-6 z-40 font-sans flex items-center gap-2"
      id="whatsapp-floating-container"
    >
      {/* Animated Greeting Tooltip */}
      <div 
        className={`bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-2xl shadow-xl border border-emerald-500/10 transition-all duration-300 transform flex items-center gap-1.5 whitespace-nowrap pointer-events-none ${
          hovered 
            ? 'opacity-100 translate-x-0 scale-100' 
            : 'opacity-0 translate-x-4 scale-95'
        }`}
        style={{
          direction: lang === 'ar' ? 'rtl' : 'ltr'
        }}
      >
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        <span>
          {lang === 'ar' 
            ? 'تواصل مباشرة عبر واتساب' 
            : 'Chat on WhatsApp'
          }
        </span>
      </div>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border border-emerald-400/30 group cursor-pointer relative"
        title={lang === 'ar' ? 'واتساب كونسيرج' : 'WhatsApp Concierge'}
      >
        <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
      </a>
    </div>
  );
}
