// api/jobs.js — minimal, robust text processor

function setCors(res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (process.env.ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Cache-Control', 'no-store');
}

function readJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
  });
}

// TODO: replace with your real transform later
async function transformText(input) {
  return input;
}

export default async function handler(req, res) {
  try {
    setCors(res);

    if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end(); }
    if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ error: 'method not allowed' })); }

    const body = await readJson(req);
    if (body?.mode !== 'text') {
      res.statusCode = 400; return res.end(JSON.stringify({ error: "mode must be 'text'" }));
    }

    const text = String(body?.text ?? '');
    const MAX = Number(process.env.MAX_TEXT_BYTES || 2_000_000);
    if (Buffer.byteLength(text, 'utf8') > MAX) {
      res.statusCode = 413; return res.end(JSON.stringify({ error: 'text too large' }));
    }

    const output = await transformText(text);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.statusCode = 200;
    return res.end(output);
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'job failed' }));
  }
}
