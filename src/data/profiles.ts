export interface StaffProfile {
  id: string;
  role: 'guide' | 'driver';
  name: { en: string; ar: string };
  bio: { en: string; ar: string };
  languages: { en: string[]; ar: string[] };
  credentials: { en: string[]; ar: string[] };
  avatar: string;
  rating: number;
  experienceYears: number;
}

export const STAFF_PROFILES: StaffProfile[] = [
  {
    id: 'dr-zahi',
    role: 'guide',
    name: { en: 'Dr. Zahi', ar: 'د. زاهي' },
    bio: {
      en: 'A world-renowned senior Egyptology scholar with over 20 years of field experience in excavation and archaeological restoration. Specializes in Giza Plateau excavations and Old Kingdom pyramid structures.',
      ar: 'عالم مصريات أول ذو شهرة عالمية، يمتلك أكثر من ٢٠ عاماً من الخبرة الميدانية في التنقيب والترميم الأثري. متخصص في استكشافات هضبة الجيزة وأهرامات الدولة القديمة.'
    },
    languages: {
      en: ['English (Fluent)', 'Arabic (Native)', 'French (Conversational)', 'German (Basic)'],
      ar: ['الإنجليزية (طلاقة)', 'العربية (اللغة الأم)', 'الفرنسية (محادثة)', 'الألمانية (أساسي)']
    },
    credentials: {
      en: [
        'Ph.D. in Egyptian Archaeology & Heritage Management',
        'Senior Consultant for the Supreme Council of Antiquities',
        'Recipient of the Golden Order of Egyptian Antiquities'
      ],
      ar: [
        'دكتوراه في الآثار المصرية وإدارة التراث الأثري',
        'مستشار أول للمجلس الأعلى للآثار المصرية',
        'حاصل على وسام الاستحقاق الذهبي للآثار المصرية'
      ]
    },
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    rating: 4.99,
    experienceYears: 24
  },
  {
    id: 'prof-selim',
    role: 'guide',
    name: { en: 'Prof. Selim Hassan', ar: 'أ.د. سليم حسن' },
    bio: {
      en: 'Expert linguistic Egyptologist and translator of ancient hieroglyphic funerary texts. He has guided global dignitaries, scholars, and state representatives through Upper Egypt for 15+ years.',
      ar: 'أستاذ اللغويات المصرية القديمة ومترجم النصوص الجنائزية الفرعونية. قام بإرشاد كبار الشخصيات والوفود الرسمية في صعيد مصر لأكثر من ١٥ عاماً.'
    },
    languages: {
      en: ['English (Fluent)', 'Arabic (Native)', 'Italian (Fluent)'],
      ar: ['الإنجليزية (طلاقة)', 'العربية (اللغة الأم)', 'الإيطالية (طلاقة)']
    },
    credentials: {
      en: [
        'M.A. & Professor of Ancient Languages (Cairo University)',
        'Accredited Royal Escort Egyptologist',
        'Published Researcher in Nile Valley Civilizations'
      ],
      ar: [
        'ماجستير وأستاذ اللغات القديمة بجامعة القاهرة',
        'مرشد مصريات معتمد لمرافقة الشخصيات الملكية والرسمية',
        'باحث منشور في تاريخ وحضارات وادي النيل'
      ]
    },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    rating: 4.96,
    experienceYears: 18
  },
  {
    id: 'yasmin-nour',
    role: 'guide',
    name: { en: 'Yasmin Nour', ar: 'ياسمين نور' },
    bio: {
      en: 'Specialist in Greco-Roman excavations and Upper Egyptian theology. Celebrated for her captivating storytelling style that brings the mythology of Philae, Karnak, and Luxor temples to vivid life.',
      ar: 'متخصصة في حفريات العصر اليوناني الروماني وعلم اللاهوت في مصر العليا. مشهورة بأسلوبها السردي الآسر الذي يحيي أساطير معابد فيلة والكرنك والأقصر.'
    },
    languages: {
      en: ['English (Fluent)', 'Arabic (Native)', 'Spanish (Fluent)'],
      ar: ['الإنجليزية (طلاقة)', 'العربية (اللغة الأم)', 'الإسبانية (طلاقة)']
    },
    credentials: {
      en: [
        'Degree in Egyptology (American University in Cairo)',
        'Active Field Archaeologist with Philae Restoration Project',
        'Certified Member of the Egyptian Tourist Guides Syndicate'
      ],
      ar: [
        'شهادة في علم المصريات من الجامعة الأمريكية بالقاهرة',
        'أثرية ميدانية نشطة في مشروع ترميم معبد فيلة',
        'عضو معتمد في نقابة المرشدين السياحيين المصرية'
      ]
    },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    rating: 4.98,
    experienceYears: 12
  },
  {
    id: 'sherif-el-masry',
    role: 'driver',
    name: { en: 'Sherif El Masry', ar: 'شريف المصري' },
    bio: {
      en: 'MAS Agency’s senior lead chauffeur, specializing in VIP hospitality, high-security driving, and corporate travel. Expertly maneuvering our premium Mercedes V-Class fleet for 10+ years.',
      ar: 'كبير السائقين في وكالة ماس، متخصص في الضيافة الفاخرة، القيادة الأمنية المتقدمة، وسفريات كبار الشخصيات. يمتلك خبرة تزيد عن ١٠ سنوات في قيادة أسطول مرسيدس V-Class.'
    },
    languages: {
      en: ['English (Conversational)', 'Arabic (Native)'],
      ar: ['الإنجليزية (محادثة)', 'العربية (اللغة الأم)']
    },
    credentials: {
      en: [
        'Certified Advanced Defensive Driving & VIP Security Escort',
        'Mercedes-Benz Fleet Premium Hospitality Certification',
        'First Aid & Emergency CPR Certified Responder'
      ],
      ar: [
        'شهادة القيادة الدفاعية المتقدمة ومرافقة الشخصيات الهامة',
        'شهادة مرسيدس-بنز في الضيافة المتميزة للعملاء النخبة',
        'مسعف معتمد للإسعافات الأولية والإنعاش القلبي الرئوي'
      ]
    },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    rating: 4.99,
    experienceYears: 15
  },
  {
    id: 'amr-hegazi',
    role: 'driver',
    name: { en: 'Amr Hegazi', ar: 'عمرو حجازي' },
    bio: {
      en: 'Dedicated luxury transport professional with an immaculate safety record and intimate knowledge of Egypt’s desert highways and scenic coastal corridors of Sharm El Sheikh and Hurghada.',
      ar: 'أخصائي نقل فاخر متميز بسجل سلامة خالٍ من الحوادث ومعرفة عميقة بالطرق الصحراوية السريعة والممرات الساحلية الخلابة في شرم الشيخ والغردقة.'
    },
    languages: {
      en: ['English (Conversational)', 'Arabic (Native)', 'Russian (Basic)'],
      ar: ['الإنجليزية (محادثة)', 'العربية (اللغة الأم)', 'الروسية (أساسي)']
    },
    credentials: {
      en: [
        'Professional Tourist Transportation License (Class A)',
        'Tourist Police Security & Protocol Clearance',
        'Recipient of MAS Agency’s Chauffeur Safety Excellence Award'
      ],
      ar: [
        'رخصة النقل السياحي المهنية (فئة أ)',
        'تصريح وموافقة أمنية وبروتوكولية من شرطة السياحة',
        'حائز على جائزة وكالة ماس للتميز في السلامة والقيادة الآمنة'
      ]
    },
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    rating: 4.95,
    experienceYears: 10
  }
];

