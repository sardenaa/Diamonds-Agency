import React, { useState, useEffect } from 'react';
import { X, Check, Plus, RefreshCw, Luggage, Sparkles, BookOpen, Sun, Waves, ShieldAlert } from 'lucide-react';
import { AppLanguage } from '../types.js';

interface PackingItem {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'essentials' | 'tour_specific' | 'luxury_accents' | 'custom';
  packed: boolean;
}

interface PackingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  tourId: string;
  tourTitleEn: string;
  bookingId: string;
}

export default function PackingAssistantModal({
  isOpen,
  onClose,
  lang,
  tourId,
  tourTitleEn,
  bookingId
}: PackingAssistantModalProps) {
  const isAr = lang === 'ar';
  const lowercaseTitle = tourTitleEn.toLowerCase();

  // Determine tour type
  const isDesert = tourId === 'tour-1' || lowercaseTitle.includes('pyramid') || lowercaseTitle.includes('cairo') || lowercaseTitle.includes('sphinx') || lowercaseTitle.includes('safari') || lowercaseTitle.includes('desert');
  const isNile = tourId === 'tour-2' || lowercaseTitle.includes('nile') || lowercaseTitle.includes('dahabiya') || lowercaseTitle.includes('luxor') || lowercaseTitle.includes('aswan');
  const isMarine = tourId === 'tour-3' || tourId === 'tour-4' || lowercaseTitle.includes('sharm') || lowercaseTitle.includes('hurghada') || lowercaseTitle.includes('yacht') || lowercaseTitle.includes('sea') || lowercaseTitle.includes('reef') || lowercaseTitle.includes('snorkel');

  // Load items from local storage or set defaults
  const [items, setItems] = useState<PackingItem[]>([]);
  const [customItemText, setCustomItemText] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const storageKey = `mas_packing_${bookingId}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setItems(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to parse saved packing items:', e);
      }
    }

    // Default Essentials (For all VIP tours)
    const defaults: PackingItem[] = [
      { id: 'ess-1', nameEn: 'Digital Passage Boarding Pass', nameAr: 'تذكرة صعود ممر العبور الرقمي', category: 'essentials', packed: false },
      { id: 'ess-2', nameEn: 'Passport & Copy of Entry Visa', nameAr: 'جواز السفر ونسخة من تأشيرة الدخول', category: 'essentials', packed: false },
      { id: 'ess-3', nameEn: 'Personal Medications & Prescriptions', nameAr: 'الأدوية الشخصية والوصفات الطبية', category: 'essentials', packed: false },
      { id: 'ess-4', nameEn: 'Multi-Country Power Adapter & Cables', nameAr: 'شاحن متعدد المقابس وكابلات الطاقة', category: 'essentials', packed: false },
    ];

    // Tour-specific recommendations
    if (isDesert) {
      defaults.push(
        { id: 'tour-1', nameEn: 'High UV Sunglasses & Safari Sun-hat', nameAr: 'نظارات شمسية واقية وقبعة سفاري صحراوية', category: 'tour_specific', packed: false },
        { id: 'tour-2', nameEn: 'Premium Breathable Linen Apparel', nameAr: 'ملابس كتان فاخرة جيدة التهوية', category: 'tour_specific', packed: false },
        { id: 'tour-3', nameEn: 'Sturdy Walking Shoes / Desert Boots', nameAr: 'أحذية مشي قوية / أحذية صحراوية', category: 'tour_specific', packed: false },
        { id: 'tour-4', nameEn: 'Lightweight Cotton Shemagh or Scarf', nameAr: 'شماغ قطني خفيف أو وشاح للرأس والغبار', category: 'tour_specific', packed: false },
        { id: 'lux-1', nameEn: 'Handheld Silent Cooling Fan', nameAr: 'مروحة تبريد يدوية صامتة', category: 'luxury_accents', packed: false },
        { id: 'lux-2', nameEn: 'Premium Skin Hydration Spray', nameAr: 'بخاخ مرطب للبشرة من الفئة الفاخرة', category: 'luxury_accents', packed: false }
      );
    } else if (isNile) {
      defaults.push(
        { id: 'tour-1', nameEn: 'Smart-Casual Attire for On-deck Dinners', nameAr: 'ملابس أنيقة وعصرية لعشاء سطح السفينة', category: 'tour_specific', packed: false },
        { id: 'tour-2', nameEn: 'Non-slip Deck Shoes / Elegant Loafers', nameAr: 'أحذية سطح السفينة المانعة للانزلاق', category: 'tour_specific', packed: false },
        { id: 'tour-3', nameEn: 'Windbreaker/Cardigan for Cool Nile Evenings', nameAr: 'سترة خفيفة لنسيم النيل البارد مساءً', category: 'tour_specific', packed: false },
        { id: 'tour-4', nameEn: 'Elite Binoculars for Riverside Sightseeing', nameAr: 'منظار عالي الدقة لمشاهدة ضفاف النيل', category: 'tour_specific', packed: false },
        { id: 'lux-1', nameEn: 'Gilded Expedition Notebook & Ink Pen', nameAr: 'مذكرة مذهبة لتدوين ذكريات الرحلة وقلم حبر', category: 'luxury_accents', packed: false },
        { id: 'lux-2', nameEn: 'Bespoke Anti-Insect Botanical Defense', nameAr: 'طارد البعوض والحشرات العضوي المخصص', category: 'luxury_accents', packed: false }
      );
    } else if (isMarine) {
      defaults.push(
        { id: 'tour-1', nameEn: 'Designer Swimwear & Yacht Cover-ups', nameAr: 'ملابس سباحة مصممة وتغطية يخت راقية', category: 'tour_specific', packed: false },
        { id: 'tour-2', nameEn: 'Polarized Sunglasses (anti-glare marine grade)', nameAr: 'نظارات شمسية مستقطبة مخصصة للأجواء البحرية', category: 'tour_specific', packed: false },
        { id: 'tour-3', nameEn: 'Waterproof Dry Bag for Camera/Devices', nameAr: 'حقيبة جافة مضادة للماء للكاميرا والأجهزة', category: 'tour_specific', packed: false },
        { id: 'tour-4', nameEn: 'Eco-Friendly certified Reef-Safe Sunscreen', nameAr: 'واقي من الشمس صديق للبيئة معتمد لحماية المرجان', category: 'tour_specific', packed: false },
        { id: 'lux-1', nameEn: 'Waterproof Professional Camera Housing', nameAr: 'بيت حماية كاميرا احترافي مضاد للماء', category: 'luxury_accents', packed: false },
        { id: 'lux-2', nameEn: 'Premium Linen Beach Sarong / Towel', nameAr: 'منشفة شاطئ فاخرة وسارونج من الكتان المنسوج', category: 'luxury_accents', packed: false }
      );
    } else {
      defaults.push(
        { id: 'tour-1', nameEn: 'Comfortable Premium Travel Outfits', nameAr: 'ملابس سفر مريحة وراقية', category: 'tour_specific', packed: false },
        { id: 'tour-2', nameEn: 'Light Jacket / Premium Scarf Accent', nameAr: 'سترة خفيفة / وشاح رقبة فاخر للاحتياط', category: 'tour_specific', packed: false },
        { id: 'lux-1', nameEn: 'Noise-Cancelling Premium Headphones', nameAr: 'سماعات رأس عازلة للضوضاء من فئة النخبة', category: 'luxury_accents', packed: false },
        { id: 'lux-2', nameEn: 'Hydrating Eye Mask & Silk Travel Pillow', nameAr: 'قناع مرطب للعين ووسادة سفر حريرية مريحة', category: 'luxury_accents', packed: false }
      );
    }

    setItems(defaults);
  }, [isOpen, bookingId, isDesert, isNile, isMarine]);

  // Persist items
  const saveItems = (updatedItems: PackingItem[]) => {
    setItems(updatedItems);
    const storageKey = `mas_packing_${bookingId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedItems));
  };

  const handleToggle = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, packed: !item.packed } : item
    );
    saveItems(updated);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemText.trim()) return;

    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      nameEn: customItemText.trim(),
      nameAr: customItemText.trim(),
      category: 'custom',
      packed: false
    };

    saveItems([...items, newItem]);
    setCustomItemText('');
  };

  const handleDeleteItem = (id: string) => {
    saveItems(items.filter(item => item.id !== id));
  };

  const handleReset = () => {
    const updated = items.map(item => ({ ...item, packed: false }));
    saveItems(updated);
  };

  if (!isOpen) return null;

  // Calculate metrics
  const totalCount = items.length;
  const packedCount = items.filter(i => i.packed).length;
  const progressPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  // Categorize
  const essentials = items.filter(i => i.category === 'essentials');
  const tourSpecific = items.filter(i => i.category === 'tour_specific');
  const luxuryAccents = items.filter(i => i.category === 'luxury_accents');
  const customs = items.filter(i => i.category === 'custom');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all animate-fade-in">
      <div 
        id="packing-assistant-modal"
        className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500 border border-amber-500/20">
              <Luggage className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest block mb-0.5">
                {isAr ? 'مساعد التعبئة الذكي الفاخر' : 'INTELLIGENT VIP WARDROBE PLANNER'}
              </span>
              <h3 className="text-lg md:text-xl font-black font-serif text-white tracking-tight">
                {isAr ? 'حقيبة السفر الاستكشافية الملكية' : 'Sovereign Packing Assistant'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800/80 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Packing Progress Stats Block */}
        <div className="bg-slate-950/60 p-5 border-b border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 w-full md:w-auto text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              {isAr ? 'تقدم تحضير الحقائب' : 'PRE-FLIGHT READY STATUS'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-amber-400">{packedCount}</span>
              <span className="text-xs text-slate-500 font-medium">{isAr ? 'من أصل' : 'of'}</span>
              <span className="text-sm font-bold text-slate-300">{totalCount}</span>
              <span className="text-xs text-slate-400 font-semibold ml-2">({progressPercent}% {isAr ? 'جاهز' : 'ready'})</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 w-full max-w-md bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-[1.5px]">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 py-2 px-3 rounded-xl font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-colors"
            title={isAr ? 'إعادة ضبط كل الأغراض' : 'Reset checklist items'}
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isAr ? 'إعادة تعيين' : 'Reset'}</span>
          </button>
        </div>

        {/* Checklist Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Section: Essential Documents */}
          {essentials.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'الأوراق والوثائق الأساسية' : '1. Mandatory Travel Credentials'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {essentials.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      item.packed 
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-300 shadow-inner' 
                        : 'bg-slate-900/40 border-slate-800 text-white hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      item.packed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {item.packed && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                    </div>
                    <span className={`text-xs font-semibold ${item.packed ? 'line-through text-slate-500' : ''}`}>
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Tour Specific Gear */}
          {tourSpecific.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-black tracking-wider pt-2">
                {isDesert ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : isMarine ? (
                  <Waves className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Luggage className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>
                  {isAr ? 'معدات وملابس خاصة بالرحلة' : `2. Tailored Expedition Gear (${isDesert ? 'Desert' : isMarine ? 'Marine' : 'River Cruise'})`}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {tourSpecific.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      item.packed 
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-300 shadow-inner' 
                        : 'bg-slate-900/40 border-slate-800 text-white hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      item.packed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {item.packed && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                    </div>
                    <span className={`text-xs font-semibold ${item.packed ? 'line-through text-slate-500' : ''}`}>
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Luxury Accents */}
          {luxuryAccents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-black tracking-wider pt-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'لمسات الرفاهية والراحة الفاخرة' : '3. Sovereign Comfort & Extras'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {luxuryAccents.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      item.packed 
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-300 shadow-inner' 
                        : 'bg-slate-900/40 border-slate-800 text-white hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      item.packed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {item.packed && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                    </div>
                    <span className={`text-xs font-semibold ${item.packed ? 'line-through text-slate-500' : ''}`}>
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Custom Items added by user */}
          <div className="space-y-3">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider pt-2">
              <span>{isAr ? 'الأغراض الشخصية الإضافية' : '4. Custom Items & Notes'}</span>
            </div>

            {customs.length === 0 ? (
              <p className="text-slate-500 italic text-[11px] text-center py-2">
                {isAr ? 'لا توجد أغراض إضافية مضافة بعد. أضف أغراضك الخاصة في المربع أدناه.' : 'No custom items added yet. Append personal gear below.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {customs.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      item.packed 
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-300' 
                        : 'bg-slate-900/40 border-slate-800 text-white'
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(item.id)}
                      className="flex items-center gap-3 text-left cursor-pointer flex-1"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        item.packed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-950'
                      }`}>
                        {item.packed && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                      </div>
                      <span className={`text-xs font-semibold truncate ${item.packed ? 'line-through text-slate-500' : ''}`}>
                        {item.nameEn}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                      title={isAr ? 'حذف العنصر' : 'Delete item'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Append Item Input Form Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 relative z-10">
          <form onSubmit={handleAddCustom} className="flex gap-3">
            <input
              type="text"
              value={customItemText}
              onChange={(e) => setCustomItemText(e.target.value)}
              placeholder={isAr ? 'مثال: الشاحن المحمول، بدلة العشاء السهرة...' : 'e.g. Spare backup camera batteries, evening gala suit...'}
              className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 flex-1 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer shrink-0 transition-colors shadow-lg hover:shadow-amber-500/15"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>{isAr ? 'إضافة' : 'Add Item'}</span>
            </button>
          </form>
          
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {isAr
                ? 'ملاحظة: هذا التحضير آمن بالكامل ويتم حفظه محلياً لخصوصية كبار الشخصيات.'
                : 'Note: Packing selections are fully private and safely retained on your personal secure device.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
