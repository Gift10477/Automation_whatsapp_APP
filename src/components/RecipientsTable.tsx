import React, { useState } from 'react';
import { Search, ExternalLink, RefreshCw, Copy, Check, Trash2, CheckCircle2, Clock, SkipForward, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Recipient, DispatchSettings } from '../types';
import { buildDispatchUrl, dispatchWhatsAppLink } from '../utils/whatsappHelper';
import { maskPhoneNumber } from '../utils/phoneParser';

interface RecipientsTableProps {
  recipients: Recipient[];
  settings: DispatchSettings;
  purgedCount?: number;
  onUpdateRecipient: (id: string, updates: Partial<Recipient>) => void;
  onDeleteRecipient: (id: string) => void;
  onRegenerateSingle: (id: string) => void;
  onResetAllStatus: () => void;
  onMarkAllSent: () => void;
  onMarkStatus: (id: string, status: Recipient['status']) => void;
}

export const RecipientsTable: React.FC<RecipientsTableProps> = ({
  recipients,
  settings,
  purgedCount = 0,
  onUpdateRecipient,
  onDeleteRecipient,
  onRegenerateSingle,
  onResetAllStatus,
  onMarkAllSent,
  onMarkStatus,
}) => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'skipped'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecipients = recipients.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phoneRaw.includes(search) ||
      r.phoneDigits.includes(search);

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLaunchWhatsApp = (r: Recipient) => {
    const url = buildDispatchUrl(settings.dispatchMethod, r.phoneDigits, r.message);
    dispatchWhatsAppLink(url, settings.dispatchMethod, settings.windowTargetMode);
    onMarkStatus(r.id, 'sent');
  };

  const counts = {
    all: recipients.length,
    pending: recipients.filter(r => r.status === 'pending').length,
    sent: recipients.filter(r => r.status === 'sent').length,
    skipped: recipients.filter(r => r.status === 'skipped').length,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Recipient Directory ({recipients.length})
            </h2>
            {purgedCount > 0 && (
              <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300/80 px-2 py-0.5 rounded-full font-medium flex items-center gap-1" title="Numbers permanently shredded from memory after sending">
                <Lock className="w-3 h-3 text-emerald-600" />
                {purgedCount} shredded
              </span>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs">
            {(['all', 'pending', 'sent', 'skipped'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>
        </div>

        {/* Search & Bulk Operations */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or number..."
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={onResetAllStatus}
            title="Reset all recipients to pending status"
            className="text-xs px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Recipient Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Recipient Name</th>
              <th className="py-3 px-4">Phone Number (+)</th>
              <th className="py-3 px-4">Personalized Message Preview</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecipients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No recipients found matching your filter.
                </td>
              </tr>
            ) : (
              filteredRecipients.map((r, idx) => {
                const isExpanded = expandedId === r.id;
                const isCopied = copiedId === r.id;

                return (
                  <React.Fragment key={r.id}>
                    <tr className={`hover:bg-slate-50/70 transition-colors ${r.status === 'sent' ? 'bg-emerald-50/20' : ''}`}>
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      
                      {/* Status Tag */}
                      <td className="py-3 px-4">
                        {r.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Sent
                          </span>
                        )}
                        {r.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {r.status === 'skipped' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <SkipForward className="w-3 h-3" />
                            Skipped
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.name}
                      </td>

                      {/* Phone with + */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {settings.maskNumbersOnScreen ? maskPhoneNumber(r.phoneRaw) : r.phoneRaw}
                        </span>
                        {r.countryCode && !settings.maskNumbersOnScreen && (
                          <span className="text-slate-400 text-[10px] ml-1.5">{r.countryCode}</span>
                        )}
                      </td>

                      {/* Message Preview */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-slate-600 text-xs">
                            {r.message.replace(/\n/g, ' ')}
                          </p>
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                            title={isExpanded ? 'Collapse' : 'Expand full message'}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLaunchWhatsApp(r)}
                            title="Directly launch WhatsApp message"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRegenerateSingle(r.id)}
                            title="Re-spin variation for this recipient"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyMessage(r.id, r.message)}
                            title="Copy message to clipboard"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteRecipient(r.id)}
                            title="Delete recipient"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Message View */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={6} className="p-4 border-b border-slate-200">
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs max-w-2xl space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">Full Message for {r.name}:</span>
                              <span className="font-mono text-indigo-600">{r.variationHash}</span>
                            </div>
                            <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">
                              {r.message}
                            </pre>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(r.id, r.message)}
                                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                Copy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLaunchWhatsApp(r)}
                                className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open in WhatsApp
                              </button>
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
  );
};
