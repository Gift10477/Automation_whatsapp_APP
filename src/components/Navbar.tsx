import React from 'react';
import { ShieldCheck, MessageSquareShare, FileDown, Code, Sparkles, RefreshCw, Lock, Eye, EyeOff, Trash2 } from 'lucide-react';

interface NavbarProps {
  totalCount: number;
  sentCount: number;
  purgedCount: number;
  autoDeleteEnabled: boolean;
  maskNumbersOnScreen: boolean;
  uniquenessScore: number;
  onOpenScriptModal: () => void;
  onExportCsv: () => void;
  onLoadSamples: () => void;
  onRegenerateAll: () => void;
  onToggleMask: () => void;
  onClearAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  sentCount,
  purgedCount,
  autoDeleteEnabled,
  maskNumbersOnScreen,
  uniquenessScore,
  onOpenScriptModal,
  onExportCsv,
  onLoadSamples,
  onRegenerateAll,
  onToggleMask,
  onClearAll,
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
        <div className="flex items-center gap-2 sm:gap-2.5">
          {autoDeleteEnabled && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 px-2.5 py-1 rounded-lg" title="Zero Retention Mode: Every number is permanently shredded from RAM upon send">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Retention Active</span>
            </div>
          )}

          {(totalCount > 0 || purgedCount > 0) && (
            <div className="hidden md:flex items-center gap-3 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-300">
                Queue: <strong className="text-white font-semibold">{totalCount}</strong>
                {purgedCount > 0 && (
                  <span className="ml-1.5 text-emerald-400 font-medium">({purgedCount} sent & purged)</span>
                )}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Uniqueness: <strong className="text-amber-400 font-semibold">{uniquenessScore}%</strong>
              </span>
            </div>
          )}

          {/* Privacy Screen Masking Toggle */}
          <button
            type="button"
            onClick={onToggleMask}
            title={maskNumbersOnScreen ? "Reveal phone numbers on screen" : "Mask phone numbers on screen to prevent shoulder-surfing/recording leaks"}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
              maskNumbersOnScreen
                ? 'bg-amber-950/60 text-amber-300 border-amber-700 hover:bg-amber-900/60'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            {maskNumbersOnScreen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Wipe All Data */}
          {(totalCount > 0 || purgedCount > 0) && (
            <button
              type="button"
              onClick={onClearAll}
              title="Secure Wipe: Immediately purge all phone numbers and recipient data from memory"
              className="text-xs font-medium px-2 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wipe All</span>
            </button>
          )}

          <button
            onClick={onLoadSamples}
            title="Load sample demo members list"
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer"
          >
            Sample Data
          </button>

          <button
            onClick={onRegenerateAll}
            title="Re-spin unique message variations for every recipient"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Re-spin Variations</span>
          </button>

          <button
            onClick={onExportCsv}
            title="Download remaining list as CSV"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          <button
            onClick={onOpenScriptModal}
            title="View WhatsApp Web automation guide & script"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Script</span> Guide
          </button>
        </div>
      </div>
    </header>
  );
};
