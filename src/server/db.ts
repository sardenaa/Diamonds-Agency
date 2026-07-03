import fs from 'fs';
import path from 'path';
import { Tour, Booking, Review, Blog, Coupon, CustomerCRM, AuditLog, CurrencyConfig, SupportTicket, WhatsAppTemplate } from '../types.js';

const DB_FILE = path.join(process.cwd(), 'database.json');

// Live default exchange rates
export const DEFAULT_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', rateToUSD: 1.0 },
  { code: 'EUR', symbol: '€', rateToUSD: 0.92 },
  { code: 'GBP', symbol: '£', rateToUSD: 0.78 },
  { code: 'EGP', symbol: 'EGP ', rateToUSD: 48.5 },
  { code: 'SAR', symbol: 'SR ', rateToUSD: 3.75 },
  { code: 'AED', symbol: 'AED ', rateToUSD: 3.67 }
];

interface DBData {
  tours: Tour[];
  bookings: Booking[];
  reviews: Review[];
  blogs: Blog[];
  coupons: Coupon[];
  crm: CustomerCRM[];
  auditLogs: AuditLog[];
  tickets?: SupportTicket[];
  whatsappTemplates?: WhatsAppTemplate[];
}

const initialTours: Tour[] = [
  {
    id: 'tour-1',
    title: {
      en: 'Private VIP Pyramids & Great Sphinx Royal Expedition',
      ar: 'رحلة استكشاف ملكية خاصة لكبار الشخصيات للأهرامات وأبي الهول'
    },
    description: {
      en: 'Experience the Giza Plateau like royalty. Includes a private Egyptologist guide, skip-the-line access to the Great Pyramid chamber, a luxurious 4x4 desert ride, and a private gourmet lunch overlooking the pyramids. Complete VIP transport in our Mercedes V-Class.',
      ar: 'استمتع بتجربة هضبة الجيزة كالملوك. تشمل الرحلة مرشدًا خاصًا متخصصًا في علم المصريات، ودخولًا سريعًا دون انتظار لغرفة الهرم الأكبر، وجولة فاخرة بالدفع الرباعي في الصحراء، وغداءً خاصًا فاخرًا يطل على الأهرامات. نقل فاخر بسيارة مرسيدس V-Class.'
    },
    category: 'Historical Tours',
    destination: 'Cairo',
    images: [
      'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-camels-walking-in-front-of-the-egyptian-pyramids-41846-large.mp4',
    duration: 'Full Day (8 Hours)',
    rating: 4.95,
    reviewCount: 148,
    priceUSD: 450,
    itinerary: [
      {
        day: 1,
        title: { en: 'Royal Reception & Mercedes Pickup', ar: 'الاستقبال الملكي والتحرك بالمرسيدس' },
        description: {
          en: 'Our professional chauffeur picks you up from your luxury hotel in a private Mercedes V-Class with chilled towels and premium refreshments.',
          ar: 'يقوم سائقنا المحترف باصطحابك من فندقك الفاخر بسيارة مرسيدس V-Class خاصة مع مناشف مبردة ومشروبات فاخرة.'
        }
      },
      {
        day: 2,
        title: { en: 'Exclusive Great Pyramid Access', ar: 'دخول حصري للهرم الأكبر' },
        description: {
          en: 'Bypass all public lines. Walk through the private chambers of Khufu with your dedicated scholar guide explaining ancient secrets.',
          ar: 'تجاوز جميع خطوط الانتظار العامة. امشِ عبر الغرف الخاصة لخوفو مع مرشدك الأكاديمي المخصص لشرح الأسرار القديمة.'
        }
      },
      {
        day: 3,
        title: { en: 'Royal Desert Camel Ride & Gourmet Lunch', ar: 'ركوب الجمال الملكي في الصحراء وغداء فاخر' },
        description: {
          en: 'Ride premium desert camels or quad bikes to our private pavilion. Enjoy a 5-star catering menu with pyramids backdrop.',
          ar: 'اركب الجمال الصحراوية الفاخرة أو الدراجات الرباعية إلى جناحنا الخاص. استمتع بقائمة طعام 5 نجوم مع خلفية الأهرامات.'
        }
      }
    ],
    faqs: [
      {
        question: { en: 'Is entrance inside the Great Pyramid included?', ar: 'هل تذكرة دخول الهرم الأكبر من الداخل مشمولة؟' },
        answer: { en: 'Yes, this VIP experience includes special entrance tickets into the deep burial chamber of King Khufu.', ar: 'نعم، تشمل هذه التجربة الفاخرة تذاكر دخول خاصة إلى غرفة الدفن العميقة للملك خوفو.' }
      },
      {
        question: { en: 'Can we customize the departure time?', ar: 'هل يمكننا تعديل وقت المغادرة؟' },
        answer: { en: 'Absolutely. As a fully private VIP tour, the timeline is fully adaptable to your preferences.', ar: 'بالتأكيد. نظرًا لأنها جولة خاصة بالكامل لكبار الشخصيات، فإن الجدول الزمني قابل للتكيف تمامًا مع تفضيلاتك.' }
      }
    ],
    pickupZones: ['Giza Hotels', 'Downtown Cairo Hotels', 'New Cairo / Heliopolis Hotels'],
    hotels: ['The Ritz-Carlton Cairo', 'Four Seasons Nile Plaza', 'Marriott Mena House', 'St. Regis Cairo'],
    extras: [
      { id: 'ext-1', name: { en: 'Professional Travel Photographer & Videographer', ar: 'مصور ومخرج سينمائي محترف لمرافقة الرحلة' }, priceUSD: 150 },
      { id: 'ext-2', name: { en: 'Helicopter Scenic Flight over Nile (Per Passenger)', ar: 'رحلة هليكوبتر فوق النيل (لكل راكب)' }, priceUSD: 600 },
      { id: 'ext-3', name: { en: 'Private Bodyguard Security Escort', ar: 'مرافق حراسة شخصية خاص' }, priceUSD: 250 }
    ],
    capacity: 6,
    availableDates: ['2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07']
  },
  {
    id: 'tour-2',
    title: {
      en: 'Luxury Nile Dahabiya Royal Cruise & Luxor Tombs Explorer',
      ar: 'رحلة نيلية ملكية فاخرة على متن الذهبية واستكشاف مقابر الأقصر'
    },
    description: {
      en: 'Settle into a private 5-suite traditional sailing Dahabiya. Discover the magnificent Valley of the Kings, the Tomb of Tutankhamun, Karnak Temple, and Philal island with ultimate luxury, fine dining, and live harp sessions under the stars.',
      ar: 'استرخِ في دهبية شراعية تقليدية خاصة تضم 5 أجنحة فقط. اكتشف وادي الملوك الرائع، مقبرة توت عنخ آمون، معبد الكرنك، وجزيرة فيلة مع الرفاهية المطلقة، المأكولات الراقية، وعزف الهارب الحي تحت النجوم.'
    },
    category: 'Luxury Cruises',
    destination: 'Luxor',
    images: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?auto=format&fit=crop&q=80&w=1200'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-luxor-temple-at-sunset-egypt-42841-large.mp4',
    duration: '3 Days / 2 Nights',
    rating: 4.98,
    reviewCount: 92,
    priceUSD: 1200,
    itinerary: [
      {
        day: 1,
        title: { en: 'Boarding the Dahabiya & East Bank Private Tour', ar: 'الصعود على الدهبية وجولة البر الشرقي الخاصة' },
        description: {
          en: 'Embark on our ultra-private luxury Dahabiya yacht. Savor custom welcoming drinks followed by a curated twilight walk inside Karnak Temple.',
          ar: 'اصعد على متن يخت الدهبية الفاخر فائق الخصوصية. تذوق مشروبات الترحيب المخصصة تليها جولة غروب ساحرة داخل معبد الكرنك.'
        }
      },
      {
        day: 2,
        title: { en: 'VIP Valley of the Kings & Seti I Tomb', ar: 'وادي الملوك الفاخر ومقبرة سيتي الأول' },
        description: {
          en: 'Descend into the exclusive Tomb of Seti I (normally closed to general public) and Tutankhamun. Afternoon sail with luxury afternoon high tea.',
          ar: 'انزل إلى مقبرة سيتي الأول الحصرية (المغلقة عادةً أمام الجمهور العام) ومقبرة توت عنخ آمون. إبحار بعد الظهر مع شاي بعد الظهر الفاخر.'
        }
      },
      {
        day: 3,
        title: { en: 'Temple of Edfu & Royal Gala Dinner', ar: 'معبد إدفو وعشاء اليخوت الملكي' },
        description: {
          en: 'Visit Edfu temple via luxury horse-drawn carriage. End the journey with a candlelit royal gala dinner on an island on the Nile.',
          ar: 'قم بزيارة معبد إدفو عبر عربة تجرها الخيول الفاخرة. اختتم الرحلة بعشاء ملكي فاخر على ضوء الشموع على جزيرة في النيل.'
        }
      }
    ],
    faqs: [
      {
        question: { en: 'Is this a large cruise ship?', ar: 'هل هذه سفينة كروز كبيرة؟' },
        answer: { en: 'No, this is a premium private sailing Dahabiya. It has only 5 boutique suites, catering to maximum 10 elite guests, ensuring total peace and luxury.', ar: 'لا، هذه دهبية شراعية خاصة فاخرة للغاية. تحتوي على 5 أجنحة بوتيكية فقط، وتتسع لـ 10 ضيوف كحد أقصى، مما يضمن الهدوء التام والخصوصية.' }
      }
    ],
    pickupZones: ['Luxor Airport', 'Luxor Luxury Hotels', 'Aswan Airport'],
    hotels: ['Sofitel Legend Old Cataract Aswan', 'Hilton Luxor Resort & Spa', 'Winter Palace Luxor'],
    extras: [
      { id: 'ext-4', name: { en: 'Sunrise Private Hot Air Balloon Ride', ar: 'رحلة منطاد هوائي خاصة عند شروق الشمس' }, priceUSD: 200 },
      { id: 'ext-5', name: { en: 'Champagne Royal Welcoming Basket', ar: 'سلة ترحيب ملكية مع مشروب فاخر' }, priceUSD: 180 }
    ],
    capacity: 10,
    availableDates: ['2026-07-04', '2026-07-08', '2026-07-12']
  },
  {
    id: 'tour-3',
    title: {
      en: 'VIP Sharm El Sheikh Private Yacht Charter & Red Sea Reef Safari',
      ar: 'ميثاق يخت خاص لكبار الشخصيات في شرم الشيخ ورحلة سفاري الشعب المرجانية'
    },
    description: {
      en: 'Cruise the crystalline waters of the Red Sea on your private 80ft luxury yacht. Visit Ras Mohammed National Park, snorkel with vibrant marine life, dive with private master instructors, and dine on fresh lobster and seafood prepared by your private chef on board.',
      ar: 'أبحر في المياه الكريستالية للبحر الأحمر على متن يختك الفاخر الخاص بطول 80 قدمًا. قم بزيارة محمية رأس محمد الوطنية، واستمتع بالغطس مع الحياة البحرية الملونة، واستمتع بالغوص مع مدربين معتمدين، وتناول الكركند الطازج والمأكولات البحرية من إعداد طاهيك الخاص على متن اليخت.'
    },
    category: 'VIP Yacht Charters',
    destination: 'Sharm El Sheikh',
    images: [
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-yacht-sailing-the-sea-43285-large.mp4',
    duration: 'Full Day (7 Hours)',
    rating: 4.97,
    reviewCount: 74,
    priceUSD: 950,
    itinerary: [
      {
        day: 1,
        title: { en: 'VIP Boarding at Marina', ar: 'صعود كبار الشخصيات في المارينا' },
        description: {
          en: 'Arrive via private Mercedes luxury transport. Step onto your pristine private yacht with a chilled glass of premium sparkling juice.',
          ar: 'الوصول عبر خدمة النقل الفاخرة الخاصة بمرسيدس. اصعد إلى يختك الخاص الرائع مع كوب مبرد من العصير الفوار الفاخر.'
        }
      },
      {
        day: 2,
        title: { en: 'Ras Mohammed Snorkeling & Coral Dives', ar: 'الغوص ورأس محمد سنوركلينج' },
        description: {
          en: 'Sail to Yolanda Reef. Explore underwater shipwrecks and vibrant gardens accompanied by a private marine biologist.',
          ar: 'أبحر إلى يولاندا ريف. استكشف حطام السفن تحت الماء والحدائق المرجانية النابضة بالحياة برفقة عالم أحياء مائية خاص.'
        }
      },
      {
        day: 3,
        title: { en: 'On-Deck Lobster Feast & Sunset Sail', ar: 'وليمة استاكوزا طازجة على اليخت وإبحار الغروب' },
        description: {
          en: 'Savor a freshly grilled lobster and prawn lunch. Sip cocktails on the sunbed as we cruise back along the Sinai coast during golden hour.',
          ar: 'تذوق غداءً من الاستاكوزا المشوية والجمبري الطازج. ارتشف المشروبات اللذيذة على السرير الشمسي بينما نبحر عائدين على طول ساحل سيناء في الساعة الذهبية.'
        }
      }
    ],
    faqs: [
      {
        question: { en: 'Does the yacht include diving gear?', ar: 'هل يشمل اليخت معدات الغوص؟' },
        answer: { en: 'Yes, full high-end snorkeling and diving gear, including tanks, are fully provided. Professional dive instructors are on board.', ar: 'نعم، يتم توفير معدات السنوركلينج والغوص الكاملة عالية الجودة بما في ذلك الخزانات. مدربو غوص محترفون على متن الطائرة.' }
      }
    ],
    pickupZones: ['Naama Bay Hotels', 'Nabq Luxury Resorts', 'Sharm Marina'],
    hotels: ['Four Seasons Resort Sharm El Sheikh', 'Rixos Premium Seagate', 'Steigenberger Alcazar'],
    extras: [
      { id: 'ext-6', name: { en: 'Jet Ski Adventure Rental (2 Hours)', ar: 'مغامرة جيت سكي (ساعتان)' }, priceUSD: 120 },
      { id: 'ext-7', name: { en: 'Live Violinist Performance on Yacht', ar: 'عازف كمان حي على اليخت' }, priceUSD: 300 }
    ],
    capacity: 12,
    availableDates: ['2026-07-03', '2026-07-05', '2026-07-07', '2026-07-09']
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    tourId: 'tour-1',
    customerName: 'Marcus Aurelius',
    rating: 5,
    comment: 'The absolute gold standard of luxury travel in Egypt. Our Mercedes V-Class chauffeur was polite, the Egyptologist scholar was incredibly brilliant, and our private lunch overlooking the Pyramids made us feel like kings. Highly recommended.',
    language: 'en',
    date: '2026-06-25'
  },
  {
    id: 'rev-2',
    tourId: 'tour-1',
    customerName: 'فاطمة الهاشمي',
    rating: 5,
    comment: 'خدمة خيالية تفوق الوصف. الاهتمام بالتفاصيل مذهل، والمرشد كان ملمًا بأدق أسرار التاريخ الفرعوني. تجربة الغداء أمام الأهرامات ساحرة ولن ننساها أبدًا.',
    language: 'ar',
    date: '2026-06-28'
  },
  {
    id: 'rev-3',
    tourId: 'tour-2',
    customerName: 'Alexandra Dupont',
    rating: 5,
    comment: 'Sailing the Nile on this private Dahabiya is like traveling back in time in complete luxury. The staff on the boat was so attentive, and having Seti I tomb all to ourselves was magical.',
    language: 'en',
    date: '2026-06-20'
  }
];

const initialBlogs: Blog[] = [
  {
    id: 'blog-1',
    title: {
      en: 'The Ultimate Guide to Luxury Egypt Travel: Beyond the Traditional Crowds',
      ar: 'الدليل الشامل للسفر الفاخر في مصر: ما وراء السياحة التقليدية المزدحمة'
    },
    content: {
      en: 'Egypt is a land of wonders, but experiencing it in comfort requires expert curation. Skip the hot tourist buses and crowded schedules. Instead, choose private Mercedes-Benz transfers, chartered Nile sailing Dahabiyas, and exclusive private temple access. In this guide, we detail how MAS Agency designs bespoke luxury itineraries for elite travelers looking to witness the Pyramids, Luxor and the Red Sea with absolute privacy.',
      ar: 'مصر أرض العجائب، ولكن الاستمتاع بها براحة يتطلب تنسيقًا احترافيًا. تخطَ الحافلات السياحية الحارة والجداول المزدحمة. بدلاً من ذلك، اختر سيارات مرسيدس-بنز الخاصة، ودهبيات الإبحار النيلية المستأجرة، والدخول الحصري الخاص للمعابد. في هذا الدليل، نوضح بالتفصيل كيف تصمم وكالة ماس رحلات فاخرة ومخصصة للمسافرين النخبة الذين يتطلعون لمشاهدة الأهرامات والأقصر والبحر الأحمر بخصوصية تامة.'
    },
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200',
    author: 'Chief Luxury Curator, MAS Agency',
    date: '2026-06-15',
    slug: 'ultimate-luxury-egypt-guide'
  },
  {
    id: 'blog-2',
    title: {
      en: 'Sailing like the Pharaohs: The Elegance of the Traditional Nile Dahabiya',
      ar: 'الإبحار على خطى الفراعنة: أناقة يخت الدهبية النيلي التقليدي'
    },
    content: {
      en: 'Nothing matches the tranquil romance of a traditional wooden Dahabiya. Unlike huge, noisy, pollutant diesel cruise ships, the Dahabiya glides gracefully utilizing only the Nile breeze. Enjoy local organic food sourced daily from local river island farmers, bespoke luxury suites, and silent sunset dinners on the river shores. Discover why elite travelers prefer Dahabiya over massive cruise ships.',
      ar: 'لا شيء يضاهي الرومانسية الهادئة للدهبية الخشبية التقليدية. على عكس سفن الكروز الضخمة والمزعجة الملوثة بمحركات الديزل، تنزلق الدهبية برقة مستعينة بنسمات النيل فقط. استمتع بالأطعمة العضوية الطازجة التي يتم جلبها يوميًا من مزارعي جزر النيل المحليين، والأجنحة الفاخرة المخصصة، وعشاء الغروب الصامت على ضفاف النهر. اكتشف لماذا يفضل نخبة المسافرين الدهبية.'
    },
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
    author: 'Captain Ahmed, Dahabiya Fleet Director',
    date: '2026-06-20',
    slug: 'sailing-pharaohs-dahabiya-elegance'
  }
];

const initialCoupons: Coupon[] = [
  { code: 'MASGOLD', discountPercent: 15, validUntil: '2026-12-31', active: true },
  { code: 'WELCOME10', discountPercent: 10, validUntil: '2026-12-31', active: true },
  { code: 'VIPLUXURY', discountPercent: 20, validUntil: '2026-12-31', active: true }
];

const initialCRM: CustomerCRM[] = [
  {
    email: 'diamond.entertainment70@gmail.com',
    name: 'Diamond Entertainment',
    phone: '+1 415-555-2671',
    nationality: 'United States',
    language: 'en',
    tags: ['VIP', 'Luxury Explorer', 'High Spender'],
    notes: 'Prefers private Mercedes V-Class transport, loves fine dining, requested high floors in all Cairo hotels.',
    whatsappHistory: [
      { sender: 'system', message: 'Welcome to MAS Agency Enterprise! Thank you for registering. Your personal travel butler has been assigned.', timestamp: '2026-07-02T05:00:00Z' },
      { sender: 'customer', message: 'Hello! I am looking to book the Pyramids VIP tour next week. Does the price include the inside pyramid ticket?', timestamp: '2026-07-02T05:02:00Z' },
      { sender: 'system', message: 'Yes, indeed! It includes skip-the-line access to King Khufu Burial Chamber, a dedicated Egyptologist guide, and a Mercedes V-Class transfer. Would you like me to book it?', timestamp: '2026-07-02T05:03:00Z' }
    ],
    supportHistory: [
      { sender: 'customer', message: 'Hi support team, is passport mandatory for the yacht charter?', timestamp: '2026-07-02T04:30:00Z' },
      { sender: 'support', message: 'Hello! Passport copies are required 24 hours prior for coast guard clearance, but can be submitted digitally via our dashboard. We take care of everything else!', timestamp: '2026-07-02T04:32:00Z' }
    ],
    totalSpentUSD: 450,
    createdAt: '2026-07-01T12:00:00Z'
  }
];

const initialBookings: Booking[] = [
  {
    id: 'RES-74291',
    tourId: 'tour-1',
    tourTitle: {
      en: 'Private VIP Pyramids & Great Sphinx Royal Expedition',
      ar: 'رحلة استكشاف ملكية خاصة لكبار الشخصيات للأهرامات وأبي الهول'
    },
    customerName: 'Diamond Entertainment',
    customerEmail: 'diamond.entertainment70@gmail.com',
    customerPhone: '+1 415-555-2671',
    customerNationality: 'United States',
    travelerCount: 1,
    travelers: [{ name: 'Diamond Entertainment', ageGroup: 'adult' }],
    pickupHotel: 'Marriott Mena House',
    roomNumber: 'Suite 408',
    specialRequests: 'Prefers an afternoon departure if possible. Please confirm photographer.',
    date: '2026-07-03',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Google Pay',
    amountPaidUSD: 450,
    totalAmountUSD: 450,
    currencyUsed: 'USD',
    driverName: 'Sherif El Masry',
    guideName: 'Dr. Zahi',
    qrCode: 'MAS-QR-RES-74291',
    whatsappSent: true,
    notes: 'Assigned Sherif (our highest-rated Mercedes V-Class driver) and Dr. Zahi as Egyptologist.',
    createdAt: '2026-07-02T01:15:00Z'
  },
  {
    id: 'RES-10952',
    tourId: 'tour-2',
    tourTitle: {
      en: 'Luxury Nile Dahabiya Royal Cruise & Luxor Tombs Explorer',
      ar: 'رحلة نيلية ملكية فاخرة على متن الذهبية واستكشاف مقابر الأقصر'
    },
    customerName: 'Diamond Entertainment',
    customerEmail: 'diamond.entertainment70@gmail.com',
    customerPhone: '+1 415-555-2671',
    customerNationality: 'United States',
    travelerCount: 2,
    travelers: [
      { name: 'Diamond Entertainment', ageGroup: 'adult' },
      { name: 'Lady Charlotte Campbell', ageGroup: 'adult' }
    ],
    pickupHotel: 'Winter Palace Luxor',
    roomNumber: 'Suite 102',
    specialRequests: 'Requested sunset candlelight dinner on Nile island.',
    date: '2026-06-30',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    amountPaidUSD: 2400,
    totalAmountUSD: 2400,
    currencyUsed: 'USD',
    driverName: 'Sherif El Masry',
    guideName: 'Dr. Zahi',
    qrCode: 'MAS-QR-RES-10952',
    whatsappSent: true,
    notes: 'Completed tour of Luxor and Nile cruising.',
    createdAt: '2026-06-25T14:30:00Z'
  }
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'PLATFORM_INITIALIZATION',
    user: 'System Admin',
    timestamp: '2026-07-02T05:40:00Z',
    details: 'MAS Agency Enterprise Platform successfully initialized and data stores seeded.'
  }
];

const initialTickets: SupportTicket[] = [
  {
    id: 'TCK-51092',
    customerEmail: 'diamond.entertainment70@gmail.com',
    customerName: 'Diamond Entertainment',
    subject: 'Confirm high-floor room view at Marriott Mena House',
    category: 'Special Request',
    status: 'open',
    priority: 'high',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        message: 'Hi, we booked the Pyramids VIP tour and are staying at Marriott Mena House. Could you verify if we have a pyramid-view high-floor suite? Thank you!',
        timestamp: new Date().toISOString()
      }
    ]
  }
];

