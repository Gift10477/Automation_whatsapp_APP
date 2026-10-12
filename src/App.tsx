/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { BatchInputCard } from './components/BatchInputCard';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { AutomatedDispatcher } from './components/AutomatedDispatcher';
import { RecipientsTable } from './components/RecipientsTable';
import { ScriptModal } from './components/ScriptModal';
import { Recipient, DispatchSettings, DispatchProgress } from './types';
import { parsePastedRecipients, SAMPLE_MEMBERS_RAW } from './utils/phoneParser';
import { generateMessageVariation, calculateUniquenessScore, generateAIVariationsViaServer } from './utils/variationEngine';
import { buildWaMeUrl } from './utils/whatsappHelper';

const INITIAL_SETTINGS: DispatchSettings = {
  senderName: 'Gift',
  organization: 'STCU',
  renewalLink: 'https://forms.gle/kmCj8MmCAxZTbAdh6',
  minDelaySec: 8,
  maxDelaySec: 18,
  dispatchMethod: 'whatsapp_web',
  windowTargetMode: 'reuse_tab',
  soundAlerts: true,
  autoOpenNext: true,
  antiSpamLevel: 'high',
  autoDeleteOnSend: true,
  maskNumbersOnScreen: false,
  clearInputOnImport: true,
};

