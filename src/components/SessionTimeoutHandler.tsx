import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Clock, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext.js';
import { tokens } from '../theme/tokens.js';
import { AppLanguage } from '../types.js';

interface SessionTimeoutHandlerProps {
  lang: AppLanguage;
}

const timeoutTranslations = {
  en: {
    title: 'Session Inactivity Security Alert',
    description: 'You have been inactive for nearly 30 minutes. To protect your sovereign security clearance, your session will automatically log out in:',
    seconds: 'seconds',
    extend: 'Extend Session',
    logout: 'Log Out Now',
    shieldActive: 'Session Security Guard Active',
    simulate: 'Simulate Inactivity',
    loggedOutTitle: 'Session Expired',
    loggedOutDesc: 'You have been securely logged out due to 30 minutes of inactivity.',
    dismiss: 'Dismiss',
  },
  ar: {
    title: 'تنبيه أمني: خمول الجلسة',
    description: 'لقد كنت غير نشط لقرابة 30 دقيقة. لحماية تصريحك الأمني السيادي، سيتم تسجيل خروجك تلقائياً خلال:',
    seconds: 'ثانية',
    extend: 'تمديد صلاحية الجلسة',
    logout: 'تسجيل الخروج الآن',
    shieldActive: 'حارس أمن الجلسة نشط',
    simulate: 'محاكاة عدم النشاط',
    loggedOutTitle: 'انتهت صلاحية الجلسة',
    loggedOutDesc: 'تم تسجيل خروجك بشكل آمن بسبب عدم النشاط لمدة 30 دقيقة.',
    dismiss: 'إغلاق',
  },
};

export default function SessionTimeoutHandler({ lang }: SessionTimeoutHandlerProps) {
  const {
    role,
    customerUser,
    isAdminVerified,
    logoutCustomer,
    logoutAdmin,
  } = useAuth();

  const isUserAuthenticated = customerUser !== null || isAdminVerified;

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds countdown
  const [isLoggedOutModalOpen, setIsLoggedOutModalOpen] = useState(false);

  // Time constants in milliseconds
  const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
  const lastActivityTime = useRef<number>(Date.now());
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const t = timeoutTranslations[lang as keyof typeof timeoutTranslations] || timeoutTranslations.en;
  const isRtl = lang === 'ar';

  // Handle Extend Session action
  const handleExtendSession = () => {
    lastActivityTime.current = Date.now();
    setIsWarningOpen(false);
    setCountdown(60);
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
  };

  // Perform secure logout due to inactivity
  const performSecureLogout = async () => {
    setIsWarningOpen(false);
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }

    try {
      if (isAdminVerified) {
        await logoutAdmin();
      } else if (customerUser !== null) {
        await logoutCustomer();
      }
    } catch (err) {
      console.error('Inactivity auto-logout error:', err);
    }

    setIsLoggedOutModalOpen(true);
  };

  // Function to simulate inactivity to test the feature instantly
  const handleSimulateInactivity = () => {
    // Set last active time to 30 minutes ago
    lastActivityTime.current = Date.now() - INACTIVITY_LIMIT - 5000;
    // Trigger the check immediately
    runInactivityCheck();
  };

  // Throttled handler for user activity events (max once every 3 seconds)
  const lastEventUpdate = useRef<number>(0);
  const handleUserActivity = () => {
    const now = Date.now();
    if (now - lastEventUpdate.current > 3000) {
      lastEventUpdate.current = now;
      if (!isWarningOpen) {
        lastActivityTime.current = now;
      }
    }
  };

  const runInactivityCheck = () => {
    if (!isUserAuthenticated || isWarningOpen) return;

    const timeSinceLastActivity = Date.now() - lastActivityTime.current;
    if (timeSinceLastActivity >= INACTIVITY_LIMIT) {
      setIsWarningOpen(true);
      setCountdown(60);
    }
  };

  // Register interaction event listeners when user is authenticated
  useEffect(() => {
    if (!isUserAuthenticated) {
      setIsWarningOpen(false);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      return;
    }

    // Reset last active time upon login/state update
    lastActivityTime.current = Date.now();

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Run periodic check every 5 seconds
    checkInterval.current = setInterval(runInactivityCheck, 5000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (checkInterval.current) clearInterval(checkInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [isUserAuthenticated]);

  // Handle Warning Countdown Timer
  useEffect(() => {
    if (isWarningOpen) {
      countdownInterval.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current!);
            performSecureLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [isWarningOpen]);

  // If user is not authenticated, render nothing
  if (!isUserAuthenticated) return null;

  return (
    <>
      {/* 1. Subtle Inactivity Simulation & Security Badge at Bottom Left */}
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="fixed bottom-4 left-4 z-40 bg-slate-950/90 border border-slate-800/80 rounded-full px-3 py-1.5 text-[10px] text-slate-400 font-mono flex items-center gap-2 shadow-xl backdrop-blur-md select-none print:hidden hover:border-slate-700/80 transition-all"
        id="session-security-shield-badge"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-sans font-bold text-slate-300">{t.shieldActive}</span>
        <button
          onClick={handleSimulateInactivity}
          className="ml-2 bg-slate-800 hover:bg-emerald-600 text-amber-400 hover:text-white px-2 py-0.5 rounded-full transition-all text-[9px] font-bold border border-slate-700 font-sans cursor-pointer active:scale-95"
          id="simulate-inactivity-btn"
        >
          {t.simulate}
        </button>
      </div>

      <AnimatePresence>
        {/* 2. WARNING MODAL */}
        {isWarningOpen && (
          <div 
            dir={isRtl ? 'rtl' : 'ltr'} 
            className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
            id="session-timeout-warning-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden"
              id="session-timeout-warning-modal"
            >
              {/* Top Warning Accents */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center animate-bounce shrink-0">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                      {t.title}
                    </h3>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-mono">
                      SECURE LEDGER PROTECTOR
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans font-semibold">
                  {t.description}
                </p>

                {/* Big Countdown circular visualization */}
                <div className="bg-slate-950/60 rounded-2xl p-6 border border-slate-850 flex flex-col items-center justify-center relative group">
                  <div className="relative flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        className="text-slate-850"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        className="text-amber-500 transition-all duration-1000"
                        strokeWidth="5"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - countdown / 60)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-amber-400 font-mono tracking-tight leading-none">
                        {countdown}
                      </span>
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider mt-1 font-sans">
                        {t.seconds}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleExtendSession}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-emerald-900/10 font-sans uppercase tracking-wider"
                    id="extend-session-btn"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>{t.extend}</span>
                  </button>

                  <button
                    onClick={performSecureLogout}
                    className="flex-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 font-bold text-xs py-3 rounded-xl border border-slate-700/80 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 font-sans uppercase tracking-wider"
                    id="logout-session-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. LOGGED OUT NOTIFICATION MODAL */}
        {isLoggedOutModalOpen && (
          <div 
            dir={isRtl ? 'rtl' : 'ltr'} 
            className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            id="session-expired-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full relative text-center space-y-5"
              id="session-expired-modal"
            >
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white uppercase tracking-tight font-sans">
                  {t.loggedOutTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                  {t.loggedOutDesc}
                </p>
              </div>
              <button
                onClick={() => setIsLoggedOutModalOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer border border-slate-700 uppercase tracking-wider font-sans active:scale-95"
                id="dismiss-session-expired-btn"
              >
                {t.dismiss}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
