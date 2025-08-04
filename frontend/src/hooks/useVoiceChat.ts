import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceService } from '../services/voice/voiceService';
import { secureVoiceClient } from '../services/voice/secureVoiceClient';
import { ConversationContext } from '../services/voice/conversationalAgent';

export interface UseVoiceChatOptions {
  autoStart?: boolean;
  voiceId?: string;
  conversationalMode?: boolean;
  onTranscription?: (text: string, isFinal: boolean) => void;
  onUserTranscript?: (transcript: { text: string; isFinal: boolean; timestamp: Date }) => void;
  onAgentResponse?: (response: { text: string; timestamp: Date }) => void;
  onAgentSpeaking?: (data: { isFinal: boolean }) => void;
  onAgentFinishedSpeaking?: () => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: string) => void;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
  onConversationStarted?: (session: any) => void;
  onConversationEnded?: (data: any) => void;
  // Fallback and recovery callbacks
  onFallbackAttempt?: (data: { mode: string; retry: number; reason: string }) => void;
  onModeChanged?: (data: { from: string; to: string; reason: string }) => void;
  onConnectionRecovered?: () => void;
  onUserMessage?: (message: { type: string; message: string; canRetry?: boolean }) => void;
}

export interface UseVoiceChatReturn {
  // State
  isInitialized: boolean;
  isSessionActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'connecting' | 'connected' | 'thinking';
  error: string | null;
  transcript: string;
  sessionId: string | null;
  isConversationalMode: boolean;
  
  // Actions
  startSession: (context?: ConversationContext) => Promise<void>;
  endSession: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  toggleListening: () => Promise<void>;
  clearTranscript: () => void;
  
  // Conversational mode
  enableConversationalMode: (context?: ConversationContext) => Promise<void>;
  disableConversationalMode: () => Promise<void>;
  updateConversationContext: (context: Partial<ConversationContext>) => void;
  
  // Configuration
  setVoiceId: (voiceId: string) => void;
  getAvailableVoices: () => Promise<any[]>;
  
  // Fallback and health monitoring
  getConnectionHealth: () => { state: string; mode: string; fallbackMode: string | null; retryCount: number };
  triggerFallback: (mode: 'tts' | 'conversational', reason?: string) => Promise<void>;
}

