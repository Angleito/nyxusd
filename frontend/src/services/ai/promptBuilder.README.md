# NyxUSD Prompt Builder System

A comprehensive prompt building system for the NyxUSD AI assistant that implements composable prompt construction with dynamic context injection, template composition, and compression utilities.

## Features

- 🔧 **Modular Design**: Composable prompt building functions with clean architecture
- 🎯 **Context-Aware**: Dynamic injection of user profile and conversation context
- 📦 **Template System**: Optimized prompt templates for each conversation step
- 🗜️ **Compression**: Token optimization achieving 40-60% reduction
- ⚡ **Performance**: Fast prompt generation with built-in analytics
- 🛡️ **Type-Safe**: Full TypeScript support with strict typing

## Quick Start

```typescript
import { createPromptBuilder, QuickBuilders } from "./promptBuilder";

// Basic usage
const result = createPromptBuilder()
  .withStep("chat")
  .withPersonalization(userProfile)
  .withContext({ userMessage: "Tell me about DeFi" })
  .compress("basic")
  .build();

if (result.isOk()) {
  console.log("Prompt:", result.value.prompt);
  console.log("Tokens:", result.value.tokenCount);
}

// Quick builders for common scenarios
const chatPrompt = QuickBuilders.chat(
  "What is a CDP?",
  userProfile,
  conversationHistory,
);
```

## API Reference

### PromptBuilder Class

The main class for building prompts with a fluent API:

```typescript
class PromptBuilder {
  withPersonalization(profile: UserProfile): PromptBuilder;
  withStep(step: ConversationStep): PromptBuilder;
  withContext(context: Partial<PromptContext>): PromptBuilder;
  compress(level?: "basic" | "aggressive"): PromptBuilder;
  withMaxTokens(maxTokens: number): PromptBuilder;
  build(): Result<PromptBuildResult, string>;
}
```

### Quick Builders

Pre-configured builders for common use cases:

```typescript
// Chat responses
QuickBuilders.chat(userMessage, profile, history?)

// Strategy building
QuickBuilders.strategy(step, profile, userMessage)

// Questionnaire steps
QuickBuilders.questionnaire(step, profile, userMessage?)

// Recommendations
QuickBuilders.recommendations(profile, walletData?)
```

### Utility Functions

```typescript
// System prompt replacement
buildSystemPrompt(step, userProfile, userMessage, options?)

// Compress existing prompts
compressExistingPrompt(level, prompt)

// Create builder with config
createPromptBuilder(config?)
```

## Configuration

### PromptBuilderConfig

```typescript
interface PromptBuilderConfig {
  maxTokens?: number;
  compressionLevel?: "none" | "basic" | "aggressive";
  personalizeWith?: Array<
    | "occupation"
    | "riskTolerance"
    | "timeline"
    | "investmentGoal"
    | "monthlyAmount"
  >;
  includeHistory?: boolean;
  maxHistoryItems?: number;
  customTemplates?: Partial<PromptTemplateMap>;
}
```

### Preset Configurations

```typescript
PRESET_CONFIGS = {
  chat: { maxTokens: 1000, compressionLevel: "basic", includeHistory: true },
  strategy: {
    maxTokens: 2000,
    compressionLevel: "basic",
    personalizeWith: ["occupation", "riskTolerance"],
  },
  questionnaire: { maxTokens: 500, compressionLevel: "aggressive" },
  recommendations: {
    maxTokens: 3000,
    personalizeWith: ["occupation", "riskTolerance", "timeline"],
  },
};
```

## Compression Levels

### Basic Compression

- Normalizes whitespace and punctuation
- ~20-30% token reduction
- Preserves readability

### Aggressive Compression

- Removes articles, intensifiers, and redundant words
- Simplifies complex phrases
- ~40-60% token reduction
- May slightly impact readability

## Template System

The system includes optimized templates for each conversation step:

- `initial` - Welcome and options presentation
- `chat` - General conversation responses
- `strategy_choice` - Strategy selection guidance
- `template_selection` - Template recommendations
- `protocol_selection` - Protocol suggestions
- `strategy_builder` - Allocation guidance
- `wallet_prompt` - Wallet connection prompts
- `recommendations` - Final strategy recommendations

