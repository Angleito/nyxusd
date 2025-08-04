import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import type { ChatMessage } from '../services/memory/chatMemoryService';

const API_BASE = import.meta.env.VITE_API_URL || 'https://nyxusd.com';

export interface MemoryHookState {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  appendMessage: (message: Partial<ChatMessage>) => Promise<void>;
  getContext: () => Promise<string>;
  saveProfile: (updates: any) => Promise<void>;
  archiveSession: () => Promise<string | null>;
}

export function useVercelMemory(): MemoryHookState {
  const { address } = useAccount();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = () => {
      const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(id);
      
      // Save to sessionStorage for persistence during session
      sessionStorage.setItem('currentSessionId', id);
    };

    // Check for existing session
    const existingSession = sessionStorage.getItem('currentSessionId');
    if (existingSession) {
      setSessionId(existingSession);
    } else {
      initSession();
    }
  }, []);

  // Save user profile when wallet connects
  useEffect(() => {
    if (address && sessionId) {
      saveProfile({
        walletAddress: address,
        history: {
          lastSeen: new Date(),
        }
      });
    }
  }, [address, sessionId]);

  const appendMessage = useCallback(async (message: Partial<ChatMessage>) => {
    if (!sessionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/memory/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: {
            ...message,
            timestamp: new Date(),
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to append message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to append message');
      console.error('Memory append error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const getContext = useCallback(async (): Promise<string> => {
    if (!sessionId) return '';
    
    try {
      const response = await fetch(`${API_BASE}/api/memory/context/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to get context');
      }
      
      const data = await response.json();
      return data.context || '';
    } catch (err) {
      console.error('Failed to get context:', err);
      return '';
    }
  }, [sessionId]);

  const saveProfile = useCallback(async (updates: any) => {
    if (!address) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/memory/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          profile: updates
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  }, [address]);

  const archiveSession = useCallback(async (): Promise<string | null> => {
    if (!sessionId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/memory/archive/${sessionId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to archive session');
      }
      
      const data = await response.json();
      
      // Clear current session
      sessionStorage.removeItem('currentSessionId');
      setSessionId(null);
      
      // Initialize new session
      const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newId);
      sessionStorage.setItem('currentSessionId', newId);
      
      return data.archiveUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive session');
      console.error('Archive error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return {
    sessionId,
    isLoading,
    error,
    appendMessage,
    getContext,
    saveProfile,
    archiveSession,
  };
}