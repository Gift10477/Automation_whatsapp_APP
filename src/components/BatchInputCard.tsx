import React, { useState } from 'react';
import { Users, ClipboardPaste, Sparkles, CheckCircle2, AlertCircle, Trash2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { parsePastedRecipients, SAMPLE_MEMBERS_RAW } from '../utils/phoneParser';

interface BatchInputCardProps {
  onImport: (rawText: string) => void;
  onClear: () => void;
  currentCount: number;
  clearInputOnImport?: boolean;
}

export const BatchInputCard: React.FC<BatchInputCardProps> = ({
  onImport,
  onClear,
  currentCount,
  clearInputOnImport = true,
}) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_MEMBERS_RAW);
  const [showHelper, setShowHelper] = useState<boolean>(false);

  // Live calculation of parsed preview
  const parsedPreview = React.useMemo(() => {
    return parsePastedRecipients(inputText);
  }, [inputText]);

  const validCount = parsedPreview.filter(p => p.isValid).length;
  const invalidCount = parsedPreview.length - validCount;

  const handlePasteSample = () => {
    setInputText(SAMPLE_MEMBERS_RAW);
  };

  const handleApply = () => {
    if (inputText.trim()) {
      onImport(inputText);
      if (clearInputOnImport) {
        setInputText('');
      }
    }
  };

  const handleClear = () => {
    setInputText('');
    onClear();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold">
            <ClipboardPaste className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Paste Member Names & Phone Numbers
            </h2>
            <p className="text-xs text-slate-500">
              Numbers with leading <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-medium">+</code> sign are validated and formatted automatically
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
          >
            {showHelper ? 'Hide Format Guide' : 'Supported Formats Guide'}
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={handlePasteSample}
            className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors cursor-pointer"
          >
            Reset to Sample
          </button>
        </div>
      </div>

      {/* Guide accordion if open */}
      {showHelper && (
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-5 py-3 text-xs text-emerald-950 space-y-1.5">
          <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            Paste directly from Excel, Google Sheets, or CSV:
          </p>
          <ul className="list-disc list-inside space-y-1 text-emerald-900/80 font-mono text-[11px]">
            <li>Comma format: <span className="text-slate-900 font-bold">John Mwangi, +254712345671</span></li>
            <li>Excel columns: <span className="text-slate-900 font-bold">Grace Wanjiku [TAB] +254722987652</span></li>
            <li>Alternative order: <span className="text-slate-900 font-bold">+254733456783, David Ochieng</span></li>
            <li>Line-by-line: Name on first line, phone number with <code className="font-bold">+</code> on the next</li>
          </ul>
        </div>
      )}

      {/* Input Textarea Area */}
      <div className="p-5 space-y-3">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste names and numbers here, e.g.:
John Mwangi, +254712345671
Grace Wanjiku, +254722987652
David Ochieng, +254733456783
Or copy two columns straight from Excel!`}
            rows={7}
            className="w-full font-mono text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 resize-y"
          />
        </div>

        {/* Security & Zero-Retention Notice */}
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
          <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <div className="text-[11px] leading-snug">
            <strong>Zero-Retention Privacy:</strong> Personal numbers remain strictly inside browser memory and are permanently deleted once messages are sent. No information is stored on servers or in databases.
          </div>
        </div>

        {/* Live Detection Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Users className="w-4 h-4 text-slate-500" />
              Detected: <strong className="text-slate-900">{parsedPreview.length}</strong> entries
            </span>

            {validCount > 0 && (
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{validCount} ready with valid <code className="font-mono">+</code> format</span>
              </span>
            )}

            {invalidCount > 0 && (
              <span className="flex items-center gap-1 text-amber-700">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{invalidCount} need review</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {inputText && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={handleApply}
              disabled={validCount === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Apply & Generate Messages ({validCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
