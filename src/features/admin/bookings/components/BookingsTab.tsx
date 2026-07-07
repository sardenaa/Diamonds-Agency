import React from 'react';
import { FileSpreadsheet, FileText, Plus, Search, Calendar } from 'lucide-react';
import { AppLanguage, Booking, Tour } from '../../../types.js';
import { SpreadsheetInput, SpreadsheetSelect } from '../../../components/SpreadsheetControls.js';

interface BookingsTabProps {
  lang: AppLanguage;
  t: any;
  bookings: Booking[];
  tours: Tour[];
  opsSearchQuery: string;
  setOpsSearchQuery: (val: string) => void;
  opsStatusFilter: string;
  setOpsStatusFilter: (val: string) => void;
  isManualBookingOpen: boolean;
  setIsManualBookingOpen: (val: boolean) => void;
  handleExportCSV: () => void;
  handleExportJSON: () => void;
  handleCreateManualBooking: (e: React.FormEvent) => void;
  manualTourId: string;
  setManualTourId: (val: string) => void;
  manualCustomerName: string;
  setManualCustomerName: (val: string) => void;
  manualCustomerEmail: string;
  setManualCustomerEmail: (val: string) => void;
  manualCustomerPhone: string;
  setManualCustomerPhone: (val: string) => void;
  manualCustomerNationality: string;
  setManualCustomerNationality: (val: string) => void;
  manualDate: string;
  setManualDate: (val: string) => void;
  manualTravelerCount: number;
  setManualTravelerCount: (val: number) => void;
  manualPickupHotel: string;
  setManualPickupHotel: (val: string) => void;
  manualRoomNumber: string;
  setManualRoomNumber: (val: string) => void;
  manualPaymentMethod: string;
  setManualPaymentMethod: (val: string) => void;
  manualSpecialRequests: string;
  setManualSpecialRequests: (val: string) => void;
  savingStatus: Record<string, 'idle' | 'saving' | 'saved' | 'error'>;
  handleAutoSaveBooking: (id: string, updates: Partial<Booking>) => void;
  handleTriggerRefund: (id: string) => void;
  handleUpgradeBookingVIP: (id: string) => void;
  handleDeleteBooking: (id: string) => void;
  setSelectedStaffName: (val: string) => void;
  setSelectedStaffRole: (val: 'driver' | 'guide') => void;
  setIsProfileModalOpen: (val: boolean) => void;
}

