import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { AppLanguage } from '../types.js';

interface SovereignDashboardChartsProps {
  lang: AppLanguage;
  bookingTrendsData: any[];
  destinationData: any[];
  revenueGrowthData: any[];
  formatLocalPrice: (usdPrice: number) => string;
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-2xl text-xs font-sans space-y-1 backdrop-blur-md text-left">
        <p className="font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} style={{ color: p.color || p.fill || '#10b981' }} className="font-bold flex items-center gap-2">
            <span className="text-[10px]">●</span>
            <span className="text-slate-300 capitalize">{p.name}:</span>
            <span className="text-white font-black">
              {p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('sales')
                ? `$${p.value.toLocaleString()}`
                : p.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SovereignDashboardCharts({
  lang,
  bookingTrendsData,
  destinationData,
  revenueGrowthData,
  formatLocalPrice
}: SovereignDashboardChartsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Grid 1: Trends and Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends AreaChart */}
        <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl flex flex-col">
          <div className="mb-4 text-left">
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
              {lang === 'ar' ? 'اتجاهات الحجوزات السيادية' : 'Sovereign Booking Trends'}
            </h4>
            <p className="text-[10px] text-slate-500">
              {lang === 'ar' ? 'مخطط زمني للحجوزات النشطة على مدار التواريخ الأخيرة.' : 'Live booking counts mapped over recent expedition dates.'}
            </p>
          </div>
          <div className="h-[260px] w-full">
            {bookingTrendsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                {lang === 'ar' ? 'لا توجد بيانات متاحة حالياً.' : 'No trend data available.'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={8} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={8} tickLine={false} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area type="monotone" dataKey="Bookings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Popular Tour Destinations BarChart */}
        <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl flex flex-col">
          <div className="mb-4 text-left">
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
              {lang === 'ar' ? 'الوجهات الأكثر شعبية' : 'Popular Destinations'}
            </h4>
            <p className="text-[10px] text-slate-500">
              {lang === 'ar' ? 'توزيع المسافرين (الضيوف) عبر الوجهات الرئيسية.' : 'Distribution of traveler counts (Guests) across destinations.'}
            </p>
          </div>
          <div className="h-[260px] w-full">
            {destinationData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                {lang === 'ar' ? 'لا توجد بيانات متاحة حالياً.' : 'No destination data available.'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destinationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={8} tickLine={false} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="Guests" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {destinationData.map((entry, index) => {
                      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Wide Grid: Cumulative Revenue Growth */}
      <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl flex flex-col">
        <div className="mb-4 text-left">
          <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
            {lang === 'ar' ? 'نمو الإيرادات الإجمالية التراكمية' : 'Gross Cumulative Revenue Growth'}
          </h4>
          <p className="text-[10px] text-slate-500">
            {lang === 'ar' ? 'المسار المالي المستمر ومنحنى نمو المبيعات التراكمي (بالدولار الأمريكي).' : 'The continuous financial trajectory and sales cumulative growth curve (USD).'}
          </p>
        </div>
        <div className="h-[280px] w-full">
          {revenueGrowthData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
              {lang === 'ar' ? 'لا توجد بيانات مبيعات متاحة حالياً.' : 'No sales history available.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={8} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={8} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area type="monotone" dataKey="CumulativeRevenue" name="Cumulative Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCumulative)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
