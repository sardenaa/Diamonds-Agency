import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { AppLanguage, Booking } from '../../../../types.js';

interface SheetsSyncTabProps {
  lang: AppLanguage;
  bookings: Booking[];
  googleUser: any;
  googleToken: string | null;
  handleGoogleLogin: () => void;
  handleGoogleLogout: () => void;
  exportTitle: string;
  setExportTitle: (val: string) => void;
  exportStatus: 'idle' | 'exporting' | 'success' | 'failed';
  exportedSheet: { id: string; url: string } | null;
  exportError: string | null;
  handleRunExport: () => void;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileImport: (file: File) => void;
  rawImportText: string;
  setRawImportText: (val: string) => void;
  handleTextImportSubmit: (e: React.FormEvent) => void;
  importStatus: 'idle' | 'importing' | 'success' | 'failed';
  importSuccessCount: number;
  importError: string | null;
  autoSync: boolean;
  setAutoSync: (val: boolean) => void;
}

export default function SheetsSyncTab({
  lang,
  bookings,
  googleUser,
  googleToken,
  handleGoogleLogin,
  handleGoogleLogout,
  exportTitle,
  setExportTitle,
  exportStatus,
  exportedSheet,
  exportError,
  handleRunExport,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileImport,
  rawImportText,
  setRawImportText,
  handleTextImportSubmit,
  importStatus,
  importSuccessCount,
  importError,
  autoSync,
  setAutoSync,
}: SheetsSyncTabProps) {
  return (
    <div className="space-y-6 animate-fade-in text-xs md:text-sm">
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">
              {lang === 'ar' ? 'مزامنة غوغل شيتس السيادية' : 'Sovereign Google Sheets Synchronization'}
            </h3>
            <p className="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">
              {lang === 'ar' ? 'إدارة تصدير واستيراد بيانات الحجز والـ CRM' : 'Manage export and live streaming of luxury reservation ledgers'}
            </p>
          </div>
        </div>
        <div className="h-[1px] bg-slate-800" />
        <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
          {lang === 'ar'
            ? 'قم بربط حسابك على Google لتصدير قوائم الحجوزات النشطة وسجلات عملاء كبار الشخصيات تلقائيًا في جداول بيانات غوغل المنظمة لتسهيل مهام المحاسبة والمتابعة الحية.'
            : 'Establish a secure OAuth connection with your Google Account to export active booking catalogs and high-spender CRM details directly into clean, styled Google Spreadsheets for seamless accounting and corporate tracking.'}
        </p>
      </div>

      {/* 1. Google OAuth Connection Controller */}
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="text-xs uppercase font-black tracking-widest text-emerald-400">
          {lang === 'ar' ? 'حالة الاتصال بـ Google' : 'Google Connection Status'}
        </h4>

        {googleUser ? (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-950/60 rounded-xl border border-slate-800 gap-4 text-xs">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500 flex items-center justify-center bg-slate-900">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt={googleUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-emerald-400">{googleUser.email?.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{googleUser.displayName || 'Sovereign Officer'}</span>
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-sans">
                    Connected
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 font-sans">{googleUser.email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogout}
              className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-rose-400 text-xs font-bold py-1.5 px-3.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'قطع الاتصال' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-4 text-xs">
            <div className="max-w-md mx-auto space-y-2">
              <p className="text-slate-400 text-xs">
                {lang === 'ar'
                  ? 'لم يتم الكشف عن اتصال OAuth نشط. يرجى تسجيل الدخول لتفويض الوصول الآمن لجداول البيانات.'
                  : 'No active Google OAuth connection detected. Connect your Google workspace account safely to access drive capabilities.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.86-3.577-7.86-8s3.53-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.133C18.423 1.932 15.603 1 12.24 1c-6.076 0-11 4.924-11 11s4.924 11 11 11c6.346 0 10.574-4.453 10.574-10.762 0-.724-.078-1.277-.174-1.953H12.24z"
                />
              </svg>
              <span>{lang === 'ar' ? 'سجل الدخول باستخدام Google' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Export Actions Panel */}
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="text-xs uppercase font-black tracking-widest text-emerald-400">
          {lang === 'ar' ? 'تصدير البيانات إلى غوغل شيتس' : 'Sovereign Sheet Export Ledger'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="text-left">
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">
              {lang === 'ar' ? 'عنوان جدول البيانات' : 'Spreadsheet Document Title'}
            </label>
            <input
              type="text"
              disabled={!googleToken}
              value={exportTitle}
              onChange={(e) => setExportTitle(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs w-full focus:outline-none disabled:opacity-40"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              disabled={!googleToken || exportStatus === 'exporting'}
              onClick={handleRunExport}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs py-2.5 px-6 rounded-xl transition-all w-full flex items-center justify-center gap-2 cursor-pointer"
            >
              {exportStatus === 'exporting' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === 'ar' ? 'جاري التصدير...' : 'Exporting Data...'}</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تصدير الحجوزات الآن' : `Export ${bookings.length} Bookings`}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {exportStatus === 'success' && exportedSheet && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-2 animate-fade-in text-left">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تم التصدير بنجاح!' : 'Sovereign Ledger Export Successful!'}</span>
            </div>
            <p className="text-slate-300">
              {lang === 'ar'
                ? `تم إنشاء ملف غوغل شيتس بنجاح بعنوان "${exportTitle}".`
                : `A brand new spreadsheet "${exportTitle}" was successfully spawned in your Google Drive and populated with high-end CRM registers.`}
            </p>
            <a
              href={exportedSheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider transition-colors mt-1 cursor-pointer"
            >
              <span>{lang === 'ar' ? 'فتح جدول البيانات ↗' : 'Open Spreadsheet ↗'}</span>
            </a>
          </div>
        )}

        {exportStatus === 'failed' && exportError && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/20 rounded-xl text-xs space-y-1 text-rose-400 animate-fade-in text-left">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{lang === 'ar' ? 'فشل التصدير' : 'Export Failed'}</span>
            </div>
            <p className="opacity-90">{exportError}</p>
          </div>
        )}
      </div>

      {/* 3. Sovereign Import Actions Panel */}
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase font-black tracking-widest text-amber-400">
            {lang === 'ar' ? 'استيراد البيانات السيادية' : 'Sovereign Ledger Data Importer'}
          </h4>
          <span className="bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
            CSV / JSON READY
          </span>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed text-left">
          {lang === 'ar'
            ? 'قم باستيراد سجلات الحجوزات والـ CRM مباشرة عن طريق تحميل ملفات CSV/JSON أو لصق النص البرمجي المهيكل لتحديث النظام السيادي.'
            : 'Import historic booking journals or guest registers into the sovereign central deck. Upload a raw CSV/JSON ledger file, or paste formatted tables directly.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
          {/* Left Column: Drag & Drop File Upload */}
          <div className="space-y-2 text-left text-xs">
            <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">
              {lang === 'ar' ? 'تحميل ملف الجدول' : 'Method A: Drag & Drop Ledger File'}
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-300 relative ${
                dragActive
                  ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/80'
              }`}
            >
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileImport(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="text-center space-y-2 flex flex-col items-center pointer-events-none">
                <div
                  className={`p-2.5 rounded-xl border transition-colors ${
                    dragActive ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-850 border-slate-750 text-slate-400'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">
                    {lang === 'ar' ? 'اسحب وأسقط الملف هنا' : 'Drop ledger file here, or browse'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">Supports .CSV and .JSON formats</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Paste Raw Text Area */}
          <form onSubmit={handleTextImportSubmit} className="space-y-2 flex flex-col justify-between text-xs text-left">
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">
                {lang === 'ar' ? 'لصق النص المهيكل' : 'Method B: Paste Raw Ledger Text'}
              </label>
              <textarea
                value={rawImportText}
                onChange={(e) => setRawImportText(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'الصق جدول البيانات أو مصفوفة JSON هنا...'
                    : 'Paste CSV rows (with headers) or a JSON array of bookings here...'
                }
                rows={5}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs w-full focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={!rawImportText.trim() || importStatus === 'importing'}
              className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer disabled:opacity-40 w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'معالجة النص المنسق' : 'Parse and Load Pasted Text'}</span>
            </button>
          </form>
        </div>

        {/* Import Status Messages */}
        {importStatus === 'importing' && (
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3 text-xs animate-fade-in text-slate-300 text-left">
            <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'جاري الاستيراد والتنقية...' : 'Streaming and refining ledger data...'}
            </span>
          </div>
        )}

        {importStatus === 'success' && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1 text-emerald-400 animate-fade-in text-left">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'نجح الاستيراد!' : 'Sovereign Import Completed successfully!'}</span>
            </div>
            <p className="text-slate-300">
              {lang === 'ar'
                ? `تم استيراد ${importSuccessCount} سجل حجز بنجاح ومزامنته مع نظام الـ CRM الحصري.`
                : `Successfully loaded ${importSuccessCount} VIP bookings. Central database synchronized, CRM registers upserted.`}
            </p>
          </div>
        )}

        {importStatus === 'failed' && importError && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/20 rounded-xl text-xs space-y-1 text-rose-400 animate-fade-in text-left">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{lang === 'ar' ? 'فشل الاستيراد' : 'Import Failed'}</span>
            </div>
            <p className="opacity-90">{importError}</p>
          </div>
        )}
      </div>

      {/* 4. Live Synchronicity Settings */}
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="text-xs uppercase font-black tracking-widest text-emerald-400">
          {lang === 'ar' ? 'إعدادات المزامنة الفورية' : 'Live Synchronization Settings'}
        </h4>
        <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 gap-4 text-xs">
          <div className="space-y-0.5 text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{lang === 'ar' ? 'مزامنة الحجوزات الجديدة تلقائياً' : 'Auto-export new bookings'}</span>
              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                PRO FEATURE
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              {lang === 'ar'
                ? 'عند التفعيل، سيتم دفق أي حجز VIP جديد تقوم به اللوائح مباشرةً لملف غوغل شيتس المتصل.'
                : 'Future luxury travel reservations will automatically stream into your sovereign sheet ledger in real-time.'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => {
                setAutoSync(e.target.checked);
                localStorage.setItem('googleSheets_autoSync', String(e.target.checked));
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>
      </div>
    </div>
  );
}
