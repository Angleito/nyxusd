import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'node:buffer';

type TranscriptionSuccess = {
  success: true;
  text: string;
  language?: string;
  durationSec?: number;
  timestamp: string;
};

type TranscriptionError = {
  success: false;
  error: string;
  details?: string;
  timestamp: string;
};

function setCors(res: VercelResponse): void {
  const isDevelopment =
    process.env['NODE_ENV'] === 'development' ||
    process.env['VERCEL_ENV'] === 'development';

  const allowedOrigins = [
    'https://nyxusd.com',
    'https://www.nyxusd.com',
    ...(isDevelopment
      ? ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080']
      : []),
  ];

  const origin = res.req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (isDevelopment) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

// Lightweight multipart parser for small uploads using request arrayBuffer
async function readRawBody(req: VercelRequest): Promise<ArrayBuffer> {
  // @vercel/node provides req as a Node IncomingMessage; we can collect buffers
  const chunks: Buffer[] = [];
  return await new Promise<ArrayBuffer>((resolve, reject) => {
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (e) => reject(e));
  });
}

function parseMultipartFormData(contentType: string | undefined, body: ArrayBuffer): { fileName?: string; fileType?: string; fileBuffer?: Uint8Array } | null {
  if (!contentType || !contentType.includes('multipart/form-data')) return null;
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) return null;
  const boundary = `--${boundaryMatch[1]}`;

  const data = new Uint8Array(body);
  const text = new TextDecoder().decode(data);

  const parts = text.split(boundary);
  for (const part of parts) {
    // Each part contains headers, blank line, then content
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const headersRaw = part.slice(0, headerEnd);
    const contentRaw = part.slice(headerEnd + 4);

    // Skip the trailing -- at the end boundary
    if (headersRaw.includes('--\r\n') || contentRaw.trim() === '--') continue;

    // Only consider file fields (Content-Disposition: form-data; name="file"; filename="...") 
    const dispMatch = headersRaw.match(/Content-Disposition:.*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
    if (!dispMatch) continue;

    const fieldName = dispMatch[1];
    const fileName = dispMatch[2];

    if (!fileName) continue; // not a file field

    const typeMatch = headersRaw.match(/Content-Type:\s*([^\r\n]+)/i);
    const fileType = typeMatch ? typeMatch[1].trim() : 'application/octet-stream';

    // Convert contentRaw (string) back to bytes by slicing from original array buffer by offsets
    // To keep simple and robust, rebuild by re-encoding string
    const fileBuffer = new TextEncoder().encode(contentRaw);

    return { fileName, fileType, fileBuffer };
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const OPENAI_API_KEY = process.env['OPENAI_API_KEY'];
    if (!OPENAI_API_KEY) {
      const payload: TranscriptionError = {
        success: false,
        error: 'Voice STT not configured',
        details: 'OPENAI_API_KEY is missing',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(payload);
      return;
    }

    const MODEL = process.env['VOICE_STT_MODEL'] || 'gpt-4o-mini-transcribe';

    const ct = (req.headers['content-type'] || '').toString();
    if (!ct.toLowerCase().includes('multipart/form-data')) {
      const payload: TranscriptionError = {
        success: false,
        error: 'Invalid content type',
        details: 'Use multipart/form-data with an audio file field',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(payload);
      return;
    }

    const raw = await readRawBody(req);
    const parsed = parseMultipartFormData(ct, raw);
    if (!parsed || !parsed.fileBuffer) {
      const payload: TranscriptionError = {
        success: false,
        error: 'No file found',
        details: 'Expected a file field in multipart/form-data payload',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(payload);
      return;
    }

    // Build a FormData payload to forward to OpenAI transcription
    // Node 18+ has global FormData, Blob
    const fd = new FormData();
    const fileName = parsed.fileName || 'audio.webm';
    const fileType = parsed.fileType || 'audio/webm';
    const blob = new Blob([parsed.fileBuffer], { type: fileType });
    fd.append('file', blob, fileName);
    fd.append('model', MODEL);
    // You can pass language hints if desired:
    // fd.append('language', 'en');

    // Call OpenAI’s transcription endpoint
    // POST https://api.openai.com/v1/audio/transcriptions
    const upstream = await (globalThis as any).fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: fd as any,
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      const payload: TranscriptionError = {
        success: false,
        error: 'Transcription failed',
        details: `Upstream ${upstream.status} ${upstream.statusText} ${detail.slice(0, 300)}`,
        timestamp: new Date().toISOString(),
      };
      res.status(upstream.status >= 400 ? upstream.status : 502).json(payload);
      return;
    }

    const result = await upstream.json().catch(() => ({} as any));
    // Expected shape includes "text"; some models may include "language", "duration"
    const text: string | undefined = typeof result?.text === 'string' ? result.text : undefined;
    if (!text) {
      const payload: TranscriptionError = {
        success: false,
        error: 'Invalid transcription response',
        details: JSON.stringify(result).slice(0, 300),
        timestamp: new Date().toISOString(),
      };
      res.status(502).json(payload);
      return;
    }

    const success: TranscriptionSuccess = {
      success: true,
      text,
      language: typeof result?.language === 'string' ? result.language : undefined,
      durationSec: typeof result?.duration === 'number' ? result.duration : undefined,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(success);
  } catch (err: any) {
    const payload: TranscriptionError = {
      success: false,
      error: 'Internal server error',
      details: err?.message || 'unknown',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(payload);
  }
}