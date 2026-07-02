import React, { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, ShieldAlert, Sparkles, Plus, Trash2, Edit2, RotateCcw, Send, Calendar, CheckCircle2, DollarSign, Award, RefreshCw, Layers, Ticket, MessageSquare, Bot, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Tour, Booking, CustomerCRM, AuditLog, CurrencyConfig, SupportTicket, WhatsAppTemplate } from '../types.js';
import { translations } from '../translations.js';

interface AdminDashboardProps {
  lang: 'en' | 'ar';
  currency: string;
  currencies: CurrencyConfig[];
  onRefreshAll: () => void;
}

export default function AdminDashboard({
  lang,
  currency,
  currencies,
  onRefreshAll
}: AdminDashboardProps) {
  const t = translations[lang];
  const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const [activeTab, setActiveTab] = useState<'analytics' | 'operations' | 'crm' | 'cms' | 'logs' | 'ai' | 'ticketing'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Support Ticketing & WhatsApp Automation states
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [adminTicketReply, setAdminTicketReply] = useState('');
  const [aiDraftingReply, setAiDraftingReply] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  
  // Ticket Creator fields
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<'Chauffeur' | 'Itinerary' | 'Payment' | 'Dietary' | 'Special Request' | 'Other'>('Other');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high' | 'royal'>('medium');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketEmail, setNewTicketEmail] = useState('diamond.entertainment70@gmail.com');
  const [newTicketName, setNewTicketName] = useState('Diamond Entertainment');

  // WhatsApp Automation rule fields
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateText, setEditingTemplateText] = useState('');

  // CRM manual triggers
  const [selectedCrmEmail, setSelectedCrmEmail] = useState('');
  const [crmWhatsappInput, setCrmWhatsappInput] = useState('');
  const [crmSupportInput, setCrmSupportInput] = useState('');

  // CMS new tour creation state
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [newTourTitleEn, setNewTourTitleEn] = useState('');
  const [newTourTitleAr, setNewTourTitleAr] = useState('');
  const [newTourDescriptionEn, setNewTourDescriptionEn] = useState('');
  const [newTourDescriptionAr, setNewTourDescriptionAr] = useState('');
  const [newTourCategory, setNewTourCategory] = useState('Historical Tours');
  const [newTourDestination, setNewTourDestination] = useState('Cairo');
  const [newTourPrice, setNewTourPrice] = useState(300);
  const [newTourDuration, setNewTourDuration] = useState('Full Day');
  const [newTourCapacity, setNewTourCapacity] = useState(8);

  // AI assistant state
  const [aiType, setAiType] = useState('Tour Description');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const analyticRes = await fetch('/api/analytics');
      const analyticData = await analyticRes.json();
      setAnalytics(analyticData);

      const toursRes = await fetch('/api/tours');
      const toursData = await toursRes.json();
      setTours(toursData);

      const bookingsRes = await fetch('/api/bookings');
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);

      const ticketsRes = await fetch('/api/tickets');
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData);

      const templatesRes = await fetch('/api/whatsapp-templates');
      const templatesData = await templatesRes.json();
      setWhatsappTemplates(templatesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Convert USD to local currency
  const toLocalPrice = (usdPrice: number) => {
    return parseFloat((usdPrice * activeCurrency.rateToUSD).toFixed(2));
  };

  const formatLocalPrice = (usdPrice: number) => {
    const price = toLocalPrice(usdPrice);
    return lang === 'ar' 
      ? `${price} ${activeCurrency.symbol}`
      : `${activeCurrency.symbol}${price}`;
  };

  // Operations: update booking status / drivers
  const handleUpdateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchAdminData();
        onRefreshAll();
        alert(t.actionSuccessful);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Operations: trigger instant refund
  const handleTriggerRefund = async (id: string) => {
    if (!confirm('Are you absolutely certain you want to authorize this instant refund transaction? This updates CRM histories.')) return;
    try {
      const res = await fetch(`/api/bookings/${id}/refund`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchAdminData();
        onRefreshAll();
        alert('Instant refund successfully authorized.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRM: Send manual WhatsApp message
  const handleSendCrmWhatsapp = async (email: string) => {
    if (!crmWhatsappInput.trim()) return;
    try {
      const res = await fetch(`/api/crm/${email}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: crmWhatsappInput })
      });
      if (res.ok) {
        setCrmWhatsappInput('');
        fetchAdminData();
        alert('Verified WhatsApp message dispatched successfully.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRM: Send manual support chat response
  const handleSendCrmSupport = async (email: string) => {
    if (!crmSupportInput.trim()) return;
    try {
      const res = await fetch(`/api/crm/${email}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: crmSupportInput })
      });
      if (res.ok) {
        setCrmSupportInput('');
        fetchAdminData();
        alert('Support Butler response published.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CMS: create or update tour
  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourTitleEn || !newTourTitleAr) return;

    const descEn = newTourDescriptionEn || `Experience a premium expedition to ${newTourDestination}. Includes elite Mercedes transportation, dedicated private expert guides and luxury amenities.`;
    const descAr = newTourDescriptionAr || `استمتع برحلة استكشافية ممتازة إلى ${newTourDestination}. تشمل النقل الفاخر بمرسيدس، مرشدين خبراء مخصصين ووسائل الراحة الراقية.`;

    const bodyData = {
      title: { en: newTourTitleEn, ar: newTourTitleAr },
      description: { en: descEn, ar: descAr },
      category: newTourCategory,
      destination: newTourDestination,
      priceUSD: newTourPrice,
      duration: newTourDuration,
      capacity: newTourCapacity,
      availableDates: ['2026-07-05', '2026-07-06', '2026-07-07'],
      images: ['https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200'],
      itinerary: [
        { day: 1, title: { en: 'Reception & Hotel Pickup', ar: 'الاستقبال والاصطحاب من الفندق' }, description: { en: 'Chauffeur arrival in Mercedes V-Class.', ar: 'الوصول بالمرسيدس V-Class.' } }
      ],
      faqs: [],
      pickupZones: ['All Luxury Hotels'],
      hotels: ['Marriott Mena House', 'Four Seasons Resort'],
      extras: [
        { id: 'ext-99', name: { en: 'Professional Photographer Companion', ar: 'مصور محترف مرافق' }, priceUSD: 100 }
      ]
    };

    try {
      if (editingTourId) {
        // Update existing
        const res = await fetch(`/api/tours/${editingTourId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
        if (res.ok) {
          setEditingTourId(null);
          setNewTourTitleEn('');
          setNewTourTitleAr('');
          setNewTourDescriptionEn('');
          setNewTourDescriptionAr('');
          fetchAdminData();
          onRefreshAll();
          alert('Luxury excursion successfully updated in CMS.');
        }
      } else {
        // Create new
        const res = await fetch('/api/tours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
        if (res.ok) {
          setNewTourTitleEn('');
          setNewTourTitleAr('');
          setNewTourDescriptionEn('');
          setNewTourDescriptionAr('');
          fetchAdminData();
          onRefreshAll();
          alert('Luxury excursion successfully cataloged in CMS.');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditTourClick = (tour: Tour) => {
    setEditingTourId(tour.id);
    setNewTourTitleEn(tour.title.en);
    setNewTourTitleAr(tour.title.ar);
    setNewTourDescriptionEn(tour.description.en || '');
    setNewTourDescriptionAr(tour.description.ar || '');
    setNewTourCategory(tour.category);
    setNewTourDestination(tour.destination);
    setNewTourPrice(tour.priceUSD);
    setNewTourDuration(tour.duration || 'Full Day');
    setNewTourCapacity(tour.capacity || 8);
  };

  const handleCancelEdit = () => {
    setEditingTourId(null);
    setNewTourTitleEn('');
    setNewTourTitleAr('');
    setNewTourDescriptionEn('');
    setNewTourDescriptionAr('');
    setNewTourCategory('Historical Tours');
    setNewTourDestination('Cairo');
    setNewTourPrice(300);
    setNewTourDuration('Full Day');
    setNewTourCapacity(8);
  };

  // CMS: Delete a tour
  const handleDeleteTour = async (id: string) => {
    if (!confirm('Are you certain you wish to delete this excursion from the active catalog?')) return;
    try {
      const res = await fetch(`/api/tours/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
        onRefreshAll();
        alert('Excursion removed from active CMS.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI: Run generation
  const handleAiGenerate = async () => {
    if (!aiKeywords.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: aiType, keywords: aiKeywords })
      });
      const data = await res.json();
      setAiGeneratedContent(data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setAiGenerating(false);
    }
  };

  // Support Ticket reply
  const handleSendTicketReply = async (ticketId: string) => {
    if (!adminTicketReply.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'support', message: adminTicketReply })
      });
      if (res.ok) {
        setAdminTicketReply('');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Generate AI reply for ticket using Gemini
  const handleGenerateAiTicketReply = async (ticketId: string) => {
    setAiDraftingReply(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/ai-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.reply) {
        setAdminTicketReply(data.reply);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiDraftingReply(false);
    }
  };

  // Create manual support ticket from admin console
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: newTicketEmail,
          customerName: newTicketName,
          subject: newTicketSubject,
          category: newTicketCategory,
          priority: newTicketPriority,
          initialMessage: newTicketMessage
        })
      });
      if (res.ok) {
        setNewTicketSubject('');
        setNewTicketMessage('');
        fetchAdminData();
        alert('Support ticket cataloged successfully.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update ticket details (e.g. priority or status)
  const handleUpdateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update WhatsApp automation template
  const handleSaveTemplate = async (id: string, text: string) => {
    try {
      const res = await fetch(`/api/whatsapp-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateText: text })
      });
      if (res.ok) {
        setEditingTemplateId(null);
        fetchAdminData();
        alert('WhatsApp automation template updated.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle active status of template
  const handleToggleTemplate = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/whatsapp-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!analytics) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 max-w-md mx-auto">
        <RefreshCw className="w-10 h-10 text-slate-400 mx-auto mb-4 animate-spin" />
        <h4 className="font-bold text-slate-800 text-base">Loading Admin Dashboard...</h4>
        <p className="text-slate-400 text-xs md:text-sm">Retrieving bookings, CRM, and analytics...</p>
      </div>
    );
  }

  const { summary, revenueByTour, countriesData, driversData, guidesData } = analytics;

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl font-sans">
      
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">{t.brandName}</span>
            <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">ADMIN MODULE</span>
          </div>
          <h2 className="text-2xl font-black font-sans tracking-tight">Admin Dashboard</h2>
        </div>
        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* Main Grid: Tabs Sidebar + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="flex flex-col gap-2">
          {[
            { id: 'analytics', label: t.salesAnalytics, icon: BarChart3 },
            { id: 'operations', label: 'Operations Workflow', icon: Layers },
            { id: 'crm', label: t.crmSystem, icon: Users },
            { id: 'ticketing', label: '🎫 Tickets & WhatsApp', icon: Ticket },
            { id: 'cms', label: t.cmsManager, icon: BookOpen },
            { id: 'logs', label: t.auditLogs, icon: ShieldAlert },
            { id: 'ai', label: t.aiStudioConsole, icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl text-xs md:text-sm font-bold text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border-l-4 border-emerald-500 text-white font-black' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel Content */}
        <div className="lg:col-span-3 min-h-[450px]">
          
          {/* 1. Analytics tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Counters */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center">
                  <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">{t.revenue}</span>
                  <span className="text-sm md:text-base font-black font-sans text-white">{formatLocalPrice(summary.revenue)}</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center">
                  <DollarSign className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">{t.profit}</span>
                  <span className="text-sm md:text-base font-black font-sans text-white">{formatLocalPrice(summary.profit)}</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center">
                  <Layers className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">{t.bookings}</span>
                  <span className="text-sm md:text-base font-black font-sans text-white">{summary.bookingsCount}</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center">
                  <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">CRM Profiles</span>
                  <span className="text-sm md:text-base font-black font-sans text-white">{summary.customerCount}</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center col-span-2 md:col-span-1">
                  <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Quality Score</span>
                  <span className="text-sm md:text-base font-black font-sans text-white">{summary.averageRating}★</span>
                </div>
              </div>

              {/* Handcrafted Animated SVG Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chart 1: Revenue by Excursion */}
                <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Gross Revenue by Excursion (USD)</h4>
                  <div className="space-y-4">
                    {revenueByTour.map((t: any, idx: number) => {
                      const maxRevenue = Math.max(...revenueByTour.map((x: any) => x.revenue)) || 1000;
                      const percentage = (t.revenue / maxRevenue) * 100;
                      return (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between font-bold text-slate-300">
                            <span className="truncate max-w-[70%]">{t.name}</span>
                            <span>{formatLocalPrice(t.revenue)}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: Bookings by Nationality */}
                <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Traveler Demographics (CRM Nationality)</h4>
                  <div className="space-y-4">
                    {countriesData.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No nationality metrics logs generated.</p>
                    ) : (
                      countriesData.map((c: any, idx: number) => {
                        const maxCount = Math.max(...countriesData.map((x: any) => x.count)) || 1;
                        const percentage = (c.count / maxCount) * 100;
                        return (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-slate-300">
                              <span>{c.country}</span>
                              <span>{c.count} {lang === 'ar' ? 'حجوزات' : 'bookings'}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                              <div 
                                className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. Operations Workflow tab */}
          {activeTab === 'operations' && (
            <div className="space-y-6 animate-fade-in overflow-x-auto">
              <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-2">Live Excursion Ledger & Chauffeur Assignments</h4>
              
              <div className="bg-slate-800/20 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400 font-bold">
                      <th className="p-3 text-[10px] uppercase">{lang === 'ar' ? 'الرمز' : 'RESERVATION'}</th>
                      <th className="p-3 text-[10px] uppercase">{lang === 'ar' ? 'العميل' : 'CLIENT'}</th>
                      <th className="p-3 text-[10px] uppercase">{lang === 'ar' ? 'الرحلة والوقت' : 'EXCURSION & DATE'}</th>
                      <th className="p-3 text-[10px] uppercase">{lang === 'ar' ? 'تعيين طاقم الخدمة' : 'STAFF ASSIGNMENTS'}</th>
                      <th className="p-3 text-[10px] uppercase text-center">{lang === 'ar' ? 'الإجراءات السيادية' : 'SOVEREIGN CONTROLS'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/25">
                        <td className="p-3">
                          <span className="font-mono text-emerald-400 font-bold block">{b.id}</span>
                          <span className="text-[10px] text-slate-500">{b.paymentMethod}</span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-200">{b.customerName}</div>
                          <div className="text-[10px] text-slate-500">{b.customerEmail}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-200 font-semibold truncate max-w-[150px]">{lang === 'ar' ? b.tourTitle.ar : b.tourTitle.en}</div>
                          <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{b.date}</span>
                          </div>
                        </td>
                        <td className="p-3 space-y-2">
                          {/* Driver assign */}
                          <div>
                            <label className="block text-[8px] uppercase text-slate-500 font-bold">{t.driver}</label>
                            <input
                              type="text"
                              value={b.driverName || ''}
                              onChange={(e) => handleUpdateBooking(b.id, { driverName: e.target.value })}
                              placeholder="e.g. Sherif El Masry"
                              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none w-full"
                            />
                          </div>
                          {/* Guide assign */}
                          <div>
                            <label className="block text-[8px] uppercase text-slate-500 font-bold">{t.guide}</label>
                            <input
                              type="text"
                              value={b.guideName || ''}
                              onChange={(e) => handleUpdateBooking(b.id, { guideName: e.target.value })}
                              placeholder="e.g. Dr. Zahi"
                              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none w-full"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-center space-y-2">
                          <div className="flex gap-1 justify-center">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBooking(b.id, { status: e.target.value as any })}
                              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1 focus:outline-none cursor-pointer"
                            >
                              <option value="pending">{t.pending}</option>
                              <option value="confirmed">{t.confirmed}</option>
                              <option value="completed">{t.completed}</option>
                              <option value="cancelled">{t.cancelled}</option>
                            </select>
                          </div>
                          {b.status !== 'cancelled' && b.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleTriggerRefund(b.id)}
                              className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white font-bold text-[9px] w-full py-1.5 rounded-md transition-colors uppercase tracking-wider block cursor-pointer"
                            >
                              {t.refundBtn}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. CRM System tab */}
          {activeTab === 'crm' && (
            <div className="space-y-6 animate-fade-in">
              <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Enterprise CRM Guest Directory</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CRM Profiles List */}
                <div className="md:col-span-1 bg-slate-800/20 border border-slate-800 rounded-2xl p-4 space-y-3">
                  {analytics.summary.customerCount === 0 ? (
                    <p className="text-xs text-slate-500 italic">No profiles registered.</p>
                  ) : (
                    crmProfilesList(analytics.summary.customerCount)
                  )}
                </div>

                {/* Selected CRM communication ledger details */}
                <div className="md:col-span-2 bg-slate-800/10 border border-slate-800 rounded-2xl p-5 space-y-4">
                  {selectedCrmEmail ? (
                    crmDetailPanel()
                  ) : (
                    <div className="text-center py-20 text-slate-500 italic text-xs">
                      Select a guest profile on the left column to audit real-time WhatsApp histories, notes, tags, and support channels.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Support Tickets & WhatsApp Automation tab */}
          {activeTab === 'ticketing' && (
            <div className="space-y-6 animate-fade-in text-xs md:text-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-sm font-black uppercase text-slate-400 tracking-wider">🎫 Concierge Support Ticketing & WhatsApp Automation</h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Manage incoming traveler inquiries, generate AI-powered responses via Gemini, and customize auto-dispatch WhatsApp alert templates.</p>
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
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">{tickets.length} Active</span>
                      </div>
                      <div className="flex gap-1.5">
                        {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
                          <button
                            key={f}
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
                        .filter(t => ticketStatusFilter === 'all' || t.status === ticketStatusFilter)
                        .map(t => {
                          const isSelected = selectedTicketId === t.id;
                          const priorityColor = 
                            t.priority === 'royal' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            t.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-700/30 text-slate-400 border-slate-700/50';
                          
                          const statusColor = 
                            t.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            t.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-slate-800 text-slate-500 border-slate-700';

                          return (
                            <div 
                              key={t.id}
                              onClick={() => {
                                setSelectedTicketId(t.id);
                                setAdminTicketReply('');
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left ${
                                isSelected 
                                  ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-500/5' 
                                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-mono text-[9px] text-slate-400 font-extrabold">{t.id}</span>
                                  <div className="flex gap-1">
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${priorityColor}`}>{t.priority}</span>
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${statusColor}`}>{t.status.replace('_', ' ')}</span>
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
                  {selectedTicketId ? (() => {
                    const ticket = tickets.find(t => t.id === selectedTicketId);
                    if (!ticket) return null;
                    return (
                      <div className="bg-slate-800/10 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fade-in">
                        <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-[8px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{ticket.category} Ticket Room</span>
                            <h4 className="text-base font-black text-slate-200 mt-1">{ticket.subject}</h4>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Guest: {ticket.customerName} ({ticket.customerEmail})</p>
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
                          </div>
                        </div>

                        {/* Messages Timeline */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-slate-900/50">
                          {ticket.messages.map((m, idx) => {
                            const isUser = m.sender === 'customer';
                            const isAi = m.sender === 'ai';
                            return (
                              <div 
                                key={idx}
                                className={`flex flex-col max-w-[85%] ${isUser ? 'mr-auto' : 'ml-auto items-end'}`}
                              >
                                <span className="text-[8px] text-slate-500 font-bold mb-0.5 px-1 uppercase flex items-center gap-1">
                                  {isUser ? ticket.customerName : (isAi ? '👑 AI Travel Assistant' : '💼 Support Agent')}
                                  <span>• {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </span>
                                <div className={`p-3 rounded-2xl text-[11px] leading-relaxed border ${
                                  isUser 
                                    ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none' 
                                    : (isAi 
                                        ? 'bg-purple-950/20 border-purple-500/20 text-purple-200 rounded-tr-none' 
                                        : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-200 rounded-tr-none')
                                }`}>
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
                            className="bg-slate-900 border border-slate-750 rounded-xl p-3 text-white text-xs w-full focus:outline-none focus:border-emerald-500 resize-none font-sans"
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
                  })() : (
                    <div className="bg-slate-850/25 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 italic text-xs">
                      Select an active support ticket in the queue above to open the AI Support Room, generate butler recommendations, and complete resolution workflows.
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
                              const b = bookings.find(x => x.customerEmail === e.target.value);
                              if (b) setNewTicketName(b.customerName);
                            }}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none cursor-pointer font-bold"
                          >
                            {bookings.map((b, idx) => (
                              <option key={idx} value={b.customerEmail}>{b.customerEmail}</option>
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
                      Customise text templates for transactional WhatsApp push updates. Changes update live in our simulated notifications database.
                    </p>

                    <div className="space-y-4">
                      {whatsappTemplates.map(tpl => {
                        const isEditing = editingTemplateId === tpl.id;
                        return (
                          <div 
                            key={tpl.id}
                            className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-2 text-xs"
                          >
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
                                Edit Template Rules
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
                      <li><strong className="text-slate-400">{'{customer_name}'}</strong> - Guest's Full Name</li>
                      <li><strong className="text-slate-400">{'{booking_id}'}</strong> - Excursion Reservation Code</li>
                      <li><strong className="text-slate-400">{'{tour_name}'}</strong> - Tour Name</li>
                      <li><strong className="text-slate-400">{'{date}'}</strong> - Booking departure Date</li>
                      <li><strong className="text-slate-400">{'{pickup_hotel}'}</strong> - Pickup hotel</li>
                      <li><strong className="text-slate-400">{'{qr_code}'}</strong> - Security voucher QR payload</li>
                      <li><strong className="text-slate-400">{'{driver_name}'}</strong> - Dedicated chauffeur</li>
                      <li><strong className="text-slate-400">{'{guide_name}'}</strong> - Egyptologist scholar</li>
                    </ul>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* 4. CMS Manager tab */}
          {activeTab === 'cms' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Add/Edit Tour Form */}
              <div className="bg-slate-800/20 border border-slate-800 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    {editingTourId ? 'CMS Corporate - Edit Luxury Excursion' : 'CMS Corporate - Catalog New Luxury Excursion'}
                  </h4>
                  {editingTourId && (
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <form onSubmit={handleSaveTour} className="space-y-4">
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
                        onChange={(e) => setNewTourPrice(parseInt(e.target.value))}
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
                        onChange={(e) => setNewTourCapacity(parseInt(e.target.value))}
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
              </div>

              {/* Active Catalog List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Active Tours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tours.map(t => (
                    <div key={t.id} className="bg-slate-800/30 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all">
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
                          className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer border border-rose-500/20"
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
          )}

          {/* 5. Security Audit Logs tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4 animate-fade-in font-mono text-xs">
              <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider font-sans mb-2">Security Audit Logs</h4>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-[380px] overflow-y-auto space-y-3 shadow-inner">
                {analytics.auditLogs.map((log: AuditLog) => (
                  <div key={log.id} className="border-b border-slate-900 pb-2 leading-relaxed">
                    <span className="text-slate-500">[{new Date(log.timestamp).toISOString()}]</span>{' '}
                    <span className="text-emerald-400 font-extrabold">{log.action}</span>{' '}
                    <span className="text-slate-400">({log.user}):</span>{' '}
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. AI Studio Executive tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-800/20 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h4 className="text-sm font-bold uppercase text-amber-400 tracking-wider">AI Content Assistant</h4>
                </div>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  Use Google Gemini to generate descriptions, itineraries, blog posts, and keywords.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Task Type</label>
                    <select
                      value={aiType}
                      onChange={(e) => setAiType(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none"
                    >
                      <option value="Tour Description">Tour Description</option>
                      <option value="Bespoke Itinerary">Itinerary</option>
                      <option value="Luxury Blog Article">Blog Post</option>
                      <option value="SEO Keywords Map">SEO Keywords</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Seed Subject Keywords</label>
                    <input
                      type="text"
                      value={aiKeywords}
                      onChange={(e) => setAiKeywords(e.target.value)}
                      placeholder="e.g. VIP Pyramids Sunset champagne horse carriage..."
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiGenerating || !aiKeywords.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>{aiGenerating ? 'Generating...' : 'Generate Content'}</span>
                </button>
              </div>

              {aiGeneratedContent && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 animate-fade-in text-xs md:text-sm">
                  <h5 className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px]">{lang === 'ar' ? 'محتوى ذكي تم توليده بواسطة جيميني' : 'Generated Content'}</h5>
                  <div className="h-[1px] bg-slate-800 my-2" />
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{aiGeneratedContent}</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );

  // Helper inside loop: render CRM sidebar profile buttons
  function crmProfilesList(count: number) {
    // We can fetch DB's CRM or mock a select list based on DB
    // To ensure consistency, we will list the CRM records directly
    return (
      <div className="space-y-2">
        {analytics.revenueByTour ? (
          // Let's search DB crm list
          bookings.map((b, idx) => {
            const isSelected = selectedCrmEmail.toLowerCase() === b.customerEmail.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCrmEmail(b.customerEmail)}
                className={`w-full p-3 rounded-lg text-left text-xs transition-all flex flex-col gap-1 border cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="font-bold truncate w-full">{b.customerName}</span>
                <span className="opacity-80 truncate text-[10px]">{b.customerEmail}</span>
              </button>
            );
          })
        ) : null}
      </div>
    );
  }

  // Helper inside CRM: render communications panel
  function crmDetailPanel() {
    // Find booking
    const b = bookings.find(x => x.customerEmail.toLowerCase() === selectedCrmEmail.toLowerCase());
    if (!b) return null;

    return (
      <div className="space-y-4 text-xs md:text-sm animate-fade-in">
        <div>
          <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Customer Profile</span>
          <h4 className="text-base md:text-lg font-black text-slate-100 mt-2">{b.customerName}</h4>
          <p className="text-slate-400 text-xs mt-0.5">{b.customerEmail} | Phone: {b.customerPhone} | Nationality: {b.customerNationality}</p>
        </div>

        {/* CRM quick specs */}
        <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-slate-300">
          <div>
            <span className="block text-[8px] text-slate-500 uppercase font-bold tracking-wider">LTV INVESTMENT VALUE</span>
            <span className="text-emerald-400 font-extrabold">{formatLocalPrice(b.totalAmountUSD)}</span>
          </div>
          <div>
            <span className="block text-[8px] text-slate-500 uppercase font-bold tracking-wider">PREFERRED LANGUAGE</span>
            <span className="text-white font-extrabold">English</span>
          </div>
        </div>

        {/* CRM Tags Module */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">CRM SEGMENT FLAGS:</span>
          {['VIP', 'Luxury Explorer', 'High Spender'].map(tag => (
            <span key={tag} className="bg-slate-800 border border-slate-700 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          
          {/* Dispatch WhatsApp */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase text-emerald-400 font-bold tracking-wider">Broadcast Verified WhatsApp Business API Message</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={crmWhatsappInput}
                onChange={(e) => setCrmWhatsappInput(e.target.value)}
                placeholder="Type push message..."
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendCrmWhatsapp(b.customerEmail)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dispatch Support response */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase text-amber-400 font-bold tracking-wider">Publish CRM Support Chat Response</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={crmSupportInput}
                onChange={(e) => setCrmSupportInput(e.target.value)}
                placeholder="Type support butler response..."
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendCrmSupport(b.customerEmail)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }
}
