import { useState, useCallback, useEffect, useRef } from "react";
import { getAIService, AIResponse, AIContext } from "../services/ai";
import {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../providers/AIAssistantProvider";

export interface UseAIServiceOptions {
  sessionId?: string;
  onError?: (error: Error) => void;
  useStreaming?: boolean;
}

export function useAIService(options: UseAIServiceOptions = {}) {
  const {
    sessionId = `session-${Date.now()}`,
    onError,
    useStreaming = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const aiService = useRef(getAIService());
  const conversationHistory = useRef<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const sendMessage = useCallback(
    async (
      message: string,
      conversationStep: ConversationStep,
      userProfile: UserProfile,
      walletData?: WalletData,
      onChunk?: (chunk: string) => void,
    ): Promise<AIResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const context: AIContext = {
          conversationStep,
          userProfile,
          walletData,
          conversationHistory: conversationHistory.current,
        };

        let response: AIResponse;

        if (useStreaming && onChunk && aiService.current.streamResponse) {
          response = await aiService.current.streamResponse(
            message,
            context,
            onChunk,
          );
        } else {
          response = await aiService.current.generateResponse(message, context);
        }

        conversationHistory.current.push(
          { role: "user", content: message },
          { role: "assistant", content: response.message },
        );

        if (conversationHistory.current.length > 20) {
          conversationHistory.current = conversationHistory.current.slice(-20);
        }

        return response;
      } catch (err: any) {
        const error =
          err instanceof Error ? err : new Error("Unknown error occurred");
        setError(error);

        if (onError) {
          onError(error);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, useStreaming, onError],
  );

  const reset = useCallback(() => {
    conversationHistory.current = [];
    aiService.current.reset();
    setError(null);
    setIsLoading(false);
  }, []);

  const validateConfiguration = useCallback(async () => {
    try {
      const isValid = await aiService.current.validateConfiguration();
      return isValid;
    } catch (err) {
      console.error("Configuration validation failed:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    validateConfiguration();
  }, [validateConfiguration]);

  return {
    sendMessage,
    reset,
    isLoading,
    error,
    sessionId,
  };
}