export function getStaffProfile(name: string, defaultRole: 'guide' | 'driver'): StaffProfile {
  const norm = name.trim().toLowerCase();
  
  // Try to find by direct English name match, sub-string, or Arabic name match
  const match = STAFF_PROFILES.find(p => 
    norm.includes(p.name.en.toLowerCase()) || 
    p.name.en.toLowerCase().includes(norm) ||
    norm.includes(p.name.ar) ||
    p.name.ar.includes(norm) ||
    (defaultRole === 'guide' && norm.includes('zahi') && p.id === 'dr-zahi') ||
    (defaultRole === 'driver' && norm.includes('sherif') && p.id === 'sherif-el-masry')
  );

  if (match) {
    return match;
  }

  // Fallback to a beautifully generated mock profile if name is arbitrary
  const isGuide = defaultRole === 'guide';
  return {
    id: `fallback-${norm.replace(/[^a-z0-9]/g, '-')}`,
    role: defaultRole,
    name: { en: name, ar: name },
    bio: {
      en: isGuide 
        ? `A certified professional Egyptology scholar with MAS Agency. Trained in classical archaeology and ancient monuments, providing tailored bespoke guides for our elite guests.`
        : `A professional executive chauffeur with MAS Agency's luxury fleet, providing secure, pristine, and prompt Mercedes V-Class private transport services.`,
      ar: isGuide
        ? `مرشد أثري معتمد ومرافق لوكالة ماس للرحلات الفاخرة. مدرب على الآثار الكلاسيكية والمواقع التراثية، لتقديم جولات مخصصة لضيوفنا المتميزين.`
        : `سائق محترف ضمن أسطول السيارات الفاخرة لوكالة ماس، يلتزم بتقديم خدمة نقل آمنة وسريعة بسياراتنا الفاخرة.`
    },
    languages: {
      en: ['English', 'Arabic'],
      ar: ['الإنجليزية', 'العربية']
    },
    credentials: {
      en: isGuide 
        ? ['Accredited Egyptian Ministry of Tourism License', 'Egyptology Heritage Guild Member']
        : ['Professional Chauffeur License (Class A)', 'MAS Elite Hospitality Protocol Training'],
      ar: isGuide
        ? ['ترخيص معتمد من وزارة السياحة والآثار المصرية', 'عضوية نقابة المرشدين السياحيين']
        : ['رخصة قيادة مهنية من الدرجة الأولى', 'دورة بروتوكول الضيافة الفاخرة من وكالة ماس']
    },
    avatar: isGuide 
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300'
      : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    experienceYears: 8
  };
}
