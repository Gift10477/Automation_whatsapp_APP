import React from 'react';
import { ShieldCheck, MessageSquareShare, FileDown, Code, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  totalCount: number;
  sentCount: number;
  uniquenessScore: number;
  onOpenScriptModal: () => void;
  onExportCsv: () => void;
  onLoadSamples: () => void;
  onRegenerateAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  sentCount,
  uniquenessScore,
  onOpenScriptModal,
  onExportCsv,
  onLoadSamples,
  onRegenerateAll,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-inner">
            <MessageSquareShare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">STCU WhatsApp Dispatcher</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Anti-Spam Guard
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Personalized Renewal Delivery · Dynamic Paraphrasing · Randomized Delays
            </p>
          </div>
        </div>

        {/* Stats and action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {totalCount > 0 && (
            <div className="hidden md:flex items-center gap-3 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-300">
                Progress: <strong className="text-emerald-400 font-semibold">{sentCount}/{totalCount}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Uniqueness: <strong className="text-amber-400 font-semibold">{uniquenessScore}%</strong>
              </span>
            </div>
          )}

          <button
            onClick={onLoadSamples}
            title="Load sample members list to test right away"
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            Sample Data
          </button>

          <button
            onClick={onRegenerateAll}
            title="Re-spin unique message variations for every recipient"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-spin Variations
          </button>

          <button
            onClick={onExportCsv}
            title="Download list and generated personalized WhatsApp links"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          <button
            onClick={onOpenScriptModal}
            title="View WhatsApp Web automation guide & script"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Script</span> Guide
          </button>
        </div>
      </div>
    </header>
  );
};
