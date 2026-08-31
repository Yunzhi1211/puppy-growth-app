import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { DEFAULT_ZHIPU_MODEL, parseChatBody, fetchZhipuChat } from './lib/zhipu-chat';

/** 与 vite.config.ts 同目录加载 .env / .env.local，避免从别的文件夹执行 npm 时读不到密钥 */
const envDir = path.dirname(fileURLToPath(import.meta.url));

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** 手动解析 .env.local，避免 UTF-8 BOM / 个别情况下 Vite loadEnv 漏读 */
function parseDotEnvFile(absPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(absPath)) return out;
  let text: string;
  try {
    text = stripBom(fs.readFileSync(absPath, 'utf8'));
  } catch {
    return out;
  }
  for (let line of text.split('\n')) {
    const hash = line.indexOf('#');
    if (hash >= 0) line = line.slice(0, hash);
    line = line.trim();
    if (!line) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const localParsed = parseDotEnvFile(path.join(envDir, '.env.local'));
  const env = {
    ...loadEnv(mode, envDir, ''),
    ...localParsed,
  };

  return {
    plugins: [
      react(),
      {
        name: 'dev-api-chat',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const pathname = req.url?.split('?')[0] ?? '';
            if (pathname !== '/api/chat') {
              next();
              return;
            }

            const nodeReq = req as IncomingMessage;
            const nodeRes = res as ServerResponse;

            if (nodeReq.method === 'OPTIONS') {
              nodeRes.statusCode = 204;
              nodeRes.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              nodeRes.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              nodeRes.end();
              return;
            }

            if (nodeReq.method !== 'POST') {
              nodeRes.statusCode = 405;
              nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
              nodeRes.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
              return;
            }

            const apiKey = (
              env.ZHIPU_API_KEY ||
              env.BIGMODEL_API_KEY ||
              process.env.ZHIPU_API_KEY ||
              process.env.BIGMODEL_API_KEY ||
              ''
            ).trim();
            const defaultModel =
              (env.ZHIPU_MODEL || process.env.ZHIPU_MODEL || '').trim() || DEFAULT_ZHIPU_MODEL;

            if (!apiKey) {
              nodeRes.statusCode = 500;
              nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
              nodeRes.end(
                JSON.stringify({
                  error: 'ZHIPU_API_KEY_MISSING',
                  message:
                    '未读到密钥：请在 `puppy-growth-app/.env.local` 中配置 ZHIPU_API_KEY=...（智谱 open.bigmodel.cn），保存后重启 npm run dev。',
                }),
              );
              return;
            }

            try {
              const raw = await readBody(nodeReq);
              let parsed: unknown;
              try {
                parsed = JSON.parse(raw);
              } catch {
                nodeRes.statusCode = 400;
                nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
                nodeRes.end(JSON.stringify({ error: 'INVALID_JSON' }));
                return;
              }

              const chat = parseChatBody(parsed, defaultModel);
              if (!chat) {
                nodeRes.statusCode = 400;
                nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
                nodeRes.end(JSON.stringify({ error: 'INVALID_MESSAGES' }));
                return;
              }

              const { status, text } = await fetchZhipuChat(chat.model, chat.messages, apiKey);
              nodeRes.statusCode = status;
              nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
              nodeRes.end(text);
            } catch (e) {
              next(e);
            }
          });
        },
      },
    ],
  };
});
