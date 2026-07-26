// Local sink: browser POSTs extraction JSON here, we write it to docs/research/raw/.
// text/plain content-type keeps it a CORS "simple request" (no preflight).
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../docs/research/raw/', import.meta.url);
mkdirSync(OUT, { recursive: true });

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  const name = decodeURIComponent(req.url.slice(1)).replace(/[^\w.-]/g, '_') || 'dump';
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    writeFileSync(new URL(name, OUT), body);
    console.log(`${name} <- ${body.length} bytes`);
    res.writeHead(200).end('ok');
  });
}).listen(7391, () => console.log('sink on http://localhost:7391'));
