import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 60,
};

type ChatRole = 'system' | 'user' | 'assistant';

interface IncomingMessage {
  role: ChatRole;
  content: string;
}

const MAX_MESSAGES = 40;
const MAX_CONTENT_LEN = 8000;

function isValidMessages(messages: unknown): messages is IncomingMessage[] {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return false;
  }
  return messages.every(
    (m) =>
      m &&
      typeof m === 'object' &&
      (m as IncomingMessage).role !== undefined &&
      ['system', 'user', 'assistant'].includes((m as IncomingMessage).role) &&
      typeof (m as IncomingMessage).content === 'string' &&
      (m as IncomingMessage).content.length > 0 &&
      (m as IncomingMessage).content.length <= MAX_CONTENT_LEN,
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENROUTER_API_KEY_MISSING',
      message: '服务端未配置 OPENROUTER_API_KEY',
    });
  }

  let parsed: unknown = req.body;
  if (typeof req.body === 'string') {
    try {
      parsed = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: 'INVALID_JSON' });
    }
  }
  if (!parsed || typeof parsed !== 'object') {
    return res.status(400).json({ error: 'INVALID_BODY' });
  }
  const body = parsed as { model?: unknown; messages?: unknown };
  const model =
    typeof body.model === 'string' && body.model.length < 200
      ? body.model
      : 'minimax/minimax-01';
  const messages = body.messages;

  if (!isValidMessages(messages)) {
    return res.status(400).json({ error: 'INVALID_MESSAGES' });
  }

  const referer =
    (typeof req.headers.referer === 'string' && req.headers.referer) ||
    (typeof req.headers.origin === 'string' && req.headers.origin) ||
    'https://vercel.com';

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': referer,
      'X-Title': 'Puppy Growth App',
    },
    body: JSON.stringify({ model, messages }),
  });

  const text = await upstream.text();
  res.status(upstream.status).send(text);
}
