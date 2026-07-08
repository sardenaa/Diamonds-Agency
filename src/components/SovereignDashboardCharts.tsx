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
import { Download } from 'lucide-react';
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
      <div className="bg-slate-950/95 border border-slate-800 p-3.5 rounded-xl shadow-2xl text-xs font-sans space-y-1.5 backdrop-blur-md text-left border-l-4 border-l-emerald-500">
        <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">{label}</p>
        {payload.map((p: any, idx: number) => {
          const isFinancial = p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('sales') || p.name.toLowerCase().includes('yield');
          return (
            <p key={idx} style={{ color: p.color || p.fill || '#10b981' }} className="font-bold flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5">
                <span className="text-[12px]">●</span>
                <span className="text-slate-300 capitalize">{p.name}:</span>
              </span>
              <span className="text-white font-black text-right">
                {isFinancial ? `$${p.value.toLocaleString()}` : p.value}
              </span>
            </p>
          );
        })}
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

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Section 1: Daily Booking & Revenue Volume
    csvContent += "=== DAILY BOOKING VOLUME AND REVENUE TRENDS ===\n";
    csvContent += "Date,Bookings,Revenue (USD)\n";
    bookingTrendsData.forEach((row) => {
      csvContent += `${row.date},${row.Bookings},${row.Revenue || 0}\n`;
    });
    csvContent += "\n";
    
    // Section 2: Popular Tour Categories / Destinations
    csvContent += "=== POPULAR TOUR DESTINATIONS ===\n";
    csvContent += "Destination,Guests,Revenue (USD)\n";
    destinationData.forEach((row) => {
      csvContent += `"${row.name}",${row.Guests},${row.Revenue || 0}\n`;
    });
    csvContent += "\n";
    
    // Section 3: Cumulative Sales Progression
    csvContent += "=== CUMULATIVE REVENUE GROWTH ===\n";
    csvContent += "Date,Daily Sales (USD),Cumulative Revenue (USD)\n";
    revenueGrowthData.forEach((row) => {
      csvContent += `${row.date},${row.DailySales || 0},${row.CumulativeRevenue || 0}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MAS_Sovereign_Booking_Analytics_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Download Action Row */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-emerald-950/20 flex items-center gap-2 transition-all duration-300 cursor-pointer border border-emerald-500/30"
        >
          <Download className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تحميل التقرير الكامل CSV' : 'Download Report (CSV)'}</span>
        </button>
      </div>

      {/* Grid 1: Trends and Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends AreaChart */}
        <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="mb-4 text-left">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                {lang === 'ar' ? 'اتجاهات الحجوزات السيادية واليرادات' : 'Sovereign Volume & Yield Trends'}
              </h4>
              <p className="text-[10px] text-slate-500">
                {lang === 'ar' ? 'مخطط زمني مزدوج للحجوزات اليومية وحصيلة الإيرادات.' : 'Dual-axis timeline of daily reservation volume and revenue yields.'}
              </p>
            </div>
            <div className="h-[260px] w-full">
              {bookingTrendsData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                  {lang === 'ar' ? 'لا توجد بيانات متاحة حالياً.' : 'No trend data available.'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bookingTrendsData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={8} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#10b981" fontSize={8} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={8} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area yAxisId="left" type="monotone" dataKey="Bookings" name="Daily Bookings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
                    <Area yAxisId="right" type="monotone" dataKey="Revenue" name="Daily Revenue" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Custom Color Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 flex-wrap text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-800/50 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block animate-pulse" />
              <span>{lang === 'ar' ? 'حجم الحجوزات اليومية' : 'Daily Booking Volume'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block animate-pulse" />
              <span>{lang === 'ar' ? 'العائدات اليومية' : 'Daily Revenue'}</span>
            </div>
          </div>
        </div>

        {/* Popular Tour Destinations BarChart */}
        <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
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
                    <Bar dataKey="Guests" name="Total Guests" fill="#f59e0b" radius={[4, 4, 0, 0]}>
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
          {/* Custom Color Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-800/50 pt-3">
            {destinationData.map((d, index) => {
              const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
              const color = colors[index % colors.length];
              return (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: color }} />
                  <span>{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wide Grid: Cumulative Revenue Growth */}
      <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
        <div>
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
                <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorDailySales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={8} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#3b82f6" fontSize={8} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={8} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area yAxisId="left" type="monotone" dataKey="CumulativeRevenue" name="Cumulative Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCumulative)" />
                  <Area yAxisId="right" type="monotone" dataKey="DailySales" name="Daily Sales" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorDailySales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        {/* Custom Color Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 flex-wrap text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-800/50 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block animate-pulse" />
            <span>{lang === 'ar' ? 'الإيرادات التراكمية الإجمالية' : 'Gross Cumulative Revenue'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] inline-block animate-pulse" />
            <span>{lang === 'ar' ? 'المبيعات اليومية الإضافية' : 'Daily Incremental Sales'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
