import React, { useState } from 'react';
import { Settings, Shield, Clock, Sparkles, RefreshCw, Link as LinkIcon, User, Layers, Monitor, CheckCircle, Info, Lock, Eye } from 'lucide-react';
import { DispatchSettings } from '../types';

interface ConfigurationPanelProps {
  settings: DispatchSettings;
  onUpdateSettings: (newSettings: Partial<DispatchSettings>) => void;
  onRegenerateVariations: () => void;
  onRunAIVariations: () => Promise<void>;
  isGeneratingAI: boolean;
  uniquenessScore: number;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  settings,
  onUpdateSettings,
  onRegenerateVariations,
  onRunAIVariations,
  isGeneratingAI,
  uniquenessScore,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Message Template & WhatsApp Link Persistence
            </h2>
            <p className="text-xs text-slate-500">
              Sender name · Form URL · Single-tab reuse (No session resets) · Anti-spam intervals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="hidden sm:inline text-slate-400">Session Mode:</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium text-[11px]">
            {settings.windowTargetMode === 'reuse_tab' ? 'Single Reused Tab' : 'New Tab per Send'}
          </span>
          <span className="text-slate-400">·</span>
          <span>{isExpanded ? 'Collapse' : 'Configure'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Section 1: Identity & Message Variables */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                1. Sender & Message Details
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender Name (e.g., [insert name])
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.senderName}
                    onChange={(e) => onUpdateSettings({ senderName: e.target.value })}
                    placeholder="Your Name (e.g., Gift)"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Inserted into: <span className="italic">"This is [name] from {settings.organization}."</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Branch
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.organization}
                    onChange={(e) => onUpdateSettings({ organization: e.target.value })}
                    placeholder="STCU"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-slate-500" />
                  Membership Renewal Form URL
                </label>
                <input
                  type="url"
                  value={settings.renewalLink}
                  onChange={(e) => onUpdateSettings({ renewalLink: e.target.value })}
                  placeholder="https://forms.gle/..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Section 2: Anti-Spam Intervals */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                2. Anti-Ban Randomized Delays
              </h3>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  Why Random Intervals Matter:
                </div>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  WhatsApp detects robotic cadence (e.g. sending every exact 2 seconds). Generating a random jitter between <strong>{settings.minDelaySec}s</strong> and <strong>{settings.maxDelaySec}s</strong> simulates natural human behavior and preserves account reputation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Delay (Seconds)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={60}
                    value={settings.minDelaySec}
                    onChange={(e) => onUpdateSettings({ minDelaySec: Math.max(1, Number(e.target.value)) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Delay (Seconds)
                  </label>
                  <input
                    type="number"
                    min={settings.minDelaySec}
                    max={120}
                    value={settings.maxDelaySec}
                    onChange={(e) => onUpdateSettings({ maxDelaySec: Math.max(settings.minDelaySec, Number(e.target.value)) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={settings.autoOpenNext}
                    onChange={(e) => onUpdateSettings({ autoOpenNext: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Auto-launch next message when countdown finishes</span>
                </label>
              </div>
            </div>

            {/* Section 3: WhatsApp Link Persistence & Rules Compliance */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                3. Link Persistence (No Tab Resets)
              </h3>

              {/* WhatsApp Rules Compliant Info Banner */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  WhatsApp Rules Compliance:
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-tight">
                  According to WhatsApp rules, having multiple tabs open triggers the <em>"WhatsApp is open in another window"</em> conflict and resets your session.
                </p>
                <p className="text-[11px] text-emerald-900/90 font-medium">
                  <strong>Solution:</strong> Enabling <strong>Single Reused Tab</strong> keeps the exact same WhatsApp Web tab active, so you never have to reset or re-sync your session!
                </p>
              </div>

              {/* Window Target Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Link Window Behavior:
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="radio"
                      name="windowTargetMode"
                      value="reuse_tab"
                      checked={settings.windowTargetMode === 'reuse_tab'}
                      onChange={() => onUpdateSettings({ windowTargetMode: 'reuse_tab' })}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Single Reused Tab (Recommended)</div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        Navigates the existing WhatsApp Web tab without opening new tabs or resetting the session.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="radio"
                      name="windowTargetMode"
                      value="new_tab"
                      checked={settings.windowTargetMode === 'new_tab'}
                      onChange={() => onUpdateSettings({ windowTargetMode: 'new_tab' })}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">New Tab Per Send</div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        Spawns a fresh browser tab for every single message.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Client Protocol */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred WhatsApp Client Link:
                </label>
                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="dispatchMethod"
                      value="whatsapp_web"
                      checked={settings.dispatchMethod === 'whatsapp_web'}
                      onChange={() => onUpdateSettings({ dispatchMethod: 'whatsapp_web' })}
                      className="text-indigo-600"
                    />
                    <span className="font-medium text-slate-800">web.whatsapp.com (Web Tab)</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="dispatchMethod"
                      value="whatsapp_app"
                      checked={settings.dispatchMethod === 'whatsapp_app'}
                      onChange={() => onUpdateSettings({ dispatchMethod: 'whatsapp_app' })}
                      className="text-indigo-600"
                    />
                    <div>
                      <span className="font-medium text-slate-800">Native App (whatsapp:// protocol)</span>
                      <span className="text-[10px] text-indigo-600 ml-1 font-semibold">Zero tabs, zero resets</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="dispatchMethod"
                      value="wame_direct"
                      checked={settings.dispatchMethod === 'wame_direct'}
                      onChange={() => onUpdateSettings({ dispatchMethod: 'wame_direct' })}
                      className="text-indigo-600"
                    />
                    <span className="font-medium text-slate-800">wa.me universal link</span>
                  </label>
                </div>
              </div>

              {/* Variation Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onRegenerateVariations}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-slate-600" />
                  Re-shuffle
                </button>

                <button
                  type="button"
                  onClick={onRunAIVariations}
                  disabled={isGeneratingAI}
                  className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-200" />
                  <span>AI Variations</span>
                </button>
              </div>
            </div>

            {/* Section 4: Privacy & Zero-Retention Security */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                4. Privacy & Zero Retention
              </h3>

              {/* Privacy Notice Banner */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Client-Side RAM Only
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-tight">
                  No data ever touches any database or remote server. Everything lives temporarily in browser RAM and is shredded upon use.
                </p>
              </div>

              {/* Setting: Auto-Delete on Send */}
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.autoDeleteOnSend}
                    onChange={(e) => onUpdateSettings({ autoDeleteOnSend: e.target.checked })}
                    className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                      Auto-Delete Once Sent
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Active</span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      Instantly purges the member's phone number and message from memory as soon as dispatched.
                    </div>
                  </div>
                </label>

                {/* Setting: Mask Numbers on Screen */}
                <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.maskNumbersOnScreen}
                    onChange={(e) => onUpdateSettings({ maskNumbersOnScreen: e.target.checked })}
                    className="mt-0.5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                      Mask Phone Numbers On-Screen
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      Hides digits (<code className="text-slate-700 font-mono">+254 ••• ••• •71</code>) to prevent leaks during screen shares or video captures.
                    </div>
                  </div>
                </label>

                {/* Setting: Clear Paste Box on Import */}
                <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.clearInputOnImport}
                    onChange={(e) => onUpdateSettings({ clearInputOnImport: e.target.checked })}
                    className="mt-0.5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Auto-Clear Paste Box on Import
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      Wipes the raw pasted textarea immediately once members are loaded into the queue.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
