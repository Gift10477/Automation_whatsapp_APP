import React, { useState } from 'react';
import { X, Code, Copy, Check, ShieldAlert, BookOpen, ExternalLink } from 'lucide-react';
import { getWhatsAppConsoleAutomationSnippet } from '../utils/whatsappHelper';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const snippet = getWhatsAppConsoleAutomationSnippet();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                WhatsApp Automation & Anti-Spam Guide
              </h2>
              <p className="text-xs text-slate-500">
                How to automate hands-free dispatching and keep your WhatsApp number safe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          {/* Step by Step workflow */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              How the Automated Dispatcher Operates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center">1</span>
                  Linguistic Variations
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every contact receives a distinct message structure, rotating greetings and phrasing so WhatsApp's bulk-text detectors see organic conversations.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center">2</span>
                  Randomized Intervals
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Random delays (e.g. 8s–20s) mimic genuine human typing cadence between consecutive messages, avoiding rate-limit triggers.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center">3</span>
                  One-Tap or Zero-Touch
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The automated queue opens the pre-filled chat. You can hit <kbd className="bg-white px-1 border rounded text-[10px]">Enter</kbd> / Spacebar or use the helper script below.
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Rules on Links & Session Persistence */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-emerald-950 space-y-2">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              WhatsApp Rules Regarding Links & Session Resets:
            </h4>
            <p className="text-[11px] leading-relaxed text-emerald-900/90">
              Under WhatsApp/Meta policies, <strong>Click-to-Chat</strong> links (<code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">web.whatsapp.com/send</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">wa.me</code>, and <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">whatsapp://</code>) are the official, compliant way to initiate conversations.
            </p>
            <div className="text-[11px] space-y-1 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
              <p className="font-semibold text-emerald-950">Why WhatsApp links usually "reset" your session:</p>
              <p className="text-slate-700">
                WhatsApp Web enforces a single active browser tab per account. If a bulk tool opens 30 different tabs, WhatsApp's server immediately disconnects your earlier tabs with <em>"WhatsApp is open in another window"</em>, forcing you to reload and reset.
              </p>
              <p className="font-semibold text-emerald-950 mt-1.5">How this app eliminates the reset:</p>
              <p className="text-slate-700">
                • <strong>Single Reused Tab Mode:</strong> We assign all outgoing messages to the same browser window target (<code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">STCU_WhatsApp_Active_Session</code>). It smoothly navigates your existing tab to the next member without reloading WhatsApp Web!
                <br />
                • <strong>Native Protocol (<code className="font-mono text-[10px]">whatsapp://</code>):</strong> Opens your installed WhatsApp Desktop app directly, completely bypassing browser tabs and session resets.
              </p>
            </div>
          </div>

          {/* Optional Console Auto-Press Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-600" />
                Optional: WhatsApp Web "Auto-Press Send" Helper
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              When WhatsApp Web opens a message link, it pre-fills the chat input. If you prefer not having to manually click Send or press Enter each time, you can paste this 5-line script into your WhatsApp Web tab's Developer Console (<kbd className="bg-slate-100 px-1 border rounded font-mono">F12</kbd> → <kbd className="bg-slate-100 px-1 border rounded font-mono">Console</kbd>).
            </p>

            <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800">
              {snippet}
            </pre>
          </div>

          {/* Safety best practices */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 space-y-1.5">
            <div className="font-semibold text-xs flex items-center gap-1.5 text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              WhatsApp Account Safety Recommendations:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900/90 leading-relaxed">
              <li>Keep random intervals above <strong>8 to 15 seconds</strong> for consistent protection.</li>
              <li>Batch large lists into groups of 30–50 members with brief rest periods.</li>
              <li>Ensure your recipients recognize the <strong>STCU</strong> organization name and form link.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Got it, Back to Dispatcher
          </button>
        </div>
      </div>
    </div>
  );
};