## Examples

### Basic Prompt Building

```typescript
const builder = createPromptBuilder({
  maxTokens: 1500,
  compressionLevel: "basic",
  personalizeWith: ["occupation", "riskTolerance"],
});

const result = builder
  .withStep("investment_goals")
  .withPersonalization({
    occupation: "engineer",
    riskTolerance: "moderate",
    investmentGoal: "growth",
  })
  .withContext({
    userMessage: "I want to maximize returns",
    conversationHistory: previousMessages,
  })
  .build();
```

### Custom Template Usage

```typescript
const customTemplates = {
  chat: (ctx) =>
    `Custom response for ${ctx.userProfile.occupation}: ${ctx.userMessage}`,
};

const result = createPromptBuilder({ customTemplates })
  .withStep("chat")
  .withPersonalization(userProfile)
  .withContext({ userMessage: "What are the best protocols?" })
  .build();
```

### Compression Utilities

```typescript
const longPrompt = "Your very long existing prompt...";

// Basic compression
const basic = compressExistingPrompt("basic", longPrompt);
console.log(
  `Saved ${basic.stats.tokensSaved} tokens (${basic.stats.reductionPercentage}%)`,
);

// Aggressive compression
const aggressive = compressExistingPrompt("aggressive", longPrompt);
console.log(
  `Saved ${aggressive.stats.tokensSaved} tokens (${aggressive.stats.reductionPercentage}%)`,
);
```

## Integration with Existing System

### Replacing Hard-coded Prompts

```typescript
// Old way
const prompt = `You are Nyx... [long hard-coded string]`;

// New way
const promptResult = buildSystemPrompt(currentStep, userProfile, userMessage, {
  compressionLevel: "basic",
});

const prompt = promptResult.isOk() ? promptResult.value : fallbackPrompt;
```

### Using with AI Services

```typescript
// In your AI service
async generateResponse(userMessage: string, context: AIContext): Promise<AIResponse> {
  const promptResult = QuickBuilders.chat(
    userMessage,
    context.userProfile,
    context.conversationHistory
  );

  if (promptResult.isOk()) {
    const optimizedPrompt = promptResult.value.prompt;
    // Use optimizedPrompt with your AI model
    return await this.callAIModel(optimizedPrompt);
  }

  // Fallback to original system
  return await this.fallbackResponse(userMessage, context);
}
```

## Performance Benefits

- **Token Reduction**: 40-60% reduction in prompt tokens
- **Cost Savings**: Proportional reduction in API costs
- **Speed**: Faster response times due to shorter prompts
- **Maintainability**: Modular, testable code
- **Flexibility**: Easy to customize and extend

## Monitoring and Analytics

Each prompt build includes comprehensive metadata:

```typescript
interface PromptBuildResult {
  prompt: string;
  tokenCount: number;
  compressionStats: {
    originalLength: number;
    compressedLength: number;
    reductionPercentage: number;
    tokensSaved: number;
  };
  truncated: boolean;
  metadata: {
    config: PromptBuilderConfig;
    context: PromptContext;
    buildTime: number;
  };
}
```

## Best Practices

1. **Use Quick Builders** for common scenarios
2. **Configure compression** based on use case requirements
3. **Monitor token usage** with built-in analytics
4. **Customize templates** for specific needs
5. **Test compression levels** to find optimal balance
6. **Include context** for better personalization

## File Structure

```
/services/ai/
├── promptBuilder.ts           # Main prompt builder system
├── promptBuilder.example.ts   # Usage examples and demonstrations
└── promptBuilder.README.md    # This documentation
```

## Contributing

When extending the prompt builder system:

1. Follow functional programming patterns
2. Add comprehensive TypeScript types
3. Include JSDoc documentation
4. Write tests for new functionality
5. Update examples and documentation

## Support

For questions or issues with the prompt builder system, refer to the example file or create an issue in the project repository.
