# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL RULES - NO SHORTCUTS

### Absolute Requirements
- **NEVER use `any` type** - Always provide proper TypeScript types
- **NEVER create mock implementations** - All code must be production-ready
- **NEVER skip error handling** - Handle all edge cases properly
- **NEVER use type assertions (`as`)** without proper validation
- **ALWAYS fix TypeScript errors properly** with correct types
- **ALWAYS implement complete functionality**, not placeholders
- **ALWAYS follow functional programming patterns** in this codebase

### Coding Standards
- **REUSE FIRST** - Always check existing code/utilities before writing new ones
- **MINIMAL CODE** - Write the shortest, most efficient solution
- **MODULAR DESIGN** - Create small, reusable functions and components
- **PERFORMANCE FOCUSED** - Optimize for efficiency and speed
- **ESSENTIAL DOCS ONLY** - Document only critical business logic and edge cases
- **DRY PRINCIPLE** - Never duplicate code, extract common patterns
- **SINGLE RESPONSIBILITY** - Each function/module should do one thing well

### Memory System Architecture
The application includes a sophisticated chat memory system:
- **Session Memory**: Tracks conversation history within sessions
- **User Profiles**: Persists user preferences based on wallet connection
- **Context Extraction**: Automatically identifies topics, tokens, and intents
- **Memory Integration**: Passes conversation context to AI for continuity

## Project Context

NYXUSD is a chain-agnostic AI-powered stablecoin protocol with functional programming architecture. The codebase follows strict functional patterns with pure functions, immutable data, and comprehensive type safety.

## Hackathon Information

### Event: JoinPond Arena
**Arena ID**: 52a56b81-b5fb-459d-a007-0ce6b52961e3
**Platform**: https://cryptopond.xyz

### Project Submission
NYXUSD is being developed for the JoinPond hackathon with focus on:
- **AI-Powered DeFi**: Natural language interface for complex DeFi operations
- **Voice Integration**: ElevenLabs voice chat for accessibility
- **Cross-chain Swaps**: Odos integration for optimal routing
- **Memory System**: Persistent user context and preferences
- **Yield Discovery**: Automated yield finding on Base network

### Key Features for Demo
1. **Voice-Controlled DeFi**: Execute swaps and CDP operations via voice
2. **Intelligent Memory**: System remembers user preferences and past interactions
3. **Multi-chain Support**: Seamless operations across Ethereum, Base, and other chains
4. **Real-time Yield Discovery**: AI-powered yield opportunity identification
5. **Portfolio Analytics**: Natural language portfolio analysis and recommendations

### Judges' Focus Areas
- **Innovation**: Novel use of AI in DeFi operations
- **Technical Implementation**: Clean functional programming architecture
- **User Experience**: Voice interface and memory system
- **Cross-chain Capabilities**: Seamless multi-chain operations
- **Security**: No mock implementations, production-ready code

## Build & Development Commands

### Core Commands
```bash
# Install dependencies
npm install

# Build entire monorepo
npm run build

# Run tests
npm run test                    # All tests
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:property          # Property-based tests
npm run test:coverage          # With coverage report

# Development
cd frontend && npm run dev     # Frontend dev server (Vite)
cd api && npm run dev          # API dev server

# Linting & Formatting
npm run lint                   # ESLint with auto-fix
npm run format                 # Prettier formatting
npm run type-check            # TypeScript type checking
npm run validate              # Full validation (lint + type-check + test)

# Python DeFi Finder
python example_usage.py        # Test DeFi yield finder
pytest test_defi_finder.py    # Run Python tests

# Email Subscription Tests
node api/test-subscriptions.mjs # Test email subscription endpoints
```

### Frontend-specific
```bash
cd frontend
npm run dev                    # Start Vite dev server
npm run build                  # Production build
npm run preview               # Preview production build
```

### API-specific
```bash
cd api
npm run dev                    # Development server with ts-node
npm run build                  # Compile TypeScript
npm run start                  # Production server
npm run mcp:start             # Start MCP crypto server
```

### Docker Operations
```bash
npm run docker:build          # Build containers
npm run docker:up             # Start services
npm run docker:down           # Stop services
npm run docker:logs           # View logs
```

## Architecture Overview

