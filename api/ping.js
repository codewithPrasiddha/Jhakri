export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, runtime: process.version, method: req.method }));
}
