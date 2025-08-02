import express, { Request, Response } from "express";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { z } from "zod";
import dotenv from "dotenv";
import {
  aiLogger,
  aiMetrics,
  performanceLogger,
  aiRequestLogger,
} from "../utils/logger.js";
import { openRouterService } from "../services/openRouterService.js";

dotenv.config();

const router = express.Router();

const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string(),
  context: z.object({
    conversationStep: z.string(),
    userProfile: z.record(z.any()).optional(),
    walletData: z.record(z.any()).optional(),
  }),
});

const responseSchema = z.object({
  message: z.string(),
  intent: z
    .object({
      action: z.string(),
      confidence: z.number(),
      extractedValue: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
  shouldContinue: z.boolean().optional(),
  nextStep: z.string().optional(),
});


router.use(aiRequestLogger);

router.post("/chat", async (req: Request, res: Response) => {
  const timer = performanceLogger.startTimer("ai-chat-request");

  try {
    const validatedData = requestSchema.parse(req.body);
    const { message, sessionId, context } = validatedData;

    aiLogger.info("Chat request validated", {
      sessionId,
      conversationStep: context.conversationStep,
      messageLength: message.length,
    });

    const serviceInfo = openRouterService.getServiceInfo();
    if (!serviceInfo.configured && !USE_MOCK_AI) {
      aiLogger.warn("OpenRouter service not configured, using fallback");
      return res.status(503).json({
        error: "AI service not configured",
        fallback: true,
      });
    }

    if (USE_MOCK_AI) {
      const mockResponse = {
        message: `I understand you said: "${message}". This is a mock response for step: ${context.conversationStep}`,
        intent: {
          action: "continue",
          confidence: 0.8,
        },
        shouldContinue: true,
      };
      return res.json(mockResponse);
    }

    const memory = openRouterService.getOrCreateMemory(sessionId);

    const queryComplexity = openRouterService.analyzeQueryComplexity(message, context);
    
    const llm = openRouterService.createLLM({
      queryComplexity,
      temperature: 0.7,
      maxTokens: 500,
      openRouterParams: {
        provider: {
          order: ["Google", "DeepSeek", "Qwen", "OpenAI"],
          allow_fallbacks: true,
        },
      },
    });

    const systemPrompt = `You are Nyx, an AI investment assistant for a DeFi platform.
    
Current conversation step: ${context.conversationStep}
User profile: ${JSON.stringify(context.userProfile || {})}
Wallet data: ${JSON.stringify(context.walletData || {})}

Your task is to:
1. Respond naturally to the user's message
2. Detect their intent (connect_wallet, select_option, input_value, continue, help, unclear)
3. Guide them through the investment assessment process
4. Use analogies related to their occupation when applicable

Always be friendly, encouraging, and explain DeFi concepts simply.`;

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const chain = new LLMChain({
      llm,
      prompt,
      memory,
    });

    const apiTimer = performanceLogger.startTimer("openrouter-api-call");
    const result = await chain.call({ input: message });
    apiTimer.end({ model: llm.modelName });

    let response;
    try {
      response = JSON.parse(result.text);
      aiLogger.info("Structured response parsed successfully");
    } catch {
      aiLogger.warn(
        "Failed to parse structured response, using fallback format",
      );
      response = {
        message: result.text,
        intent: { action: "unclear", confidence: 0.5 },
      };
    }

    if (response.intent) {
      aiMetrics.logIntent(response.intent, response.intent.confidence);
    }

    if (response.nextStep && response.nextStep !== context.conversationStep) {
      aiMetrics.logConversationStep(
        context.conversationStep,
        response.nextStep,
      );
    }

    const validatedResponse = responseSchema.parse(response);

    timer.end({
      sessionId,
      intentAction: response.intent?.action,
      transitioned: !!response.nextStep,
    });

    res.json(validatedResponse);
  } catch (error: any) {
    aiMetrics.logError(error, {
      endpoint: "/chat",
      sessionId: req.body?.sessionId,
    });
    timer.end({ error: true, errorType: error.name });

    const rateLimit = await openRouterService.handleRateLimit(error);
    if (rateLimit.shouldRetry) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        retryAfter: rateLimit.retryAfter,
      });
    }

    if (error.name === "ZodError") {
      aiLogger.error("Validation error", { errors: error.errors });
      return res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
    }

    aiLogger.error("Unhandled error in chat endpoint", {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Internal server error",
      fallback: true,
    });
  }
});

router.post("/chat/stream", async (req: Request, res: Response) => {
  try {
    const validatedData = requestSchema.parse(req.body);
    const { message, sessionId, context } = validatedData;

    const serviceInfo = openRouterService.getServiceInfo();
    if (!serviceInfo.configured) {
      return res.status(503).json({
        error: "Streaming not available without API key",
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const memory = openRouterService.getOrCreateMemory(sessionId);

    const queryComplexity = openRouterService.analyzeQueryComplexity(message, context);
    
    const llm = openRouterService.createLLM({
      queryComplexity,
      temperature: 0.7,
      maxTokens: 500,
      streaming: true,
      openRouterParams: {
        provider: {
          order: ["Google", "DeepSeek", "Qwen", "OpenAI"],
          allow_fallbacks: true,
        },
      },
    });

    const systemPrompt = `You are Nyx, an AI investment assistant. Current step: ${context.conversationStep}`;

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const chain = new LLMChain({
      llm,
      prompt,
      memory,
    });

    const stream = await chain.stream({ input: message });

    for await (const chunk of stream) {
      const text = chunk.text || "";
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.status(500).json({ error: "Streaming failed" });
  }
});

router.post("/reset/:sessionId", (req: Request, res: Response) => {
  const { sessionId } = req.params;

  openRouterService.clearMemory(sessionId);

  res.json({ success: true, message: "Session reset" });
});

router.get("/health", async (req: Request, res: Response) => {
  const serviceInfo = openRouterService.getServiceInfo();
  const connectionTest = await openRouterService.testConnection();
  
  res.json({
    status: connectionTest ? "healthy" : "degraded",
    service: "OpenRouter",
    ...serviceInfo,
    useMockAI: USE_MOCK_AI,
    connectionTest,
  });
});

router.get("/models", (req: Request, res: Response) => {
  const models = openRouterService.getAvailableModels();
  const modelsInfo = models.map(id => ({
    id,
    info: openRouterService.getModelInfo(id),
  }));
  
  res.json({
    models: modelsInfo,
    count: models.length,
  });
});

setInterval(
  () => {
    openRouterService.cleanupOldSessions(30 * 60 * 1000);
  },
  5 * 60 * 1000,
);

export default router;
