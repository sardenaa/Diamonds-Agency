import { useEffect } from 'react';
import { Tour, AppLanguage } from '../types.js';

interface SEOHelperProps {
  lang: AppLanguage;
  role: 'guest' | 'customer' | 'admin';
  selectedCategory: string;
  selectedTour: Tour | null;
  searchDestination?: string;
  sharedBooking?: any;
}

export default function SEOHelper({
  lang,
  role,
  selectedCategory,
  selectedTour,
  searchDestination,
  sharedBooking
}: SEOHelperProps) {
  useEffect(() => {
    let title = '';
    let description = '';
    let keywords = '';

    const isAr = lang === 'ar';

    if (sharedBooking) {
      const tourTitle = isAr ? sharedBooking.tourTitle?.ar : sharedBooking.tourTitle?.en;
      const guestName = sharedBooking.customerName;
      title = isAr
        ? `تصريح المرور الرقمي الفاخر لـ ${guestName} | وكالة ماس السيادية بمصر`
        : `${guestName}'s Digital VIP Clearance Pass | MAS Sovereign Agency`;
      description = isAr
        ? `عرض تفاصيل المسار الحي المعتمد، تعيينات السائق الفاخر والأثري، وحالة الدفع لرحلة "${tourTitle}" لـ ${guestName}.`
        : `Live approved routing details, personal chauffeur assignments, luxury Egyptologist scholar guides, and payment ledger status for ${guestName}'s upcoming tour "${tourTitle}".`;
      keywords = `boarding pass, vip clearance, mas agency, sovereign travel egypt, ${tourTitle}, personal chauffeur`;
    } else if (role === 'admin') {
      title = isAr
        ? 'بوابة الإدارة والامتثال والتحليلات السيادية | وكالة ماس الفاخرة'
        : 'Sovereign Compliance & Operations Audit Ledger | MAS Luxury Admin';
      description = isAr
        ? 'لوحة تحكم إدارية مغلقة بالكامل لإدارة العمليات، تعيين السائقين والأثريين، والتحقق من سجلات الأمان والامتثال والتحليلات المتقدمة.'
        : 'Secure enterprise admin dashboard. Live operations, CRM profiling, automated customer dispatch, custom blogs, coupon engine, and military-grade traceability logs.';
      keywords = 'admin dashboard, secure ledger, mas internal operations, compliance logs, sovereign analytics';
    } else if (role === 'customer') {
      title = isAr
        ? 'بوابة الضيوف الفاخرة وتتبع الرحلات | وكالة ماس السيادية'
        : 'Sovereign VIP Guest Portal & Live Itinerary Tracking | MAS Agency';
      description = isAr
        ? 'الوصول الحصري لبوابة كبار الشخصيات لتتبع المسارات النشطة، تفاصيل السائقين الأثريين، والتواصل المباشر مع مكتب الخدمة.'
        : 'Bespoke customer VIP terminal. Access live chauffeur telemetry, luxury Egyptologist profiles, digital boarding pass QR codes, and 24/7 butler service.';
      keywords = 'vip portal, travel tracker, luxury butler, mercedes v-class egypt, sovereign guest pass';
    } else if (selectedTour) {
      const tTitle = isAr ? selectedTour.title.ar : selectedTour.title.en;
      const tDesc = isAr ? selectedTour.description.ar : selectedTour.description.en;
      const cleanDesc = tDesc.length > 155 ? `${tDesc.slice(0, 152)}...` : tDesc;
      
      title = isAr
        ? `رحلة ${tTitle} - تجربة كبار الشخصيات الخاصة | وكالة ماس مصر`
        : `${tTitle} - VIP Elite Private Tour | MAS Sovereign Egypt`;
      description = cleanDesc;
      keywords = `${selectedTour.category}, ${selectedTour.destination}, ${tTitle}, Egypt luxury travel, private egyptologist, private charter egypt`;
    } else if (selectedCategory && selectedCategory !== 'All') {
      title = isAr
        ? `رحلات ${selectedCategory} الفاخرة والمخصصة | وكالة ماس`
        : `${selectedCategory} - Curated Bespoke Private Tours | MAS Egypt`;
      description = isAr
        ? `استكشف مجموعتنا الفاخرة من رحلات ${selectedCategory} بمصر. تضمن جميع الرحلات انتقالات مرسيدس خاصة ومرشدين أثريين مرخصين.`
        : `Explore our prestigious collection of ${selectedCategory} tours in Egypt. Includes absolute private Mercedes transit, custom itineraries, and high-security escorts.`;
      keywords = `${selectedCategory}, Egypt private tours, elite excursions, cairo luxury, luxury nile dahabiya`;
    } else if (searchDestination) {
      title = isAr
        ? `رحلات استكشافية فاخرة في ${searchDestination} | وكالة ماس`
        : `Bespoke Curated Luxury Tours in ${searchDestination} | MAS Egypt`;
      description = isAr
        ? `احجز رحلتك الفاخرة المخصصة في ${searchDestination} مع وكالة ماس. جولات خاصة بالكامل، مرسيدس V-Class، ويخوت سيادية.`
        : `Book your custom sovereign tour in ${searchDestination} with MAS Agency. Certified elite Egyptologists, VIP Mercedes-Benz transfers, and bespoke luxury access.`;
      keywords = `${searchDestination} tour, private tour ${searchDestination}, luxury travel, royal egypt holiday`;
    } else {
      title = isAr
        ? 'وكالة ماس السيادية - رحلات خاصة فاخرة ويخوت كبار الشخصيات بمصر'
        : 'MAS Sovereign Agency - Bespoke Luxury Private Expeditions & VIP Yachting Egypt';
      description = isAr
        ? 'وكالة السفر الفاخرة الرائدة بمصر. نقدم جولات خاصة حصرية بالكامل مع سائقين شخصيين بمرسيدس V-Class، مرشدين أثريين من النخبة، ويخوت خاصة فاخرة.'
        : 'Egypt\'s premier sovereign luxury agency. Absolute private itineraries, elite licensed Egyptologists, high-end private yacht fleets, and personal Mercedes V-Class chauffeur transit.';
      keywords = 'egypt luxury tours, private pyramids tour, private egyptologist, luxury nile cruise, sharm private yacht, elite cairo travel agency';
    }

    // Update Document Title
    document.title = title;

    // Helper to update/create meta tags
    const updateMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update Meta Tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // OpenGraph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:locale', isAr ? 'ar_EG' : 'en_US', true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:site_name', isAr ? 'وكالة ماس السيادية' : 'MAS Sovereign Agency', true);

  }, [lang, role, selectedCategory, selectedTour, searchDestination, sharedBooking]);

  return null; // This component updates the DOM head dynamically and does not render visual markup
}
