import React, { useState, useEffect } from 'react';
import BookingDetailsColumn from './BookingDetailsColumn.js';
import UpgradeEngineColumn from './UpgradeEngineColumn.js';
import { AppLanguage } from '../../types.js';
import { tokens } from '../../theme/tokens.js';

interface BookingSummaryModalProps {
  successBookingResult: any;
  setSuccessBookingResult: React.Dispatch<React.SetStateAction<any | null>>;
  lang: AppLanguage;
  formatLocalPrice: (usdPrice: number) => string;
  onClose: () => void;
}

export default function BookingSummaryModal({
  successBookingResult,
  setSuccessBookingResult,
  lang,
  formatLocalPrice,
  onClose,
}: BookingSummaryModalProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [upgradeLoadingId, setUpgradeLoadingId] = useState<string | null>(null);

  // Auto-fetch upgrades when booking success is triggered
  useEffect(() => {
    if (successBookingResult && successBookingResult.booking) {
      const fetchRecommendations = async () => {
        setRecLoading(true);
        try {
          const res = await fetch(`/api/bookings/${successBookingResult.booking.id}/recommendations`);
          if (res.ok) {
            const data = await res.json();
            setRecommendations(data);
          }
        } catch (e) {
          console.error('Error fetching luxury recommendations:', e);
        } finally {
          setRecLoading(false);
        }
      };
      fetchRecommendations();
    }
  }, [successBookingResult]);

  const handleApplyUpgrade = async (addon: any) => {
    if (!successBookingResult || !successBookingResult.booking) return;
    setUpgradeLoadingId(addon.id);
    try {
      const res = await fetch(`/api/bookings/${successBookingResult.booking.id}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addonId: addon.id,
          title: addon.title,
          priceUSD: addon.priceUSD,
          icon: addon.icon
        })
      });
      if (res.ok) {
        const updatedBooking = await res.json();
        
        // Update the success booking result in state so the summary and price update in real-time
        setSuccessBookingResult((prev: any) => ({
          ...prev,
          booking: updatedBooking,
          whatsappAlert: lang === 'ar'
            ? `👑 تأكيد الترقية السيادية: تمت إضافة ترقية "${addon.title.ar || addon.title.en}" للحجز ${updatedBooking.id}! تم تحديث الفاتورة والمجموع النهائي.`
            : `👑 MAS Sovereign Upgrade: Secured "${addon.title.en}" for booking ${updatedBooking.id}! Luxury scheduling updated.`
        }));
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to secure upgrade.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating booking details.');
    } finally {
      setUpgradeLoadingId(null);
    }
  };

  const booking = successBookingResult?.booking;
  const whatsappAlert = successBookingResult?.whatsappAlert || '';

  if (!booking) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in ${tokens.typography.familySans}`}>
      <div className={`${tokens.colors.bgCard} rounded-3xl ${tokens.shadows.xl} max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col md:grid md:grid-cols-12`}>
        {/* Left Column (Details) */}
        <BookingDetailsColumn
          booking={booking}
          whatsappAlert={whatsappAlert}
          lang={lang}
          formatLocalPrice={formatLocalPrice}
          onClose={onClose}
        />

        {/* Right Column (Upgrade Recommendations) */}
        <UpgradeEngineColumn
          lang={lang}
          recommendations={recommendations}
          recLoading={recLoading}
          upgradeLoadingId={upgradeLoadingId}
          activeAddonId={booking.luxuryAddon?.id || null}
          formatLocalPrice={formatLocalPrice}
          onApplyUpgrade={handleApplyUpgrade}
        />
      </div>
    </div>
  );
}
