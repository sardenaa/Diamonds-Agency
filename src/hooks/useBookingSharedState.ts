import { useState, useEffect } from 'react';
import { AppLanguage } from '../types.js';

export function useBookingSharedState(lang: AppLanguage) {
  const [sharedBooking, setSharedBooking] = useState<any | null>(null);
  const [sharedBookingLoading, setSharedBookingLoading] = useState(false);
  const [sharedBookingError, setSharedBookingError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share-itinerary') || params.get('view-itinerary');
    if (shareId) {
      const fetchSharedBooking = async () => {
        setSharedBookingLoading(true);
        setSharedBookingError(null);
        try {
          const res = await fetch(`/api/bookings/${shareId}`);
          if (res.ok) {
            const data = await res.json();
            setSharedBooking(data);
          } else {
            setSharedBookingError(
              lang === 'ar'
                ? 'لم يتم العثور على حجز تفاصيل الرحلة المشارك أو انتهت صلاحيته.'
                : 'Itinerary reservation not found or expired.'
            );
          }
        } catch (e) {
          console.error('Error fetching shared booking:', e);
          setSharedBookingError(
            lang === 'ar'
              ? 'فشل استرجاع تفاصيل الرحلة الملكية من نظام التوزيع.'
              : 'Failed to retrieve expedition itinerary.'
          );
        } finally {
          setSharedBookingLoading(false);
        }
      };
      fetchSharedBooking();
    } else {
      // Clear state if no query parameter is active
      setSharedBooking(null);
      setSharedBookingError(null);
    }
  }, [lang]);

  // Automatic Print Effect for "Prepare for Departure"
  useEffect(() => {
    if (sharedBooking) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('print') === 'true') {
        const timer = setTimeout(() => {
          window.print();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [sharedBooking]);

  return {
    sharedBooking,
    setSharedBooking,
    sharedBookingLoading,
    sharedBookingError,
    setSharedBookingError,
  };
}