const initialTemplates: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Booking Confirmed & QR Voucher Dispatch',
    triggerEvent: 'on_booking_create',
    templateText: '👑 *MAS Luxury Travel* | Booking *{booking_id}* CONFIRMED!\n\nDear *{customer_name}*, we are delighted to curate your experience: *{tour_name}* on *{date}*.\n\n📍 *Pickup:* {pickup_hotel}\n🚗 *Transport:* Mercedes-Benz V-Class Private Chauffeur\n\n🎟️ *Digital QR Ticket:* {qr_code}\nShow this to your chauffeur at pickup. Safe travels!',
    active: true
  },
  {
    id: 'tpl-2',
    name: 'VIP Private Chauffeur Assignment Alerts',
    triggerEvent: 'on_driver_assign',
    templateText: '🚗 *Chauffeur Dispatch* | MAS Agency VIP Escort\n\nDear *{customer_name}*, your dedicated Mercedes chauffeur has been assigned for your upcoming tour *{booking_id}*.\n\n👤 *Driver Name:* {driver_name}\n✨ *Vehicle:* Pristine Mercedes-Benz V-Class with climate-controls and premium amenities.\n\nEnjoy the peak of luxury transportation.',
    active: true
  },
  {
    id: 'tpl-3',
    name: 'VIP Tour Guide Coordinator Alignment',
    triggerEvent: 'on_guide_assign',
    templateText: '🎓 *Egyptologist Assigned* | MAS Agency Heritage Curator\n\nDear *{customer_name}*, we are honored to align your expedition with our elite Egyptology scholar *{guide_name}* for your tour on *{date}*.\n\nThey are excited to unveil ancient mysteries for you with absolute privacy. Prepare for an unforgettable journey!',
    active: true
  }
];

const defaultDB: DBData = {
  tours: initialTours,
  bookings: initialBookings,
  reviews: initialReviews,
  blogs: initialBlogs,
  coupons: initialCoupons,
  crm: initialCRM,
  auditLogs: initialAuditLogs,
  tickets: initialTickets,
  whatsappTemplates: initialTemplates
};

export function getDB(): DBData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
      return defaultDB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db: DBData = JSON.parse(raw);
    
    // Auto-migrate if support tickets or templates are missing
    let modified = false;
    if (!db.tickets) {
      db.tickets = initialTickets;
      modified = true;
    }
    if (!db.whatsappTemplates) {
      db.whatsappTemplates = initialTemplates;
      modified = true;
    }
    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
    
    return db;
  } catch (error) {
    console.error('Error reading JSON DB, returning defaults', error);
    return defaultDB;
  }
}

export function saveDB(data: DBData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing JSON DB', error);
  }
}

export function logAudit(action: string, user: string, details: string): void {
  const db = getDB();
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    action,
    user,
    timestamp: new Date().toISOString(),
    details
  };
  db.auditLogs.unshift(newLog);
  // Keep last 200 logs for performance
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  saveDB(db);
}
