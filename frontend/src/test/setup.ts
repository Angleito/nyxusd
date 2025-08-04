// Vitest global setup for jsdom environment: mock timers, fetch, WebSocket, AudioContext, SpeechRecognition
import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import type { InboundWsMessage } from '../types';
import type { ISpeechRecognition, UIEvent } from '../types';

// Use modern fake timers for deterministic setTimeout/setInterval
vi.useFakeTimers();

// Minimal EventTarget polyfill for older jsdom edge cases (jsdom already has it, but ensure consistency)
class SimpleEventTarget {
  private listeners: Record<string, Set<EventListenerOrEventListenerObject>> = {};
  addEventListener(type: string, callback: EventListenerOrEventListenerObject) {
    if (!this.listeners[type]) this.listeners[type] = new Set();
    this.listeners[type].add(callback);
  }
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject) {
    this.listeners[type]?.delete(callback);
  }
  dispatchEvent(event: Event) {
    const cbs = Array.from(this.listeners[event.type] || []);
    for (const cb of cbs) {
      if (typeof cb === 'function') cb.call(this, event);
      else cb.handleEvent(event);
    }
    return true;
  }
}

// Global fetch mock
const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
  // Default: return 404 to ensure tests explicitly stub behavior
  return new Response(JSON.stringify({ success: false, error: 'Not mocked' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
});
(globalThis as any).fetch = fetchMock;

// atob/btoa for Node test env
if (!(globalThis as any).atob) {
  (globalThis as any).atob = (data: string) => Buffer.from(data, 'base64').toString('binary');
}
if (!(globalThis as any).btoa) {
  (globalThis as any).btoa = (data: string) => Buffer.from(data, 'binary').toString('base64');
}

// Minimal WebSocket mock that preserves interface and lifecycle
type WSHandlers = {
  open?: () => void;
  message?: (ev: { data: any }) => void;
  error?: (ev: any) => void;
  close?: (ev: { code?: number; reason?: string; wasClean?: boolean }) => void;
};
class MockWebSocket extends SimpleEventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState = MockWebSocket.CONNECTING;
  public url: string;
  public sent: string[] = [];
  public onopen: WSHandlers['open'] | null = null;
  public onmessage: WSHandlers['message'] | null = null;
  public onerror: WSHandlers['error'] | null = null;
  public onclose: WSHandlers['close'] | null = null;

  constructor(url: string) {
    super();
    super.dispatchEvent(new Event('constructor'));
    this.url = url;
    // Open asynchronously to mimic real behavior
    queueMicrotask(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    });
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.sent.push(data);
  }

  close(code?: number, reason?: string) {
    if (this.readyState === MockWebSocket.CLOSED) return;
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code, reason, wasClean: true });
  }

  // Test helpers
  emitMessage(data: any) {
    if (this.readyState !== MockWebSocket.OPEN) return;
    this.onmessage?.({ data });
  }
  emitError(err: any) {
    this.onerror?.(err);
  }
}
(globalThis as any).WebSocket = MockWebSocket;

// Minimal AudioContext mock with decodeAudioData and createBufferSource
class MockAudioBufferSourceNode {
  buffer: any = null;
  onended: (() => void) | null = null;
  connect() {}
  start() {
    // Simulate audio playback finishing on next tick
    queueMicrotask(() => this.onended?.());
  }
}
class MockAudioContext {
  destination = {};
  decodeAudioData = vi.fn(async (_arrayBuffer: ArrayBuffer) => ({}));
  createBufferSource() {
    return new MockAudioBufferSourceNode();
  }
  close = vi.fn(async () => {});
}
(globalThis as any).AudioContext = MockAudioContext;
(globalThis as any).webkitAudioContext = MockAudioContext;

// Typed SpeechRecognition factory for tests
export function createMockRecognition(overrides: Partial<ISpeechRecognition> = {}): ISpeechRecognition {
  const base: ISpeechRecognition = {
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    onresult: null,
    onerror: null,
    onend: null,
    start: () => {},
    stop: () => {},
  };
  return { ...base, ...overrides };
}

// Minimal SpeechRecognition mock class installed on window for code paths using `new SpeechRecognition()`
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  onresult: ISpeechRecognition['onresult'] = null;
  onerror: ISpeechRecognition['onerror'] = null;
  onend: ISpeechRecognition['onend'] = null;
  start = vi.fn(() => {});
  stop = vi.fn(() => {
    this.onend?.();
  });
}
(globalThis as any).SpeechRecognition = MockSpeechRecognition;
(globalThis as any).webkitSpeechRecognition = MockSpeechRecognition;

// navigator.mediaDevices.getUserMedia mock
if (!('navigator' in globalThis)) {
  (globalThis as any).navigator = {} as any;
}
(globalThis.navigator as any).mediaDevices = (globalThis.navigator as any).mediaDevices || {};
(globalThis.navigator as any).mediaDevices.getUserMedia = vi.fn(async () => {
  // Return a minimal stream-like object
  return {
    getTracks: () => [{ stop: () => {} }],
  };
});

// window.import.meta.env mock for Vite variables used in code
if (!(globalThis as any).window) {
  (globalThis as any).window = globalThis;
}
// Ensure import.meta.env exists for code referencing it directly
// Vitest uses ESM; define a global "import" holder with "meta.env"
const importMeta: any = { env: { MODE: 'test', VITE_API_URL: '' } };
// Define a global accessor 'import' with 'meta'
(Object.assign(globalThis as any, { import: { meta: importMeta } }));
// Also define a global property 'import' to be safe for property writes/reads
if (!((globalThis as any).import && (globalThis as any).import.meta)) {
  Object.defineProperty(globalThis as any, 'import', {
    value: { meta: importMeta },
    writable: true,
    configurable: true,
  });
}
// Finally, expose direct alias so tests can do (globalThis as any).import.meta.env

// Helpers/factories for typed messages and timing
export function createMockWsMessage(m: InboundWsMessage): MessageEvent {
  return { data: JSON.stringify(m) } as unknown as MessageEvent;
}

export function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function textEvent(text: string): InboundWsMessage {
  // Prefer 'transcription' variant used in implementation parsing
  return { type: 'transcription', text, isFinal: true };
}

// Re-export UI event type to aid tests in precise typing without importing from service each time
export type { UIEvent } from '../types';

// Reset mocks between tests
beforeAll(() => {
  // nothing yet
});

afterEach(() => {
  vi.clearAllMocks();
  // advance timers to flush queued tasks deterministically
  vi.runAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

export { fetchMock, MockWebSocket, MockAudioContext, MockSpeechRecognition };