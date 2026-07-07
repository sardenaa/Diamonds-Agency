import React from 'react';
import { Crown, Loader2, Check, Sparkles, Utensils, Ship } from 'lucide-react';
import { AppLanguage } from '../../types.js';

interface UpgradeEngineColumnProps {
  lang: AppLanguage;
  recommendations: any[];
  recLoading: boolean;
  upgradeLoadingId: string | null;
  activeAddonId: string | null;
  formatLocalPrice: (usdPrice: number) => string;
  onApplyUpgrade: (addon: any) => void;
}

export default function UpgradeEngineColumn({
  lang,
  recommendations,
  recLoading,
  upgradeLoadingId,
  activeAddonId,
  formatLocalPrice,
  onApplyUpgrade,
}: UpgradeEngineColumnProps) {
  const isAr = lang === 'ar';

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

  return (
    <div className="md:col-span-7 bg-slate-50/50 p-6 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg">
            <Crown className="w-5 h-5 text-amber-600 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
              {isAr ? 'ترقيات سيادية مخصصة لك' : 'Bespoke Sovereign Upgrades'}
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                MAS Curated
              </span>
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {isAr 
                ? 'استنادًا إلى تاريخ معاملاتك الفاخرة، نوصي بإضافة هذه الترقيات الحصرية لرحلتك الجديدة'
                : 'Curated by our Lead Experience Architect based on your royal travel history.'}
            </p>
          </div>
        </div>

        {/* Dynamic State: Loading or List */}
        {recLoading ? (
          <div className="space-y-4 py-12">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase animate-pulse">
                {isAr ? 'جاري استشارة منسق الرحلات الملكية...' : 'Consulting Lead Architect...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((addon) => {
              const isUpgraded = activeAddonId === addon.id;
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
                    💡 {isAr ? addon.reason.ar : addon.reason.en}
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${isUpgraded ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {isUpgraded ? <Check className="w-5 h-5 text-emerald-600" /> : renderAddonIcon(addon.icon)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-bold text-slate-800 text-xs md:text-sm">
                          {isAr ? addon.title.ar : addon.title.en}
                        </h5>
                        <span className={`font-black text-xs md:text-sm shrink-0 ${isUpgraded ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isUpgraded ? (isAr ? 'تم الإدراج' : 'Secured') : `+${formatLocalPrice(addon.priceUSD)}`}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        {isAr ? addon.description.ar : addon.description.en}
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Action Button */}
                  <div className="mt-3 flex justify-end">
                    {isUpgraded ? (
                      <div className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 bg-emerald-100/60 px-3 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تمت إضافة الترقية للحجز' : 'Bespoke Upgrade Integrated'}</span>
                      </div>
                    ) : (
                      <button
                        disabled={upgradeLoadingId !== null}
                        onClick={() => onApplyUpgrade(addon)}
                        className={`font-bold text-[11px] px-4 py-1.5 rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                          upgradeLoadingId === addon.id 
                            ? 'bg-slate-100 border-slate-200 text-slate-400' 
                            : 'border-amber-500/30 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500'
                        }`}
                      >
                        {upgradeLoadingId === addon.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>{isAr ? 'جاري الترقية...' : 'Securing...'}</span>
                          </>
                        ) : (
                          <span>{isAr ? 'ترقية الآن 👑' : 'Upgrade Now 👑'}</span>
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
    </div>
  );
}
