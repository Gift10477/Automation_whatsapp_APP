/**
 * WhatsApp URL generation, Window reuse management, Audio effects, and Automation helpers
 */

import { DispatchLinkMethod, WindowTargetMode } from '../types';

export function buildWhatsAppWebUrl(phoneDigits: string, message: string): string {
  const cleanDigits = phoneDigits.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${cleanDigits}&text=${encodedText}`;
}

export function buildWaMeUrl(phoneDigits: string, message: string): string {
  const cleanDigits = phoneDigits.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanDigits}?text=${encodedText}`;
}

/**
 * Native WhatsApp desktop/mobile application URI protocol.
 * Opens directly inside the installed WhatsApp app without opening browser tabs
 * or resetting the web session.
 */
export function buildWhatsAppAppProtocolUrl(phoneDigits: string, message: string): string {
  const cleanDigits = phoneDigits.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `whatsapp://send?phone=${cleanDigits}&text=${encodedText}`;
}

/**
 * Builds the appropriate URL depending on the user's selected dispatch method
 */
export function buildDispatchUrl(
  method: DispatchLinkMethod,
  phoneDigits: string,
  message: string
): string {
  switch (method) {
    case 'whatsapp_app':
      return buildWhatsAppAppProtocolUrl(phoneDigits, message);
    case 'wame_direct':
      return buildWaMeUrl(phoneDigits, message);
    case 'whatsapp_web':
    default:
      return buildWhatsAppWebUrl(phoneDigits, message);
  }
}

/**
 * Reference to the single persistent WhatsApp tab so we can reuse it
 * without resetting WhatsApp Web or spawning endless tabs.
 */
let persistentWhatsAppWindow: Window | null = null;
const PERSISTENT_WINDOW_NAME = 'STCU_WhatsApp_Active_Session';

/**
 * Dispatches a message according to WhatsApp rules and window reuse settings.
 * 
 * According to WhatsApp/Meta rules:
 * - WhatsApp Web permits only ONE active web session per browser at a time.
 * - Opening multiple tabs causes the "WhatsApp Web is open in another window" conflict,
 *   which constantly resets the session.
 * - Reusing the SAME tab via named target or using the native desktop protocol (whatsapp://)
 *   satisfies WhatsApp rules and eliminates session resets.
 */
export function dispatchWhatsAppLink(
  url: string,
  method: DispatchLinkMethod,
  windowTargetMode: WindowTargetMode
): Window | null {
  if (method === 'whatsapp_app' || url.startsWith('whatsapp://')) {
    // Native protocol hook: triggers native client directly
    const anchor = document.createElement('a');
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return null;
  }

  if (windowTargetMode === 'reuse_tab') {
    // Reuses the identical browser tab/window!
    try {
      if (persistentWhatsAppWindow && !persistentWhatsAppWindow.closed) {
        persistentWhatsAppWindow.location.href = url;
        persistentWhatsAppWindow.focus();
        return persistentWhatsAppWindow;
      }
    } catch {
      // Cross-origin access might restrict reading location, window.open with name will target it
    }

    persistentWhatsAppWindow = window.open(url, PERSISTENT_WINDOW_NAME);
    return persistentWhatsAppWindow;
  }

  // Fallback: Open in new tab
  return window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Returns a randomized interval between min and max seconds (inclusive)
 * with a slight millisecond jitter.
 */
export function getRandomInterval(minSec: number, maxSec: number): number {
  const min = Math.max(1, Math.min(minSec, maxSec));
  const max = Math.max(min, maxSec);
  const diff = max - min;
  const randomSeconds = min + Math.random() * diff;
  return Math.round(randomSeconds);
}

/**
 * Lightweight Web Audio API sound generator (no external audio assets required)
 */
class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playPop() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignore audio context autoplay restrictions
    }
  }

  playSuccessChime() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.08, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  playTick() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundEngine();

/**
 * Generates an optional console automation snippet for power users running WhatsApp Web
 */
export function getWhatsAppConsoleAutomationSnippet(): string {
  return `/* STCU WhatsApp Web Auto-Press Enter Helper */
// Paste this into the Chrome Developer Tools Console (F12) on https://web.whatsapp.com
// It watches for when a conversation finishes loading and automatically presses send for you!
(() => {
  console.log("🟢 STCU Auto-Presser Active!");
  setInterval(() => {
    // Finds the WhatsApp Web send button
    const sendBtn = document.querySelector('button[aria-label="Send"], span[data-icon="send"]')?.closest('button');
    if (sendBtn && !sendBtn.disabled) {
      console.log("🚀 Found Send button, clicking...");
      sendBtn.click();
    }
  }, 1000);
})();`;
}
