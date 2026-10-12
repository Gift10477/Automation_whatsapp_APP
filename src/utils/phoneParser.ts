/**
 * Parses user copy-pasted input containing member names and phone numbers.
 * Gracefully handles:
 * - Leading plus signs '+' (e.g. +254712345678, +1 509 555 1234, +44 7911 123456)
 * - Tab-separated columns (Excel, Google Sheets)
 * - Comma-separated (CSV format)
 * - Pipe, semicolon, or dash delimited lines
 * - Line-paired inputs (Name on line 1, Phone on line 2)
 */

export interface ParsedEntry {
  name: string;
  phoneRaw: string;
  phoneDigits: string;
  countryCode: string;
  isValid: boolean;
  validationNote?: string;
}

/**
 * Clean phone number: preserves the '+' in raw display,
 * and extracts clean digits without '+' for WhatsApp API URLs.
 */
export function normalizePhoneNumber(input: string): {
  rawFormatted: string;
  digitsOnly: string;
  countryCode: string;
  isValid: boolean;
  note?: string;
} {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith('+');

  // Strip all non-digit characters except the leading plus
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length < 7) {
    return {
      rawFormatted: hasPlus ? `+${digits}` : trimmed,
      digitsOnly: digits,
      countryCode: '',
      isValid: false,
      note: 'Too short to be a valid phone number',
    };
  }

  if (digits.length > 15) {
    return {
      rawFormatted: hasPlus ? `+${digits}` : trimmed,
      digitsOnly: digits,
      countryCode: '',
      isValid: false,
      note: 'Exceeds maximum international phone length (15 digits)',
    };
  }

  // Detect common country prefixes
  let countryCode = '';
  if (digits.startsWith('254')) countryCode = '+254 (KE)';
  else if (digits.startsWith('1') && digits.length === 11) countryCode = '+1 (US/CA)';
  else if (digits.startsWith('44')) countryCode = '+44 (UK)';
  else if (digits.startsWith('27')) countryCode = '+27 (ZA)';
  else if (digits.startsWith('234')) countryCode = '+234 (NG)';
  else if (digits.startsWith('91')) countryCode = '+91 (IN)';
  else if (digits.startsWith('256')) countryCode = '+256 (UG)';
  else if (digits.startsWith('255')) countryCode = '+255 (TZ)';
  else countryCode = `+${digits.slice(0, 3)}`;

  // Always present clean raw format with '+' prefix
  const rawFormatted = `+${digits}`;

  return {
    rawFormatted,
    digitsOnly: digits,
    countryCode,
    isValid: true,
  };
}

/**
 * Checks if a string chunk looks like a phone number
 */
function isPhoneNumberCandidate(str: string): boolean {
  const trimmed = str.trim();
  // Contains '+' or starts with digits or lots of numbers/dashes/parentheses
  const digitCount = (trimmed.match(/\d/g) || []).length;
  return digitCount >= 7 && (trimmed.startsWith('+') || /^[0-9+\s\-()./]+$/.test(trimmed));
}

/**
 * Parse an entire pasted block of text into structured recipient entries
 */
export function parsePastedRecipients(rawText: string): ParsedEntry[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const results: ParsedEntry[] = [];

  // Check if format is alternating lines: Line 1 = Name, Line 2 = Phone
  let looksLikeAlternating = false;
  if (lines.length >= 2 && lines.length % 2 === 0) {
    let altMatches = 0;
    for (let i = 0; i < lines.length; i += 2) {
      const line1IsPhone = isPhoneNumberCandidate(lines[i]);
      const line2IsPhone = isPhoneNumberCandidate(lines[i + 1]);
      if (!line1IsPhone && line2IsPhone) {
        altMatches++;
      }
    }
    if (altMatches === lines.length / 2) {
      looksLikeAlternating = true;
    }
  }

  if (looksLikeAlternating) {
    for (let i = 0; i < lines.length; i += 2) {
      const name = cleanName(lines[i]);
      const phoneInfo = normalizePhoneNumber(lines[i + 1]);
      results.push({
        name,
        phoneRaw: phoneInfo.rawFormatted,
        phoneDigits: phoneInfo.digitsOnly,
        countryCode: phoneInfo.countryCode,
        isValid: phoneInfo.isValid && name.length > 0,
        validationNote: !name ? 'Missing name' : phoneInfo.note,
      });
    }
    return results;
  }

  // Otherwise parse line by line (Tab, Comma, Semicolon, Colon, Pipe, or trailing phone)
  for (const line of lines) {
    // Skip comment lines or header lines (e.g., "Name, Phone Number")
    const lower = line.toLowerCase();
    if (
      (lower.includes('name') && lower.includes('phone')) ||
      (lower.includes('recipient') && lower.includes('number'))
    ) {
      continue;
    }

    let name = '';
    let phone = '';

    // Check common delimiters: Tab, Comma, Semicolon, Pipe
    const delimiters = ['\t', ',', ';', '|'];
    let splitDone = false;

    for (const delim of delimiters) {
      if (line.includes(delim)) {
        const parts = line.split(delim).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          // Identify which part is phone and which is name
          if (isPhoneNumberCandidate(parts[0]) && !isPhoneNumberCandidate(parts[1])) {
            phone = parts[0];
            name = parts.slice(1).join(' ');
          } else {
            name = parts[0];
            phone = parts.slice(1).join(' ');
          }
          splitDone = true;
          break;
        }
      }
    }

    // If no delimiter found, attempt regex separation of name and phone number
    if (!splitDone) {
      // Look for a phone number token like +123456789 or 0712345678
      const phoneMatch = line.match(/(\+?\d[\d\s\-().]{6,})/);
      if (phoneMatch) {
        phone = phoneMatch[0];
        name = line.replace(phone, '').trim();
      } else {
        name = line;
        phone = '';
      }
    }

    const cleanNameStr = cleanName(name);
    const phoneInfo = normalizePhoneNumber(phone);

    results.push({
      name: cleanNameStr,
      phoneRaw: phoneInfo.rawFormatted,
      phoneDigits: phoneInfo.digitsOnly,
      countryCode: phoneInfo.countryCode,
      isValid: phoneInfo.isValid && cleanNameStr.length > 0,
      validationNote: !cleanNameStr ? 'Name is empty' : phoneInfo.note,
    });
  }

  return results;
}

function cleanName(raw: string): string {
  return raw
    .replace(/^["'`\s]+|["'`\s]+$/g, '') // remove quotes
    .replace(/^[-–—:]+\s*/, '') // remove leading bullets or dashes
    .trim();
}

/**
 * Sample dataset formatted specifically with members and plus-prefixed international phone numbers
 */
export const SAMPLE_MEMBERS_RAW = `John Mwangi, +254712345671
Grace Wanjiku, +254722987652
David Ochieng, +254733456783
Sarah Muthoni, +254701234564
Brian Kiprop, +254715678905
Amina Hassan, +254728112233
Peter Njoroge, +254790445566`;
