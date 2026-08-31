import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_ZHIPU_MODEL, parseChatBody, fetchZhipuChat } from '../lib/zhipu-chat';

export const config = {
  maxDuration: 60,
};

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

  const apiKey = (
    process.env.ZHIPU_API_KEY ||
    process.env.BIGMODEL_API_KEY ||
    ''
  ).trim();
  if (!apiKey) {
    return res.status(500).json({
      error: 'ZHIPU_API_KEY_MISSING',
      message: '服务端未配置 ZHIPU_API_KEY（智谱开放平台）',
    });
  }

  const defaultModel = process.env.ZHIPU_MODEL?.trim() || DEFAULT_ZHIPU_MODEL;

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

  const chat = parseChatBody(parsed, defaultModel);
  if (!chat) {
    return res.status(400).json({ error: 'INVALID_MESSAGES' });
  }

  const { status, text } = await fetchZhipuChat(chat.model, chat.messages, apiKey);
  res.status(status).send(text);
}
