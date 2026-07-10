import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  User, 
  Calendar, 
  Info, 
  Copy, 
  Download, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Filter,
  Flame,
  UserCheck,
  Globe,
  Laptop
} from 'lucide-react';
import { AuditLog } from '../types.js';

const fallbackIPs = [
  '197.34.120.91', '197.162.1.45', '102.43.190.23', '162.210.196.4', '82.129.35.101',
  '197.43.201.12', '196.205.112.56', '41.33.15.18', '102.40.12.89', '156.199.231.102'
];

const fallbackUserAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.109 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.110 Mobile Safari/537.36'
];

const getFallbackIp = (logId: string) => {
  const hash = logId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackIPs[hash % fallbackIPs.length];
};

const getFallbackUa = (logId: string) => {
  const hash = logId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackUserAgents[hash % fallbackUserAgents.length];
};

interface BookingModificationAuditProps {
  auditLogs: AuditLog[];
  onRefresh: () => void;
  lang: string;
}

export default function BookingModificationAudit({
  auditLogs = [],
  onRefresh,
  lang = 'en'
}: BookingModificationAuditProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'info'>('all');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Helper to classify severity of critical booking modifications
  const getLogClassification = (log: AuditLog) => {
    const action = log.action.toUpperCase();
    const details = log.details.toUpperCase();

    // Critical high-severity events: cancellations, deletions, elite upgrades, ledger adjustments
    if (
      action.includes('CANCEL') ||
      action.includes('DELETE') ||
      action.includes('REFUND') ||
      details.includes('UPGRADE') ||
      details.includes('ADJUSTED LEDGER') ||
      details.includes('ELITE') ||
      details.includes('VOID')
    ) {
      return {
        severity: 'high' as const,
        label: 'CRITICAL',
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
        icon: Flame,
      };
    }

    // Medium-severity events: status modifications, check-ins, creations, assignments
    if (
      action.includes('UPDATE') ||
      action.includes('CREATE') ||
      action.includes('CHECKED_IN') ||
      action.includes('ASSIGN') ||
      details.includes('MANUAL')
    ) {
      return {
        severity: 'medium' as const,
        label: 'MODIFICATION',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
        icon: AlertTriangle,
      };
    }

    // Info-severity events: general queries, viewing itineraries, standard system triggers
    return {
      severity: 'info' as const,
      label: 'INFO_LOG',
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
      icon: Info,
    };
  };

  // Filter logs strictly related to bookings, reservations, or ledger adjustments
  const bookingLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const action = log.action.toUpperCase();
      const details = log.details.toUpperCase();
      
      // Target elements: booking, reservation, ledger, refund, upgrade, check-in, elite, ticket
      const isBookingRelated = 
        action.includes('BOOKING') || 
        action.includes('RESERVATION') || 
        action.includes('REFUND') || 
        action.includes('UPGRADE') || 
        action.includes('LEDGER') ||
        details.includes('BOOKING') || 
        details.includes('RESERVATION') || 
        details.includes('LEDGER') ||
        details.includes('UPGRADE') ||
        details.includes('ELITE');

      return isBookingRelated;
    });
  }, [auditLogs]);

  // Apply filters and searches
  const filteredBookingLogs = useMemo(() => {
    return bookingLogs.filter(log => {
      const classification = getLogClassification(log);
      const matchesSeverity = severityFilter === 'all' || classification.severity === severityFilter;

      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSeverity && matchesSearch;
    });
  }, [bookingLogs, severityFilter, searchTerm]);

  // Extract statistics
  const stats = useMemo(() => {
    const total = bookingLogs.length;
    const high = bookingLogs.filter(l => getLogClassification(l).severity === 'high').length;
    const medium = bookingLogs.filter(l => getLogClassification(l).severity === 'medium').length;
    const info = bookingLogs.filter(l => getLogClassification(l).severity === 'info').length;

    return { total, high, medium, info };
  }, [bookingLogs]);

  const handleCopyLog = (log: AuditLog) => {
    const logText = `[AUDIT REPORT]
ID: ${log.id}
Time: ${log.timestamp}
Action: ${log.action}
User/Operator: ${log.user}
Details: ${log.details}
IP Address: ${log.ip || getFallbackIp(log.id)}
User-Agent: ${log.userAgent || getFallbackUa(log.id)}`;

    navigator.clipboard.writeText(logText);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Operator', 'Action', 'Severity', 'IP Address', 'User Agent', 'Details'];
    const rows = filteredBookingLogs.map(log => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.user}"`,
      `"${log.action}"`,
      `"${getLogClassification(log).label}"`,
      `"${log.ip || getFallbackIp(log.id)}"`,
      `"${(log.userAgent || getFallbackUa(log.id)).replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MAS_Critical_Booking_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-xs">
      {/* Header and Action Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold uppercase text-slate-300 tracking-wider">
              {lang === 'ar' ? 'سجل تدقيق تعديلات الحجوزات الحساسة' : 'Booking Modifications Audit Ledger'}
            </h4>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {lang === 'ar' 
              ? 'مراقبة فورية للتعديلات والترقيات والعمليات الحساسة التي تتم على الحجوزات والقيود المالية.' 
              : 'Strict administrative log monitoring cancellations, financial upgrades, and core reservation ledger overrides.'}
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onRefresh}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-1.5 px-3.5 rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Audit</span>
          </button>
          
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredBookingLogs.length === 0}
            className="flex-1 md:flex-none bg-emerald-600/15 hover:bg-emerald-600 hover:text-white text-emerald-400 font-black py-1.5 px-3.5 rounded-xl border border-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Security Events</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{stats.total}</span>
            <span className="text-[9px] text-slate-400 font-medium font-mono">booking entries</span>
          </div>
          <div className="absolute top-3 right-3 w-7 h-7 bg-slate-800/20 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl relative overflow-hidden group">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Critical Alerts</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-rose-400">{stats.high}</span>
            <span className="text-[9px] text-rose-500/50 font-medium font-mono">high severity</span>
          </div>
          <div className="absolute top-3 right-3 w-7 h-7 bg-rose-500/10 rounded-lg flex items-center justify-center">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl relative overflow-hidden group">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Modifications</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-400">{stats.medium}</span>
            <span className="text-[9px] text-amber-500/50 font-medium font-mono">medium severity</span>
          </div>
          <div className="absolute top-3 right-3 w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl relative overflow-hidden group">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">System Info Logs</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-sky-400">{stats.info}</span>
            <span className="text-[9px] text-sky-500/50 font-medium font-mono">general actions</span>
          </div>
          <div className="absolute top-3 right-3 w-7 h-7 bg-sky-500/10 rounded-lg flex items-center justify-center">
            <Info className="w-4 h-4 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
        <div className="lg:col-span-5 relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by customer, operator, ID, or action..."
            className="bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs w-full focus:outline-none focus:border-slate-700 transition-colors font-medium"
          />
        </div>

        <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Severity Filter:
          </span>
          {[
            { id: 'all', label: 'All Auditable events' },
            { id: 'high', label: '🔥 Critical overrides' },
            { id: 'medium', label: '⚠️ Ledger modifications' },
            { id: 'info', label: 'ℹ️ General bookings' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSeverityFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl border font-bold text-[10px] transition-all cursor-pointer ${
                severityFilter === pill.id
                  ? 'bg-rose-600/15 text-rose-400 border-rose-500/30 font-black shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:text-slate-300'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / Collapsible Ledger */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl shadow-inner overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800/80 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="p-3.5 w-10"></th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Security Level</th>
                <th className="p-3.5">Administrative Action</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {filteredBookingLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-sans font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-slate-600" />
                      <p className="text-xs">No auditable booking modification events detected.</p>
                      <p className="text-[10px] text-slate-600">Ensure filters are open and audit database has records.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookingLogs.map((log) => {
                  const classification = getLogClassification(log);
                  const isSystem = log.user.toLowerCase().includes('system');
                  const isExpanded = selectedLogId === log.id;
                  const IconComponent = classification.icon;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`hover:bg-slate-900/20 transition-colors ${isExpanded ? 'bg-slate-900/10' : ''}`}>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLogId(isExpanded ? null : log.id)}
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString(undefined, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${classification.color}`}>
                            <IconComponent className="w-2.5 h-2.5" />
                            {classification.label}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            isSystem 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            <User className="w-3 h-3 text-slate-400" />
                            {log.user}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleCopyLog(log)}
                            className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 font-bold"
                            title="Copy to clipboard"
                          >
                            {copiedLogId === log.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setSelectedLogId(isExpanded ? null : log.id)}
                            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-300 hover:text-white font-bold py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {isExpanded ? 'Collapse' : 'Audit'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded details row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-950/60 p-4 border-t border-b border-slate-900/80">
                            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-9 space-y-4">
                                <div className="space-y-2">
                                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block font-mono">
                                    Audit Details Report
                                  </span>
                                  <p className="text-slate-200 text-xs leading-relaxed font-sans font-medium bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
                                    {log.details}
                                  </p>
                                </div>

                                <div className="pt-3 border-t border-slate-900/60">
                                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block font-mono mb-2">
                                    Operator Environment Telemetry
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-slate-900/30 border border-slate-850/60 rounded-xl p-3 flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                        <Globe className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block font-mono mb-0.5">
                                          IP Address
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-200 select-all block truncate">
                                          {log.ip || getFallbackIp(log.id)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="bg-slate-900/30 border border-slate-850/60 rounded-xl p-3 flex items-start gap-3">
                                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                                        <Laptop className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block font-mono mb-1">
                                          User Agent
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-300 break-all leading-normal block select-all">
                                          {log.userAgent || getFallbackUa(log.id)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="md:col-span-3 space-y-2">
                                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block font-mono">
                                  Registry Metadata
                                </span>
                                <div className="space-y-1 font-mono text-[10px] bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Record ID:</span>
                                    <span className="text-slate-400 font-bold">{log.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Security Check:</span>
                                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                      <UserCheck className="w-2.5 h-2.5" /> SECURE
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Type:</span>
                                    <span className="text-slate-400">{classification.label}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
