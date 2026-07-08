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
  notifications?: any[];
}

const initialTours: Tour[] = [
  {
    id: 'tour-1',
    title: {
      en: 'Private VIP Pyramids & Great Sphinx Royal Expedition',
      ar: 'رحلة استكشاف ملكية خاصة لكبار الشخصيات للأهرامات وأبي الهول',
      de: 'Private VIP-Expedition zu den Pyramiden & dem Großen Sphinx',
      pl: 'Prywatna Królewska Wyprawa VIP pod Piramidy i Wielkiego Sfinksa',
      cs: 'Soukromá Královská Expedice VIP k Pyramidám a Velké Sfinze'
    },
    description: {
      en: 'Experience the Giza Plateau like royalty. Includes a private Egyptologist guide, skip-the-line access to the Great Pyramid chamber, a luxurious 4x4 desert ride, and a private gourmet lunch overlooking the pyramids. Complete VIP transport in our Mercedes V-Class.',
      ar: 'استمتع بتجربة هضبة الجيزة كالملوك. تشمل الرحلة مرشدًا خاصًا متخصصًا في علم المصريات، ودخولًا سريعًا دون انتظار لغرفة الهرم الأكبر، وجولة فاخرة بالدفع الرباعي في الصحراء، وغداءً خاصًا فاخرًا يطل على الأهرامات. نقل فاخر بسيارة مرسيدس V-Class.',
      de: 'Erleben Sie das Gizeh-Plateau wie ein König. Beinhaltet einen privaten Ägyptologen-Führer, bevorzugten Einlass zur Grabkammer der Großen Pyramide, eine luxuriöse 4x4-Wüstenfahrt und ein privates Gourmet-Mittagessen mit Blick auf die Pyramiden. VIP-Transport in unserer Mercedes V-Klasse.',
      pl: 'Doświadcz płaskowyżu Giza jak rodzina królewska. W cenie prywatny przewodnik egiptolog, wejście bez kolejki do komory Wielkiej Piramidy, luksusowa przejażdżka 4x4 po pustyni oraz prywatny wykwintny lunch z widokiem na piramidy. Pełny transport VIP naszym Mercedesem Klasy V.',
      cs: 'Zažijte plošinu v Gíze jako královská rodina. Zahrnuje soukromého průvodce egyptologa, přednostní vstup do komory Velké pyramidy, luxusní jízdu 4x4 pouští a soukromý gurmánský oběd s výhledem na pyramidy. VIP doprava naším Mercedesem třídy V.'
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
        title: { 
          en: 'Royal Reception & Mercedes Pickup', 
          ar: 'الاستقبال الملكي والتحرك بالمرسيدس',
          de: 'Königlicher Empfang & Abholung im Mercedes',
          pl: 'Królewskie Powitanie i Odbiór Mercedesem',
          cs: 'Královské Přivítání a Vyzvednutí Mercedesem'
        },
        description: {
          en: 'Our professional chauffeur picks you up from your luxury hotel in a private Mercedes V-Class with chilled towels and premium refreshments.',
          ar: 'يقوم سائقنا المحترف باصطحابك من فندقك الفاخر بسيارة مرسيدس V-Class خاصة مع مناشف مبردة ومشروبات فاخرة.',
          de: 'Unser professioneller Chauffeur holt Sie von Ihrem Luxushotel in einer privaten Mercedes V-Klasse mit gekühlten Handtüchern und Premium-Erfrischungen ab.',
          pl: 'Nasz profesjonalny szofer odbierze Cię z luksusowego hotelu prywatnym Mercedesem Klasy V, oferując schłodzone ręczniki i napoje premium.',
          cs: 'Náš profesionální řidič vás vyzvedne z vašeho luxusního hotelu v soukromém Mercedesu třídy V se studenými ručníky a prémiovým občerstvením.'
        }
      },
      {
        day: 2,
        title: { 
          en: 'Exclusive Great Pyramid Access', 
          ar: 'دخول حصري للهرم الأكبر',
          de: 'Exklusiver Zugang zur Großen Pyramide',
          pl: 'Ekskluzywny Dostęp do Wielkiej Piramidy',
          cs: 'Exkluzivní Vstup do Velké Pyramidy'
        },
        description: {
          en: 'Bypass all public lines. Walk through the private chambers of Khufu with your dedicated scholar guide explaining ancient secrets.',
          ar: 'تجاوز جميع خطوط الانتظار العامة. امشِ عبر الغرف الخاصة لخوفو مع مرشدك الأكاديمي المخصص لشرح الأسرار القديمة.',
          de: 'Umgehen Sie alle öffentlichen Warteschlangen. Gehen Sie mit Ihrem engagierten Gelehrtenführer durch die privaten Kammern des Cheops, der Ihnen alte Geheimnisse erklärt.',
          pl: 'Omiń wszystkie publiczne kolejki. Przejdź przez prywatne komnaty Cheopsa ze swoim oddanym przewodnikiem-naukowcem, który wyjaśni starożytne tajemnice.',
          cs: 'Vyhněte se všem veřejným frontám. Projděte se soukromými komorami Chufua se svým specializovaným průvodcem, který vám vysvětlí starověká tajemství.'
        }
      },
      {
        day: 3,
        title: { 
          en: 'Royal Desert Camel Ride & Gourmet Lunch', 
          ar: 'ركوب الجمال الملكي في الصحراء وغداء فاخر',
          de: 'Königlicher Wüstenritt & Gourmet-Mittagessen',
          pl: 'Królewska Przejażdżka Wielbłądem i Wykwintny Lunch',
          cs: 'Královská Jízda na Velbloudu a Gurmánský Oběd'
        },
        description: {
          en: 'Ride premium desert camels or quad bikes to our private pavilion. Enjoy a 5-star catering menu with pyramids backdrop.',
          ar: 'اركب الجمال الصحراوية الفاخرة أو الدراجات الرباعية إلى جناحنا الخاص. استمتع بقائمة طعام 5 نجوم مع خلفية الأهرامات.',
          de: 'Reiten Sie auf erstklassigen Wüstenkameelen oder fahren Sie mit Quad-Bikes zu unserem privaten Pavillon. Genießen Sie ein 5-Sterne-Catering-Menü vor der Kulisse der Pyramiden.',
          pl: 'Przejedź się wielbłądami lub quadami do naszego prywatnego pawilonu. Ciesz się 5-gwiazdkowym menu cateringowym na tle piramid.',
          cs: 'Projeďte se na velbloudech nebo čtyřkolkách do našeho soukromého pavilonu. Vychutnejte si pětihvězdičkové menu s výhledem na pyramidy.'
        }
      }
    ],
    faqs: [
      {
        question: { 
          en: 'Is entrance inside the Great Pyramid included?', 
          ar: 'هل تذكرة دخول الهرم الأكبر من الداخل مشمولة؟',
          de: 'Ist der Eintritt in die Große Pyramide inbegriffen?',
          pl: 'Czy wejście do wnętrza Wielkiej Piramidy jest wliczone w cenę?',
          cs: 'Je vstup do vnitřku Velké pyramidy zahrnut v ceně?'
        },
        answer: { 
          en: 'Yes, this VIP experience includes special entrance tickets into the deep burial chamber of King Khufu.', 
          ar: 'نعم، تشمل هذه التجربة الفاخرة تذاكر دخول خاصة إلى غرفة الدفن العميقة للملك خوفو.',
          de: 'Ja, dieses VIP-Erlebnis beinhaltet spezielle Eintrittskarten für die tiefe Grabkammer des Königs Cheops.',
          pl: 'Tak, to doświadczenie VIP obejmuje specjalne bilety wstępu do głębokiej komory grobowej króla Cheopsa.',
          cs: 'Ano, tento VIP zážitek zahrnuje speciální vstupenky do hluboké pohřební komory krále Chufua.'
        }
      },
      {
        question: { 
          en: 'Can we customize the departure time?', 
          ar: 'هل يمكننا تعديل وقت المغادرة؟',
          de: 'Können wir die Abfahrtszeit anpassen?',
          pl: 'Czy możemy dostosować godzinę wyjazdu?',
          cs: 'Můžeme upravit čas odjezdu?'
        },
        answer: { 
          en: 'Absolutely. As a fully private VIP tour, the timeline is fully adaptable to your preferences.', 
          ar: 'بالتأكيد. نظرًا لأنها جولة خاصة بالكامل لكبار الشخصيات، فإن الجدول الزمني قابل للتكيف تمامًا مع تفضيلاتك.',
          de: 'Absolut. Da es sich um eine vollständig private VIP-Tour handelt, ist der Zeitplan flexibel an Ihre Wünsche anpassbar.',
          pl: 'Absolutnie. Jako w pełni prywatna wycieczka VIP, harmonogram można całkowicie dostosować do własnych preferencji.',
          cs: 'Rozhodně. Jako plně soukromá VIP prohlídka je časový plán zcela přizpůsobitelný vašim preferencím.'
        }
      }
    ],
    pickupZones: ['Giza Hotels', 'Downtown Cairo Hotels', 'New Cairo / Heliopolis Hotels'],
    hotels: ['The Ritz-Carlton Cairo', 'Four Seasons Nile Plaza', 'Marriott Mena House', 'St. Regis Cairo'],
    extras: [
      { 
        id: 'ext-1', 
        name: { 
          en: 'Professional Travel Photographer & Videographer', 
          ar: 'مصور ومخرج سينمائي محترف لمرافقة الرحلة',
          de: 'Professioneller Reisefotograf & Videograf',
          pl: 'Profesjonalny Fotograf i Kamerzysta Podróżny',
          cs: 'Profesionální Cestovní Fotograf a Kameraman'
        }, 
        priceUSD: 150 
      },
      { 
        id: 'ext-2', 
        name: { 
          en: 'Helicopter Scenic Flight over Nile (Per Passenger)', 
          ar: 'رحلة هليكوبتر فوق النيل (لكل راكب)',
          de: 'Hubschrauber-Rundflug über dem Nil (Pro Passagier)',
          pl: 'Lot Widokowy Śmigłowcem nad Nilem (Za Pasażera)',
          cs: 'Vyhlídkový Let Vrtulníkem nad Nilem (Za Cestujícího)'
        }, 
        priceUSD: 600 
      },
      { 
        id: 'ext-3', 
        name: { 
          en: 'Private Bodyguard Security Escort', 
          ar: 'مرافق حراسة شخصية خاص',
          de: 'Eskorte durch privaten Bodyguard',
          pl: 'Prywatna Eskorta Ochroniarza',
          cs: 'Soukromý Ochranný Doprovod (Bodyguard)'
        }, 
        priceUSD: 250 
      }
    ],
    capacity: 6,
    availableDates: ['2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07']
  },
  {
    id: 'tour-2',
    title: {
      en: 'Luxury Nile Dahabiya Royal Cruise & Luxor Tombs Explorer',
      ar: 'رحلة نيلية ملكية فاخرة على متن الذهبية واستكشاف مقابر الأقصر',
      de: 'Luxus-Nil-Dahabiya Königskreuzfahrt & Luxor-Gräber-Entdecker',
      pl: 'Luksusowy Rejs Dahabiją po Nilu i Eksploracja Grobowców w Luksorze',
      cs: 'Luxusní Plavba Dahabiyou po Nilu a Průzkum Hrobek v Luxoru'
    },
    description: {
      en: 'Settle into a private 5-suite traditional sailing Dahabiya. Discover the magnificent Valley of the Kings, the Tomb of Tutankhamun, Karnak Temple, and Philal island with ultimate luxury, fine dining, and live harp sessions under the stars.',
      ar: 'استرخِ في دهبية شراعية تقليدية خاصة تضم 5 أجنحة فقط. اكتشف وادي الملوك الرائع، مقبرة توت عنخ آمون، معبد الكرنك، وجزيرة فيلة مع الرفاهية المطلقة، المأكولات الراقية، وعزف الهارب الحي تحت النجوم.',
      de: 'Lassen Sie sich auf einer privaten, traditionellen Segel-Dahabiya mit 5 Suiten nieder. Entdecken Sie das prächtige Tal der Könige, das Grab von Tutenchamun, den Karnak-Tempel und die Insel Philae mit ultimativem Luxus, exquisiter Küche und Live-Harfenkonzerten unter den Sternen.',
      pl: 'Zrelaksuj się na prywatnej, tradycyjnej 5-apartamentowej żaglowej Dahabii. Odkryj wspaniałą Dolinę Królów, Grobowiec Tutenchamona, Świątynię Karnak i wyspę File w atmosferze luksusu, wykwintnej kuchni i koncertów harfy pod gwiazdami.',
      cs: 'Usaďte se na soukromé, tradiční plachetní Dahabiyi s 5 apartmány. Objevte nádherné Údolí králů, hrobku Tutanchamona, chrám v Karnaku a ostrov Philae s maximálním luxusem, vynikajícím jídlem a živými koncerty harfy pod hvězdami.'
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
        title: { 
          en: 'Boarding the Dahabiya & East Bank Private Tour', 
          ar: 'الصعود على الدهبية وجولة البر الشرقي الخاصة',
          de: 'Einschiffung auf der Dahabiya & Private Ostufer-Tour',
          pl: 'Wejście na Pokład Dahabii i Prywatna Wycieczka po Wschodnim Brzegu',
          cs: 'Nalodění na Dahabiyu a Soukromá Prohlídka Východního Břehu'
        },
        description: {
          en: 'Embark on our ultra-private luxury Dahabiya yacht. Savor custom welcoming drinks followed by a curated twilight walk inside Karnak Temple.',
          ar: 'اصعد على متن يخت الدهبية الفاخر فائق الخصوصية. تذوق مشروبات الترحيب المخصصة تليها جولة غروب ساحرة داخل معبد الكرنك.',
          de: 'Gehen Sie an Bord unserer ultra-privaten Luxus-Dahabiya-Yacht. Genießen Sie maßgeschneiderte Begrüßungsgetränke, gefolgt von einem geführten Spaziergang in der Abenddämmerung im Karnak-Tempel.',
          pl: 'Wejdź na pokład naszej ultra-prywatnej luksusowej Dahabii. Skosztuj powitalnych drinków, a następnie udaj się na klimatyczny spacer o zmierzchu po Świątyni Karnak.',
          cs: 'Naloďte se na naši ultra-soukromou luxusní jachtu Dahabiya. Vychutnejte si uvítací nápoje na míru, po nichž následuje procházka za soumraku chrámem v Karnaku.'
        }
      },
      {
        day: 2,
        title: { 
          en: 'VIP Valley of the Kings & Seti I Tomb', 
          ar: 'وادي الملوك الفاخر ومقبرة سيتي الأول',
          de: 'VIP-Tal der Könige & Grab von Sethos I.',
          pl: 'Dolina Królów VIP i Grobowiec Setiego I',
          cs: 'VIP Údolí Králů a Hrobka Sethiho I.'
        },
        description: {
          en: 'Descend into the exclusive Tomb of Seti I (normally closed to general public) and Tutankhamun. Afternoon sail with luxury afternoon high tea.',
          ar: 'انزل إلى مقبرة سيتي الأول الحصرية (المغلقة عادةً أمام الجمهور العام) ومقبرة توت عنخ آمون. إبحار بعد الظهر مع شاي بعد الظهر الفاخر.',
          de: 'Steigen Sie hinab in das exklusive Grab von Sethos I. (normalerweise für die Öffentlichkeit geschlossen) und Tutenchamun. Nachmittagssegeln mit luxuriösem High Tea.',
          pl: 'Wejdź do ekskluzywnego Grobowca Setiego I (zwykle zamkniętego dla publiczności) oraz Tutenchamona. Popołudniowy rejs z luksusowym podwieczorkiem.',
          cs: 'Sestupte do exkluzivní hrobky Sethiho I. (obvykle pro veřejnost uzavřené) a Tutanchamona. Odpolední plavba s luxusním odpoledním čajem.'
        }
      },
      {
        day: 3,
        title: { 
          en: 'Temple of Edfu & Royal Gala Dinner', 
          ar: 'معبد إدفو وعشاء اليخوت الملكي',
          de: 'Tempel von Edfu & Königliches Gala-Dinner',
          pl: 'Świątynia Edfu i Królewska Kolacja Galowa',
          cs: 'Chrám v Edfu a Královská Slavnostní Večeře'
        },
        description: {
          en: 'Visit Edfu temple via luxury horse-drawn carriage. End the journey with a candlelit royal gala dinner on an island on the Nile.',
          ar: 'قم بزيارة معبد إدفو عبر عربة تجرها الخيول الفاخرة. اختتم الرحلة بعشاء ملكي فاخر على ضوء الشموع على جزيرة في النيل.',
          de: 'Besuchen Sie den Edfu-Tempel in einer luxuriösen Pferdekutsche. Beenden Sie die Reise mit einem königlichen Gala-Dinner bei Kerzenschein auf einer Nilinsel.',
          pl: 'Odwiedź świątynię w Edfu luksusową dorożką. Zakończ podróż królewską kolacją galową przy świecach na prywatnej wyspie na Nilu.',
          cs: 'Navštivte chrám v Edfu v luxusním kočáru taženém koňmi. Zakončete cestu královskou slavnostní večeří při svíčkách na Nilském ostrově.'
        }
      }
    ],
    faqs: [
      {
        question: { 
          en: 'Is this a large cruise ship?', 
          ar: 'هل هذه سفينة كروز كبيرة؟',
          de: 'Handelt es sich um ein großes Kreuzfahrtschiff?',
          pl: 'Czy to duży statek wycieczkowy?',
          cs: 'Jedná se o velkou výletní loď?'
        },
        answer: { 
          en: 'No, this is a premium private sailing Dahabiya. It has only 5 boutique suites, catering to maximum 10 elite guests, ensuring total peace and luxury.', 
          ar: 'لا، هذه دهبية شراعية خاصة فاخرة للغاية. تحتوي على 5 أجنحة بوتيكية فقط، وتتسع لـ 10 ضيوف كحد أقصى، مما يضمن الهدوء التام والخصوصية.',
          de: 'Nein, dies ist eine erstklassige, private Segel-Dahabiya. Sie verfügt über nur 5 Boutique-Suiten für maximal 10 Elite-Gäste, was absolute Ruhe und Luxus garantiert.',
          pl: 'Nie, to jest luksusowa prywatna Dahabija żaglowa. Posiada tylko 5 butikowych apartamentów dla maksymalnie 10 gości, co gwarantuje pełną prywatność i spokój.',
          cs: 'Ne, jedná se o prvotřídní soukromou plachetní Dahabiyu. Má pouze 5 butikových apartmánů pro maximálně 10 elitních hostů, což zajišťuje naprostý klid a luxus.'
        }
      }
    ],
    pickupZones: ['Luxor Airport', 'Luxor Luxury Hotels', 'Aswan Airport'],
    hotels: ['Sofitel Legend Old Cataract Aswan', 'Hilton Luxor Resort & Spa', 'Winter Palace Luxor'],
    extras: [
      { 
        id: 'ext-4', 
        name: { 
          en: 'Sunrise Private Hot Air Balloon Ride', 
          ar: 'رحلة منطاد هوائي خاصة عند شروق الشمس',
          de: 'Private Heißluftballonfahrt bei Sonnenaufgang',
          pl: 'Prywatny Lot Balonem o Wschodzie Słońca',
          cs: 'Soukromý Let Balónem při Východu Slunce'
        }, 
        priceUSD: 200 
      },
      { 
        id: 'ext-5', 
        name: { 
          en: 'Champagne Royal Welcoming Basket', 
          ar: 'سلة ترحيب ملكية مع مشروب فاخر',
          de: 'Königlicher Willkommenskorb mit Champagner',
          pl: 'Królewski Kosz Powitalny z Szampanem',
          cs: 'Královský Uvítací Koš se Šampaňským'
        }, 
        priceUSD: 180 
      }
    ],
    capacity: 10,
    availableDates: ['2026-07-04', '2026-07-08', '2026-07-12']
  },
  {
    id: 'tour-3',
    title: {
      en: 'VIP Sharm El Sheikh Private Yacht Charter & Red Sea Reef Safari',
      ar: 'ميثاق يخت خاص لكبار الشخصيات في شرم الشيخ ورحلة سفاري الشعب المرجانية',
      de: 'VIP Sharm El-Sheikh Private Yacht-Charter & Rotes Meer Riff-Safari',
      pl: 'Czarter Prywatnego Jachtu VIP w Szarm el-Szejk i Safari na Rafę Koralową',
      cs: 'VIP Pronájem Soukromé Jachty v Šarm aš-Šajchu a Safari na Korálový Útes'
    },
    description: {
      en: 'Cruise the crystalline waters of the Red Sea on your private 80ft luxury yacht. Visit Ras Mohammed National Park, snorkel with vibrant marine life, dive with private master instructors, and dine on fresh lobster and seafood prepared by your private chef on board.',
      ar: 'أبحر في المياه الكريستالية للبحر الأحمر على متن يختك الفاخر الخاص بطول 80 قدمًا. قم بزيارة محمية رأس محمد الوطنية، واستمتع بالغطس مع الحياة البحرية الملونة، واستمتع بالغوص مع مدربين معتمدين، وتناول الكركند الطازج والمأكولات البحرية من إعداد طاهيك الخاص على متن اليخت.',
      de: 'Kreuzen Sie auf Ihrer privaten 80-Fuß-Luxusyacht durch das kristallklare Wasser des Roten Meeres. Besuchen Sie den Ras-Mohammed-Nationalpark, schnorcheln Sie in lebendiger Unterwasserwelt, tauchen Sie mit privaten Lehrern und genießen Sie frischen Hummer von Ihrem privaten Koch an Bord.',
      pl: 'Żegluj po krystalicznych wodach Morza Czerwonego na swoim prywatnym 80-stopowym luksusowym jachcie. Odwiedź Park Narodowy Ras Muhammad, nurkuj z rurką wśród tętniącego życiem świata morskiego, nurkuj z instruktorem i delektuj się homarem przygotowanym przez kucharza.',
      cs: 'Plavte se po křišťálových vodách Rudého moře na své soukromé 80stopé luxusní jachtě. Navštivte národní park Ras Mohammed, šnorchlujte s živým mořským životem, potápějte se s instruktorem a pochutnejte si na humru od soukromého kuchaře na palubě.'
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
        title: { 
          en: 'VIP Boarding at Marina', 
          ar: 'صعود كبار الشخصيات في المارينا',
          de: 'VIP-Einschiffung am Jachthafen',
          pl: 'Wejście na Pokład VIP w Marynie',
          cs: 'VIP Nalodění v Přístavu'
        },
        description: {
          en: 'Arrive via private Mercedes luxury transport. Step onto your pristine private yacht with a chilled glass of premium sparkling juice.',
          ar: 'الوصول عبر خدمة النقل الفاخرة الخاصة بمرسيدس. اصعد إلى يختك الخاص الرائع مع كوب مبرد من العصير الفوار الفاخر.',
          de: 'Anreise im privaten Mercedes-Luxustransport. Betreten Sie Ihre makellose Privatyacht mit einem gekühlten Glas erstklassigem Prickelnden Saft.',
          pl: 'Dojazd prywatnym, luksusowym transportem marki Mercedes. Wejdź na swój prywatny jacht ze szklanką schłodzonego soku musującego premium.',
          cs: 'Příjezd soukromým luxusním vozem Mercedes. Vstupte na svou soukromou jachtu s vychlazenou sklenkou prémiové šumivé šťávy.'
        }
      },
      {
        day: 2,
        title: { 
          en: 'Ras Mohammed Snorkeling & Coral Dives', 
          ar: 'الغوص ورأس محمد سنوركلينج',
          de: 'Ras-Mohammed-Schnorcheln & Korallentauchen',
          pl: 'Snorkeling i Nurkowanie na Rafach Ras Muhammad',
          cs: 'Šnorchlování a Potápění v Ras Mohammed'
        },
        description: {
          en: 'Sail to Yolanda Reef. Explore underwater shipwrecks and vibrant gardens accompanied by a private marine biologist.',
          ar: 'أبحر إلى يولاندا ريف. استكشف حطام السفن تحت الماء والحدائق المرجانية النابضة بالحياة برفقة عالم أحياء مائية خاص.',
          de: 'Segeln Sie zum Yolanda-Riff. Erkunden Sie Unterwassershow-Wracks und lebendige Meeresgärten in Begleitung eines privaten Meeresbiologen.',
          pl: 'Popłyń na rafę Yolanda. Odkryj podwodne wraki statków i tętniące życiem ogrody koralowe w towarzystwie prywatnego biologa morskiego.',
          cs: 'Plavte se k útesu Yolanda. Prozkoumejte podmořské vraky lodí a živé korálové zahrady v doprovodu soukromého mořského biologa.'
        }
      },
      {
        day: 3,
        title: { 
          en: 'On-Deck Lobster Feast & Sunset Sail', 
          ar: 'وليمة استاكوزا طازجة على اليخت وإبحار الغروب',
          de: 'Hummer-Festmahl an Deck & Segeln im Sonnenuntergang',
          pl: 'Uczta z Homarem na Pokładzie i Rejs o Zachodzie Słońca',
          cs: 'Humří Hostina na Palubě a Plavba při Západu Slunce'
        },
        description: {
          en: 'Savor a freshly grilled lobster and prawn lunch. Sip cocktails on the sunbed as we cruise back along the Sinai coast during golden hour.',
          ar: 'تذوق غداءً من الاستاكوزا المشوية والجمبري الطازج. ارتشف المشروبات اللذيذة على السرير الشمسي بينما نبحر عائدين على طول ساحل سيناء في الساعة الذهبية.',
          de: 'Genießen Sie ein frisch gegrilltes Hummer- und Garnelen-Mittagessen. Schlürfen Sie Cocktails auf der Sonnenliege während wir bei Sonnenuntergang zurücksegeln.',
          pl: 'Delektuj się świeżo grillowanym homarem i krewetkami na lunch. Pij koktajle na leżaku, podczas gdy płyniemy z powrotem wzdłuż wybrzeża Synaju.',
          cs: 'Vychutnejte si čerstvě grilovaného humra a krevety k obědu. Popíjejte koktejly na lehátku, zatímco plujeme zpět podél Sinajského pobřeží.'
        }
      }
    ],
    faqs: [
      {
        question: { 
          en: 'Does the yacht include diving gear?', 
          ar: 'هل يشمل اليخت معدات الغوص؟',
          de: 'Ist Tauchausrüstung auf der Yacht vorhanden?',
          pl: 'Czy jacht posiada sprzęt do nurkowania?',
          cs: 'Zahrnuje jachta potápěčské vybavení?'
        },
        answer: { 
          en: 'Yes, full high-end snorkeling and diving gear, including tanks, are fully provided. Professional dive instructors are on board.', 
          ar: 'نعم، يتم توفير معدات السنوركلينج والغوص الكاملة عالية الجودة بما في ذلك الخزانات. مدربو غوص محترفون على متن الطائرة.',
          de: 'Ja, eine komplette High-End-Schnorchel- und Tauchausrüstung inklusive Flaschen wird zur Verfügung gestellt. Professionelle Tauchlehrer sind an Bord.',
          pl: 'Tak, na pokładzie zapewniony jest pełny, profesjonalny sprzęt do snorkelingu i nurkowania, w tym butle. Towarzyszą nam licencjonowani instruktorzy.',
          cs: 'Ano, k dispozici je kompletní špičkové šnorchlovací a potápěčské vybavení včetně lahví. Na palubě jsou profesionální instruktoři.'
        }
      }
    ],
    pickupZones: ['Naama Bay Hotels', 'Nabq Luxury Resorts', 'Sharm Marina'],
    hotels: ['Four Seasons Resort Sharm El Sheikh', 'Rixos Premium Seagate', 'Steigenberger Alcazar'],
    extras: [
      { 
        id: 'ext-6', 
        name: { 
          en: 'Jet Ski Adventure Rental (2 Hours)', 
          ar: 'مغامرة جيت سكي (ساعتان)',
          de: 'Jet-Ski Abenteuer-Miete (2 Stunden)',
          pl: 'Wynajem Skutera Wodnego Jet Ski (2 godziny)',
          cs: 'Pronájem Vodního Skútru Jet Ski (2 hodiny)'
        }, 
        priceUSD: 120 
      },
      { 
        id: 'ext-7', 
        name: { 
          en: 'Live Violinist Performance on Yacht', 
          ar: 'عازف كمان حي على اليخت',
          de: 'Live-Violonisten-Auftritt auf der Yacht',
          pl: 'Koncert Skrzypcowy na Żywo na Jachcie',
          cs: 'Vystoupení Houslisty Živě na Jachtě'
        }, 
        priceUSD: 300 
      }
    ],
    capacity: 12,
    availableDates: ['2026-07-03', '2026-07-05', '2026-07-07', '2026-07-09']
  },
  {
    id: 'tour-4',
    title: {
      en: 'Sovereign Hurghada Private Yacht & Red Sea Safari',
      ar: 'رحلة يخت الغردقة السيادية الخاصة وسفاري البحر الأحمر',
      de: 'Sovereign Hurghada Private Yacht & Rotes Meer Safari',
      pl: 'Ekskluzywny Prywatny Jacht w Hurgadzie i Safari na Morzu Czerwonym',
      cs: 'Sovereign Hurghada Soukromá Jachta a Safari na Rudém Moři'
    },
    description: {
      en: "Set sail from our agency's home base in Hurghada. Cruise in ultimate elegance aboard a pristine private motor yacht. Includes a private diving/snorkeling instructor, bespoke beach setup on Giftun Island, personal onboard butler service, and a freshly prepared seafood feast of lobster and sea bass.",
      ar: 'أبحر من مقر وكالتنا الرئيسي في الغردقة. استمتع برحلتك بأناقة مطلقة على متن يخت خاص فائق الجودة. تشمل الجولة مدرب غوص وسنوركلينج خاص، تجهيزاً مميزاً على شواطئ جزيرة جفتون، خدمة خادم شخصي على متن اليخت، ووجبة بحرية طازجة من الكركند وقاروص البحر.',
      de: 'Setzen Sie die Segel an unserem Hauptsitz in Hurghada. Fahren Sie in höchster Eleganz an Bord einer privaten Motoryacht. Beinhaltet einen privaten Tauchlehrer, ein maßgeschneidertes Stranderlebnis auf der Giftun-Insel, persönlichen Butler-Service und ein frisches Meeresfrüchte-Festmahl.',
      pl: 'Wypłyń z bazy naszej agencji w Hurgadzie. Żegluj w najwyższej elegancji na pokładzie nieskazitelnego prywatnego jachtu motorowego. W cenie prywatny instruktor nurkowania, luksusowy pobyt na plaży na wyspie Giftun, lokaj oraz uczta ze świeżych owoców morza.',
      cs: 'Vyplujte z hlavní základny naší agentury v Hurghadě. Plavte se v maximální eleganci na palubě soukromé motorové jachty. Zahrnuje soukromého instruktora potápění, plážový servis na ostrově Giftun, osobního komorníka a hostinu z čerstvých plodů moře.'
    },
    category: 'VIP Yacht Charters',
    destination: 'Hurghada',
    images: [
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-yacht-sailing-the-sea-43285-large.mp4',
    duration: 'Full Day (8 Hours)',
    rating: 4.99,
    reviewCount: 112,
    priceUSD: 850,
    itinerary: [
      {
        day: 1,
        title: { 
          en: 'Mercedes V-Class Transfer & Marina Boarding', 
          ar: 'توصيل مرسيدس V-Class والصعود في المارينا',
          de: 'Mercedes V-Klasse Transfer & Einschiffung am Jachthafen',
          pl: 'Transfer Mercedesem Klasy V i Wejście na Pokład',
          cs: 'Transfer Mercedesem Třídy V a Nalodění v Přístavu'
        },
        description: {
          en: 'Our private chauffeur collects you from your resort. Board your immaculate private yacht with a premium welcome toast.',
          ar: 'يصحبك سائقنا الخاص من منتجعك بسيارة مرسيدس. اصعد إلى يختك الخاص الرائع مع تحية ترحيبية فاخرة.',
          de: 'Unser privater Chauffeur holt Sie von Ihrem Resort ab. Gehen Sie mit einem erstklassigen Begrüßungstoast an Bord Ihrer makellosen Privatyacht.',
          pl: 'Nasz prywatny szofer odbierze Cię z resortu. Wejdź na swój nieskazitelny prywatny jacht z powitalnym toastem premium.',
          cs: 'Náš soukromý řidič vás vyzvedne z vašeho resortu. Vstupte na svou soukromou jachtu s uvítacím přípitkem.'
        }
      },
      {
        day: 2,
        title: { 
          en: 'Elite Giftun Island Private Shore Haven', 
          ar: 'ملاذ شاطئ جزيرة جفتون الخاص للنخبة',
          de: 'Exklusives Stranderlebnis auf der Insel Giftun',
          pl: 'Ekskluzywna Prywatna Przystań Plażowa na Wyspie Giftun',
          cs: 'Exkluzivní Soukromá Pláž na Ostrově Giftun'
        },
        description: {
          en: 'Step onto a pristine white-sand beach prepared exclusively for you with premium sunbeds, umbrellas, and fully catered cold refreshments.',
          ar: 'خطوة على الرمال البيضاء النقية لشاطئ مجهز خصيصاً لك بأسرة شمسية مظللة ومشروبات باردة منعشة.',
          de: 'Betreten Sie einen makellosen weißen Sandstrand, der exklusiv für Sie mit Premium-Sonnenliegen, Sonnenschirmen und kalten Erfrischungen vorbereitet wurde.',
          pl: 'Wejdź na nieskazitelną plażę z białym piaskiem, przygotowaną wyłącznie dla Ciebie z leżakami, parasolami i zimnymi napojami.',
          cs: 'Vstupte na čistou pláž s bílým pískem připravenou exkluzivně pro vás s lehátky, slunečníky a studeným občerstvením.'
        }
      },
      {
        day: 3,
        title: { 
          en: 'Gourmet Seafood Feast & Sunset Cruise', 
          ar: 'وليمة مأكولات بحرية فاخرة وإبحار الغروب',
          de: 'Gourmet-Meeresfrüchte-Festmahl & Segeln im Sonnenuntergang',
          pl: 'Wykwintna Uczta z Owoców Morza i Rejs o Zachodzie Słońca',
          cs: 'Gurmánská Hostina z Plodů Moře a Plavba při Západu Slunce'
        },
        description: {
          en: 'Relish a premium lobster, prawn, and sea bass grill prepared by your onboard private chef, followed by a sunset cruise back to Hurghada Marina.',
          ar: 'استمتع بغداء مشاوي فاخر من الكركند، الجمبري وقاروص البحر طازجاً من إعداد طاهيك الخاص على متن اليخت، تليها جولة غروب ساحرة ممتدة لعودتنا.',
          de: 'Genießen Sie frisch gegrillten Hummer, Garnelen und Seebarsch, zubereitet von Ihrem privaten Schiffskoch, gefolgt von einer Kreuzfahrt bei Sonnenuntergang zurück zum Hurghada-Jachthafen.',
          pl: 'Delektuj się wyśmienitym homarem, krewetkami i okoniem morskim z grilla, przygotowanym przez kucharza, a następnie udaj się w rejs powrotny do przystani.',
          cs: 'Vychutnejte si skvělého humra, krevety a mořského vlka na grilu od vašeho kuchaře na palubě, následované plavbou při západu slunce zpět do přístavu.'
        }
      }
    ],
    faqs: [
      {
        question: { 
          en: 'Where is the agency office located?', 
          ar: 'أين يقع مكتب الوكالة؟',
          de: 'Wo befindet sich das Büro der Agentur?',
          pl: 'Gdzie znajduje się biuro agencji?',
          cs: 'Kde se nachází kancelář agentury?'
        },
        answer: { 
          en: 'Our premier agency headquarters is located directly in the luxury marina sector of Hurghada, offering seamless local support.', 
          ar: 'يقع المقر الرئيسي الفاخر لوكالتنا مباشرةً في قطاع مارينا الغردقة الفاخر، لنقدم لك دعماً محلياً متكاملاً طوال رحلتك.',
          de: 'Unser Hauptsitz befindet sich direkt im luxuriösen Jachthafensektor von Hurghada und bietet Ihnen nahtlosen Vor-Ort-Support.',
          pl: 'Nasza główna siedziba znajduje się bezpośrednio w luksusowej przystani w Hurgadzie, oferując kompleksowe wsparcie na miejscu.',
          cs: 'Naše hlavní sídlo se nachází přímo v luxusním jachtařském sektoru v Hurghadě a nabízí vám nepřetržitou místní podporu.'
        }
      }
    ],
    pickupZones: ['Hurghada Hotels', 'El Gouna Resorts', 'Sahl Hasheesh Luxury Lodges'],
    hotels: ['The Oberoi Sahl Hasheesh', 'Steigenberger ALDAU Beach', 'Rixos Premium Magawish'],
    extras: [
      { 
        id: 'ext-8', 
        name: { 
          en: 'Professional Drone & Underwater Footage Package', 
          ar: 'باقة تصوير احترافي بالدرون والكاميرات المائية',
          de: 'Professionelles Paket für Drohnen- & Unterwasseraufnahmen',
          pl: 'Profesjonalny Pakiet Zdjęć z Drona i Kamer Podwodnych',
          cs: 'Profesionální Balíček Záběrů z Dronu a Podvodních Kamer'
        }, 
        priceUSD: 180 
      },
      { 
        id: 'ext-9', 
        name: { 
          en: 'Premium Champagne Bottle & Caviar Board', 
          ar: 'زجاجة كحول فاخرة وطبق كافيار',
          de: 'Premium-Champagnerflasche & Kaviar-Platte',
          pl: 'Butelka Szampana Premium i Deska Kawioru',
          cs: 'Láhev Prémiového Šampaňského a Kaviárové Prkénko'
        }, 
        priceUSD: 320 
      }
    ],
    capacity: 10,
    availableDates: ['2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09']
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
    date: '2026-06-25',
    photoUri: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'rev-2',
    tourId: 'tour-1',
    customerName: 'فاطمة الهاشمي',
    rating: 5,
    comment: 'خدمة خيالية تفوق الوصف. الاهتمام بالتفاصيل مذهل، والمرشد كان ملمًا بأدق أسرار التاريخ الفرعوني. تجربة الغداء أمام الأهرامات ساحرة ولن ننساها أبدًا.',
    language: 'ar',
    date: '2026-06-28',
    photoUri: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'rev-3',
    tourId: 'tour-2',
    customerName: 'Alexandra Dupont',
    rating: 5,
    comment: 'Sailing the Nile on this private Dahabiya is like traveling back in time in complete luxury. The staff on the boat was so attentive, and having Seti I tomb all to ourselves was magical.',
    language: 'en',
    date: '2026-06-20',
    photoUri: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800'
  }
];

