export interface LocalizedText {
  en: string;
  ar: string;
  de?: string;
  it?: string;
  fr?: string;
  es?: string;
  ru?: string;
}

export interface TourItinerary {
  day: number;
  title: LocalizedText;
  description: LocalizedText;
}

export interface TourFAQ {
  question: LocalizedText;
  answer: LocalizedText;
}

export interface TourExtra {
  id: string;
  name: LocalizedText;
  priceUSD: number;
}

export interface Tour {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  category: string;
  destination: string;
  images: string[];
  video?: string;
  duration: string; // e.g. "Full Day", "4 Hours"
  rating: number;
  reviewCount: number;
  priceUSD: number;
  itinerary: TourItinerary[];
  faqs: TourFAQ[];
  pickupZones: string[];
  hotels: string[];
  extras: TourExtra[];
  capacity: number;
  availableDates: string[];
}

export interface Traveler {
  name: string;
  ageGroup: 'adult' | 'child' | 'infant';
  passportNumber?: string;
}

export interface Booking {
  id: string;
  tourId: string;
  tourTitle: LocalizedText;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNationality: string;
  travelerCount: number;
  travelers: Traveler[];
  pickupHotel: string;
  roomNumber?: string;
  specialRequests?: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'deposit' | 'paid' | 'refunded';
  paymentMethod: string;
  amountPaidUSD: number;
  totalAmountUSD: number;
  currencyUsed: string;
  driverName?: string;
  guideName?: string;
  qrCode: string;
  whatsappSent: boolean;
  notes?: string;
  createdAt: string;
  detailsConfirmed?: boolean;
  detailsConfirmedAt?: string;
  signatureUrl?: string;
  luxuryAddon?: {
    id: string;
    title: LocalizedText;
    priceUSD: number;
    icon?: string;
  };
  review?: BookingReview;
  metadata?: Record<string, any>;
}

export interface ComponentReview {
  rating: number;
  comment: string;
}

export interface BookingReview {
  submittedAt: string;
  overallRating: number;
  components: {
    chauffeur: ComponentReview;
    guide: ComponentReview;
    itinerary: ComponentReview;
    catering: ComponentReview;
  };
  generalComment: string;
}

export interface LuxuryAddonRecommend {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  priceUSD: number;
  icon: string;
  reason: LocalizedText;
}

export interface Review {
  id: string;
  tourId: string;
  customerName: string;
  rating: number;
  comment: string;
  language: string;
  date: string;
}

export interface Blog {
  id: string;
  title: LocalizedText;
  content: LocalizedText;
  image: string;
  author: string;
  date: string;
  slug: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  validUntil: string;
  active: boolean;
}

export interface WhatsAppMessage {
  sender: 'customer' | 'system';
  message: string;
  timestamp: string;
}

export interface SupportMessage {
  sender: 'customer' | 'support';
  message: string;
  timestamp: string;
}

export interface EmailMessage {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  attachmentName?: string; // e.g. "MAS_Itinerary_RES-12345.pdf"
  timestamp: string;
}

export interface CustomerCRM {
  email: string;
  name: string;
  phone: string;
  nationality: string;
  language: string;
  tags: string[];
  notes: string;
  whatsappHistory: WhatsAppMessage[];
  supportHistory: SupportMessage[];
  emailHistory?: EmailMessage[]; // Optional to support existing CRM objects without migration hassle
  totalSpentUSD: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateToUSD: number; // exchange rate, e.g. EGP = 48.5, EUR = 0.92
}

export interface SupportTicketMessage {
  id: string;
  sender: 'customer' | 'support' | 'ai';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  category: 'Chauffeur' | 'Itinerary' | 'Payment' | 'Dietary' | 'Special Request' | 'Other';
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'royal';
  createdAt: string;
  messages: SupportTicketMessage[];
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  triggerEvent: string; // e.g., 'on_booking_create', 'on_driver_assign', 'on_payment'
  templateText: string;
  active: boolean;
}
