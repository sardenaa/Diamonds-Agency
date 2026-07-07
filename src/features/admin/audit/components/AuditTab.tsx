import React from 'react';
import { RefreshCw, Search, ShieldCheck, Plus, Download, Upload, AlertTriangle, RotateCcw } from 'lucide-react';
import { AppLanguage, AuditLog } from '../../../types.js';

interface AuditTabProps {
  lang: AppLanguage;
  analytics: any;
  logSearch: string;
  setLogSearch: (val: string) => void;
  logFilter: string;
  setLogFilter: (val: string) => void;
  fetchAdminData: () => void;
  handleCreateManualBackup: () => void;
  creatingBackup: boolean;
  handleLocalExport: () => void;
  handleLocalImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  backupMessage: { text: string; type: 'success' | 'error' } | null;
  backups: any[];
  handleRestoreBackup: (filename: string, id: string) => void;
  restoringBackupId: string | null;
}

export default function AuditTab({
  lang,
  analytics,
  logSearch,
  setLogSearch,
  logFilter,
  setLogFilter,
  fetchAdminData,
  handleCreateManualBackup,
  creatingBackup,
  handleLocalExport,
  handleLocalImport,
  backupMessage,
  backups,
  handleRestoreBackup,
  restoringBackupId,
}: AuditTabProps) {
  const getLogCategory = (action: string): string => {
    const act = action.toUpperCase();
    if (act.includes('TOUR')) return 'tours';
    if (
      act.includes('BOOKING') ||
      act.includes('REFUND') ||
      act.includes('UPGRADE') ||
      act.includes('EXPORT') ||
      act.includes('MANUAL')
    )
      return 'bookings';
    if (act.includes('CRM') || act.includes('TICKET') || act.includes('CUSTOMER') || act.includes('REPLY'))
      return 'crm_tickets';
    if (act.includes('COUPON') || act.includes('BLOG')) return 'coupons_blogs';
    return 'system_security';
  };

  const getLogCategoryColor = (category: string) => {
    switch (category) {
      case 'tours':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      case 'bookings':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
      case 'crm_tickets':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/20';
      case 'coupons_blogs':
        return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/20';
    }
  };

  const getLogCategoryLabel = (category: string) => {
    switch (category) {
      case 'tours':
        return 'Excursions';
      case 'bookings':
        return 'Reservations';
      case 'crm_tickets':
        return 'CRM & Helpdesk';
      case 'coupons_blogs':
        return 'Promotions';
      default:
        return 'System Admin';
    }
  };

  const filteredLogs = (analytics?.auditLogs || []).filter((log: AuditLog) => {
    const category = getLogCategory(log.action);
    const matchesFilter = logFilter === 'all' || category === logFilter;
    const searchLower = logSearch.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(searchLower) ||
      log.user.toLowerCase().includes(searchLower) ||
      log.details.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider">
            Security & Operations Audit Ledger
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">
            Real-time tracking of all CRUD, operational modifications, and secure reports exported by system administrators.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAdminData}
          className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs py-1.5 px-3.5 rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-800/10 border border-slate-800/80 p-4 rounded-2xl">
        {/* Search bar */}
        <div className="lg:col-span-4 relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Search by action, user, details..."
            className="bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-xs w-full focus:outline-none focus:border-slate-550 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Operations' },
            { id: 'tours', label: 'Tours CRUD' },
            { id: 'bookings', label: 'Reservations' },
            { id: 'crm_tickets', label: 'CRM & Tickets' },
            { id: 'coupons_blogs', label: 'Promotions' },
            { id: 'system_security', label: 'System Admin' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setLogFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl border font-semibold text-[10px] transition-all cursor-pointer ${
                logFilter === pill.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-300'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-inner overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-900">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-sans font-medium space-y-1">
              <p className="text-xs">No matching administrative operations found.</p>
              <p className="text-[10px] text-slate-600">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            filteredLogs.map((log: AuditLog) => {
              const category = getLogCategory(log.action);
              const isSystem = log.user.toLowerCase().includes('system');
              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500 text-[10px] font-medium font-sans">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        })}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border font-sans ${getLogCategoryColor(
                          category
                        )}`}
                      >
                        {getLogCategoryLabel(category)}
                      </span>
                      <span className="text-white font-extrabold text-[11px] font-sans">{log.action}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed font-sans font-medium">{log.details}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:text-right font-sans">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        isSystem ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-800 text-slate-300 border-slate-700/50'
                      }`}
                    >
                      👤 {log.user}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Disaster Recovery Backups Control Panel */}
      <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl space-y-6 mt-8 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold uppercase text-slate-300 tracking-wider">
                Sovereign Disaster Recovery & Backup Core
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Secure AES-256-CBC encrypted backups of bookings and review databases for instant system-wide recovery.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCreateManualBackup}
              disabled={creatingBackup}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-black text-[11px] uppercase tracking-wider py-2 px-4 rounded-xl shadow-md shadow-amber-500/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {creatingBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{creatingBackup ? 'Creating Snapshot...' : 'Trigger Secure Backup'}</span>
            </button>

            <button
              type="button"
              onClick={handleLocalExport}
              className="bg-slate-800 hover:bg-slate-750 text-white font-bold text-[11px] uppercase tracking-wider py-2 px-4 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Database JSON</span>
            </button>

            <label className="bg-slate-800 hover:bg-slate-750 text-white font-bold text-[11px] uppercase tracking-wider py-2 px-4 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Database JSON</span>
              <input type="file" accept=".json" onChange={handleLocalImport} className="hidden" />
            </label>
          </div>
        </div>

        {backupMessage && (
          <div
            className={`p-4 rounded-xl border text-[11px] font-medium flex items-center gap-2.5 ${
              backupMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {backupMessage.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{backupMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Config Stats Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-900">
                Security Assurance Manifest
              </h5>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Backup Cryptography</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                  AES-256-CBC
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Daily Auto-Scheduler</span>
                <span className="font-sans text-sky-400 font-bold bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                  ACTIVE
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Durable Repositories</span>
                <span className="font-mono text-slate-300">backups/</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Total Saved Snapshots</span>
                <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded">{backups.length}</span>
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>DISASTER RECOVERY COMPLIANCE</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                These backups serve as military-grade offline archives. Restoring from any historical snapshot will overwrite all active
                database collections. Ensure validation is performed prior to restore.
              </p>
            </div>
          </div>

          {/* Backups History Column */}
          <div className="lg:col-span-7 space-y-3">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Encrypted Snapshots Ledger</h5>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-900 max-h-[220px] overflow-y-auto">
              {backups.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium space-y-1">
                  <p className="text-[11px]">No backup snapshots archived yet.</p>
                  <p className="text-[9px] text-slate-600">Trigger manual snapshot above or wait for system schedule.</p>
                </div>
              ) : (
                backups.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-3 hover:bg-slate-900/20 transition-colors flex items-center justify-between gap-3 font-mono"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            bk.type === 'Auto'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {bk.type}
                        </span>
                        <span className="text-white text-[10px] font-bold truncate max-w-[150px] sm:max-w-xs" title={bk.filename}>
                          {bk.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-sans">
                        <span>{new Date(bk.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>{(bk.sizeBytes / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreBackup(bk.filename, bk.id)}
                      disabled={restoringBackupId !== null}
                      className="bg-slate-900 hover:bg-slate-850 disabled:bg-slate-900/40 border border-slate-800 text-[10px] text-slate-300 hover:text-white font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {restoringBackupId === bk.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                      ) : (
                        <RotateCcw className="w-3 h-3" />
                      )}
                      <span>{restoringBackupId === bk.id ? 'Restoring...' : 'Restore'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