const initialBlogs: Blog[] = [
  {
    id: 'blog-1',
    title: {
      en: 'The Ultimate Guide to Luxury Egypt Travel: Beyond the Traditional Crowds',
      ar: 'الدليل الشامل للسفر الفاخر في مصر: ما وراء السياحة التقليدية المزدحمة',
      de: 'Der ultimative Führer für Luxusreisen in Ägypten: Jenseits der traditionellen Menschenmassen',
      pl: 'Ostateczny Przewodnik po Luksusowych Podróżach do Egiptu: Poza Tradycyjnymi Tłumami',
      cs: 'Dokonalý Průvodce Luxusním Cestováním po Egyptě: Mimo Tradiční Davy'
    },
    content: {
      en: 'Egypt is a land of wonders, but experiencing it in comfort requires expert curation. Skip the hot tourist buses and crowded schedules. Instead, choose private Mercedes-Benz transfers, chartered Nile sailing Dahabiyas, and exclusive private temple access. In this guide, we detail how MAS Agency designs bespoke luxury itineraries for elite travelers looking to witness the Pyramids, Luxor and the Red Sea with absolute privacy.',
      ar: 'مصر أرض العجائب، ولكن الاستمتاع بها براحة يتطلب تنسيقًا احترافيًا. تخطَ الحافلات السياحية الحارة والجداول المزدحمة. بدلاً من ذلك، اختر سيارات مرسيدس-بنز الخاصة، ودهبيات الإبحار النيلية المستأجرة، والدخول الحصري الخاص للمعابد. في هذا الدليل، نوضح بالتفصيل كيف تصمم وكالة ماس رحلات فاخرة ومخصصة للمسافرين النخبة الذين يتطلعون لمشاهدة الأهرامات والأقصر والبحر الأحمر بخصوصية تامة.',
      de: 'Ägypten ist ein Land der Wunder, aber es komfortabel zu erleben, erfordert erstklassige Organisation. Verzichten Sie auf heiße Touristenbusse und überfüllte Zeitpläne. Wählen Sie stattdessen private Mercedes-Benz-Transfers, gecharterte Nil-Dahabiyas und exklusiven privaten Zugang zu den Tempeln. In diesem Reiseführer erfahren Sie, wie die MAS Agency maßgeschneiderte Luxus-Reiserouten für anspruchsvolle Reisende entwirft.',
      pl: 'Egipt to kraina cudów, ale komfortowe jej doświadczanie wymaga eksperckiego przygotowania. Zapomnij o gorących autobusach turystycznych i zatłoczonych harmonogramach. Zamiast tego wybierz prywatne transfery Mercedes-Benz, czarterowane Dahabije na Nilu i ekskluzywny dostęp do świątyń. W tym przewodniku szczegółowo opisujemy, jak MAS Agency projektuje luksusowe plany podróży dla wymagających podróżników.',
      cs: 'Egypt je země divů, ale zažít ho v pohodlí vyžaduje odbornou péči. Zapomeňte na horké turistické autobusy a přeplněné plány. Místo toho zvolte soukromé transfery Mercedes-Benz, pronajaté nilské Dahabiyi a exkluzivní soukromý vstup do chrámů. V tomto průvodci podrobně popisujeme, jak MAS Agency navrhuje luxusní itineráře pro elitní cestovatele.'
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
      ar: 'الإبحار على خطى الفراعنة: أناقة يخت الدهبية النيلي التقليدي',
      de: 'Segeln wie die Pharaonen: Die Eleganz der traditionellen Nil-Dahabiya',
      pl: 'Żegluj jak Faraonowie: Elegancja Tradycyjnej Dahabii na Nilu',
      cs: 'Plavba jako Faraoni: Elegance Tradiční Dahabiyi na Nilu'
    },
    content: {
      en: 'Nothing matches the tranquil romance of a traditional wooden Dahabiya. Unlike huge, noisy, pollutant diesel cruise ships, the Dahabiya glides gracefully utilizing only the Nile breeze. Enjoy local organic food sourced daily from local river island farmers, bespoke luxury suites, and silent sunset dinners on the river shores. Discover why elite travelers prefer Dahabiya over massive cruise ships.',
      ar: 'لا شيء يضاهي الرومانسية الهادئة للدهبية الخشبية التقليدية. على عكس سفن الكروز الضخمة والمزعجة الملوثة بمحركات الديزل، تنزلق الدهبية برقة مستعينة بنسمات النيل فقط. استمتع بالأطعمة العضوية الطازجة التي يتم جلبها يوميًا من مزارعي جزر النيل المحليين، والأجنحة الفاخرة المخصصة، وعشاء الغروب الصامت على ضفاف النهر. اكتشف لماذا يفضل نخبة المسافرين الدهبية.',
      de: 'Nichts kommt der ruhigen Romantik einer traditionellen hölzernen Dahabiya gleich. Im Gegensatz zu riesigen, lauten und umweltbelastenden Diesel-Kreuzfahrtschiffen gleitet die Dahabiya anmutig und nutzt nur die Nilbrise. Genießen Sie täglich frische, biologische Lebensmittel von den Flussinseln, maßgeschneiderte Luxussuiten und stille Abendessen zum Sonnenuntergang am Flussufer.',
      pl: 'Nic nie równa się ze spokojnym romantyzmem tradycyjnej drewnianej Dahabii. W przeciwieństwie do ogromnych, hałaśliwych statków wycieczkowych na olej napędowy, Dahabija sunie z gracją, wykorzystując jedynie nilewską bryzę. Ciesz się organicznym jedzeniem pozyskiwanym codziennie od rolników, luksusowymi apartamentami i cichymi kolacjami o zachodzie słońca.',
      cs: 'Nic se nevyrovná klidné romantice tradiční dřevěné Dahabiyi. Na rozdíl od obřích, hlučných a znečišťujících výletních lodí klouže Dahabiya s grácií pouze za pomoci nilského vánku. Vychutnejte si organické jídlo dodávané denně od farmářů z říčních ostrovů, luxusní apartmány a tiché večeře při západu slunce.'
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
  whatsappTemplates: initialTemplates,
  notifications: []
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