export default function BookingsTab({
  lang,
  t,
  bookings,
  tours,
  opsSearchQuery,
  setOpsSearchQuery,
  opsStatusFilter,
  setOpsStatusFilter,
  isManualBookingOpen,
  setIsManualBookingOpen,
  handleExportCSV,
  handleExportJSON,
  handleCreateManualBooking,
  manualTourId,
  setManualTourId,
  manualCustomerName,
  setManualCustomerName,
  manualCustomerEmail,
  setManualCustomerEmail,
  manualCustomerPhone,
  setManualCustomerPhone,
  manualCustomerNationality,
  setManualCustomerNationality,
  manualDate,
  setManualDate,
  manualTravelerCount,
  setManualTravelerCount,
  manualPickupHotel,
  setManualPickupHotel,
  manualRoomNumber,
  setManualRoomNumber,
  manualPaymentMethod,
  setManualPaymentMethod,
  manualSpecialRequests,
  setManualSpecialRequests,
  savingStatus,
  handleAutoSaveBooking,
  handleTriggerRefund,
  handleUpgradeBookingVIP,
  handleDeleteBooking,
  setSelectedStaffName,
  setSelectedStaffRole,
  setIsProfileModalOpen,
}: BookingsTabProps) {
  const filteredOpsBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.id || '').toLowerCase().includes(opsSearchQuery.toLowerCase()) ||
      (b.customerName || '').toLowerCase().includes(opsSearchQuery.toLowerCase()) ||
      (b.customerEmail || '').toLowerCase().includes(opsSearchQuery.toLowerCase()) ||
      (b.customerPhone || '').toLowerCase().includes(opsSearchQuery.toLowerCase()) ||
      ((b.tourTitle && b.tourTitle.en) || '').toLowerCase().includes(opsSearchQuery.toLowerCase()) ||
      ((b.tourTitle && b.tourTitle.ar) || '').toLowerCase().includes(opsSearchQuery.toLowerCase()) ||
      (b.driverName || '').toLowerCase().includes(opsSearchQuery.toLowerCase()) ||
      (b.guideName || '').toLowerCase().includes(opsSearchQuery.toLowerCase());

    const matchesStatus = opsStatusFilter === 'all' || b.status === opsStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs md:text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider">
            Live Excursion Ledger & Chauffeur Assignments
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">
            Manage existing bookings, assign chauffeurs and guides, or create a direct manual entry below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Download Excel-compatible CSV list of all bookings"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel/CSV Ledger</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 font-black text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Download database JSON dump of all bookings"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export JSON Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => setIsManualBookingOpen(!isManualBookingOpen)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isManualBookingOpen ? 'Close Form' : 'Add Manual Booking'}</span>
          </button>
        </div>
      </div>

      {/* Operations search & filter bar */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between text-xs animate-fade-in">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by reservation ID, guest, phone, guide, driver, excursion..."
            value={opsSearchQuery}
            onChange={(e) => setOpsSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3 py-2 text-white w-full focus:outline-none focus:border-emerald-500 placeholder-slate-500 text-xs"
          />
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <span className="text-slate-400 font-bold whitespace-nowrap">Filter Status:</span>
          <select
            value={opsStatusFilter}
            onChange={(e) => setOpsStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer text-xs font-semibold"
          >
            <option value="all">All Booking Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {filteredOpsBookings.length !== bookings.length && (
            <button
              onClick={() => {
                setOpsSearchQuery('');
                setOpsStatusFilter('all');
              }}
              className="text-amber-400 hover:text-amber-300 font-black uppercase text-[10px] tracking-wider pl-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {isManualBookingOpen && (
        <form
          onSubmit={handleCreateManualBooking}
          className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl space-y-4 animate-fade-in text-xs"
        >
          <h5 className="text-amber-400 font-extrabold uppercase tracking-wider text-[10px]">
            Create Manual Sovereign Reservation
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Select Excursion</label>
              <select
                value={manualTourId}
                onChange={(e) => setManualTourId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none cursor-pointer"
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {lang === 'ar' ? t.title.ar : t.title.en} (${t.priceUSD}/guest)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Customer Full Name</label>
              <input
                required
                type="text"
                value={manualCustomerName}
                onChange={(e) => setManualCustomerName(e.target.value)}
                placeholder="e.g. Lord Charles Spencer"
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Customer Email</label>
              <input
                required
                type="email"
                value={manualCustomerEmail}
                onChange={(e) => setManualCustomerEmail(e.target.value)}
                placeholder="guest@domain.com"
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={manualCustomerPhone}
                onChange={(e) => setManualCustomerPhone(e.target.value)}
                placeholder="+20 12..."
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Nationality</label>
              <input
                type="text"
                value={manualCustomerNationality}
                onChange={(e) => setManualCustomerNationality(e.target.value)}
                placeholder="e.g. Germany"
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Expedition Date</label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Traveler Guest Count</label>
              <input
                type="number"
                min={1}
                value={manualTravelerCount}
                onChange={(e) => setManualTravelerCount(parseInt(e.target.value) || 1)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Pickup Hotel / Yacht Marina</label>
              <input
                type="text"
                value={manualPickupHotel}
                onChange={(e) => setManualPickupHotel(e.target.value)}
                placeholder="e.g. Marriott Mena House"
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Room / Yacht Suite Number</label>
              <input
                type="text"
                value={manualRoomNumber}
                onChange={(e) => setManualRoomNumber(e.target.value)}
                placeholder="e.g. Suite 404"
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Payment Settlement Method</label>
              <select
                value={manualPaymentMethod}
                onChange={(e) => setManualPaymentMethod(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none cursor-pointer"
              >
                <option value="Cash">Cash / Pay at Pickup</option>
                <option value="Credit Card">Credit Card (Stripe pre-paid)</option>
                <option value="Bank Transfer">VIP Wire Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Special Concierge Requests</label>
            <textarea
              value={manualSpecialRequests}
              onChange={(e) => setManualSpecialRequests(e.target.value)}
              placeholder="e.g. Kosher champagne, strictly private Egyptologist, custom high tea..."
              rows={2}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-full focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl transition-all cursor-pointer"
          >
            Insert Sovereign Booking Ledger
          </button>
        </form>
      )}

      <div className="bg-slate-800/20 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[700px]">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400 font-bold">
              <th className="p-3 text-[10px] uppercase">{lang === 'ar' ? 'الرمز' : 'RESERVATION'}</th>
              <th className="p-3 text-[10px] uppercase">{lang === 'ar' ? 'العميل' : 'CLIENT'}</th>
              <th className="p-3 text-[10px] uppercase">{lang === 'ar' ? 'الرحلة والوقت' : 'EXCURSION & DATE'}</th>
              <th className="p-3 text-[10px] uppercase">{lang === 'ar' ? 'تعيين طاقم الخدمة' : 'STAFF ASSIGNMENTS'}</th>
              <th className="p-3 text-[10px] uppercase text-center">{lang === 'ar' ? 'الإجراءات الإدارية' : 'ADMIN ACTIONS'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-medium">
            {filteredOpsBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                  No reservations found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredOpsBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/25">
                  <td className="p-3">
                    <span className="font-mono text-emerald-400 font-bold block">{b.id}</span>
                    <span className="text-[10px] text-slate-500">{b.paymentMethod}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{b.customerName}</div>
                    <div className="text-[10px] text-slate-500">{b.customerEmail}</div>
                    {b.metadata && (b.metadata.location || b.metadata.device || b.metadata.sessionMetrics) && (
                      <div className="mt-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800 space-y-1 max-w-[240px]">
                        <div className="text-[8px] font-black text-amber-500 uppercase tracking-wider">
                          🕵️ Silent Intelligence
                        </div>
                        {b.metadata.location && (b.metadata.location.country || b.metadata.location.city) && (
                          <div className="text-[9px] text-slate-300 leading-normal">
                            📍 <b>Geo:</b> {b.metadata.location.city || 'Unknown'}, {b.metadata.location.country || 'Unknown'}{' '}
                            {b.metadata.location.ip && `(${b.metadata.location.ip})`}
                          </div>
                        )}
                        {b.metadata.device && b.metadata.device.screenResolution && (
                          <div className="text-[9px] text-slate-400 leading-normal">
                            💻 <b>Specs:</b> {b.metadata.device.platform || 'Browser'}, {b.metadata.device.screenResolution}
                          </div>
                        )}
                        {b.metadata.sessionMetrics &&
                          b.metadata.sessionMetrics.viewedDestinations &&
                          b.metadata.sessionMetrics.viewedDestinations.length > 0 && (
                            <div className="text-[9px] text-emerald-400 leading-normal">
                              🧭 <b>Clicked:</b> {b.metadata.sessionMetrics.viewedDestinations.join(', ')}
                            </div>
                          )}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-slate-200 font-semibold truncate max-w-[150px]">
                      {lang === 'ar' ? b.tourTitle.ar : b.tourTitle.en}
                    </div>
                    <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{b.date}</span>
                    </div>
                  </td>
                  <td className="p-3 space-y-2">
                    {/* Driver assign */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                          <label className="block text-[8px] uppercase text-slate-500 font-bold">{t.driver}</label>
                          {savingStatus[`${b.id}-driverName`] === 'saving' && (
                            <span className="text-[8px] text-emerald-400 font-bold animate-pulse">
                              {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                            </span>
                          )}
                          {savingStatus[`${b.id}-driverName`] === 'saved' && (
                            <span className="text-[8px] text-emerald-500 font-bold">{lang === 'ar' ? 'تم الحفظ' : 'Saved'}</span>
                          )}
                          {savingStatus[`${b.id}-driverName`] === 'error' && (
                            <span className="text-[8px] text-rose-500 font-bold">{lang === 'ar' ? 'خطأ' : 'Error'}</span>
                          )}
                        </div>
                        {b.driverName && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStaffName(b.driverName || '');
                              setSelectedStaffRole('driver');
                              setIsProfileModalOpen(true);
                            }}
                            className="text-[8px] font-black uppercase text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center"
                          >
                            {lang === 'ar' ? 'عرض الملف' : 'View Profile'}
                          </button>
                        )}
                      </div>
                      <SpreadsheetInput
                        value={b.driverName || ''}
                        placeholder="e.g. Sherif El Masry"
                        onSave={(val) => handleAutoSaveBooking(b.id, { driverName: val })}
                        status={savingStatus[`${b.id}-driverName`] || 'idle'}
                        className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none w-full"
                      />
                    </div>
                    {/* Guide assign */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                          <label className="block text-[8px] uppercase text-slate-500 font-bold">{t.guide}</label>
                          {savingStatus[`${b.id}-guideName`] === 'saving' && (
                            <span className="text-[8px] text-emerald-400 font-bold animate-pulse">
                              {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                            </span>
                          )}
                          {savingStatus[`${b.id}-guideName`] === 'saved' && (
                            <span className="text-[8px] text-emerald-500 font-bold">{lang === 'ar' ? 'تم الحفظ' : 'Saved'}</span>
                          )}
                          {savingStatus[`${b.id}-guideName`] === 'error' && (
                            <span className="text-[8px] text-rose-500 font-bold">{lang === 'ar' ? 'خطأ' : 'Error'}</span>
                          )}
                        </div>
                        {b.guideName && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStaffName(b.guideName || '');
                              setSelectedStaffRole('guide');
                              setIsProfileModalOpen(true);
                            }}
                            className="text-[8px] font-black uppercase text-amber-400 hover:text-amber-300 hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center"
                          >
                            {lang === 'ar' ? 'عرض الملف' : 'View Profile'}
                          </button>
                        )}
                      </div>
                      <SpreadsheetInput
                        value={b.guideName || ''}
                        placeholder="e.g. Dr. Zahi"
                        onSave={(val) => handleAutoSaveBooking(b.id, { guideName: val })}
                        status={savingStatus[`${b.id}-guideName`] || 'idle'}
                        className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none w-full"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center space-y-2">
                    <div className="flex flex-col gap-1 items-center justify-center">
                      <SpreadsheetSelect
                        value={b.status}
                        options={[
                          { value: 'pending', label: t.pending },
                          { value: 'confirmed', label: t.confirmed },
                          { value: 'completed', label: t.completed },
                          { value: 'cancelled', label: t.cancelled },
                        ]}
                        onSave={(val) => handleAutoSaveBooking(b.id, { status: val as any })}
                        status={savingStatus[`${b.id}-status`] || 'idle'}
                        className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none cursor-pointer w-full text-center"
                      />
                      {savingStatus[`${b.id}-status`] === 'saving' && (
                        <span className="text-[8px] text-emerald-400 font-bold animate-pulse block">
                          {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </span>
                      )}
                      {savingStatus[`${b.id}-status`] === 'saved' && (
                        <span className="text-[8px] text-emerald-500 font-bold block">{lang === 'ar' ? 'تم الحفظ' : 'Saved'}</span>
                      )}
                      {savingStatus[`${b.id}-status`] === 'error' && (
                        <span className="text-[8px] text-rose-500 font-bold block">{lang === 'ar' ? 'خطأ' : 'Error'}</span>
                      )}
                    </div>
                    {b.status !== 'cancelled' && b.paymentStatus === 'paid' && (
                      <button
                        onClick={() => handleTriggerRefund(b.id)}
                        className="bg-rose-500/10 hover:bg-rose-650 border border-rose-500/20 text-rose-400 hover:text-white font-bold text-[9px] w-full py-1.5 rounded-md transition-colors uppercase tracking-wider block cursor-pointer"
                      >
                        {t.refundBtn}
                      </button>
                    )}
                    {b.status !== 'cancelled' && !b.specialRequests?.includes('Sovereign Elite Package') && (
                      <button
                        onClick={() => handleUpgradeBookingVIP(b.id)}
                        className="bg-amber-500/10 hover:bg-amber-500 border border-amber-500/25 text-amber-400 hover:text-slate-950 font-black text-[9px] w-full py-1.5 rounded-md transition-colors uppercase tracking-wider block cursor-pointer"
                      >
                        👑 VIP Upgrade (+$250)
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBooking(b.id)}
                      className="bg-rose-600/15 hover:bg-rose-650 border border-rose-500/25 text-rose-400 hover:text-white font-bold text-[9px] w-full py-1.5 rounded-md transition-colors uppercase tracking-wider block cursor-pointer"
                    >
                      ❌ Delete Booking
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
