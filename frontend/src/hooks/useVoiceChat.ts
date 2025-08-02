import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceService } from '../services/voice/voiceService';
import { elevenLabsClient } from '../services/voice/elevenLabsClient';

export interface UseVoiceChatOptions {
  apiKey?: string;
  autoStart?: boolean;
  voiceId?: string;
  onTranscription?: (text: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: string) => void;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
}

export interface UseVoiceChatReturn {
  // State
  isInitialized: boolean;
  isSessionActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  error: string | null;
  transcript: string;
  sessionId: string | null;
  
  // Actions
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  toggleListening: () => Promise<void>;
  clearTranscript: () => void;
  
  // Configuration
  setVoiceId: (voiceId: string) => void;
  getAvailableVoices: () => Promise<any[]>;
}

export function useVoiceChat(options: UseVoiceChatOptions = {}): UseVoiceChatReturn {
  const {
    apiKey,
    autoStart = false,
    voiceId,
    onTranscription,
    onError,
    onStatusChange,
    onSessionStart,
    onSessionEnd,
  } = options;

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);

  // Refs for callbacks to avoid recreating event listeners
  const onTranscriptionRef = useRef(onTranscription);
  const onErrorRef = useRef(onError);
  const onStatusChangeRef = useRef(onStatusChange);

  // Update refs when callbacks change
  useEffect(() => {
    onTranscriptionRef.current = onTranscription;
    onErrorRef.current = onError;
    onStatusChangeRef.current = onStatusChange;
  }, [onTranscription, onError, onStatusChange]);

  // Initialize voice services
  useEffect(() => {
    const initialize = async () => {
      try {
        if (apiKey) {
          await elevenLabsClient.initialize(apiKey);
          
          if (voiceId) {
            voiceService.setVoiceConfig({ voiceId });
          }
          
          setIsInitialized(true);
          
          // Fetch available voices
          try {
            const voices = await elevenLabsClient.getVoices();
            setAvailableVoices(voices);
          } catch (err) {
            console.warn('Failed to fetch voices:', err);
          }
          
          if (autoStart) {
            await startSession();
          }
        }
      } catch (err) {
        console.error('Failed to initialize voice services:', err);
        setError('Failed to initialize voice services');
        onErrorRef.current?.(err);
      }
    };

    initialize();
  }, [apiKey, voiceId, autoStart]);

  // Set up event listeners
  useEffect(() => {
    const handleTranscription = (result: any) => {
      setTranscript(result.text);
      onTranscriptionRef.current?.(result.text, result.isFinal);
      
      if (result.isFinal) {
        setStatus('processing');
        onStatusChangeRef.current?.('processing');
      }
    };

    const handleError = (err: any) => {
      setError(err.message || 'An error occurred');
      setStatus('error');
      onErrorRef.current?.(err);
      onStatusChangeRef.current?.('error');
    };

    const handleSessionStarted = (session: any) => {
      setIsSessionActive(true);
      setSessionId(session.id);
      setError(null);
      onSessionStart?.(session.id);
    };

    const handleSessionEnded = () => {
      setIsSessionActive(false);
      setIsListening(false);
      setIsSpeaking(false);
      setStatus('idle');
      setSessionId(null);
      onSessionEnd?.();
    };

    const handleListeningStarted = () => {
      setIsListening(true);
      setStatus('listening');
      onStatusChangeRef.current?.('listening');
    };

    const handleListeningStopped = () => {
      setIsListening(false);
      if (!isSpeaking) {
        setStatus('idle');
        onStatusChangeRef.current?.('idle');
      }
    };

    const handleSpeakingStarted = () => {
      setIsSpeaking(true);
      setStatus('speaking');
      onStatusChangeRef.current?.('speaking');
    };

    const handleSpeakingFinished = () => {
      setIsSpeaking(false);
      if (!isListening) {
        setStatus('idle');
        onStatusChangeRef.current?.('idle');
      }
    };

    // Add event listeners
    voiceService.on('transcription', handleTranscription);
    voiceService.on('error', handleError);
    voiceService.on('sessionStarted', handleSessionStarted);
    voiceService.on('sessionEnded', handleSessionEnded);
    voiceService.on('listeningStarted', handleListeningStarted);
    voiceService.on('listeningStopped', handleListeningStopped);
    voiceService.on('speakingStarted', handleSpeakingStarted);
    voiceService.on('speakingFinished', handleSpeakingFinished);

    // Cleanup
    return () => {
      voiceService.off('transcription', handleTranscription);
      voiceService.off('error', handleError);
      voiceService.off('sessionStarted', handleSessionStarted);
      voiceService.off('sessionEnded', handleSessionEnded);
      voiceService.off('listeningStarted', handleListeningStarted);
      voiceService.off('listeningStopped', handleListeningStopped);
      voiceService.off('speakingStarted', handleSpeakingStarted);
      voiceService.off('speakingFinished', handleSpeakingFinished);
    };
  }, [isSpeaking, onSessionStart, onSessionEnd]);

  // Actions
  const startSession = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('Voice services not initialized');
    }
    
    try {
      const id = await voiceService.startSession();
      setSessionId(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isInitialized]);

  const endSession = useCallback(async () => {
    try {
      await voiceService.endSession();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSessionActive) {
      await startSession();
    }
    
    try {
      await voiceService.startListening();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isSessionActive, startSession]);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!isSessionActive) {
      await startSession();
    }
    
    try {
      await voiceService.speakText(text);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isSessionActive, startSession]);

  const stopSpeaking = useCallback(() => {
    voiceService.stopSpeaking();
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const setVoiceId = useCallback((newVoiceId: string) => {
    voiceService.setVoiceConfig({ voiceId: newVoiceId });
  }, []);

  const getAvailableVoices = useCallback(async () => {
    if (!isInitialized) {
      return [];
    }
    
    try {
      const voices = await elevenLabsClient.getVoices();
      setAvailableVoices(voices);
      return voices;
    } catch (err) {
      console.error('Failed to fetch voices:', err);
      return availableVoices;
    }
  }, [isInitialized, availableVoices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSessionActive) {
        voiceService.endSession();
      }
    };
  }, [isSessionActive]);

  return {
    // State
    isInitialized,
    isSessionActive,
    isListening,
    isSpeaking,
    status,
    error,
    transcript,
    sessionId,
    
    // Actions
    startSession,
    endSession,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleListening,
    clearTranscript,
    
    // Configuration
    setVoiceId,
    getAvailableVoices,
  };
}