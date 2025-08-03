import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, Loader2, AlertCircle } from 'lucide-react';
import { voiceService } from '../../services/voice/voiceService';
import { secureVoiceClient } from '../../services/voice/secureVoiceClient';

interface VoiceControlsProps {
  onTranscription?: (text: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: string) => void;
  className?: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  onTranscription,
  onError,
  onStatusChange,
  apiKey,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize voice services
    const initializeServices = async () => {
      try {
        // Check if voice service is configured on the server
        const isConfigured = await secureVoiceClient.isConfigured();
        if (!isConfigured) {
          setError('Voice service not configured');
          return;
        }

        // Get token from server (no API key needed on frontend)
        const tokenData = await secureVoiceClient.getConfig();
        if (tokenData.configured) {
          // Initialize voice service with secure configuration
          await voiceService.initialize('secure-token'); // Placeholder, actual auth via server
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to initialize voice services:', err);
        setError('Failed to initialize voice services');
        onError?.(err);
      }
    };

    initializeServices();

    // Set up event listeners
    voiceService.on('transcription', handleTranscription);
    voiceService.on('finalTranscription', handleFinalTranscription);
    voiceService.on('error', handleError);
    voiceService.on('sessionStarted', handleSessionStarted);
    voiceService.on('sessionEnded', handleSessionEnded);
    voiceService.on('listeningStarted', handleListeningStarted);
    voiceService.on('listeningStopped', handleListeningStopped);
    voiceService.on('speakingStarted', handleSpeakingStarted);
    voiceService.on('speakingFinished', handleSpeakingFinished);

    return () => {
      // Clean up event listeners
      voiceService.off('transcription', handleTranscription);
      voiceService.off('finalTranscription', handleFinalTranscription);
      voiceService.off('error', handleError);
      voiceService.off('sessionStarted', handleSessionStarted);
      voiceService.off('sessionEnded', handleSessionEnded);
      voiceService.off('listeningStarted', handleListeningStarted);
      voiceService.off('listeningStopped', handleListeningStopped);
      voiceService.off('speakingStarted', handleSpeakingStarted);
      voiceService.off('speakingFinished', handleSpeakingFinished);
      
      // Clean up audio analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [apiKey]);

  const handleTranscription = (result: any) => {
    onTranscription?.(result.text, result.isFinal);
  };

  const handleFinalTranscription = (result: any) => {
    setStatus('processing');
    onStatusChange?.('processing');
  };

  const handleError = (err: any) => {
    setError(err.message || 'An error occurred');
    setStatus('error');
    onError?.(err);
    onStatusChange?.('error');
  };

  const handleSessionStarted = () => {
    setSessionActive(true);
    setError(null);
  };

  const handleSessionEnded = () => {
    setSessionActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setStatus('idle');
  };

  const handleListeningStarted = () => {
    setIsListening(true);
    setStatus('listening');
    onStatusChange?.('listening');
    startAudioAnalysis();
  };

  const handleListeningStopped = () => {
    setIsListening(false);
    if (!isSpeaking) {
      setStatus('idle');
      onStatusChange?.('idle');
    }
    stopAudioAnalysis();
  };

  const handleSpeakingStarted = () => {
    setIsSpeaking(true);
    setStatus('speaking');
    onStatusChange?.('speaking');
  };

  const handleSpeakingFinished = () => {
    setIsSpeaking(false);
    if (!isListening) {
      setStatus('idle');
      onStatusChange?.('idle');
    }
  };

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };
      
      updateLevel();
    } catch (err) {
      console.error('Failed to start audio analysis:', err);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const toggleListening = async () => {
    if (!isInitialized) {
      setError('Voice services not initialized');
      return;
    }

    try {
      if (!sessionActive) {
        await voiceService.startSession();
      }

      if (isListening) {
        voiceService.stopListening();
      } else {
        await voiceService.startListening();
      }
    } catch (err: any) {
      console.error('Failed to toggle listening:', err);
      setError(err.message);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implement actual mute logic here
  };

  const endSession = async () => {
    try {
      await voiceService.endSession();
    } catch (err: any) {
      console.error('Failed to end session:', err);
      setError(err.message);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'bg-red-500';
      case 'processing': return 'bg-yellow-500';
      case 'speaking': return 'bg-green-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      case 'error': return error || 'Error';
      default: return 'Ready';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Main microphone button */}
      <motion.button
        onClick={toggleListening}
        disabled={!isInitialized || status === 'processing'}
        className={`relative p-3 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-purple-600 hover:bg-purple-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Audio level indicator */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-400 opacity-30"
            animate={{ scale: 1 + audioLevel * 0.5 }}
            transition={{ duration: 0.1 }}
          />
        )}
        
        {status === 'processing' ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : isListening ? (
          <Mic className="w-5 h-5 text-white" />
        ) : (
          <MicOff className="w-5 h-5 text-white" />
        )}
      </motion.button>

      {/* Volume control */}
      <motion.button
        onClick={toggleMute}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-gray-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-gray-400" />
        )}
      </motion.button>

      {/* Settings button */}
      <motion.button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings className="w-4 h-4 text-gray-400" />
      </motion.button>

      {/* Status indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${
          status === 'listening' ? 'animate-pulse' : ''
        }`} />
        <span className="text-xs text-gray-400">{getStatusText()}</span>
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center space-x-1 text-xs text-red-400"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-12 right-0 w-64 p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50"
          >
            <h3 className="text-sm font-semibold text-white mb-3">Voice Settings</h3>
            
            <div className="space-y-3">
              {/* Volume slider */}
              <div>
                <label className="text-xs text-gray-400">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Session control */}
              {sessionActive && (
                <button
                  onClick={endSession}
                  className="w-full px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  End Voice Session
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};