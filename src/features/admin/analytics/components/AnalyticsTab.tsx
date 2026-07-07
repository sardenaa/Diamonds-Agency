import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AppLanguage } from '../../../types.js';
import SovereignDashboardCharts from '../../../components/SovereignDashboardCharts.js';

interface AnalyticsTabProps {
  lang: AppLanguage;
  analytics: any;
  analyticsSubTab: 'sovereign' | 'core';
  setAnalyticsSubTab: (val: 'sovereign' | 'core') => void;
  fetchAdminData: () => void;
  revenueByTour: any[];
  countriesData: any[];
  formatLocalPrice: (price: number) => string;
  destinationData: any[];
  revenueGrowthData: any[];
}

export default function AnalyticsTab({
  lang,
  analytics,
  analyticsSubTab,
  setAnalyticsSubTab,
  fetchAdminData,
  revenueByTour,
  countriesData,
  formatLocalPrice,
  destinationData,
  revenueGrowthData,
}: AnalyticsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in text-xs md:text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider">
            {lang === 'ar' ? 'التحليلات والمؤشرات السيادية للرئيس التنفيذي' : 'Sovereign Executive Analytics & KPI Core'}
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">
            {lang === 'ar'
              ? 'مراقبة فورية لأداء رحلات السفر الفاخرة، والإشغال، وسلوك العملاء، وبيانات التقييم الذكي.'
              : 'Real-time oversight of luxury travel performance, occupancy, customer behavior patterns, and smart rating metrics.'}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAdminData}
          className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs py-1.5 px-3.5 rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setAnalyticsSubTab('sovereign')}
          className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${
            analyticsSubTab === 'sovereign'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          {lang === 'ar' ? 'رسوم بيانية تفاعلية متقدمة' : 'Sovereign Recharts Core'}
        </button>
        <button
          type="button"
          onClick={() => setAnalyticsSubTab('core')}
          className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${
            analyticsSubTab === 'core'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          {lang === 'ar' ? 'أداء الرحلات والجغرافيا للعملاء' : 'Catalog Performance & Demographics'}
        </button>
      </div>

      {analyticsSubTab === 'sovereign' ? (
        <SovereignDashboardCharts
          analytics={analytics}
          destinationData={destinationData}
          revenueGrowthData={revenueGrowthData}
          formatLocalPrice={formatLocalPrice}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Chart 1: Revenue by Excursion */}
          <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 text-left">
              Gross Revenue by Excursion (USD)
            </h4>
            <div className="space-y-4">
              {revenueByTour.map((t: any, idx: number) => {
                const maxRevenue = Math.max(...revenueByTour.map((x: any) => x.revenue)) || 1000;
                const percentage = (t.revenue / maxRevenue) * 100;
                return (
                  <div key={idx} className="space-y-1 text-xs text-left">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span className="truncate max-w-[70%]">{t.name}</span>
                      <span>{formatLocalPrice(t.revenue)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Bookings by Nationality */}
          <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 text-left">
              Traveler Demographics (CRM Nationality)
            </h4>
            <div className="space-y-4">
              {countriesData.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No nationality metrics logs generated.</p>
              ) : (
                countriesData.map((c: any, idx: number) => {
                  const maxCount = Math.max(...countriesData.map((x: any) => x.count)) || 1;
                  const percentage = (c.count / maxCount) * 100;
                  return (
                    <div key={idx} className="space-y-1 text-xs text-left">
                      <div className="flex justify-between font-bold text-slate-300">
                        <span>{c.country}</span>
                        <span>
                          {c.count} {lang === 'ar' ? 'حجوزات' : 'bookings'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
