import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { AppLanguage, Tour } from '../../../../types.js';

interface CmsTabProps {
  lang: AppLanguage;
  tours: Tour[];
  editingTourId: string | null;
  newTourTitleEn: string;
  setNewTourTitleEn: (val: string) => void;
  newTourTitleAr: string;
  setNewTourTitleAr: (val: string) => void;
  newTourDescriptionEn: string;
  setNewTourDescriptionEn: (val: string) => void;
  newTourDescriptionAr: string;
  setNewTourDescriptionAr: (val: string) => void;
  newTourCategory: string;
  setNewTourCategory: (val: string) => void;
  newTourDestination: string;
  setNewTourDestination: (val: string) => void;
  newTourPrice: number;
  setNewTourPrice: (val: number) => void;
  newTourDuration: string;
  setNewTourDuration: (val: string) => void;
  newTourCapacity: number;
  setNewTourCapacity: (val: number) => void;
  handleSaveTour: (e: React.FormEvent) => void;
  handleCancelEdit: () => void;
  handleEditTourClick: (tour: Tour) => void;
  handleDeleteTour: (id: string) => void;
  formatLocalPrice: (price: number) => string;
}

export default function CmsTab({
  lang,
  tours,
  editingTourId,
  newTourTitleEn,
  setNewTourTitleEn,
  newTourTitleAr,
  setNewTourTitleAr,
  newTourDescriptionEn,
  setNewTourDescriptionEn,
  newTourDescriptionAr,
  setNewTourDescriptionAr,
  newTourCategory,
  setNewTourCategory,
  newTourDestination,
  setNewTourDestination,
  newTourPrice,
  setNewTourPrice,
  newTourDuration,
  setNewTourDuration,
  newTourCapacity,
  setNewTourCapacity,
  handleSaveTour,
  handleCancelEdit,
  handleEditTourClick,
  handleDeleteTour,
  formatLocalPrice,
}: CmsTabProps) {
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'ar'>('en');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add/Edit Tour Form */}
      <div className="bg-slate-800/20 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800/60 pb-3 mb-4">
          <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
            {editingTourId ? 'CMS Corporate - Edit Luxury Excursion' : 'CMS Corporate - Catalog New Luxury Excursion'}
          </h4>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
              className={`text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isLivePreviewOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                  : 'bg-slate-900 text-slate-400 border-slate-750 hover:bg-slate-850 hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLivePreviewOpen ? 'Hide Live Preview' : 'Show Live Preview'}</span>
            </button>
            {editingTourId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isLivePreviewOpen ? 'lg:grid-cols-12 gap-6' : ''}`}>
          <form
            onSubmit={handleSaveTour}
            className={`space-y-4 ${isLivePreviewOpen ? 'lg:col-span-7 border-r border-slate-800/80 pr-6' : 'w-full'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Title (English)</label>
                <input
                  required
                  type="text"
                  value={newTourTitleEn}
                  onChange={(e) => setNewTourTitleEn(e.target.value)}
                  placeholder="e.g. VIP Pyramids Helicopter Safari"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Title (Arabic)</label>
                <input
                  required
                  type="text"
                  value={newTourTitleAr}
                  onChange={(e) => setNewTourTitleAr(e.target.value)}
                  placeholder="e.g. رحلة الهليكوبتر الملكية للأهرامات"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Price (USD)</label>
                <input
                  required
                  type="number"
                  value={newTourPrice}
                  onChange={(e) => setNewTourPrice(parseInt(e.target.value) || 0)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Description (English)</label>
                <textarea
                  value={newTourDescriptionEn}
                  onChange={(e) => setNewTourDescriptionEn(e.target.value)}
                  placeholder="Enter premium English description or leave blank for a luxurious auto-generated draft."
                  rows={2}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Description (Arabic)</label>
                <textarea
                  value={newTourDescriptionAr}
                  onChange={(e) => setNewTourDescriptionAr(e.target.value)}
                  placeholder="أدخل الوصف باللغة العربية أو اتركه فارغاً للحصول على مسودة تلقائية فاخرة."
                  rows={2}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none resize-none font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Category</label>
                <select
                  value={newTourCategory}
                  onChange={(e) => setNewTourCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none cursor-pointer"
                >
                  <option value="Historical Tours">Historical Tours</option>
                  <option value="Luxury Cruises">Luxury Cruises</option>
                  <option value="VIP Yacht Charters">VIP Yacht Charters</option>
                  <option value="Desert Safaris">Desert Safaris</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Destination</label>
                <select
                  value={newTourDestination}
                  onChange={(e) => setNewTourDestination(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none cursor-pointer"
                >
                  <option value="Cairo">Cairo</option>
                  <option value="Luxor">Luxor</option>
                  <option value="Sharm El Sheikh">Sharm El Sheikh</option>
                  <option value="Aswan">Aswan</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Duration</label>
                <input
                  type="text"
                  value={newTourDuration}
                  onChange={(e) => setNewTourDuration(e.target.value)}
                  placeholder="e.g. Full Day"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Capacity (Travelers)</label>
                <input
                  type="number"
                  value={newTourCapacity}
                  onChange={(e) => setNewTourCapacity(parseInt(e.target.value) || 0)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
              >
                {editingTourId ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Update Excursion</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إدراج بالـ CMS' : 'Add Tour'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {isLivePreviewOpen && (
            <div className="lg:col-span-5 space-y-4 animate-fade-in flex flex-col justify-start">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Customer Live Preview</span>
                </div>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setPreviewLang('en')}
                    className={`text-[9px] px-2.5 py-0.5 rounded font-black uppercase transition-all ${
                      previewLang === 'en' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLang('ar')}
                    className={`text-[9px] px-2.5 py-0.5 rounded font-black uppercase transition-all ${
                      previewLang === 'ar' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AR
                  </button>
                </div>
              </div>

              <div className="w-full max-w-sm mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-300 text-slate-900 pb-4">
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200"
                    alt="Pyramids Cover"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur-md text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-white/10">
                    {newTourDestination || 'Cairo'}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow font-bold text-[10px]">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>5.0</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider">
                      {newTourCategory || 'Historical Tours'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight tracking-tight">
                      {previewLang === 'ar' ? newTourTitleAr || 'العنوان الفاخر باللغة العربية' : newTourTitleEn || 'VIP Royal Luxury Tour Title'}
                    </h3>
                    <p className="text-slate-500 text-[11px] line-clamp-3 leading-relaxed font-medium">
                      {previewLang === 'ar'
                        ? newTourDescriptionAr || 'وصف فاخر لخدمة السفر المصممة خصيصًا لنخبة المسافرين...'
                        : newTourDescriptionEn ||
                          'Bespoke high-hospitality expedition featuring Mercedes V-Class chauffeur, private guides, and gourmet custom services...'}
                    </p>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-3" />

                  <div className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">PER GUEST</span>
                      <span className="text-sm font-black text-slate-900">{formatLocalPrice(newTourPrice || 300)}</span>
                    </div>
                    <div className="flex flex-col items-end text-[9px] text-slate-400 font-semibold space-y-0.5">
                      <span>⏱ {newTourDuration || 'Full Day'}</span>
                      <span>👥 Max {newTourCapacity || 8} guests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Catalog List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Active Tours</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tours.map((t) => (
            <div
              key={t.id}
              className="bg-slate-800/30 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <h5 className="font-bold text-slate-200 text-xs md:text-sm">{lang === 'ar' ? t.title.ar : t.title.en}</h5>
                <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">
                  {t.category} | {t.destination} | {formatLocalPrice(t.priceUSD)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTourClick(t)}
                  className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 p-2 rounded-lg transition-colors cursor-pointer border border-amber-500/20"
                  title="Edit Tour"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTour(t.id)}
                  className="bg-rose-500/10 hover:bg-rose-650 text-rose-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer border border-rose-500/20"
                  title="Delete Tour"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
