import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipForward, CheckCircle, ExternalLink, ShieldCheck, Clock, Send, MessageCircle, Layers, Link as LinkIcon, RefreshCw, Zap, Lock } from 'lucide-react';
import { Recipient, DispatchSettings, DispatchProgress } from '../types';
import { buildDispatchUrl, dispatchWhatsAppLink, getRandomInterval } from '../utils/whatsappHelper';
import { maskPhoneNumber } from '../utils/phoneParser';

interface AutomatedDispatcherProps {
  recipients: Recipient[];
  settings: DispatchSettings;
  progress: DispatchProgress;
  onUpdateProgress: (newProgress: Partial<DispatchProgress>) => void;
  onMarkStatus: (id: string, status: Recipient['status']) => void;
  onCompleteAll: () => void;
}

export const AutomatedDispatcher: React.FC<AutomatedDispatcherProps> = ({
  recipients,
  settings,
  progress,
  onUpdateProgress,
  onMarkStatus,
  onCompleteAll,
}) => {
  const [lastOpenedUrl, setLastOpenedUrl] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter pending or active recipients
  const pendingRecipients = recipients.filter(r => r.status === 'pending');
  const sentCount = recipients.filter(r => r.status === 'sent').length;
  const currentRecipient = progress.currentRecipientId
    ? recipients.find(r => r.id === progress.currentRecipientId) || pendingRecipients[0]
    : pendingRecipients[0];

  const hasNext = Boolean(currentRecipient);
  const percentComplete = recipients.length > 0 ? Math.round((sentCount / recipients.length) * 100) : 0;

  // Dispatch current recipient to WhatsApp complying with tab reuse rules
  const executeSend = (recipient: Recipient) => {
    const url = buildDispatchUrl(settings.dispatchMethod, recipient.phoneDigits, recipient.message);
    setLastOpenedUrl(url);

    // Dispatches via single persistent tab or native protocol
    dispatchWhatsAppLink(url, settings.dispatchMethod, settings.windowTargetMode);

    // Mark as sent
    onMarkStatus(recipient.id, 'sent');

    // Pick next interval for subsequent message
    const nextRemaining = recipients.filter(r => r.id !== recipient.id && r.status === 'pending');
    if (nextRemaining.length > 0) {
      const nextDelay = getRandomInterval(settings.minDelaySec, settings.maxDelaySec);
      const nextTarget = nextRemaining[0];

      onUpdateProgress({
        currentRecipientId: nextTarget.id,
        countdownSec: nextDelay,
        totalDelayForCurrent: nextDelay,
      });
    } else {
      // Completed all!
      onUpdateProgress({
        isActive: false,
        isPaused: false,
        currentRecipientId: null,
        countdownSec: 0,
      });
      onCompleteAll();
    }
  };

  // Automated countdown effect
  useEffect(() => {
    if (!progress.isActive || progress.isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (!currentRecipient) {
      // No more recipients
      onUpdateProgress({ isActive: false });
      return;
    }

    timerRef.current = setInterval(() => {
      onUpdateProgress({
        countdownSec: Math.max(0, progress.countdownSec - 1),
      });

      if (progress.countdownSec <= 1) {
        // Interval completed!
        if (settings.autoOpenNext && currentRecipient) {
          executeSend(currentRecipient);
        } else {
          // Pause and let user trigger with Spacebar/Click
          onUpdateProgress({ isPaused: true });
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [progress.isActive, progress.isPaused, progress.countdownSec, currentRecipient, settings.autoOpenNext]);

  // Keyboard shortcut: Spacebar to immediately dispatch/advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (currentRecipient) {
          executeSend(currentRecipient);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRecipient]);

  // Start queue
  const handleStartQueue = () => {
    if (!currentRecipient) return;
    const initialDelay = getRandomInterval(settings.minDelaySec, settings.maxDelaySec);
    onUpdateProgress({
      isActive: true,
      isPaused: false,
      currentRecipientId: currentRecipient.id,
      countdownSec: initialDelay,
      totalDelayForCurrent: initialDelay,
    });
  };

  const handlePauseToggle = () => {
    onUpdateProgress({ isPaused: !progress.isPaused });
  };

  const handleSkipCurrent = () => {
    if (!currentRecipient) return;
    onMarkStatus(currentRecipient.id, 'skipped');
    const remaining = recipients.filter(r => r.id !== currentRecipient.id && r.status === 'pending');
    if (remaining.length > 0) {
      const delay = getRandomInterval(settings.minDelaySec, settings.maxDelaySec);
      onUpdateProgress({
        currentRecipientId: remaining[0].id,
        countdownSec: delay,
        totalDelayForCurrent: delay,
      });
    } else {
      onUpdateProgress({ isActive: false, currentRecipientId: null });
    }
  };

  const handleStopQueue = () => {
    onUpdateProgress({
      isActive: false,
      isPaused: false,
      countdownSec: 0,
    });
  };

  const progressPct = progress.totalDelayForCurrent > 0
    ? Math.round(((progress.totalDelayForCurrent - progress.countdownSec) / progress.totalDelayForCurrent) * 100)
    : 100;

  const currentDynamicUrl = currentRecipient
    ? buildDispatchUrl(settings.dispatchMethod, currentRecipient.phoneDigits, currentRecipient.message)
    : '#';

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 text-white shadow-lg overflow-hidden">
      {/* Top Banner with Anti-Spam protection notice and link persistence status */}
      <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Anti-Spam Dispatch Engine
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            {settings.windowTargetMode === 'reuse_tab' ? (
              <span className="text-emerald-300 font-medium">Single Reused Tab (No Link Resets)</span>
            ) : (
              <span className="text-slate-400">New Tab Mode</span>
            )}
          </span>
          {settings.autoDeleteOnSend && (
            <>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-xs text-emerald-300 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Zero-Retention Mode (Purge on Send)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Queue:</span>
          <strong className="text-emerald-400">{recipients.length} pending members</strong>
        </div>
      </div>

      <div className="p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dispatch Controls & Countdown */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Automated Delivery Queue</h3>
                <p className="text-xs text-slate-400">
                  {progress.isActive
                    ? progress.isPaused
                      ? 'Queue is currently paused.'
                      : `Sending with randomized interval (${settings.minDelaySec}s–${settings.maxDelaySec}s)`
                    : 'Ready to dispatch personalized messages sequentially.'}
                </p>
              </div>

              {progress.isActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Next in: {progress.countdownSec}s</span>
                </div>
              )}
            </div>

            {/* Link Persistence Feature Callout */}
            <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  No Link Reset Mechanism:
                </span>
                <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded font-mono">
                  {settings.dispatchMethod === 'whatsapp_app' ? 'Native Protocol' : 'Target Window Reuse'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {settings.dispatchMethod === 'whatsapp_app'
                  ? 'Triggers the native WhatsApp desktop client directly — zero browser tabs spawned, zero resets.'
                  : 'Reuses a single persistent tab. Your WhatsApp Web session stays authenticated without reloading or showing "opened in another window".'}
              </p>
            </div>

            {/* Countdown Progress Bar */}
            {progress.isActive && !progress.isPaused && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Random Jitter Countdown</span>
                  <span>{progress.countdownSec}s remaining</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Overall Batch Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Batch Delivery Progress</span>
                <span className="font-mono text-white">{sentCount}/{recipients.length} Sent</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="space-y-3 pt-2">
            {!progress.isActive ? (
              <button
                type="button"
                onClick={handleStartQueue}
                disabled={!hasNext}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Automated Sending Queue</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePauseToggle}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  {progress.isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Resume Queue
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Pause Queue
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStopQueue}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  Stop Queue
                </button>
              </div>
            )}

            {currentRecipient && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => executeSend(currentRecipient)}
                    className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Send to this contact in persistent WhatsApp window"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Now ({currentRecipient.name})</span>
                    <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-indigo-700/80 rounded text-[10px] font-mono">
                      Space
                    </kbd>
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipCurrent}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
                    title="Skip this member"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>
                </div>

                {/* Direct Dynamic One-Link Relay */}
                <div className="flex items-center justify-between text-[11px] bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Live Dynamic Relay Link:</span>
                  <a
                    href={currentDynamicUrl}
                    target={settings.windowTargetMode === 'reuse_tab' ? 'STCU_WhatsApp_Active_Session' : '_blank'}
                    rel="noopener noreferrer"
                    onClick={() => onMarkStatus(currentRecipient.id, 'sent')}
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>Click to open without tab reset</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span>Press <strong className="text-white">Spacebar</strong> to trigger send immediately.</span>
              <span className="text-emerald-400 font-medium">Safe Mode</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Recipient & WhatsApp Chat Preview */}
        <div className="lg:col-span-7 bg-slate-950/70 rounded-xl p-4 sm:p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Up Next / Live Preview
              </span>
            </div>

            {currentRecipient && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {settings.maskNumbersOnScreen ? maskPhoneNumber(currentRecipient.phoneRaw) : currentRecipient.phoneRaw}
                </span>
                {currentRecipient.countryCode && !settings.maskNumbersOnScreen && (
                  <span className="text-slate-400 text-[11px]">{currentRecipient.countryCode}</span>
                )}
              </div>
            )}
          </div>

          {currentRecipient ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Target Member:</div>
                  <div className="text-sm font-bold text-white">{currentRecipient.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Variation Fingerprint:</div>
                  <div className="text-xs font-mono text-indigo-400">{currentRecipient.variationHash}</div>
                </div>
              </div>

              {/* Realistic WhatsApp Chat Bubble */}
              <div className="p-4 rounded-xl bg-[#0b141a] border border-slate-800 relative">
                <div className="text-[11px] text-center text-slate-500 mb-2">
                  Today · WhatsApp Message Preview
                </div>

                <div className="max-w-[92%] ml-auto bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none p-3 shadow-md text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed relative">
                  {currentRecipient.message}
                  
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0]">
                    <span>12:00 PM</span>
                    <span className="text-[#53bdeb] font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">All Queue Messages Processed!</p>
              <p className="text-xs">You have completed delivery for all imported members.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
