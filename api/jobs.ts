export default async function handler(req: any, res: any) {
  // Basic CORS (safe if UI + API share domain; handy for local/dev)
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Cache-Control", "no-store");
  if (process.env.ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN);
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (body?.mode !== "text") return res.status(400).json({ error: "mode must be 'text' for now" });

    const text = String(body?.text ?? "");
    const MAX = Number(process.env.MAX_TEXT_BYTES || 2_000_000); // 2MB default
    if (Buffer.byteLength(text, "utf8") > MAX) {
      return res.status(413).json({ error: "text too large" });
    }

    // === your anti-AI transform goes here ===
    const output = await transformText(text);
    // ========================================

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(output);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "job failed" });
  }
}

async function transformText(input: string): Promise<string> {
  // TODO: replace with your real logic
  return input;
}
