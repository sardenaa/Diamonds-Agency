import React, { useState } from 'react';

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
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300 fill-current"
          id="whatsapp-logo-svg"
        >
          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.458 3.477 1.328 5.004l-1.411 5.15 5.27-1.383c1.479.807 3.14 1.231 4.801 1.231 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm5.787 14.397c-.237.669-1.189 1.228-1.642 1.277-.453.048-.901.218-2.909-.575-2.573-1.018-4.212-3.645-4.34-3.816-.128-.17-1.026-1.365-1.026-2.604 0-1.24.646-1.849.873-2.102.227-.253.495-.316.66-.316.165 0 .33.003.474.01.152.007.356-.057.557.426.206.495.706 1.724.767 1.85.061.127.102.274.018.443-.083.17-.124.274-.248.417-.124.143-.261.32-.372.43-.124.124-.253.259-.11.505.143.245.635 1.047 1.365 1.696.942.837 1.737 1.096 1.985 1.219.248.123.392.102.536-.062.144-.165.619-.723.784-.97.165-.247.33-.206.557-.123.227.082 1.444.68 1.691.804.248.124.413.186.475.294.062.108.062.624-.175 1.293z" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
      </a>
    </div>
  );
}