### Monorepo Structure
The project uses TypeScript project references for efficient builds:
- **libs/** - Shared functional libraries (fp-utils, validators, midnight-utils)
- **packages/** - Core business modules (cdp-core, cdp-adapters, cdp-sdk, oracle-service)
- **frontend/** - React/Vite application with RainbowKit wallet integration
- **api/** - Express API server with Langchain integration
- **defi_yield_finder/** - Python module for DeFi yield discovery on Base network

### Functional Programming Patterns

All business logic follows FP principles:
```typescript
// Use pipe for composition
pipe(value, transform1, transform2, fold(onError, onSuccess))

// Use Either for error handling
Either<Error, Result>

// Use Option for nullable values
Option<Value>
```

### Key Technologies
- **Frontend**: React 18, Vite, TailwindCSS, RainbowKit, Wagmi, Framer Motion, Viem
- **Backend**: Express, TypeScript, Langchain, MCP SDK
- **Blockchain**: Ethers.js, Viem, Wagmi for multi-chain support
- **AI**: Langchain with OpenAI integration, custom prompt optimization
- **Memory**: Session storage, localStorage for user profiles
- **Python**: DeFiLlama API integration, safety scoring algorithms

### Path Mappings
Use TypeScript path aliases:
- `@nyxusd/core` - Core business logic
- `@nyxusd/cdp-*` - CDP modules
- `@nyxusd/fp-utils` - Functional utilities
- `@nyxusd/validators` - Input validation

### AI Integration with Memory
The project includes sophisticated AI services with memory:
- Natural language processing for DeFi operations
- Prompt optimization with caching and fallbacks
- **Conversation chains with persistent memory**
- **User profile tracking and personalization**
- **Context extraction from conversations**
- Portfolio analysis and recommendations

### Memory Service (`chatMemoryService.ts`)
Key features:
- **Session Management**: Automatic session creation and tracking
- **Message Storage**: Up to 50 messages in memory with auto-trimming
- **Context Extraction**: Identifies tokens, topics, and user intents
- **User Profiles**: Persists preferences, watchlists, and interaction history
- **Export Functionality**: Export chat history as JSON
- **Wallet Integration**: Profile persistence based on wallet address

### Wallet Integration
Multi-wallet support via RainbowKit:
- MetaMask, WalletConnect, Rainbow, Coinbase
- Custom Midnight Protocol connector
- Chain-agnostic operations
- **Profile persistence on wallet connection**

### DeFi Yield Finder
Python module for Base network yield discovery:
- 100-point safety scoring system
- DeFiLlama API integration
- Redis/in-memory caching
- Vercel serverless deployment ready

## Testing Strategy

### Test Organization
- **Unit tests**: Pure function testing in isolation
- **Integration tests**: Component interaction testing
- **Property tests**: Mathematical operation validation using fast-check
- **Type tests**: TypeScript type correctness

### Running Tests
```bash
# Single test file
npm test -- path/to/test.spec.ts

# Watch mode for development
npm run test:watch

# Specific test suite
npm test -- --testNamePattern="CDP calculations"
```

## Deployment

### Vercel Deployment
The project is configured for Vercel:
- Frontend: Auto-deployed from `frontend/dist`
- API endpoints: Serverless functions in `api/`
- Python endpoints: `api/defi_yields.py`

### Environment Variables
Required for production:
- `OPENAI_API_KEY` - AI service integration
- `REDIS_URL` - Optional caching layer
- `LOG_LEVEL` - Logging verbosity
- `USE_MOCK_AI` - Set to "true" for mock responses (development only)

## Code Style Guidelines

### TypeScript - STRICT REQUIREMENTS
- **Strict mode enabled** - No exceptions
- **Explicit return types** for all functions
- **Readonly properties** for immutability
- **Comprehensive JSDoc comments**
- **NO `any` types** - Use proper generics or union types
- **NO type assertions** without validation

### Functional Patterns
- Pure functions without side effects
- Immutable data transformations
- Explicit error handling with Either/Option
- Function composition with pipe/flow

### Component Structure
React components follow:
- Functional components with hooks
- Props interfaces with readonly properties
- Memoization for expensive computations
- Lazy loading for code splitting
- **Memory integration for stateful conversations**

## Common Patterns

### CDP Operations
```typescript
// Always validate before state changes
pipe(
  operation,
  validate,
  chain(execute),
  fold(handleError, handleSuccess)
)
```

### API Endpoints with Proper Types
```typescript
// Standard error handling with proper types
interface ServiceParams {
  // Define exact types, no any
}

interface ServiceResult {
  // Define exact return types
}

try {
  const result: ServiceResult = await service.execute(params);
  res.json({ success: true, data: result });
} catch (error) {
  if (error instanceof Error) {
    logger.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### React State Management with Memory
```typescript
// Use custom hooks for complex state
const { data, loading, error } = useAsyncState(fetchData);

// Integrate memory service
const userProfile = chatMemoryService.getUserProfile(address);
const memoryContext = chatMemoryService.getMemoryPromptContext(address);
```


## Debugging

### Frontend
- React DevTools for component inspection
- Redux DevTools for state management
- Network tab for API calls
- Vite HMR for fast iteration
- **Session Storage Inspector** for memory debugging
- **Local Storage Inspector** for profile persistence

### Backend
- Winston logging with configurable levels
- Morgan for HTTP request logging
- Node debugger with VS Code integration
- **Memory context in logs** for debugging conversations

### Python
- Built-in logging with timestamps
- Pytest with verbose output
- Example usage scripts for testing

## Memory System Implementation Details

### Session Memory Structure
```typescript
interface ConversationMemory {
  sessionId: string;
  messages: ChatMessage[];
  context: {
    topics: string[];
    mentionedTokens: Set<string>;
    userIntents: string[];
    lastActivity: Date;
  };
  summary?: string;
}
```

### User Profile Structure
```typescript
interface UserProfile {
  walletAddress: string;
  preferences: {
    riskTolerance: 'low' | 'moderate' | 'high';
    experience: 'beginner' | 'intermediate' | 'advanced';
    interests: string[];
    favoriteTokens: string[];
    defaultChain?: string;
  };
  history: {
    totalInteractions: number;
    lastSeen: Date;
    firstSeen: Date;
    topQueries: string[];
  };
  portfolio?: {
    holdings: Array<{
      symbol: string;
      amount: number;
      chain?: string;
    }>;
    watchlist: string[];
  };
}
```

### Integration Points
1. **Frontend**: EnhancedChatInterface uses chatMemoryService
2. **API**: Enhanced routes accept memoryContext and conversationSummary
3. **AI Service**: Includes memory context in prompts for continuity
4. **Storage**: SessionStorage for sessions, localStorage for profiles

## Important Notes
- **ALWAYS** validate types at runtime when dealing with external data
- **NEVER** assume data structure without checking
- **ALWAYS** handle async operations with proper error boundaries
- **NEVER** commit sensitive data or API keys
- **ALWAYS** use the memory service for maintaining conversation context
- **NEVER** clear user profiles without explicit user action