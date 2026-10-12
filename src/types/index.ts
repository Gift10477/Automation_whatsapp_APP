export interface Recipient {
  id: string;
  name: string;
  phoneRaw: string;
  phoneDigits: string;
  countryCode: string;
  isValidPhone: boolean;
  message: string;
  variationHash: string;
  status: 'pending' | 'sending' | 'sent' | 'skipped' | 'failed';
  sentAt: string | null;
  error?: string | null;
}

export type DispatchLinkMethod = 'whatsapp_web' | 'wame_direct' | 'whatsapp_app';
export type WindowTargetMode = 'reuse_tab' | 'new_tab';

export interface DispatchSettings {
  senderName: string;
  organization: string;
  renewalLink: string;
  minDelaySec: number;
  maxDelaySec: number;
  dispatchMethod: DispatchLinkMethod;
  windowTargetMode: WindowTargetMode;
  autoOpenNext: boolean;
  antiSpamLevel: 'high' | 'ultra' | 'natural';
  autoDeleteOnSend: boolean;
  maskNumbersOnScreen: boolean;
  clearInputOnImport: boolean;
}

export interface DispatchProgress {
  isActive: boolean;
  isPaused: boolean;
  currentIndex: number;
  currentRecipientId: string | null;
  countdownSec: number;
  totalDelayForCurrent: number;
  lastSentAt: string | null;
}

export interface SpintaxPreset {
  id: string;
  name: string;
  description: string;
}
