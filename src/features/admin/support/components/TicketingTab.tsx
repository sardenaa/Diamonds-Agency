import React, { useState } from 'react';
import { MessageSquare, Bot, Send, Plus, Edit2, ShieldCheck } from 'lucide-react';
import { AppLanguage, Booking, SupportTicket, WhatsAppTemplate } from '../../../types.js';

interface TicketingTabProps {
  lang: AppLanguage;
  tickets: SupportTicket[];
  selectedTicketId: string | null;
  setSelectedTicketId: (val: string | null) => void;
  adminTicketReply: string;
  setAdminTicketReply: (val: string) => void;
  handleUpdateTicketStatus: (id: string, status: 'open' | 'in_progress' | 'resolved') => void;
  handleDeleteTicket: (id: string) => void;
  aiDraftingReply: boolean;
  handleGenerateAiTicketReply: (id: string) => void;
  handleSendTicketReply: (id: string) => void;
  newTicketEmail: string;
  setNewTicketEmail: (val: string) => void;
  newTicketName: string;
  setNewTicketName: (val: string) => void;
  newTicketSubject: string;
  setNewTicketSubject: (val: string) => void;
  newTicketCategory: string;
  setNewTicketCategory: (val: string) => void;
  newTicketPriority: 'low' | 'medium' | 'high' | 'royal';
  setNewTicketPriority: (val: 'low' | 'medium' | 'high' | 'royal') => void;
  newTicketMessage: string;
  setNewTicketMessage: (val: string) => void;
  handleCreateTicket: (e: React.FormEvent) => void;
  bookings: Booking[];
  whatsappTemplates: WhatsAppTemplate[];
  editingTemplateId: string | null;
  setEditingTemplateId: (val: string | null) => void;
  editingTemplateText: string;
  setEditingTemplateText: (val: string) => void;
  handleToggleTemplate: (id: string, active: boolean) => void;
  handleSaveTemplate: (id: string, text: string) => void;
}

