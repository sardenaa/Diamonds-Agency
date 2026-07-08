import React from 'react';
import { Loader2, X } from 'lucide-react';
import Dashboard from '../components/Dashboard.js';
import AdminSecurityGate from '../components/AdminSecurityGate.js';
import { Tour, AppLanguage } from '../types.js';
import { translations } from '../translations.js';
import { tokens } from '../theme/tokens.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useCurrency } from '../contexts/CurrencyContext.js';
import TourCatalog from '../features/tour/TourCatalog.js';

// Code splitting optimization for production performance
const AdminDashboard = React.lazy(() => import('../components/AdminDashboard.js'));

// Custom Suspense Dashboard Skeleton fallback for premium experience
const SuspenseFallback = ({ message }: { message: string }) => (
  <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-8 space-y-6 animate-pulse shadow-sm">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <div className="h-4 w-36 bg-slate-200 rounded-md" />
        <div className="h-3 w-20 bg-slate-100 rounded-md" />
      </div>
      <div className="h-9 w-28 bg-slate-200 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-28 bg-slate-50 rounded-2xl border border-slate-100/80" />
      <div className="h-28 bg-slate-50 rounded-2xl border border-slate-100/80" />
      <div className="h-28 bg-slate-50 rounded-2xl border border-slate-100/80" />
    </div>
    <div className="h-64 bg-slate-50/50 rounded-2xl border border-slate-100/80 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
        {message}
      </span>
    </div>
  </div>
);

interface AppRouterProps {
  lang: AppLanguage;
  searchFilters: { query: string; destination: string; date: string };
  setSearchFilters: React.Dispatch<React.SetStateAction<{ query: string; destination: string; date: string }>>;
  setSelectedBookTour: (tour: Tour | null) => void;
  setActiveTourCategory: (category: string) => void;
  setActiveTour: (tour: Tour | null) => void;
  userEmail: string;
  isAdminThemeLight: boolean;
  onToggleAdminTheme: () => void;
}

export default function AppRouter({
  lang,
  searchFilters,
  setSearchFilters,
  setSelectedBookTour,
  setActiveTourCategory,
  setActiveTour,
  userEmail,
  isAdminThemeLight,
  onToggleAdminTheme,
}: AppRouterProps) {
  const {
    role,
    setRole,
    isAdminVerified,
    verifyAdmin,
    logoutAdmin,
    adminPermissionTier,
  } = useAuth();

  const {
    currency,
    currencies,
  } = useCurrency();

  const t = translations[lang] || translations.en;

  return (
    <main className="flex-1">
      {role === 'guest' && (
        <TourCatalog
          lang={lang}
          setSelectedBookTour={setSelectedBookTour}
          onStateChange={({ activeTour, activeTourCategory, searchFilters }) => {
            setActiveTour(activeTour);
            setActiveTourCategory(activeTourCategory);
            setSearchFilters(searchFilters);
          }}
        />
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
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
              <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-1 shadow-2xl animate-scale-in">
                {/* Close Button to return to Guest */}
                <button
                  type="button"
                  onClick={() => {
                    setRole('guest');
                  }}
                  className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer z-[10000] flex items-center justify-center border border-slate-800/80 shadow-md"
                  aria-label="Cancel Admin Entry"
                >
                  <X className="w-4 h-4" />
                </button>
                <AdminSecurityGate
                  lang={lang}
                  onVerify={(tier) => {
                    verifyAdmin(tier);
                  }}
                />
              </div>
            </div>
          ) : (
            <React.Suspense fallback={<SuspenseFallback message={lang === 'ar' ? 'جاري فتح لوحة التحكم السيادية...' : 'Unlocking Sovereign Control Panel...'} />}>
              <AdminDashboard
                lang={lang}
                currency={currency}
                currencies={currencies}
                onRefreshAll={() => {}}
                adminPermissionTier={adminPermissionTier}
                onLogoutAdmin={() => {
                  logoutAdmin();
                }}
                isAdminThemeLight={isAdminThemeLight}
                onToggleAdminTheme={onToggleAdminTheme}
              />
            </React.Suspense>
          )}
        </div>
      )}
    </main>
  );
}
