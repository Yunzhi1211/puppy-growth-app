export type ChatRole = 'system' | 'user' | 'assistant';

export interface IncomingMessage {
  role: ChatRole;
  content: string;
}

const MAX_MESSAGES = 40;
const MAX_CONTENT_LEN = 8000;

/** 智谱通用 API；Flash 系列适合高频轻量场景，可在控制台查看当前可用模型名 */
export const DEFAULT_ZHIPU_MODEL = 'glm-4-flash';

export function isValidMessages(messages: unknown): messages is IncomingMessage[] {
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

export function parseChatBody(
  parsed: unknown,
  defaultModel: string,
): { model: string; messages: IncomingMessage[] } | null {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }
  const body = parsed as { model?: unknown; messages?: unknown };
  const model =
    typeof body.model === 'string' && body.model.length > 0 && body.model.length < 200
      ? body.model
      : defaultModel;
  if (!isValidMessages(body.messages)) {
    return null;
  }
  return { model, messages: body.messages };
}

const ZHIPU_CHAT_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

/** 智谱对话补全（OpenAI 兼容形态），原样转发 JSON 便于前端解析 */
export async function fetchZhipuChat(
  model: string,
  messages: IncomingMessage[],
  apiKey: string,
): Promise<{ status: number; text: string }> {
  const upstream = await fetch(ZHIPU_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
    }),
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    return { status: upstream.status, text };
  }

  try {
    const j = JSON.parse(text) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = j.choices?.[0]?.message?.content;
    if (!content) {
      return {
        status: 502,
        text: JSON.stringify({
          error: { message: '智谱未返回正文，可能被内容策略拦截，请换种问法试试' },
        }),
      };
    }
    return { status: 200, text };
  } catch {
    return {
      status: 502,
      text: JSON.stringify({ error: { message: 'ZHIPU_RESPONSE_PARSE_ERROR' } }),
    };
  }
}
