import React from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus.js';
import { AppLanguage } from '../types.js';

interface NetworkToastProps {
  lang: AppLanguage;
}

export default function NetworkToast({ lang }: NetworkToastProps) {
  const { showNetworkToast, toastType, dismissToast } = useNetworkStatus();

  if (!showNetworkToast) return null;

  return (
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
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5 rounded transition-colors shrink-0"
          aria-label="Close Notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