export default function TicketingTab({
  lang,
  tickets,
  selectedTicketId,
  setSelectedTicketId,
  adminTicketReply,
  setAdminTicketReply,
  handleUpdateTicketStatus,
  handleDeleteTicket,
  aiDraftingReply,
  handleGenerateAiTicketReply,
  handleSendTicketReply,
  newTicketEmail,
  setNewTicketEmail,
  newTicketName,
  setNewTicketName,
  newTicketSubject,
  setNewTicketSubject,
  newTicketCategory,
  setNewTicketCategory,
  newTicketPriority,
  setNewTicketPriority,
  newTicketMessage,
  setNewTicketMessage,
  handleCreateTicket,
  bookings,
  whatsappTemplates,
  editingTemplateId,
  setEditingTemplateId,
  editingTemplateText,
  setEditingTemplateText,
  handleToggleTemplate,
  handleSaveTemplate,
}: TicketingTabProps) {
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  return (
    <div className="space-y-6 animate-fade-in text-xs md:text-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="text-sm font-black uppercase text-slate-400 tracking-wider">
            🎫 Concierge Support Ticketing & WhatsApp Automation
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Manage incoming traveler inquiries, generate AI-powered responses via Gemini, and customize auto-dispatch WhatsApp alert
            templates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columns 1 & 2: Tickets Queue & Message Room */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter & Tickets List */}
          <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-slate-200">Support Tickets Queue</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                  {tickets.length} Active
                </span>
              </div>
              <div className="flex gap-1.5">
                {(['all', 'open', 'in_progress', 'resolved'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTicketStatusFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      ticketStatusFilter === f
                        ? 'bg-emerald-600 border-emerald-500 text-white font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.toUpperCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
              {tickets
                .filter((t) => ticketStatusFilter === 'all' || t.status === ticketStatusFilter)
                .map((t) => {
                  const isSelected = selectedTicketId === t.id;
                  const priorityColor =
                    t.priority === 'royal'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : t.priority === 'high'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : t.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-700/30 text-slate-400 border-slate-700/50';

                  const statusColor =
                    t.status === 'open'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : t.status === 'in_progress'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-slate-800 text-slate-500 border-slate-700';

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setAdminTicketReply('');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left ${
                        isSelected ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-500/5' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono text-[9px] text-slate-400 font-extrabold">{t.id}</span>
                          <div className="flex gap-1">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${priorityColor}`}>
                              {t.priority}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${statusColor}`}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <h5 className="font-bold text-slate-200 mt-1 truncate">{t.subject}</h5>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-800/50 pt-1.5 mt-1">
                        <span className="truncate max-w-[100px] font-medium">{t.customerName}</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              {tickets.length === 0 && (
                <p className="text-xs text-slate-500 italic py-4 col-span-2 text-center">No tickets in this filter.</p>
              )}
            </div>
          </div>

          {/* Message Room inside Selected Ticket */}
          {selectedTicketId ? (
            (() => {
              const ticket = tickets.find((t) => t.id === selectedTicketId);
              if (!ticket) return null;
              return (
                <div className="bg-slate-800/10 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fade-in">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[8px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {ticket.category} Ticket Room
                      </span>
                      <h4 className="text-base font-black text-slate-200 mt-1">{ticket.subject}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Guest: {ticket.customerName} ({ticket.customerEmail})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="bg-rose-950/20 hover:bg-rose-655/20 border border-rose-500/30 text-rose-400 font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-all uppercase"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Messages Timeline */}
                  <div className="space-y-3 max-h-[220px] overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-slate-900/50">
                    {ticket.messages.map((m, idx) => {
                      const isUser = m.sender === 'customer';
                      const isAi = m.sender === 'ai';
                      return (
                        <div key={idx} className={`flex flex-col max-w-[85%] ${isUser ? 'mr-auto' : 'ml-auto items-end'}`}>
                          <span className="text-[8px] text-slate-500 font-bold mb-0.5 px-1 uppercase flex items-center gap-1">
                            {isUser ? ticket.customerName : isAi ? '👑 AI Travel Assistant' : '💼 Support Agent'}
                            <span>
                              • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                          <div
                            className={`p-3 rounded-2xl text-[11px] leading-relaxed border ${
                              isUser
                                ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'
                                : isAi
                                ? 'bg-purple-950/20 border-purple-500/20 text-purple-200 rounded-tr-none'
                                : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-200 rounded-tr-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ticket Reply Controls */}
                  <div className="space-y-3">
                    <textarea
                      value={adminTicketReply}
                      onChange={(e) => setAdminTicketReply(e.target.value)}
                      placeholder="Type a premium support response..."
                      rows={3}
                      className="bg-slate-900 border border-slate-755 rounded-xl p-3 text-white text-xs w-full focus:outline-none focus:border-emerald-500 resize-none font-sans"
                    />
                    <div className="flex justify-between items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateAiTicketReply(ticket.id)}
                        disabled={aiDraftingReply}
                        className="bg-purple-600/10 hover:bg-purple-600 border border-purple-500/20 text-purple-300 hover:text-white font-extrabold text-[10px] uppercase py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Bot className={`w-3.5 h-3.5 ${aiDraftingReply ? 'animate-bounce' : ''}`} />
                        <span>{aiDraftingReply ? 'Consulting Gemini...' : '👑 Generate AI Response'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendTicketReply(ticket.id)}
                        disabled={!adminTicketReply.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase py-2 px-5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Response</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-slate-850/25 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 italic text-xs">
              Select an active support ticket in the queue above to open the AI Support Room, generate butler recommendations, and
              complete resolution workflows.
            </div>
          )}

          {/* Manual Ticket Creation Form */}
          <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Make a Support Ticket
            </h4>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] uppercase text-slate-500 font-bold mb-1">Guest Email</label>
                  <select
                    value={newTicketEmail}
                    onChange={(e) => {
                      setNewTicketEmail(e.target.value);
                      const b = bookings.find((x) => x.customerEmail === e.target.value);
                      if (b) setNewTicketName(b.customerName);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none cursor-pointer font-bold"
                  >
                    {bookings.map((b, idx) => (
                      <option key={idx} value={b.customerEmail}>
                        {b.customerEmail}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-slate-500 font-bold mb-1">Ticket Subject</label>
                  <input
                    required
                    type="text"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    placeholder="e.g. Verify catering requirements"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase text-slate-500 font-bold mb-1">Category</label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-[10px] w-full focus:outline-none cursor-pointer"
                    >
                      <option value="Chauffeur">Chauffeur</option>
                      <option value="Itinerary">Itinerary</option>
                      <option value="Payment">Payment</option>
                      <option value="Dietary">Dietary</option>
                      <option value="Special Request">Special Request</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-slate-500 font-bold mb-1">Priority</label>
                    <select
                      value={newTicketPriority}
                      onChange={(e) => setNewTicketPriority(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-[10px] w-full focus:outline-none cursor-pointer font-bold text-amber-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="royal">👑 Royal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase text-slate-500 font-bold mb-1">Guest Initial Query</label>
                <textarea
                  required
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  placeholder="What did the customer request or report?"
                  rows={2}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase py-2.5 px-6 rounded-lg shadow cursor-pointer transition-all"
                >
                  Open Active Ticket
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Column 3: WhatsApp Automation templates */}
        <div className="space-y-6">
          <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <h4 className="font-extrabold text-slate-200 uppercase tracking-wider text-xs">WhatsApp Automation Rules</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Customise text templates for transactional WhatsApp push updates. Changes update live in our simulated notifications
              database.
            </p>

            <div className="space-y-4">
              {whatsappTemplates.map((tpl) => {
                const isEditing = editingTemplateId === tpl.id;
                return (
                  <div key={tpl.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-200">{tpl.name}</span>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tpl.active}
                            onChange={(e) => handleToggleTemplate(tpl.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white" />
                        </label>
                        <span className={`text-[8px] uppercase font-black ${tpl.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {tpl.active ? 'Active' : 'Muted'}
                        </span>
                      </div>
                    </div>

                    <span className="inline-block text-[8px] font-mono bg-slate-850 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      Trigger: {tpl.triggerEvent}
                    </span>

                    {isEditing ? (
                      <div className="space-y-2 pt-1.5">
                        <textarea
                          value={editingTemplateText}
                          onChange={(e) => setEditingTemplateText(e.target.value)}
                          rows={4}
                          className="bg-slate-950 border border-slate-700 text-slate-200 p-2.5 rounded-lg text-[10px] w-full focus:outline-none font-mono resize-none leading-relaxed"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingTemplateId(null)}
                            className="text-[9px] font-bold bg-slate-850 border border-slate-800 hover:bg-slate-800 px-2 py-1 rounded text-slate-400 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveTemplate(tpl.id, editingTemplateText)}
                            className="text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/50 text-[10px] font-medium text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {tpl.templateText}
                      </div>
                    )}

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTemplateId(tpl.id);
                          setEditingTemplateText(tpl.templateText);
                        }}
                        className="text-[9px] font-bold text-amber-400 hover:text-amber-500 flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Template Rules</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Template Variable Guide */}
          <div className="bg-slate-800/10 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-300 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Placeholder Injection Keys
            </div>
            <ul className="space-y-1 font-mono text-[9px] text-slate-500 list-disc list-inside">
              <li>
                <strong className="text-slate-400">{'{customer_name}'}</strong> - Guest's Full Name
              </li>
              <li>
                <strong className="text-slate-400">{'{booking_id}'}</strong> - Excursion Reservation Code
              </li>
              <li>
                <strong className="text-slate-400">{'{tour_name}'}</strong> - Tour Name
              </li>
              <li>
                <strong className="text-slate-400">{'{date}'}</strong> - Booking departure Date
              </li>
              <li>
                <strong className="text-slate-400">{'{pickup_hotel}'}</strong> - Pickup hotel
              </li>
              <li>
                <strong className="text-slate-400">{'{qr_code}'}</strong> - Security voucher QR payload
              </li>
              <li>
                <strong className="text-slate-400">{'{driver_name}'}</strong> - Dedicated chauffeur
              </li>
              <li>
                <strong className="text-slate-400">{'{guide_name}'}</strong> - Egyptologist scholar
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
