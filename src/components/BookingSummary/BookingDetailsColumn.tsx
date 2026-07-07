import React from 'react';
import { ShieldCheck, Crown, Download, ArrowRight } from 'lucide-react';
import { AppLanguage } from '../../types.js';
import { tokens } from '../../theme/tokens.js';

interface BookingDetailsColumnProps {
  booking: any;
  whatsappAlert: string;
  lang: AppLanguage;
  formatLocalPrice: (usdPrice: number) => string;
  onClose: () => void;
}

export default function BookingDetailsColumn({
  booking,
  whatsappAlert,
  lang,
  formatLocalPrice,
  onClose,
}: BookingDetailsColumnProps) {
  const isAr = lang === 'ar';

  const handleDownload = () => {
    alert(`Downloading Secure PDF invoice/vouchers for booking ${booking.id}`);
  };

  return (
    <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
      {/* Banner / Header */}
      <div className={`${tokens.colors.primaryBg} text-white p-6 text-center space-y-2 relative`}>
        <div className="bg-white/20 p-3 rounded-full inline-flex items-center justify-center mb-1 animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black tracking-tight">
          {isAr ? 'تم تأكيد المعاملة الملكية' : 'Booking Confirmed!'}
        </h3>
        <p className="text-emerald-100 text-xs font-semibold">
          {isAr ? 'تم إرسال تذكرتك عبر واتساب الموثق' : 'We have sent your ticket details to your WhatsApp.'}
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          {/* Details Table */}
          <div className={`${tokens.colors.bgMuted} p-4 ${tokens.borderRadius.button} border border-slate-100 space-y-2.5 text-xs md:text-sm font-medium`}>
            <div className="flex justify-between">
              <span className={tokens.colors.textLight}>{isAr ? 'معرف الحجز' : 'Booking ID'}</span>
              <span className={`font-bold ${tokens.colors.textMain} ${tokens.typography.familyMono}`}>
                {booking.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={tokens.colors.textLight}>{isAr ? 'النقل الخاص' : 'Private Car'}</span>
              <span className={`font-bold ${tokens.colors.textMain}`}>Mercedes-Benz Private Car</span>
            </div>
            <div className="flex justify-between">
              <span className={tokens.colors.textLight}>{isAr ? 'رمز التذكرة' : 'Ticket Code'}</span>
              <span className={`font-bold ${tokens.colors.primaryText} ${tokens.typography.familyMono}`}>
                {booking.qrCode}
              </span>
            </div>
            
            {/* Total Invoice */}
            <div className="flex justify-between border-t border-slate-200/60 pt-2.5 mt-1">
              <span className={tokens.colors.textLight}>{isAr ? 'المجموع النهائي' : 'Total Invoice'}</span>
              <span className={`font-black ${tokens.colors.primaryText}`}>
                {formatLocalPrice(booking.totalAmountUSD)}
              </span>
            </div>

            {/* Active Upgrade Section */}
            {booking.luxuryAddon && (
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 mt-2 space-y-1">
                <span className="block text-[10px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {isAr ? 'الترقية النشطة' : 'Active Sovereign Upgrade'}
                </span>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">
                    {isAr ? booking.luxuryAddon.title.ar : booking.luxuryAddon.title.en}
                  </span>
                  <span className="font-bold text-amber-600">
                    +{formatLocalPrice(booking.luxuryAddon.priceUSD)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Alert Log */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-1">
            <span className="block text-[9px] text-emerald-800 font-bold uppercase tracking-widest">
              WhatsApp Message Sent
            </span>
            <p className="text-xs text-emerald-700 italic font-semibold leading-relaxed">
              "{whatsappAlert}"
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={handleDownload}
            className={`${tokens.colors.secondaryBg} ${tokens.colors.secondaryHover} text-white font-bold text-xs py-3 ${tokens.borderRadius.button} cursor-pointer flex items-center justify-center gap-1.5`}
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تحميل التذكرة (PDF)' : 'Download PDF'}</span>
          </button>
          <button
            onClick={onClose}
            className={`${tokens.colors.primaryBg} ${tokens.colors.primaryHover} text-white font-bold text-xs py-3 ${tokens.borderRadius.button} cursor-pointer flex items-center justify-center gap-1`}
          >
            <span>{isAr ? 'دخول بوابة العميل' : 'My Bookings'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
