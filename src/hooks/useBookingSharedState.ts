import { useState, useEffect } from 'react';
import { AppLanguage } from '../types.js';

const hookT = {
  en: {
    notFound: 'Itinerary reservation not found or expired.',
    failed: 'Failed to retrieve expedition itinerary.'
  },
  ar: {
    notFound: 'لم يتم العثور على حجز تفاصيل الرحلة المشارك أو انتهت صلاحيته.',
    failed: 'فشل استرجاع تفاصيل الرحلة الملكية من نظام التوزيع.'
  },
  de: {
    notFound: 'Reiseplanreservierung nicht gefunden oder abgelaufen.',
    failed: 'Abrufen des Expeditionsreiseplans fehlgeschlagen.'
  },
  pl: {
    notFound: 'Nie znaleziono rezerwacji planu podróży lub jej ważność wygasła.',
    failed: 'Nie udało się pobrać planu wyprawy.'
  },
  cs: {
    notFound: 'Rezervace itineráře nebyla nalezena nebo vypršela její platnost.',
    failed: 'Nepodařilo se načíst itinerář expedice.'
  }
};

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
              (hookT[lang] || hookT.en).notFound
            );
          }
        } catch (e) {
          console.error('Error fetching shared booking:', e);
          setSharedBookingError(
            (hookT[lang] || hookT.en).failed
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
