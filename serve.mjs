// Servidor de previsualización local. No hace falta en producción:
// Vercel sirve la carpeta "public" tal cual, sin build.
//
//   npm start          -> http://127.0.0.1:4321
//
// Reproduce el comportamiento de Vercel: cleanUrls (/privacidad -> privacidad.html)
// y soporte de rangos HTTP, necesario para que el vídeo se reproduzca y se pueda
// adelantar sin descargarlo entero.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, 'public');
const PORT = Number(process.env.PORT) || 4321;
const WHOLE_FILE_LIMIT = 2 * 1024 * 1024; // por encima de esto se sirve por rangos

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const safe = normalize(clean).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(ROOT, safe);

  if (!candidate.startsWith(ROOT)) return null; // no salir de public

  const tries = [candidate];
  if (!extname(candidate)) {
    tries.push(`${candidate}.html`, join(candidate, 'index.html'));
  }

  for (const file of tries) {
    try {
      const info = await stat(file);
      if (info.isFile()) return { file, size: info.size, mtime: info.mtime };
    } catch {
      /* siguiente candidato */
    }
  }
  return null;
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404</h1><p>Página no encontrada.</p>');
}

const server = createServer(async (req, res) => {
  const found = await resolveFile(req.url || '/');
  if (!found) return notFound(res);

  const { file, size, mtime } = found;
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  const etag = `W/"${size.toString(16)}-${mtime.getTime().toString(16)}"`;

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304).end();
    return;
  }

  const headers = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    ETag: etag,
    'Cache-Control': 'no-store',
  };

  // Archivos grandes (el vídeo): rangos, con tipo de contenido siempre presente,
  // que es lo que exige el elemento <video>.
  if (size > WHOLE_FILE_LIMIT) {
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (match) {
        let start = match[1] ? Number(match[1]) : 0;
        let end = match[2] ? Number(match[2]) : size - 1;
        if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
          return;
        }
        end = Math.min(end, size - 1);
        res.writeHead(206, {
          ...headers,
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Content-Length': end - start + 1,
        });
        createReadStream(file, { start, end }).pipe(res);
        return;
      }
    }
    res.writeHead(200, { ...headers, 'Content-Length': size });
    createReadStream(file).pipe(res);
    return;
  }

  const body = await readFile(file);
  res.writeHead(200, { ...headers, 'Content-Length': body.length });
  res.end(body);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Método MAC-OS -> http://127.0.0.1:${PORT}`);
  console.log('Ctrl+C para parar.');
});
