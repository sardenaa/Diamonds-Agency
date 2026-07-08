import React from 'react';
import { Plus, Users, MessageSquare, Send, Edit2, Trash2, Award, Mail, FileText, RefreshCw } from 'lucide-react';
import { AppLanguage, Booking, CustomerCRM } from '../../../../types.js';

interface CrmTabProps {
  lang: AppLanguage;
  crmProfiles: CustomerCRM[];
  bookings: Booking[];
  selectedCrmEmail: string;
  setSelectedCrmEmail: (val: string) => void;
  crmSearch: string;
  setCrmSearch: (val: string) => void;
  crmFilterTag: string;
  setCrmFilterTag: (val: string) => void;
  isCrmModalOpen: boolean;
  setIsCrmModalOpen: (val: boolean) => void;
  crmModalMode: 'create' | 'edit';
  crmFormEmail: string;
  setCrmFormEmail: (val: string) => void;
  crmFormName: string;
  setCrmFormName: (val: string) => void;
  crmFormPhone: string;
  setCrmFormPhone: (val: string) => void;
  crmFormNationality: string;
  setCrmFormNationality: (val: string) => void;
  crmFormLanguage: string;
  setCrmFormLanguage: (val: string) => void;
  crmFormTagsString: string;
  setCrmFormTagsString: (val: string) => void;
  crmFormNotes: string;
  setCrmFormNotes: (val: string) => void;
  handleSaveCrmProfile: (e: React.FormEvent) => void;
  handleOpenCreateCrm: () => void;
  handleOpenEditCrm: (profile: CustomerCRM) => void;
  handleDeleteCrmProfile: (email: string) => void;
  isBulkBlastOpen: boolean;
  setIsBulkBlastOpen: (val: boolean) => void;
  bulkBlastSegment: string;
  setBulkBlastSegment: (val: string) => void;
  bulkBlastTemplateId: string;
  setBulkBlastTemplateId: (val: string) => void;
  bulkBlastText: string;
  setBulkBlastText: (val: string) => void;
  isBlasting: boolean;
  handleSendBulkBlast: (e: React.FormEvent) => void;
  crmWhatsappInput: string;
  setCrmWhatsappInput: (val: string) => void;
  crmSupportInput: string;
  setCrmSupportInput: (val: string) => void;
  handleSendCrmWhatsapp: (email: string) => void;
  handleSendCrmSupport: (email: string) => void;
  formatLocalPrice: (price: number) => string;
}

