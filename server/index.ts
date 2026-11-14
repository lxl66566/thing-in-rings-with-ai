import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { WebSocket, WebSocketServer } from 'ws';

import { type Connection, createRoomManager } from './rooms.ts';

/** Public base path; keep in sync with `base` in vite.config.ts. */
const BASE_PATH = '/thing-in-rings-with-ai/';
const DEFAULT_PORT = 8787;
const HEARTBEAT_INTERVAL_MS = 30_000;
const MAX_MESSAGE_BYTES = 64 * 1024;

const distDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dist',
);

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const readPort = (): number => {
  const flagIndex = process.argv.indexOf('--port');
  const flagged =
    flagIndex >= 0 ? Number(process.argv[flagIndex + 1]) : Number.NaN;
  const fromEnv =
    process.env.PORT === undefined ? Number.NaN : Number(process.env.PORT);
  const port = Number.isInteger(flagged) ? flagged : fromEnv;
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
};

const sendText = (res: ServerResponse, status: number, body: string): void => {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(body);
};

/** Serve the built SPA from dist/, falling back to index.html. */
const handleRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendText(res, 405, 'method not allowed');
    return;
  }
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname === '/healthz') {
    sendText(res, 200, 'ok');
    return;
  }
  if (!url.pathname.startsWith(BASE_PATH)) {
    res.writeHead(302, { location: BASE_PATH });
    res.end();
    return;
  }
  if (!existsSync(distDir)) {
    sendText(
      res,
      404,
      'dist/ not built. Run `pnpm build`, or use the vite dev server for development.',
    );
    return;
  }
  // Keep one leading slash, then resolve inside dist/ (traversal-safe).
  const relative = url.pathname.slice(BASE_PATH.length - 1);
  const candidate = path.resolve(distDir, `.${relative}`);
  const isFile =
    candidate.startsWith(distDir) &&
    existsSync(candidate) &&
    statSync(candidate).isFile();
  const filePath = isFile ? candidate : path.join(distDir, 'index.html');
  const type = MIME_TYPES[path.extname(filePath).toLowerCase()];
  const headers: Record<string, string> = {
    'cache-control': filePath.includes(`${path.sep}assets${path.sep}`)
      ? 'public, max-age=31536000, immutable'
      : 'no-store',
  };
  if (type !== undefined) {
    headers['content-type'] = type;
  }
  if (req.method === 'HEAD') {
    res.writeHead(200, headers);
    res.end();
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, headers);
    res.end(body);
  } catch {
    sendText(res, 500, 'failed to read file');
  }
};

const manager = createRoomManager();

const attachSocket = (ws: WebSocket): void => {
  const conn: Connection = {
    close: () => {
      ws.close();
    },
    isAlive: true,
    markAlive: () => {
      conn.isAlive = true;
    },
    ping: () => {
      ws.ping();
    },
    send: message => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },
  };
  ws.on('message', data => {
    const text =
      typeof data === 'string'
        ? data
        : Buffer.isBuffer(data)
          ? data.toString('utf8')
          : Array.isArray(data)
            ? Buffer.concat(data).toString('utf8')
            : new TextDecoder().decode(data);
    manager.handleMessage(conn, text);
  });
  ws.on('pong', conn.markAlive);
  ws.on('close', () => {
    manager.handleDisconnect(conn);
  });
  ws.on('error', () => {
    ws.close();
  });
  manager.handleConnect(conn);
};

const server = createServer((req, res) => {
  void handleRequest(req, res);
});
const wss = new WebSocketServer({
  maxPayload: MAX_MESSAGE_BYTES,
  noServer: true,
});

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname === '/ws') {
    wss.handleUpgrade(req, socket, head, attachSocket);
    return;
  }
  socket.destroy();
});

const heartbeat = setInterval(() => {
  for (const conn of manager.connections) {
    if (!conn.isAlive) {
      conn.close();
      continue;
    }
    conn.isAlive = false;
    conn.ping();
  }
}, HEARTBEAT_INTERVAL_MS);
heartbeat.unref();

const port = readPort();

server.on('error', (error: Error) => {
  console.error(`server error: ${error.message}`);
  process.exit(1);
});

server.listen(port, '0.0.0.0', () => {
  console.log('Thing in Rings multiplayer server');
  console.log(`  Local:   http://localhost:${String(port)}${BASE_PATH}`);
  for (const addresses of Object.values(os.networkInterfaces())) {
    if (!addresses) continue;
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        console.log(
          `  Network: http://${address.address}:${String(port)}${BASE_PATH}`,
        );
      }
    }
  }
  console.log(`  WebSocket endpoint: ws://<host>:${String(port)}/ws`);
});