export function useVoiceChat(options: UseVoiceChatOptions = {}): UseVoiceChatReturn {
  const {
    autoStart = false,
    voiceId,
    conversationalMode = false,
    onTranscription,
    onUserTranscript,
    onAgentResponse,
    onAgentSpeaking,
    onAgentFinishedSpeaking,
    onError,
    onStatusChange,
    onSessionStart,
    onSessionEnd,
    onConversationStarted,
    onConversationEnded,
    onFallbackAttempt,
    onModeChanged,
    onConnectionRecovered,
    onUserMessage,
  } = options;

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'connecting' | 'connected' | 'thinking'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [isConversationalMode, setIsConversationalMode] = useState(conversationalMode);

  // Refs for callbacks to avoid recreating event listeners
  const onTranscriptionRef = useRef(onTranscription);
  const onUserTranscriptRef = useRef(onUserTranscript);
  const onAgentResponseRef = useRef(onAgentResponse);
  const onAgentSpeakingRef = useRef(onAgentSpeaking);
  const onAgentFinishedSpeakingRef = useRef(onAgentFinishedSpeaking);
  const onErrorRef = useRef(onError);
  const onStatusChangeRef = useRef(onStatusChange);
  const onConversationStartedRef = useRef(onConversationStarted);
  const onConversationEndedRef = useRef(onConversationEnded);
  const onFallbackAttemptRef = useRef(onFallbackAttempt);
  const onModeChangedRef = useRef(onModeChanged);
  const onConnectionRecoveredRef = useRef(onConnectionRecovered);
  const onUserMessageRef = useRef(onUserMessage);

  // Update refs when callbacks change
  useEffect(() => {
    onTranscriptionRef.current = onTranscription;
    onUserTranscriptRef.current = onUserTranscript;
    onAgentResponseRef.current = onAgentResponse;
    onAgentSpeakingRef.current = onAgentSpeaking;
    onAgentFinishedSpeakingRef.current = onAgentFinishedSpeaking;
    onErrorRef.current = onError;
    onStatusChangeRef.current = onStatusChange;
    onConversationStartedRef.current = onConversationStarted;
    onConversationEndedRef.current = onConversationEnded;
    onFallbackAttemptRef.current = onFallbackAttempt;
    onModeChangedRef.current = onModeChanged;
    onConnectionRecoveredRef.current = onConnectionRecovered;
    onUserMessageRef.current = onUserMessage;
  }, [
    onTranscription, 
    onUserTranscript, 
    onAgentResponse, 
    onAgentSpeaking, 
    onAgentFinishedSpeaking, 
    onError, 
    onStatusChange,
    onConversationStarted,
    onConversationEnded,
    onFallbackAttempt,
    onModeChanged,
    onConnectionRecovered,
    onUserMessage
  ]);

  // Initialize voice services
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if voice service is configured on server
        const isConfigured = await secureVoiceClient.isConfigured();
        if (!isConfigured) {
          const errorMsg = 'Voice service not configured on server (ElevenLabs API key missing)';
          setError(errorMsg);
          console.warn('Voice chat initialization failed:', errorMsg);
          onErrorRef.current?.({ message: errorMsg });
          return;
        }

        // Get configuration from secure endpoint
        const configData = await secureVoiceClient.getConfig();
        
        // Set voice config including conversational mode
        const config = { 
          voiceId: voiceId || configData.config.defaultVoiceId,
          conversationalMode: isConversationalMode,
          ...configData.config.voiceSettings
        };
        voiceService.setVoiceConfig(config);
        
        // Initialize with secure token (not API key)
        await voiceService.initialize('secure-token');
        
        setIsInitialized(true);
        
        // Set available voices from config
        setAvailableVoices(configData.config.availableVoices);
        
        if (autoStart) {
          await startSession();
        }
      } catch (err) {
        // Don't treat conversational mode unavailability as a hard error
        if (err instanceof Error && err.message.includes('not available')) {
          console.log('Voice services initialized without conversational mode');
          setIsInitialized(true); // Still allow regular voice features
        } else {
          console.error('Failed to initialize voice services:', err);
          setError('Failed to initialize voice services');
          onErrorRef.current?.(err);
        }
      }
    };

    initialize();
  }, [voiceId, autoStart, isConversationalMode]);

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

    // Conversational AI event handlers
    const handleUserTranscript = (transcript: any) => {
      onUserTranscriptRef.current?.(transcript);
    };

    const handleAgentResponse = (response: any) => {
      onAgentResponseRef.current?.(response);
    };

    const handleAgentSpeaking = (data: any) => {
      setIsSpeaking(true);
      onAgentSpeakingRef.current?.(data);
    };

    const handleAgentFinishedSpeaking = () => {
      setIsSpeaking(false);
      onAgentFinishedSpeakingRef.current?.();
    };

    const handleConversationStarted = (session: any) => {
      setIsSessionActive(true);
      setSessionId(session.sessionId);
      setStatus('connected');
      onConversationStartedRef.current?.(session);
    };

    const handleConversationEnded = (data: any) => {
      setIsSessionActive(false);
      setIsListening(false);
      setIsSpeaking(false);
      setStatus('idle');
      setSessionId(null);
      onConversationEndedRef.current?.(data);
    };

    // Fallback and recovery event handlers
    const handleFallbackAttempt = (data: any) => {
      console.log('Fallback attempt:', data);
      onFallbackAttemptRef.current?.(data);
    };

    const handleModeChanged = (data: any) => {
      console.log('Voice mode changed:', data);
      setIsConversationalMode(data.to === 'conversational');
      onModeChangedRef.current?.(data);
    };

    const handleConnectionRecovered = () => {
      console.log('Connection recovered');
      setError(null);
      onConnectionRecoveredRef.current?.();
    };

    const handleUserMessage = (message: any) => {
      console.log('User message:', message);
      if (message.type === 'error') {
        setError(message.message);
      }
      onUserMessageRef.current?.(message);
    };

    // Add regular event listeners
    voiceService.on('transcription', handleTranscription);
    voiceService.on('error', handleError);
    voiceService.on('sessionStarted', handleSessionStarted);
    voiceService.on('sessionEnded', handleSessionEnded);
    voiceService.on('listeningStarted', handleListeningStarted);
    voiceService.on('listeningStopped', handleListeningStopped);
    voiceService.on('speakingStarted', handleSpeakingStarted);
    voiceService.on('speakingFinished', handleSpeakingFinished);

    // Add conversational AI event listeners
    voiceService.on('userTranscript', handleUserTranscript);
    voiceService.on('agentResponse', handleAgentResponse);
    voiceService.on('agentSpeaking', handleAgentSpeaking);
    voiceService.on('agentFinishedSpeaking', handleAgentFinishedSpeaking);
    voiceService.on('conversationStarted', handleConversationStarted);
    voiceService.on('conversationEnded', handleConversationEnded);

    // Add fallback and recovery event listeners
    voiceService.on('fallbackAttempt', handleFallbackAttempt);
    voiceService.on('modeChanged', handleModeChanged);
    voiceService.on('connectionRecovered', handleConnectionRecovered);
    voiceService.on('userMessage', handleUserMessage);

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
      
      // Cleanup conversational AI listeners
      voiceService.off('userTranscript', handleUserTranscript);
      voiceService.off('agentResponse', handleAgentResponse);
      voiceService.off('agentSpeaking', handleAgentSpeaking);
      voiceService.off('agentFinishedSpeaking', handleAgentFinishedSpeaking);
      voiceService.off('conversationStarted', handleConversationStarted);
      voiceService.off('conversationEnded', handleConversationEnded);
      
      // Cleanup fallback and recovery listeners
      voiceService.off('fallbackAttempt', handleFallbackAttempt);
      voiceService.off('modeChanged', handleModeChanged);
      voiceService.off('connectionRecovered', handleConnectionRecovered);
      voiceService.off('userMessage', handleUserMessage);
    };
  }, [isSpeaking, onSessionStart, onSessionEnd]);

  // Actions
  const startSession = useCallback(async (context?: ConversationContext) => {
    if (!isInitialized) {
      throw new Error('Voice services not initialized');
    }
    
    try {
      const id = await voiceService.startSession(context);
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
      const voices = await secureVoiceClient.getVoices();
      setAvailableVoices(voices);
      return voices;
    } catch (err) {
      console.error('Failed to fetch voices:', err);
      return availableVoices;
    }
  }, [isInitialized, availableVoices]);

  // Conversational mode methods
  const enableConversationalMode = useCallback(async (context?: ConversationContext) => {
    if (isConversationalMode) return;
    
    try {
      await voiceService.enableConversationalMode(context);
      setIsConversationalMode(true);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isConversationalMode]);

  const disableConversationalMode = useCallback(async () => {
    if (!isConversationalMode) return;
    
    try {
      await voiceService.disableConversationalMode();
      setIsConversationalMode(false);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isConversationalMode]);

  const updateConversationContext = useCallback((context: Partial<ConversationContext>) => {
    voiceService.updateConversationContext(context);
  }, []);

  // Fallback and health monitoring methods
  const getConnectionHealth = useCallback(() => {
    return voiceService.getConnectionHealth();
  }, []);

  const triggerFallback = useCallback(async (mode: 'tts' | 'conversational', reason: string = 'manual') => {
    await voiceService.triggerFallback(mode, reason);
  }, []);

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
    isConversationalMode,
    
    // Actions
    startSession,
    endSession,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleListening,
    clearTranscript,
    
    // Conversational mode
    enableConversationalMode,
    disableConversationalMode,
    updateConversationContext,
    
    // Configuration
    setVoiceId,
    getAvailableVoices,
    
    // Fallback and health monitoring
    getConnectionHealth,
    triggerFallback,
  };
}