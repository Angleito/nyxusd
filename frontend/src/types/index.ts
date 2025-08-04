// Centralized type-only barrel for voice-related types
// Re-export types without creating runtime dependencies to avoid circular imports

// conversationalAgent types
export type {
  InboundWsMessage,
  AgentCreatedEvent,
  ConversationStartedEvent,
  UserTranscriptEvent,
  AgentResponseEvent,
  AgentSpeakingEvent,
  ConversationEndedEvent,
  WebsocketClosedEvent,
  ContextUpdatedEvent,
  ConversationalAgentEvents,
} from '../services/voice/conversationalAgent';

// voiceService types
export type {
  ISpeechRecognition,
  StatusMessageEvent,
  UserMessageEvent,
  AgentMessageEvent,
  UIEvent,
} from '../services/voice/voiceService';