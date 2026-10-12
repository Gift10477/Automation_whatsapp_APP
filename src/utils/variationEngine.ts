/**
 * Anti-Spam Message Variation Engine
 *
 * WhatsApp algorithms detect identical messages sent in bulk.
 * This engine generates linguistic permutations that preserve the exact
 * recipient name, sender name, STCU identity, form link, and 🙃 emoji,
 * but varies syntax, greetings, sentence structure, and sign-offs so no two
 * messages are identical.
 */

export interface VariationOptions {
  recipientName: string;
  senderName: string;
  organization: string;
  renewalLink: string;
  index: number;
  totalCount: number;
  antiSpamLevel?: 'high' | 'ultra' | 'natural';
}

const GREETINGS = [
  'Hello {name}',
  'Hi {name}',
  'Good day {name}',
  'Hello {name}, hope you are well',
  'Greetings {name}',
  'Hi {name}, trust your week is going great',
  'Hello there {name}',
  'Hi {name}, hope you are having a wonderful day',
  'Warm greetings {name}',
  'Hello {name}, hope all is well',
];

const INTROS = [
  'This is {sender} from {org}.',
  'It is {sender} reaching out from {org}.',
  '{sender} here from {org}.',
  'This is {sender} with the {org} team.',
  '{sender} from {org} reaching out to you.',
  'I am {sender} from {org}.',
  'It is {sender} from {org} checking in.',
  '{sender} from the {org} secretariat here.',
];

const REMINDERS = [
  'This is a gentle reminder to fill out our annual membership renewal form🙃',
  'Just sharing a gentle reminder to fill out our annual membership renewal form🙃',
  'Reaching out with a friendly reminder to complete our annual membership renewal form🙃',
  'This is a quick, gentle reminder to fill out our annual membership renewal form🙃',
  'Kindly take a quick moment to fill out our annual membership renewal form🙃',
  'We would love to have you renewed! Here is a gentle reminder to complete our annual membership renewal form🙃',
  'Just a warm reminder to fill out our annual membership renewal form🙃',
  'Please find a quick reminder to complete our annual membership renewal form🙃',
  'Dropping a friendly reminder to complete your annual membership renewal form🙃',
  'Reaching out with a polite reminder to submit our annual membership renewal form🙃',
];

const LINK_PREFIXES = [
  '\n\n{link}',
  '\n\nHere is the renewal link:\n{link}',
  '\n\nYou can access the renewal form here:\n{link}',
  '\n\nForm link:\n{link}',
  '\n\nPlease find the link below:\n{link}',
  '\n\nDirect link to the form:\n{link}',
  '\n\nAccess the form here:\n{link}',
  '\n\n{link}',
];

const CLOSINGS = [
  '',
  '\n\nThank you for being part of our community!',
  '\n\nWe truly appreciate your continued membership!',
  '\n\nThank you so much for your support!',
  '\n\nHave a wonderful day ahead!',
  '\n\nLooking forward to another fruitful year together!',
  '\n\nFeel free to reach out if you have any questions.',
  '\n\nAppreciate your time and cooperation!',
  '',
];

/**
 * Deterministically generates a unique variation for a given recipient index,
 * with pseudo-random salt to ensure distinctness.
 */
export function generateMessageVariation(options: VariationOptions): {
  message: string;
  variationHash: string;
} {
  const { recipientName, senderName, organization, renewalLink, index } = options;

  // Salt each dimension with index and prime offsets
  const gIdx = (index * 7 + 1) % GREETINGS.length;
  const iIdx = (index * 5 + 3) % INTROS.length;
  const rIdx = (index * 11 + 2) % REMINDERS.length;
  const lIdx = (index * 13 + 5) % LINK_PREFIXES.length;
  const cIdx = (index * 17 + 4) % CLOSINGS.length;

  const greeting = GREETINGS[gIdx].replace('{name}', recipientName || 'Member');
  const intro = INTROS[iIdx]
    .replace('{sender}', senderName || 'Member Services')
    .replace('{org}', organization || 'STCU');
  const reminder = REMINDERS[rIdx];
  const linkSection = LINK_PREFIXES[lIdx].replace('{link}', renewalLink);
  const closing = CLOSINGS[cIdx];

  // Compose message cleanly matching the required visual structure
  const message = `${greeting}\n${intro}\n${reminder}${linkSection}${closing}`.trim();
  const variationHash = `var-${gIdx}-${iIdx}-${rIdx}-${lIdx}-${cIdx}`;

  return { message, variationHash };
}

/**
 * Calculates how unique the messages are across all recipients (0 to 100%)
 */
export function calculateUniquenessScore(messages: string[]): {
  uniqueCount: number;
  totalCount: number;
  percentage: number;
  hasDuplicates: boolean;
} {
  if (messages.length === 0) {
    return { uniqueCount: 0, totalCount: 0, percentage: 100, hasDuplicates: false };
  }

  const set = new Set(messages);
  const uniqueCount = set.size;
  const percentage = Math.round((uniqueCount / messages.length) * 100);

  return {
    uniqueCount,
    totalCount: messages.length,
    percentage,
    hasDuplicates: uniqueCount < messages.length,
  };
}

/**
 * Optional server-side AI paraphrasing via Gemini
 */
export async function generateAIVariationsViaServer(
  recipients: { id: string; name: string }[],
  senderName: string,
  organization: string,
  link: string
): Promise<Record<string, string> | null> {
  try {
    const res = await fetch('/api/generate-variations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients,
        senderName,
        organization,
        link,
      }),
    });

    if (!res.ok) {
      console.warn('Server AI variations returned non-OK status, falling back to local engine');
      return null;
    }

    const data = await res.json();
    if (data.variations && Array.isArray(data.variations)) {
      const map: Record<string, string> = {};
      for (const item of data.variations) {
        if (item.id && item.message) {
          map[item.id] = item.message;
        }
      }
      return map;
    }
    return null;
  } catch (err) {
    console.warn('AI variation request error, falling back to local engine:', err);
    return null;
  }
}
