import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter, type ApiRequest, type ApiResponse } from './routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const webIndexPath = join(__dirname, 'web', 'index.html');

function getWebIndex(): string {
  try {
    if (existsSync(webIndexPath)) {
      return readFileSync(webIndexPath, 'utf-8');
    }
  } catch (err) {
    console.error('Error reading web index:', err);
  }
  return '<h1>Royal Ludo Server Online</h1>';
}

/**
 * Universal Royal Ludo HTTP Application Dispatcher
 */
export class RoyalApp {
  public static handleRequest(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Use standard WHATWG URL API
    const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost:4000'}`);
    const pathname = parsed.pathname;

    // Health check endpoint
    if (pathname === '/health') {
      // If opened in a web browser (e.g. Chrome, Edge), serve the full Royal Ludo game!
      if (req.headers.accept?.includes('text/html')) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getWebIndex());
        return;
      }
      // If requested by an automated test or curl client, send JSON
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'online',
          service: 'Royal Ludo Multiplayer Server',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // Serve complete Royal Ludo Web Game for non-API web routes
    if (!pathname.startsWith('/api') && !pathname.startsWith('/socket.io')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getWebIndex());
      return;
    }

    let bodyData = '';
    req.on('data', (chunk) => {
      bodyData += chunk;
    });

    req.on('end', () => {
      let body: any = {};
      if (bodyData) {
        try {
          body = JSON.parse(bodyData);
        } catch {
          body = {};
        }
      }

      const queryObj: Record<string, string> = {};
      parsed.searchParams.forEach((val, key) => {
        queryObj[key] = val;
      });

      const customReq: ApiRequest = {
        headers: req.headers,
        query: queryObj,
        params: {},
        body,
      };

      const customRes: ApiResponse = {
        statusCode: 200,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          res.writeHead(this.statusCode || 200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        },
      };

      try {
        apiRouter.handle(customReq, customRes, pathname, req.method || 'GET');
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
      }
    });
  }
}
