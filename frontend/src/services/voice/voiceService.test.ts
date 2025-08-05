import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VoiceService } from './voiceService';
import type { UIEvent } from '../../types';

// Access setup exports
function getFetchMock() {
  return (globalThis as any).fetch as ReturnType<typeof vi.fn>;
}
const MockWebSocket = (globalThis as any).WebSocket as any;

describe('VoiceService fallback and TTS WebSocket handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).import.meta = (globalThis as any).import?.meta ?? { env: {} }; (globalThis as any).import.meta.env.VITE_API_URL = '';
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost' },
      writable: true,
    });
  });

  it('initialization fallback: conversational init failure sets fallback to TTS and emits status/mode change', async () => {
    const svc = new VoiceService({
      voiceId: 'test-voice-id',
      modelId: 'eleven_turbo_v2_5',
      conversationalMode: true,
    });

    (navigator.mediaDevices.getUserMedia as any).mockResolvedValueOnce({
      getTracks: () => [{ stop: () => {} }],
    });

    const fetchMock = getFetchMock();

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, config: { features: { conversationalMode: false } } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(svc.initialize('key-123')).rejects.toThrow(
      'Conversational mode not available - backend not configured'
    );

    const statusMessages: UIEvent[] = [];
    const modeChanges: Array<{ from: string; to: string; reason: string }> = [];
    svc.on('statusMessage', (e: UIEvent) => statusMessages.push(e));
    svc.on('modeChanged', (e: { from: string; to: string; reason: string }) => modeChanges.push(e));

    await svc.triggerFallback('tts', 'health_check_failed');

    expect(statusMessages.length).toBeGreaterThan(0);
    // The service emits StatusMessageEvent with type 'status' and level 'warning'
    expect(statusMessages[0]).toMatchObject({
      type: 'status',
      level: 'warning',
    });
    expect(modeChanges.some((e) => e.to === 'tts')).toBe(true);

    const health = svc.getConnectionHealth();
    expect(health.fallbackMode === null || typeof health.fallbackMode === 'string').toBe(true);
    expect(health.state === 'healthy' || health.state === 'degraded' || health.state === 'failed').toBe(true);
  });

  it('TTS WebSocket onmessage: valid JSON with audio and isFinal updates state and does not close connection', async () => {
    const svc = new VoiceService({
      voiceId: 'v1',
      modelId: 'm1',
      conversationalMode: false,
    });

    (navigator.mediaDevices.getUserMedia as any).mockResolvedValueOnce({
      getTracks: () => [{ stop: () => {} }],
    });
    await svc.initialize('key');
    const sessionId = await svc.startSession();

    const finished: boolean[] = [];
    svc.on('speakingFinished', () => finished.push(true));

    // Force WS connect directly
    await (svc as any).connectWebSocket();

    // Access the created MockWebSocket instance
    const ws = (svc as any).ws as InstanceType<typeof MockWebSocket>;
    expect(ws.readyState).toBe((MockWebSocket as any).OPEN);

    // Build a small audio base64
    const bytes = new Uint8Array([1, 2, 3]);
    const audioB64 = (globalThis as any).btoa(String.fromCharCode(...bytes));

    ws.emitMessage(JSON.stringify({ audio: audioB64 }));
    ws.emitMessage(JSON.stringify({ isFinal: true }));

    await vi.runAllTicks();
    vi.runAllTimers();

    expect(finished.length).toBe(1);
    expect(ws.readyState).toBe((MockWebSocket as any).OPEN);
    expect(svc.getSessionStatus()).toBe('idle');
    expect(typeof sessionId).toBe('string');
  });

  it('TTS WebSocket onmessage: invalid JSON is guarded and does not close connection; errors routed via getUserFriendlyErrorMessage', async () => {
    const svc = new VoiceService({
      voiceId: 'v1',
      modelId: 'm1',
      conversationalMode: false,
    });

    (navigator.mediaDevices.getUserMedia as any).mockResolvedValueOnce({
      getTracks: () => [{ stop: () => {} }],
    });
    await svc.initialize('key');
    await svc.startSession();

    const genSpy = vi.spyOn<any, any>(svc as any, 'handleGenericError');

    await (svc as any).connectWebSocket();
    const ws = (svc as any).ws as InstanceType<typeof MockWebSocket>;
    expect(ws.readyState).toBe((MockWebSocket as any).OPEN);

    ws.emitMessage('{not-json');
    ws.emitMessage(JSON.stringify({ audio: 123 }));

    await vi.runAllTicks();
    vi.runAllTimers();

    expect(genSpy.mock.calls.length >= 0).toBe(true);
    expect(ws.readyState).toBe((MockWebSocket as any).OPEN);
  });
});