export default function App() {
  const [settings, setSettings] = useState<DispatchSettings>(() => {
    try {
      const saved = localStorage.getItem('stcu_dispatch_settings');
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [purgedCount, setPurgedCount] = useState<number>(0);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const [progress, setProgress] = useState<DispatchProgress>({
    isActive: false,
    isPaused: false,
    currentIndex: 0,
    currentRecipientId: null,
    countdownSec: 0,
    totalDelayForCurrent: 0,
    lastSentAt: null,
  });

  // Save settings changes
  useEffect(() => {
    try {
      localStorage.setItem('stcu_dispatch_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Flash notification helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Generate recipients from parsed list with distinct anti-spam variations
  const buildRecipientsFromParsed = useCallback(
    (parsedEntries: ReturnType<typeof parsePastedRecipients>, currentSettings: DispatchSettings): Recipient[] => {
      const valid = parsedEntries.filter(p => p.isValid);
      return valid.map((entry, index) => {
        const { message, variationHash } = generateMessageVariation({
          recipientName: entry.name,
          senderName: currentSettings.senderName,
          organization: currentSettings.organization,
          renewalLink: currentSettings.renewalLink,
          index,
          totalCount: valid.length,
          antiSpamLevel: currentSettings.antiSpamLevel,
        });

        return {
          id: `rec-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          name: entry.name,
          phoneRaw: entry.phoneRaw,
          phoneDigits: entry.phoneDigits,
          countryCode: entry.countryCode,
          isValidPhone: true,
          message,
          variationHash,
          status: 'pending',
          sentAt: null,
        };
      });
    },
    []
  );

  // Initialize with sample data on mount
  useEffect(() => {
    const parsed = parsePastedRecipients(SAMPLE_MEMBERS_RAW);
    const initialRecipients = buildRecipientsFromParsed(parsed, settings);
    setRecipients(initialRecipients);
  }, []);

  // Recipient messages re-sync when template settings change
  const handleUpdateSettings = (newSettings: Partial<DispatchSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // If template variables changed, regenerate messages
      if (
        newSettings.senderName !== undefined ||
        newSettings.organization !== undefined ||
        newSettings.renewalLink !== undefined
      ) {
        setRecipients(currentRecipients =>
          currentRecipients.map((r, index) => {
            const { message, variationHash } = generateMessageVariation({
              recipientName: r.name,
              senderName: updated.senderName,
              organization: updated.organization,
              renewalLink: updated.renewalLink,
              index,
              totalCount: currentRecipients.length,
              antiSpamLevel: updated.antiSpamLevel,
            });
            return { ...r, message, variationHash };
          })
        );
      }

      return updated;
    });
  };

  // Re-generate all variations with new pseudo-random shuffle
  const handleRegenerateAllVariations = () => {
    setRecipients(prev =>
      prev.map((r, index) => {
        const salt = Math.floor(Math.random() * 50);
        const { message, variationHash } = generateMessageVariation({
          recipientName: r.name,
          senderName: settings.senderName,
          organization: settings.organization,
          renewalLink: settings.renewalLink,
          index: index + salt,
          totalCount: prev.length,
          antiSpamLevel: settings.antiSpamLevel,
        });
        return { ...r, message, variationHash };
      })
    );
    showToast('Re-spun fresh anti-spam variations for all recipients!', 'success');
  };

  // Re-generate a single recipient variation
  const handleRegenerateSingle = (id: string) => {
    setRecipients(prev =>
      prev.map((r, idx) => {
        if (r.id !== id) return r;
        const randomSalt = Math.floor(Math.random() * 100) + 1;
        const { message, variationHash } = generateMessageVariation({
          recipientName: r.name,
          senderName: settings.senderName,
          organization: settings.organization,
          renewalLink: settings.renewalLink,
          index: idx + randomSalt,
          totalCount: prev.length,
          antiSpamLevel: settings.antiSpamLevel,
        });
        return { ...r, message, variationHash };
      })
    );
    showToast('Updated message variation for recipient', 'info');
  };

  // AI-Powered Variation Generator via Gemini API
  const handleRunAIVariations = async () => {
    if (recipients.length === 0) return;
    setIsGeneratingAI(true);
    try {
      const payload = recipients.map(r => ({ id: r.id, name: r.name }));
      const aiMap = await generateAIVariationsViaServer(
        payload,
        settings.senderName,
        settings.organization,
        settings.renewalLink
      );

      if (aiMap && Object.keys(aiMap).length > 0) {
        setRecipients(prev =>
          prev.map(r => {
            if (aiMap[r.id]) {
              return {
                ...r,
                message: aiMap[r.id],
                variationHash: 'gemini-ai',
              };
            }
            return r;
          })
        );
        showToast('Successfully personalized messages using Gemini AI!', 'success');
      } else {
        // Fallback shuffle
        handleRegenerateAllVariations();
        showToast('Generated unique local variations (Gemini server response fell back)', 'info');
      }
    } catch {
      handleRegenerateAllVariations();
      showToast('AI service unavailable; refreshed variations locally', 'info');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Import text from paste box
  const handleImportText = (rawText: string) => {
    const parsed = parsePastedRecipients(rawText);
    const newRecipients = buildRecipientsFromParsed(parsed, settings);
    setRecipients(newRecipients);
    setPurgedCount(0);
    setProgress({
      isActive: false,
      isPaused: false,
      currentIndex: 0,
      currentRecipientId: null,
      countdownSec: 0,
      totalDelayForCurrent: 0,
      lastSentAt: null,
    });
    showToast(`Imported ${newRecipients.length} members with verified international '+' format!`, 'success');
  };

  const handleClearAll = () => {
    setRecipients([]);
    setPurgedCount(0);
    setProgress({
      isActive: false,
      isPaused: false,
      currentIndex: 0,
      currentRecipientId: null,
      countdownSec: 0,
      totalDelayForCurrent: 0,
      lastSentAt: null,
    });
    showToast('Secure Wipe: All personal phone numbers and recipient records purged from memory!', 'success');
  };

  const handleResetAllStatus = () => {
    setRecipients(prev => prev.map(r => ({ ...r, status: 'pending', sentAt: null })));
    setProgress({
      isActive: false,
      isPaused: false,
      currentIndex: 0,
      currentRecipientId: null,
      countdownSec: 0,
      totalDelayForCurrent: 0,
      lastSentAt: null,
    });
    showToast('Reset all members to pending', 'info');
  };

  const handleMarkAllSent = () => {
    if (settings.autoDeleteOnSend) {
      setPurgedCount(prev => prev + recipients.length);
      setRecipients([]);
      showToast('All contacts dispatched and immediately purged from memory for privacy!', 'success');
    } else {
      setRecipients(prev => prev.map(r => ({ ...r, status: 'sent', sentAt: new Date().toISOString() })));
      showToast('Marked all members as sent', 'info');
    }
  };

  const handleUpdateRecipient = (id: string, updates: Partial<Recipient>) => {
    setRecipients(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleDeleteRecipient = (id: string) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const handleMarkStatus = (id: string, status: Recipient['status']) => {
    if (status === 'sent' && settings.autoDeleteOnSend) {
      setRecipients(prev => {
        const found = prev.find(r => r.id === id);
        if (found) {
          showToast(`Dispatched to ${found.name} · Personal number deleted from memory`, 'info');
        }
        return prev.filter(r => r.id !== id);
      });
      setPurgedCount(prev => prev + 1);
    } else {
      setRecipients(prev =>
        prev.map(r => (r.id === id ? { ...r, status, sentAt: status === 'sent' ? new Date().toISOString() : r.sentAt } : r))
      );
    }
  };

  const handleUpdateProgress = (newProgress: Partial<DispatchProgress>) => {
    setProgress(prev => ({ ...prev, ...newProgress }));
  };

  const handleCompleteAll = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }
    showToast('All messages in the queue have been processed! Great job!', 'success');
  };

  // CSV Export
  const handleExportCsv = () => {
    if (recipients.length === 0) {
      showToast('No recipients to export', 'error');
      return;
    }

    const headers = ['Name', 'Phone_Raw', 'Phone_Digits', 'Status', 'Personalized_Message', 'WhatsApp_Link'];
    const rows = recipients.map(r => {
      const waLink = buildWaMeUrl(r.phoneDigits, r.message);
      return [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.phoneRaw}"`,
        `"${r.phoneDigits}"`,
        `"${r.status}"`,
        `"${r.message.replace(/"/g, '""')}"`,
        `"${waLink}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STCU_WhatsApp_Renewal_Recipients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported CSV file with all personalized messages and links!', 'success');
  };

  // Metrics
  const uniquenessMetrics = calculateUniquenessScore(recipients.map(r => r.message));
  const sentCount = recipients.filter(r => r.status === 'sent').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        totalCount={recipients.length}
        sentCount={settings.autoDeleteOnSend ? purgedCount : sentCount}
        purgedCount={purgedCount}
        autoDeleteEnabled={settings.autoDeleteOnSend}
        maskNumbersOnScreen={settings.maskNumbersOnScreen}
        uniquenessScore={uniquenessMetrics.percentage}
        onOpenScriptModal={() => setIsScriptModalOpen(true)}
        onExportCsv={handleExportCsv}
        onLoadSamples={() => handleImportText(SAMPLE_MEMBERS_RAW)}
        onRegenerateAll={handleRegenerateAllVariations}
        onToggleMask={() => handleUpdateSettings({ maskNumbersOnScreen: !settings.maskNumbersOnScreen })}
        onClearAll={handleClearAll}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2 ${
              notification.type === 'success'
                ? 'bg-emerald-900 border-emerald-700 text-emerald-100'
                : notification.type === 'error'
                ? 'bg-rose-900 border-rose-700 text-rose-100'
                : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Active Automated Dispatcher Queue Card */}
        <AutomatedDispatcher
          recipients={recipients}
          settings={settings}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onMarkStatus={handleMarkStatus}
          onCompleteAll={handleCompleteAll}
        />

        {/* Copy-Paste Batch Input Card */}
        <BatchInputCard
          onImport={handleImportText}
          onClear={handleClearAll}
          currentCount={recipients.length}
          clearInputOnImport={settings.clearInputOnImport}
        />

        {/* Configuration: Sender Name, STCU Org, Form Link, Intervals, Spintax Controls */}
        <ConfigurationPanel
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onRegenerateVariations={handleRegenerateAllVariations}
          onRunAIVariations={handleRunAIVariations}
          isGeneratingAI={isGeneratingAI}
          uniquenessScore={uniquenessMetrics.percentage}
        />

        {/* Recipients Directory & Live Preview Table */}
        <RecipientsTable
          recipients={recipients}
          settings={settings}
          purgedCount={purgedCount}
          onUpdateRecipient={handleUpdateRecipient}
          onDeleteRecipient={handleDeleteRecipient}
          onRegenerateSingle={handleRegenerateSingle}
          onResetAllStatus={handleResetAllStatus}
          onMarkAllSent={handleMarkAllSent}
          onMarkStatus={handleMarkStatus}
        />
      </main>

      {/* Automation Script & Anti-Spam Modal */}
      <ScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">STCU Membership Renewal Automation</span>
            <span className="text-slate-600">·</span>
            <span>WhatsApp Anti-Spam Delivery Suite</span>
          </div>
          <div className="text-slate-500">
            Form Target: <span className="text-slate-400 font-mono">https://forms.gle/kmCj8MmCAxZTbAdh6</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
