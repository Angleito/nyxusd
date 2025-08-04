import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversationalAgent, createConversationalAgent } from './conversationalAgent';

function getFetchMock() {
  return (globalThis as any).fetch as ReturnType<typeof vi.fn>;
}

describe('ConversationalAgent.createAgent POST flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).import.meta = (globalThis as any).import?.meta ?? { env: {} }; (globalThis as any).import.meta.env.VITE_API_URL = '';
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost' },
      writable: true,
    });
  });

  it('createAgent success: parses response and emits agentCreated', async () => {
    const agent = createConversationalAgent({
      voiceId: 'voice_123',
      ttsConfig: { model: 'eleven_turbo_v2_5' },
      firstMessage: 'hi',
    });

    const events: Array<['agentCreated', unknown]> = [];
    agent.on('agentCreated', (e) => events.push(['agentCreated', e]));

    const mockResponse = {
      success: true,
      sessionId: 'sess_abc',
      agentId: 'agent_xyz',
      websocketUrl: 'wss://example/ws',
      config: { any: 'thing' },
    };

    const fm = getFetchMock();
    fm.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    const returnedAgentId = await agent.createAgent({
      userProfile: { experience: 'beginner' },
      defiCapabilities: { canExecuteSwaps: false },
    });

    expect(returnedAgentId).toBe('agent_xyz');

    expect(fm).toHaveBeenCalledTimes(1);
    const call = fm.mock.calls[0]!;
    expect(String(call[0])).toBe('http://localhost/api/voice/conversational-agent');
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body.config.voiceId).toBe('voice_123');
    expect(body.config.modelId).toBe('eleven_turbo_v2_5');

    const created = events.find((e) => e[0] === 'agentCreated');
    expect(created).toBeTruthy();
    expect(created?.[1]).toMatchObject({
      agentId: 'agent_xyz',
      sessionId: 'sess_abc',
      websocketUrl: 'wss://example/ws',
    });
  });

  it('createAgent failure: non-ok response throws with statusText and no state set', async () => {
    const agent = new ConversationalAgent({ voiceId: 'v' });

    const fm = getFetchMock();
    fm.mockResolvedValueOnce(new Response(JSON.stringify({ details: 'Bad stuff' }), {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': 'application/json' },
    }));

    await expect(agent.createAgent()).rejects.toThrow(
      'Failed to create conversational agent: Internal Server Error - Bad stuff'
    );

    expect(agent.getCurrentSession()).toBeNull();
  });

  it('createAgent failure: success:false payload throws "Backend error"', async () => {
    const agent = new ConversationalAgent({ voiceId: 'v' });

    const fm = getFetchMock();
    fm.mockResolvedValueOnce(new Response(JSON.stringify({ success: false, error: 'blocked' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    await expect(agent.createAgent()).rejects.toThrow('Backend error: blocked');
    expect(agent.getCurrentSession()).toBeNull();
  });
});