// /api/jobs.ts

type Req = import('http').IncomingMessage & { method?: string; headers: any };
type Res = import('http').ServerResponse & {
  status: (code: number) => Res;
  json: (obj: any) => void;
  send: (body: any) => void;
  setHeader: (k: string, v: string) => void;
};

async function readJson(req: Req) {
  let data = '';
  for await (const chunk of req as any) data += chunk;
  if (!data) return {};
  try { return JSON.parse(data); } catch { return {}; }
}

function setCors(res: Res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Cache-Control', 'no-store');
  if (process.env.ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN);
    res.setHeader('Vary', 'Origin');
  }
}

export default async function handler(req: Req, res: Res) {
  try {
    setCors(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 200; return res.end();
    }
    if (req.method !== 'POST') {
      res.statusCode = 405; return res.end(JSON.stringify({ error: 'method not allowed' }));
    }

    const body = await readJson(req);
    if (body?.mode !== 'text') {
      res.statusCode = 400; return res.end(JSON.stringify({ error: "mode must be 'text'" }));
    }

    const text = String(body?.text ?? '');
    const MAX = Number(process.env.MAX_TEXT_BYTES || 2_000_000);
    if (Buffer.byteLength(text, 'utf8') > MAX) {
      res.statusCode = 413; return res.end(JSON.stringify({ error: 'text too large' }));
    }

    // === Your anti-AI transform goes here ===
    const output = await transformText(text);
    // ========================================

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.statusCode = 200;
    return res.end(output);
  } catch (err: any) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'job failed' }));
  }
}

async function transformText(input: string): Promise<string> {
  // TODO: replace with your real logic
  return input;
}