export default function CrmTab({
  lang,
  crmProfiles,
  bookings,
  selectedCrmEmail,
  setSelectedCrmEmail,
  crmSearch,
  setCrmSearch,
  crmFilterTag,
  setCrmFilterTag,
  isCrmModalOpen,
  setIsCrmModalOpen,
  crmModalMode,
  crmFormEmail,
  setCrmFormEmail,
  crmFormName,
  setCrmFormName,
  crmFormPhone,
  setCrmFormPhone,
  crmFormNationality,
  setCrmFormNationality,
  crmFormLanguage,
  setCrmFormLanguage,
  crmFormTagsString,
  setCrmFormTagsString,
  crmFormNotes,
  setCrmFormNotes,
  handleSaveCrmProfile,
  handleOpenCreateCrm,
  handleOpenEditCrm,
  handleDeleteCrmProfile,
  isBulkBlastOpen,
  setIsBulkBlastOpen,
  bulkBlastSegment,
  setBulkBlastSegment,
  bulkBlastTemplateId,
  setBulkBlastTemplateId,
  bulkBlastText,
  setBulkBlastText,
  isBlasting,
  handleSendBulkBlast,
  crmWhatsappInput,
  setCrmWhatsappInput,
  crmSupportInput,
  setCrmSupportInput,
  handleSendCrmWhatsapp,
  handleSendCrmSupport,
  formatLocalPrice,
}: CrmTabProps) {
  const uniqueTags = Array.from(new Set(crmProfiles.flatMap((p) => p.tags || [])));

  // Helper: Render CRM sidebar list
  const renderCrmProfilesList = () => {
    const filtered = crmProfiles.filter((p) => {
      const searchLower = crmSearch.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        (p.nationality && p.nationality.toLowerCase().includes(searchLower));

      const matchesTag = crmFilterTag === 'all' || (p.tags && p.tags.includes(crmFilterTag));

      return matchesSearch && matchesTag;
    });

    if (filtered.length === 0) {
      return (
        <div className="text-center py-6 text-slate-500 italic text-xs">
          No matches found for "{crmSearch}".
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
        {filtered.map((p, idx) => {
          const isSelected = selectedCrmEmail.toLowerCase() === p.email.toLowerCase();
          return (
            <div
              key={idx}
              onClick={() => setSelectedCrmEmail(p.email)}
              className={`w-full p-3 rounded-xl text-left text-xs transition-all flex flex-col gap-1.5 border cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex justify-between items-start gap-1">
                <span className="font-extrabold truncate w-[80%]">{p.name}</span>
                <span className="text-[9px] font-mono opacity-60">ID: {idx + 1}</span>
              </div>
              <span className="opacity-80 truncate text-[10px]">{p.email}</span>
              {p.phone && <span className="opacity-70 text-[9px]">📞 {p.phone}</span>}
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {p.tags.slice(0, 3).map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isSelected
                          ? 'bg-emerald-700 text-white border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-750'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                  {p.tags.length > 3 && (
                    <span className="text-[7px] font-bold opacity-60 px-1 py-0.5">+ {p.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper: Render Detail Panel
  const renderCrmDetailPanel = () => {
    const profile = crmProfiles.find((x) => x.email.toLowerCase() === selectedCrmEmail.toLowerCase());
    if (!profile) return null;

    const customerBookings = bookings.filter((b) => b.customerEmail.toLowerCase() === profile.email.toLowerCase());
    const totalSpent = customerBookings.reduce((sum, b) => sum + (b.totalAmountUSD || 0), 0);

    return (
      <div className="space-y-6 text-xs md:text-sm animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800/50 pb-4">
          <div>
            <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              VIP GUEST PROFILE CARD
            </span>
            <h4 className="text-base md:text-lg font-black text-slate-100 mt-2">{profile.name}</h4>
            <p className="text-slate-400 text-xs mt-1">
              {profile.email} {profile.phone ? `| Phone: ${profile.phone}` : ''}
            </p>
            {profile.nationality && (
              <p className="text-slate-500 text-[10px] mt-0.5">
                Country of Origin: <span className="text-slate-300 font-bold">{profile.nationality}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleOpenEditCrm(profile)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
            >
              <Edit2 className="w-3 h-3" />
              <span>EDIT PROFILE</span>
            </button>
            <button
              type="button"
              onClick={() => handleDeleteCrmProfile(profile.email)}
              className="bg-rose-500/10 hover:bg-rose-650 border border-rose-500/20 text-rose-400 hover:text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
            >
              <Trash2 className="w-3 h-3" />
              <span>DELETE</span>
            </button>
          </div>
        </div>

        {/* CRM specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">LTV INVESTMENT VALUE</span>
            <span className="text-emerald-400 text-xs sm:text-sm font-black mt-0.5 block">
              {formatLocalPrice(profile.totalSpentUSD || totalSpent || 0)}
            </span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">EXCURSIONS BOOKED</span>
            <span className="text-slate-200 text-xs sm:text-sm font-black mt-0.5 block">{customerBookings.length} bookings</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">PREFERRED LANGUAGE</span>
            <span className="text-slate-200 text-xs sm:text-sm font-black mt-0.5 block capitalize">
              {profile.language === 'ar' ? 'Arabic' : profile.language}
            </span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">LOYALTY TIER</span>
            <span className="text-amber-400 text-xs sm:text-sm font-black mt-0.5 block uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{customerBookings.length >= 3 ? '👑 PLATINUM' : customerBookings.length >= 1 ? '🥇 GOLD' : '🥈 SILVER'}</span>
            </span>
          </div>
        </div>

        {/* CRM Tags */}
        <div className="space-y-1.5">
          <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">CRM SEGMENT FLAGS:</span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {profile.tags && profile.tags.length > 0 ? (
              profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-850 border border-slate-750 text-slate-300 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-600 italic">No tags associated.</span>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
          <span className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider block">Special Concierge Butler Notes</span>
          <p className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed font-medium italic">
            {profile.notes || 'No premium notes registered for this VIP guest.'}
          </p>
        </div>

        {/* Communications log */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
          {/* WhatsApp history */}
          <div className="space-y-3">
            <label className="block text-[10px] uppercase text-emerald-400 font-extrabold tracking-wider">
              Simulated WhatsApp Notification Logs
            </label>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 max-h-[140px] overflow-y-auto space-y-2">
              {profile.whatsappHistory && profile.whatsappHistory.length > 0 ? (
                profile.whatsappHistory.map((w, idx) => (
                  <div key={idx} className="bg-emerald-950/20 border border-emerald-500/10 p-2 rounded-lg text-[10px] space-y-1">
                    <p className="text-emerald-200 leading-relaxed font-medium">{w.message}</p>
                    <div className="flex justify-between text-[8px] text-slate-500">
                      <span>Sender: {w.sender || 'System'}</span>
                      <span>{new Date(w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-600 italic py-4 text-center">No WhatsApp alerts logged.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={crmWhatsappInput}
                onChange={(e) => setCrmWhatsappInput(e.target.value)}
                placeholder="Broadcast instant WhatsApp message..."
                className="bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-white text-xs flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendCrmWhatsapp(profile.email)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 rounded-lg cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Support chats */}
          <div className="space-y-3">
            <label className="block text-[10px] uppercase text-amber-400 font-extrabold tracking-wider">
              Butler Concierge Support Chats
            </label>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 max-h-[140px] overflow-y-auto space-y-2">
              {profile.supportHistory && profile.supportHistory.length > 0 ? (
                profile.supportHistory.map((s, idx) => (
                  <div key={idx} className="bg-amber-950/10 border border-amber-500/10 p-2 rounded-lg text-[10px] space-y-1">
                    <p className="text-amber-200 leading-relaxed font-medium">{s.message}</p>
                    <div className="flex justify-between text-[8px] text-slate-500">
                      <span>By: {s.sender === 'customer' ? 'Customer' : 'Support Butler'}</span>
                      <span>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-600 italic py-4 text-center">No support chat logs registered.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={crmSupportInput}
                onChange={(e) => setCrmSupportInput(e.target.value)}
                placeholder="Publish Support response..."
                className="bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-white text-xs flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendCrmSupport(profile.email)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 rounded-lg cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Email history & print-ready pdf */}
        <div className="pt-4 border-t border-slate-800/50 space-y-3">
          <label className="block text-[10px] uppercase text-sky-400 font-extrabold tracking-wider">
            Automated Formal Email Dispatch Ledger & Print-Ready PDF Itineraries
          </label>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
            {profile.emailHistory && profile.emailHistory.length > 0 ? (
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {profile.emailHistory.map((em, emIdx) => {
                  const bookingIdMatch = em.subject.match(/\[(RES-\d+)\]/);
                  const bId = bookingIdMatch ? bookingIdMatch[1] : customerBookings[0]?.id || '';
                  return (
                    <div
                      key={em.id || emIdx}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs space-y-2 animate-fade-in"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <p className="text-slate-300 font-extrabold">{em.subject}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Sent: {new Date(em.timestamp).toLocaleString()}</p>
                        </div>
                        {bId && (
                          <a
                            href={`/api/bookings/${bId}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-sky-600 hover:bg-sky-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow"
                          >
                            <FileText className="w-3 h-3" />
                            <span>VIEW / PRINT PDF</span>
                          </a>
                        )}
                      </div>
                      <p className="text-slate-400 text-[10px] leading-relaxed whitespace-pre-wrap font-mono select-all bg-slate-950/40 p-2 rounded border border-slate-850/50">
                        {em.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 italic text-xs space-y-2">
                <Mail className="w-8 h-8 text-slate-700 mx-auto" />
                <p>No automated email dispatches recorded for this VIP guest.</p>
                {customerBookings.length > 0 && (
                  <div className="pt-1">
                    <a
                      href={`/api/bookings/${customerBookings[0].id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/20 text-[9px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Curate & View Official Itinerary Document</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs md:text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-black uppercase text-slate-400 tracking-wider">Enterprise CRM Guest Directory</h4>
          <p className="text-[10px] text-slate-500 font-medium">
            Create, edit, audit, and dispatch custom notifications to high-net-worth VIP guest profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateCrm}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add VIP Guest Profile</span>
        </button>
      </div>

      {/* Bulk WhatsApp Blast Module */}
      <div className="bg-gradient-to-r from-emerald-950/20 to-slate-900/40 border border-emerald-500/15 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
              <MessageSquare className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h5 className="text-xs font-black uppercase text-slate-300 tracking-wider">Bulk WhatsApp Blast Campaign Tool</h5>
              <p className="text-[10px] text-slate-500 font-medium">
                Broadcast customized promotional templates directly to high-value customer segments instantly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsBulkBlastOpen(!isBulkBlastOpen);
              if (!bulkBlastText) {
                setBulkBlastText(
                  '👑 *MAS Exclusive Luxury Upgrade* | Dear *{customer_name}*,\n\nWe are delighted to offer a limited-time 20% elite chauffeur upgrade. Connect with your butler team today!'
                );
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 text-[10px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isBulkBlastOpen ? 'COLLAPSE CONSOLE' : 'LAUNCH CAMPAIGN BLAST'}
          </button>
        </div>

        {isBulkBlastOpen && (
          <form
            onSubmit={handleSendBulkBlast}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-slate-800/60 animate-fade-in"
          >
            {/* Segment */}
            <div className="md:col-span-3 space-y-2">
              <label className="block text-[9px] uppercase text-slate-400 font-bold tracking-wider">Target Audience Segment</label>
              <select
                value={bulkBlastSegment}
                onChange={(e) => setBulkBlastSegment(e.target.value)}
                className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none cursor-pointer"
              >
                <option value="all">👑 All Registered Guests ({crmProfiles.length})</option>
                {uniqueTags.map((tag) => {
                  const count = crmProfiles.filter((p) => p.tags && p.tags.includes(tag)).length;
                  return (
                    <option key={tag} value={tag}>
                      🏷️ Segment: {tag} ({count})
                    </option>
                  );
                })}
              </select>
              <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-850">
                <span className="block text-[8px] text-slate-500 font-extrabold uppercase">Segment Description</span>
                <span className="text-[9.5px] text-slate-400 leading-relaxed font-medium">
                  {bulkBlastSegment === 'all'
                    ? 'Sends to every guest listed in the database directory.'
                    : `Restricted to guests matching the custom tag "${bulkBlastSegment}".`}
                </span>
              </div>
            </div>

            {/* Template Select */}
            <div className="md:col-span-4 space-y-2">
              <label className="block text-[9px] uppercase text-slate-400 font-bold tracking-wider">Select Promotional Template</label>
              <select
                value={bulkBlastTemplateId}
                onChange={(e) => {
                  const tplId = e.target.value;
                  setBulkBlastTemplateId(tplId);
                  if (tplId === 'custom') {
                    setBulkBlastText(
                      '👑 *MAS Exclusive Luxury Upgrade* | Dear *{customer_name}*,\n\nWe are delighted to offer a limited-time 20% elite chauffeur upgrade. Connect with your butler team today!'
                    );
                  } else if (tplId === 'summer') {
                    setBulkBlastText(
                      '☀️ *MAS Egyptian Summer Soirée* | Dear *{customer_name}*,\n\nExperience ancient Cairo in royal seclusion. Book any VIP Expedition this week and receive a complimentary private luxury sunset yacht sail with gourmet caviar.\n\nReply directly to unlock with your Personal Butler.'
                    );
                  } else if (tplId === 'helicopter') {
                    setBulkBlastText(
                      '🚁 *MAS Royal Helicopter Sky-Tour* | Dear *{customer_name}*,\n\nBypass all highway congestion. Fly directly over the Great Pyramids Plateau in our twin-engine chopper.\n\nBook your royal flight transfer and get 15% off standard rates: {booking_id}'
                    );
                  } else if (tplId === 'loyal') {
                    setBulkBlastText(
                      '👑 *MAS Loyalty Sovereign Suite* | Dear *{customer_name}*,\n\nThank you for being an elite Gold/Platinum guest. Your total investment is *{customer_phone}*. We have unlocked special front-row Sphinx access clearance for you.\n\nReply to claim your Sovereign pass.'
                    );
                  }
                }}
                className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none cursor-pointer"
              >
                <option value="custom">✨ Custom Campaign Broadcast</option>
                <option value="summer">☀️ Cairo Summer Soirée Upgrade Template</option>
                <option value="helicopter">🚁 Giza Pyramids Heli-Tour Dispatch Template</option>
                <option value="loyal">👑 High-End Loyalty Sovereign Upgrade Template</option>
              </select>

              <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-850 space-y-1">
                <span className="block text-[8px] text-slate-500 font-extrabold uppercase">Dynamic Placeholder Legend</span>
                <p className="text-[8.5px] text-slate-400 leading-normal font-mono">
                  <b className="text-emerald-400">{`{customer_name}`}</b>, <b className="text-emerald-400">{`{customer_email}`}</b>,{' '}
                  <b className="text-emerald-400">{`{booking_id}`}</b>, <b className="text-emerald-400">{`{tour_name}`}</b>,{' '}
                  <b className="text-emerald-400">{`{date}`}</b>, <b className="text-emerald-400">{`{pickup_hotel}`}</b>,{' '}
                  <b className="text-emerald-400">{`{qr_code}`}</b>
                </p>
              </div>
            </div>

            {/* Broadcast Message Body */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-[9px] uppercase text-slate-400 font-bold tracking-wider">Promotional Broadcast Message</label>
              <textarea
                rows={4}
                value={bulkBlastText}
                onChange={(e) => setBulkBlastText(e.target.value)}
                placeholder="Compose your high-value promotional broadcast message..."
                className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-xl px-3 py-2 w-full focus:outline-none h-[110px] resize-none leading-relaxed font-mono"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isBlasting}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black text-[10px] py-2 px-6 rounded-lg transition-all shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                >
                  {isBlasting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>BROADCASTING...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>DISPATCH BULK BLAST CAMPAIGN</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CRM list */}
        <div className="md:col-span-1 bg-slate-800/20 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-[9px] uppercase text-slate-500 font-black tracking-wider">Search & Filter Ledger</label>
            <input
              type="text"
              value={crmSearch}
              onChange={(e) => setCrmSearch(e.target.value)}
              placeholder="Search by name, email, or nationality..."
              className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs w-full focus:outline-none"
            />

            <div className="flex items-center gap-2">
              <span className="text-[8px] text-slate-500 uppercase font-bold">Tag Filter:</span>
              <select
                value={crmFilterTag}
                onChange={(e) => setCrmFilterTag(e.target.value)}
                className="bg-slate-900 border border-slate-750 text-slate-300 text-[10px] rounded-lg px-2 py-1 flex-1 focus:outline-none cursor-pointer"
              >
                <option value="all">All Segment Tags</option>
                {uniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-2">
            {crmProfiles.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No profiles registered.</p>
            ) : (
              renderCrmProfilesList()
            )}
          </div>
        </div>

        {/* Selected CRM communications panel */}
        <div className="md:col-span-2 bg-slate-800/10 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
          {selectedCrmEmail ? (
            renderCrmDetailPanel()
          ) : (
            <div className="text-center py-24 text-slate-500 italic text-xs space-y-2">
              <Users className="w-10 h-10 text-slate-700 mx-auto" />
              <p>
                Select an elite guest profile on the left ledger to audit real-time WhatsApp histories, concierge notes, segments, and
                edit files.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit CRM Profile Modal */}
      {isCrmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider">
              {crmModalMode === 'create' ? 'Create VIP Guest Profile' : 'Edit VIP Guest Profile'}
            </h3>
            <form onSubmit={handleSaveCrmProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Address (Key ID)</label>
                  <input
                    required
                    disabled={crmModalMode === 'edit'}
                    type="email"
                    value={crmFormEmail}
                    onChange={(e) => setCrmFormEmail(e.target.value)}
                    placeholder="guest@domain.com"
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={crmFormName}
                    onChange={(e) => setCrmFormName(e.target.value)}
                    placeholder="Lord/Lady Guest Name"
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={crmFormPhone}
                    onChange={(e) => setCrmFormPhone(e.target.value)}
                    placeholder="+1 555-555-5555"
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nationality</label>
                  <input
                    type="text"
                    value={crmFormNationality}
                    onChange={(e) => setCrmFormNationality(e.target.value)}
                    placeholder="e.g. United Kingdom"
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Preferred Language</label>
                  <select
                    value={crmFormLanguage}
                    onChange={(e) => setCrmFormLanguage(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Segment Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={crmFormTagsString}
                    onChange={(e) => setCrmFormTagsString(e.target.value)}
                    placeholder="e.g. VIP, High Spender, Royal, Repeat Guest"
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Special Concierge Butler Notes</label>
                <textarea
                  value={crmFormNotes}
                  onChange={(e) => setCrmFormNotes(e.target.value)}
                  placeholder="Preferences, allergy logs, security clearances..."
                  rows={3}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCrmModalOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
