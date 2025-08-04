#!/usr/bin/env node
/**
 * Test script for AI integration
 * Run with: npx tsx test-ai.ts
 */

import { createAIService } from "./index";
import { ConversationStep } from "../../providers/AIAssistantProvider";

async function testAIService() {
  console.log("🧪 Testing AI Service Integration...\n");

  // Create service instance
  const aiService = createAIService({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  });

  // Test configuration validation
  console.log("1️⃣ Testing configuration validation...");
  const isValid = await aiService.validateConfiguration();
  console.log(`   Configuration valid: ${isValid ? "✅" : "❌"}`);

  if (!isValid && !import.meta.env.VITE_USE_MOCK_AI) {
    console.log("\n⚠️  No OpenAI API key found. Using fallback service.\n");
  }

  // Test conversation steps
  const testCases: Array<{
    step: ConversationStep;
    message: string;
    expectedIntent?: string;
  }> = [
    {
      step: "wallet_prompt",
      message: "Yes, connect my wallet",
      expectedIntent: "connect_wallet",
    },
    {
      step: "investment_goals",
      message: "I want to focus on growth",
      expectedIntent: "select_option",
    },
    {
      step: "occupation",
      message: "I am a chef",
      expectedIntent: "select_option",
    },
    {
      step: "timeline",
      message: "5 years",
      expectedIntent: "input_value",
    },
    {
      step: "amount",
      message: "$1000 per month",
      expectedIntent: "input_value",
    },
  ];

  console.log("\n2️⃣ Testing conversation flow...\n");

  for (const testCase of testCases) {
    console.log(`   Step: ${testCase.step}`);
    console.log(`   User: "${testCase.message}"`);

    try {
      const response = await aiService.generateResponse(testCase.message, {
        conversationStep: testCase.step,
        userProfile: {},
        conversationHistory: [],
      });

      console.log(`   AI: "${response.message.substring(0, 100)}..."`);

      if (response.intent) {
        console.log(
          `   Intent: ${response.intent.action} (confidence: ${response.intent.confidence})`,
        );

        if (
          testCase.expectedIntent &&
          response.intent.action !== testCase.expectedIntent
        ) {
          console.log(`   ⚠️  Expected intent: ${testCase.expectedIntent}`);
        }
      }

      if (response.nextStep) {
        console.log(`   Next step: ${response.nextStep}`);
      }

      console.log("");
    } catch (error) {
      console.error(
        `   ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}\n`,
      );
    }
  }

  // Test streaming (if available)
  if (aiService.streamResponse) {
    console.log("3️⃣ Testing streaming response...");

    let streamedContent = "";
    try {
      await aiService.streamResponse(
        "Tell me about CDP investments",
        {
          conversationStep: "chat",
          userProfile: {},
          conversationHistory: [],
        },
        (chunk) => {
          streamedContent += chunk;
          process.stdout.write(".");
        },
      );

      console.log("\n   ✅ Streaming completed");
      console.log(`   Received ${streamedContent.length} characters\n`);
    } catch (error) {
      console.log("\n   ❌ Streaming not available or failed\n");
    }
  }

  console.log("✨ AI Service testing completed!\n");

  // Reset service
  aiService.reset();
}

// Run the test
testAIService().catch(console.error);
