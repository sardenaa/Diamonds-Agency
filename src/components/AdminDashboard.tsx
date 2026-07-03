import React, { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, ShieldAlert, Sparkles, Plus, Trash2, Edit2, RotateCcw, Send, Calendar, CheckCircle2, DollarSign, Award, RefreshCw, Layers, Ticket, MessageSquare, Bot, AlertTriangle, ShieldCheck, FileSpreadsheet, FileText, Mail } from 'lucide-react';
import { Tour, Booking, CustomerCRM, AuditLog, CurrencyConfig, SupportTicket, WhatsAppTemplate } from '../types.js';
import { translations } from '../translations.js';
import { googleSignIn, logout, initAuth, getAccessToken } from '../lib/firebase.js';
import { exportBookingsToSheets } from '../lib/googleSheets.js';

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

  const [activeTab, setActiveTab] = useState<'analytics' | 'operations' | 'crm' | 'cms' | 'logs' | 'ai' | 'ticketing' | 'sheets'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Google Sheets integration state declarations
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [exportTitle, setExportTitle] = useState('MAS Agency - Sovereign Bookings Ledger');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'failed'>('idle');
  const [exportedSheet, setExportedSheet] = useState<{ id: string; url: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState<boolean>(() => {
    return localStorage.getItem('googleSheets_autoSync') === 'true';
  });

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
  const [crmProfiles, setCrmProfiles] = useState<CustomerCRM[]>([]);
  const [selectedCrmEmail, setSelectedCrmEmail] = useState('');
  const [crmWhatsappInput, setCrmWhatsappInput] = useState('');
  const [crmSupportInput, setCrmSupportInput] = useState('');

  // CRM Search, Filter, Modal states
  const [crmSearch, setCrmSearch] = useState('');
  const [crmFilterTag, setCrmFilterTag] = useState('all');
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [crmModalMode, setCrmModalMode] = useState<'create' | 'edit'>('create');

  // CRM Form fields
  const [crmFormEmail, setCrmFormEmail] = useState('');
  const [crmFormName, setCrmFormName] = useState('');
  const [crmFormPhone, setCrmFormPhone] = useState('');
  const [crmFormNationality, setCrmFormNationality] = useState('');
  const [crmFormLanguage, setCrmFormLanguage] = useState('en');
  const [crmFormTagsString, setCrmFormTagsString] = useState('');
  const [crmFormNotes, setCrmFormNotes] = useState('');

  // Bulk WhatsApp Blast states
  const [isBulkBlastOpen, setIsBulkBlastOpen] = useState(false);
  const [bulkBlastSegment, setBulkBlastSegment] = useState('all');
  const [bulkBlastTemplateId, setBulkBlastTemplateId] = useState('custom');
  const [bulkBlastText, setBulkBlastText] = useState('');
  const [isBlasting, setIsBlasting] = useState(false);

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

      const crmRes = await fetch('/api/crm');
      if (crmRes.ok) {
        const crmData = await crmRes.json();
        setCrmProfiles(crmData);
        // Automatically select the first customer profile if none is selected
        if (crmData.length > 0 && !selectedCrmEmail) {
          setSelectedCrmEmail(crmData[0].email);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    setExportStatus('idle');
    setExportError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setExportError(err.message || 'Google Sign-In failed.');
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      setExportedSheet(null);
      setExportStatus('idle');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRunExport = async () => {
    if (!googleToken) return;
    setExportStatus('exporting');
    setExportError(null);
    setExportedSheet(null);

    try {
      const sheet = await exportBookingsToSheets(googleToken, bookings, exportTitle);
      setExportedSheet(sheet);
      setExportStatus('success');

      // Save to server audit logs!
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EXPORT_COMPLETED',
          user: googleUser?.email || 'Sovereign Admin',
          details: `Exported ${bookings.length} reservations to Google Sheet "${exportTitle}"`
        })
      });
      fetchAdminData();
      onRefreshAll();
    } catch (err: any) {
      console.error(err);
      setExportStatus('failed');
      setExportError(err.message || 'Export failed.');
    }
  };

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

  // CRM: Handle submit manually created or edited profile
  const handleSaveCrmProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmFormEmail || !crmFormName) return;
    
    const tagsArray = crmFormTagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
      
    const payload = {
      email: crmFormEmail,
      name: crmFormName,
      phone: crmFormPhone,
      nationality: crmFormNationality,
      language: crmFormLanguage,
      tags: tagsArray,
      notes: crmFormNotes
    };
    
    try {
      if (crmModalMode === 'create') {
        const res = await fetch('/api/crm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsCrmModalOpen(false);
          alert('CRM Profile successfully generated.');
          fetchAdminData();
          onRefreshAll();
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to generate CRM profile.');
        }
      } else {
        const res = await fetch(`/api/crm/${crmFormEmail}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsCrmModalOpen(false);
          alert('CRM Profile successfully updated.');
          fetchAdminData();
          onRefreshAll();
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to update CRM profile.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateCrm = () => {
    setCrmModalMode('create');
    setCrmFormEmail('');
    setCrmFormName('');
    setCrmFormPhone('');
    setCrmFormNationality('');
    setCrmFormLanguage('en');
    setCrmFormTagsString('VIP');
    setCrmFormNotes('');
    setIsCrmModalOpen(true);
  };

  const handleOpenEditCrm = (profile: CustomerCRM) => {
    setCrmModalMode('edit');
    setCrmFormEmail(profile.email);
    setCrmFormName(profile.name);
    setCrmFormPhone(profile.phone || '');
    setCrmFormNationality(profile.nationality || '');
    setCrmFormLanguage(profile.language || 'en');
    setCrmFormTagsString(profile.tags ? profile.tags.join(', ') : '');
    setCrmFormNotes(profile.notes || '');
    setIsCrmModalOpen(true);
  };

  const handleDeleteCrmProfile = async (email: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete the CRM profile for ${email}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/crm/${email}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('CRM Profile deleted successfully.');
        setSelectedCrmEmail('');
        fetchAdminData();
        onRefreshAll();
      } else {
        alert('Failed to delete CRM profile.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBulkBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkBlastText.trim()) {
      alert('Please write or select a template message for the promotional broadcast.');
      return;
    }

    setIsBlasting(true);
    try {
      const res = await fetch('/api/crm/whatsapp-blast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: bulkBlastSegment,
          templateText: bulkBlastText
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`🎉 Bulk WhatsApp Blast Dispatched!\nSuccessfully sent customized promotional alerts to ${data.sentCount} premium guest profiles under the segment "${bulkBlastSegment}".`);
        setIsBulkBlastOpen(false);
        setBulkBlastText('');
        fetchAdminData();
        onRefreshAll();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to dispatch Bulk WhatsApp blast.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while dispatching the Bulk WhatsApp blast.');
    } finally {
      setIsBlasting(false);
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
            { id: 'ai', label: t.aiStudioConsole, icon: Sparkles },
            { id: 'sheets', label: '🟢 Google Sheets Sync', icon: FileSpreadsheet }
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
          {activeTab === 'crm' && (() => {
            const uniqueTags = Array.from(new Set(crmProfiles.flatMap(p => p.tags || [])));
            return (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-wider">Enterprise CRM Guest Directory</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Create, edit, audit, and dispatch custom notifications to high-net-worth VIP guest profiles.</p>
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

                {/* Bulk WhatsApp Blast Marketing Module */}
                <div className="bg-gradient-to-r from-emerald-950/20 to-slate-900/40 border border-emerald-500/15 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                        <MessageSquare className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black uppercase text-slate-300 tracking-wider">Bulk WhatsApp Blast Campaign Tool</h5>
                        <p className="text-[10px] text-slate-500 font-medium">Broadcast customized promotional templates directly to high-value customer segments instantly.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkBlastOpen(!isBulkBlastOpen);
                        if (!bulkBlastText) {
                          setBulkBlastText('👑 *MAS Exclusive Luxury Upgrade* | Dear *{customer_name}*,\n\nWe are delighted to offer a limited-time 20% elite chauffeur upgrade. Connect with your butler team today!');
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 text-[10px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isBulkBlastOpen ? 'COLLAPSE CONSOLE' : 'LAUNCH CAMPAIGN BLAST'}
                    </button>
                  </div>

                  {isBulkBlastOpen && (
                    <form onSubmit={handleSendBulkBlast} className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-slate-800/60 animate-fade-in">
                      {/* Segment Tag Selector */}
                      <div className="md:col-span-3 space-y-2">
                        <label className="block text-[9px] uppercase text-slate-400 font-bold tracking-wider">Target Audience Segment</label>
                        <select
                          value={bulkBlastSegment}
                          onChange={(e) => setBulkBlastSegment(e.target.value)}
                          className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none cursor-pointer"
                        >
                          <option value="all">👑 All Registered Guests ({crmProfiles.length})</option>
                          {uniqueTags.map(tag => {
                            const count = crmProfiles.filter(p => p.tags && p.tags.includes(tag)).length;
                            return (
                              <option key={tag} value={tag}>🏷️ Segment: {tag} ({count})</option>
                            );
                          })}
                        </select>
                        <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-850">
                          <span className="block text-[8px] text-slate-500 font-extrabold uppercase">Segment Description</span>
                          <span className="text-[9.5px] text-slate-400 leading-relaxed font-medium">
                            {bulkBlastSegment === 'all' 
                              ? "Sends to every guest listed in the database directory." 
                              : `Restricted to guests matching the custom tag "${bulkBlastSegment}".`}
                          </span>
                        </div>
                      </div>

                      {/* Campaign Template Select */}
                      <div className="md:col-span-4 space-y-2">
                        <label className="block text-[9px] uppercase text-slate-400 font-bold tracking-wider">Select Promotional Template</label>
                        <select
                          value={bulkBlastTemplateId}
                          onChange={(e) => {
                            const tplId = e.target.value;
                            setBulkBlastTemplateId(tplId);
                            if (tplId === 'custom') {
                              setBulkBlastText('👑 *MAS Exclusive Luxury Upgrade* | Dear *{customer_name}*,\n\nWe are delighted to offer a limited-time 20% elite chauffeur upgrade. Connect with your butler team today!');
                            } else if (tplId === 'summer') {
                              setBulkBlastText('☀️ *MAS Egyptian Summer Soirée* | Dear *{customer_name}*,\n\nExperience ancient Cairo in royal seclusion. Book any VIP Expedition this week and receive a complimentary private luxury sunset yacht sail with gourmet caviar.\n\nReply directly to unlock with your Personal Butler.');
                            } else if (tplId === 'helicopter') {
                              setBulkBlastText('🚁 *MAS Royal Helicopter Sky-Tour* | Dear *{customer_name}*,\n\nBypass all highway congestion. Fly directly over the Great Pyramids Plateau in our twin-engine chopper.\n\nBook your royal flight transfer and get 15% off standard rates: {booking_id}');
                            } else if (tplId === 'loyal') {
                              setBulkBlastText('👑 *MAS Loyalty Sovereign Suite* | Dear *{customer_name}*,\n\nThank you for being an elite Gold/Platinum guest. Your total investment is *{customer_phone}*. We have unlocked special front-row Sphinx access clearance for you.\n\nReply to claim your Sovereign pass.');
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
                            <b className="text-emerald-400">{`{customer_name}`}</b>, <b className="text-emerald-400">{`{customer_email}`}</b>, <b className="text-emerald-400">{`{booking_id}`}</b>, <b className="text-emerald-400">{`{tour_name}`}</b>, <b className="text-emerald-400">{`{date}`}</b>, <b className="text-emerald-400">{`{pickup_hotel}`}</b>, <b className="text-emerald-400">{`{qr_code}`}</b>
                          </p>
                        </div>
                      </div>

                      {/* Customize Campaign Message Text */}
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
                  
                  {/* CRM Profiles List Column with search and filters */}
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
                          {uniqueTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/50 pt-2">
                      {crmProfiles.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-6 text-center">No profiles registered.</p>
                      ) : (
                        crmProfilesList(crmProfiles.length)
                      )}
                    </div>
                  </div>

                  {/* Selected CRM communication ledger details */}
                  <div className="md:col-span-2 bg-slate-800/10 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
                    {selectedCrmEmail ? (
                      crmDetailPanel()
                    ) : (
                      <div className="text-center py-24 text-slate-500 italic text-xs space-y-2">
                        <Users className="w-10 h-10 text-slate-700 mx-auto" />
                        <p>Select an elite guest profile on the left ledger to audit real-time WhatsApp histories, concierge notes, segments, and edit files.</p>
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
          })()}

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

          {activeTab === 'sheets' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">{lang === 'ar' ? 'مزامنة غوغل شيتس السيادية' : 'Sovereign Google Sheets Synchronization'}</h3>
                    <p className="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">{lang === 'ar' ? 'إدارة تصدير واستيراد بيانات الحجز والـ CRM' : 'Manage export and live streaming of luxury reservation ledgers'}</p>
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
                <h4 className="text-xs uppercase font-black tracking-widest text-emerald-400">{lang === 'ar' ? 'حالة الاتصال بـ Google' : 'Google Connection Status'}</h4>
                
                {googleUser ? (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-950/60 rounded-xl border border-slate-800 gap-4">
                    <div className="flex items-center gap-3">
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
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-sans">Connected</span>
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
                  <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-4">
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
                        <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.86-3.577-7.86-8s3.53-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.133C18.423 1.932 15.603 1 12.24 1c-6.076 0-11 4.924-11 11s4.924 11 11 11c6.346 0 10.574-4.453 10.574-10.762 0-.724-.078-1.277-.174-1.953H12.24z"/>
                      </svg>
                      <span>{lang === 'ar' ? 'سجل الدخول باستخدام Google' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Export Actions Panel */}
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs uppercase font-black tracking-widest text-emerald-400">{lang === 'ar' ? 'تصدير البيانات إلى غوغل شيتس' : 'Sovereign Sheet Export Ledger'}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">{lang === 'ar' ? 'عنوان جدول البيانات' : 'Spreadsheet Document Title'}</label>
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
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-2 animate-fade-in">
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
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider transition-colors mt-1"
                    >
                      <span>{lang === 'ar' ? 'فتح جدول البيانات ↗' : 'Open Spreadsheet ↗'}</span>
                    </a>
                  </div>
                )}

                {exportStatus === 'failed' && exportError && (
                  <div className="p-4 bg-rose-500/15 border border-rose-500/20 rounded-xl text-xs space-y-1 text-rose-400 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'فشل التصدير' : 'Export Failed'}</span>
                    </div>
                    <p className="opacity-90">{exportError}</p>
                  </div>
                )}
              </div>

              {/* 3. Live Synchronicity Settings */}
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs uppercase font-black tracking-widest text-emerald-400">{lang === 'ar' ? 'إعدادات المزامنة الفورية' : 'Live Synchronization Settings'}</h4>
                <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{lang === 'ar' ? 'مزامنة الحجوزات الجديدة تلقائياً' : 'Auto-export new bookings'}</span>
                      <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">PRO FEATURE</span>
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
                    <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );

  // Helper inside loop: render CRM sidebar profile buttons
  function crmProfilesList(count: number) {
    const filtered = crmProfiles.filter(p => {
      const searchLower = crmSearch.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        (p.nationality && p.nationality.toLowerCase().includes(searchLower));
        
      const matchesTag = 
        crmFilterTag === 'all' || 
        (p.tags && p.tags.includes(crmFilterTag));
        
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
                          : 'bg-slate-800 text-slate-400 border border-slate-750'
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
  }

  // Helper inside CRM: render communications panel
  function crmDetailPanel() {
    const profile = crmProfiles.find(x => x.email.toLowerCase() === selectedCrmEmail.toLowerCase());
    if (!profile) return null;

    // Calculate dynamic stats
    const customerBookings = bookings.filter(b => b.customerEmail.toLowerCase() === profile.email.toLowerCase());
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
              className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
            >
              <Trash2 className="w-3 h-3" />
              <span>DELETE</span>
            </button>
          </div>
        </div>

        {/* CRM quick specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">LTV INVESTMENT VALUE</span>
            <span className="text-emerald-400 text-xs sm:text-sm font-black mt-0.5 block">{formatLocalPrice(profile.totalSpentUSD || totalSpent || 0)}</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">EXCURSIONS BOOKED</span>
            <span className="text-slate-200 text-xs sm:text-sm font-black mt-0.5 block">{customerBookings.length} bookings</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">PREFERRED LANGUAGE</span>
            <span className="text-slate-200 text-xs sm:text-sm font-black mt-0.5 block capitalize">{profile.language === 'ar' ? 'Arabic' : profile.language}</span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">LOYALTY TIER</span>
            <span className="text-amber-400 text-xs sm:text-sm font-black mt-0.5 block uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{customerBookings.length >= 3 ? '👑 PLATINUM' : customerBookings.length >= 1 ? '🥇 GOLD' : '🥈 SILVER'}</span>
            </span>
          </div>
        </div>

        {/* CRM Tags Module */}
        <div className="space-y-1.5">
          <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">CRM SEGMENT FLAGS:</span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {profile.tags && profile.tags.length > 0 ? (
              profile.tags.map(tag => (
                <span key={tag} className="bg-slate-850 border border-slate-750 text-slate-300 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-600 italic">No tags associated.</span>
            )}
          </div>
        </div>

        {/* Concierge Notes Block */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
          <span className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider block">Special Concierge Butler Notes</span>
          <p className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed font-medium italic">
            {profile.notes || 'No premium notes registered for this VIP guest.'}
          </p>
        </div>

        {/* Messaging Logs & Immediate Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
          
          {/* Dispatch WhatsApp */}
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

          {/* Dispatch Support response */}
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

        {/* Automated Email Dispatches & PDF Itinerary Downloads */}
        <div className="pt-4 border-t border-slate-800/50 space-y-3">
          <label className="block text-[10px] uppercase text-sky-400 font-extrabold tracking-wider">
            Automated Formal Email Dispatch Ledger & Print-Ready PDF Itineraries
          </label>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
            {profile.emailHistory && profile.emailHistory.length > 0 ? (
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {profile.emailHistory.map((em, emIdx) => {
                  const bookingIdMatch = em.subject.match(/\[(RES-\d+)\]/);
                  const bId = bookingIdMatch ? bookingIdMatch[1] : (customerBookings[0]?.id || '');
                  return (
                    <div key={em.id || emIdx} className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs space-y-2 animate-fade-in">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <p className="text-slate-300 font-extrabold">{em.subject}</p>
                          <p className="text-[10px] text-slate-500">Sent: {new Date(em.timestamp).toLocaleString()}</p>
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
  }
}
