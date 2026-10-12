import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Variations generator endpoint using Gemini 3.8 Flash
app.post('/api/generate-variations', async (req, res) => {
  try {
    const { recipients, senderName = 'Gift', organization = 'STCU', link = 'https://forms.gle/kmCj8MmCAxZTbAdh6', baseTone = 'friendly' } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ 
        error: 'GEMINI_API_KEY is not configured on the server. Using built-in local variation engine instead.' 
      });
    }

    const ai = new GoogleGenAI({});

    const namesList = recipients.map((r: { id: string; name: string }) => `${r.id}:::${r.name}`).join('\n');

    const prompt = `You are a professional WhatsApp communication assistant for ${organization}.
We need to send an annual membership renewal reminder to ${recipients.length} individual members.
To prevent WhatsApp's spam detection algorithm from flagging the account, every single message MUST have a distinct, naturally paraphrased variation, while strictly maintaining:
1. Exact recipient's name addressed at the start.
2. Sender's identity: ${senderName} from ${organization}.
3. The exact core message: a gentle reminder to fill out our annual membership renewal form.
4. The exact form URL: ${link}
5. The playful upside-down face emoji 🙃 (or subtle pleasant emojis like 🙃 🙏 ✨ 😊).

Here is the base reference template:
"Hello [recipient's name]
This is ${senderName} from ${organization}. 
This is a gentle reminder to fill out our annual membership renewal form🙃

${link}"

Tone: ${baseTone} (warm, respectful, natural, human).
Vary the greetings (e.g., "Hello [Name]", "Hi [Name]", "Good day [Name]", "Greetings [Name]"), vary the introductory phrasing, vary how you present the friendly reminder, and vary the sign-off closing sentences, so no two messages are identical.

Return a JSON array with exactly ${recipients.length} objects matching each recipient ID:
[
  {
    "id": "recipient-id",
    "name": "recipient-name",
    "message": "Full personalized WhatsApp message text..."
  }
]

Recipients list:
${namesList}

Respond ONLY with valid JSON (no markdown ticks or extra conversational words).`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = aiResponse.text || '[]';
    const parsed = JSON.parse(text);

    return res.json({ variations: parsed });
  } catch (err: any) {
    console.error('Error in /api/generate-variations:', err);
    return res.status(500).json({ 
      error: err.message || 'Failed to generate AI variations' 
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
