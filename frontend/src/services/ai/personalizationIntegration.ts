/**
 * @fileoverview Integration Example for PersonalizationEngine with AI Service
 *
 * Demonstrates how to integrate the PersonalizationEngine with the existing
 * AI service to provide personalized responses based on user profiles.
 *
 * @author NyxUSD AI Team
 * @version 1.0.0
 */

import {
  PersonalizationEngine,
  PersonalizationProfile,
  PersonalizationContext,
} from "./personalizationEngine";
import {
  ConversationStep,
  UserProfile,
} from "../../providers/AIAssistantProvider";
import { AIContext, AIResponse } from "./aiService";

/**
 * Enhanced AI Context with personalization support
 */
export interface PersonalizedAIContext extends AIContext {
  personalizationProfile?: PersonalizationProfile;
}

/**
 * Enhanced AI Response with personalization metadata
 */
export interface PersonalizedAIResponse extends AIResponse {
  personalization?: {
    strategy: string;
    confidence: number;
    analogiesUsed: string[];
    effectivenessScore: number;
  };
}

/**
 * Converts UserProfile to PersonalizationProfile
 */
export function convertToPersonalizationProfile(
  userProfile: UserProfile,
): PersonalizationProfile {
  return {
    occupation: userProfile.occupation,
    hobbies: userProfile.hobbies,
    experienceLevel: mapInvestmentGoalToExperience(userProfile.investmentGoal),
    riskTolerance: userProfile.riskTolerance,
    lifestyle: mapTimelineToLifestyle(userProfile.timeline),
    // Add more mappings as needed
  };
}

/**
 * Creates PersonalizationContext from conversation state
 */
export function createPersonalizationContext(
  step: ConversationStep,
  concept: string,
  urgency: "low" | "medium" | "high" = "medium",
  complexity: number = 5,
): PersonalizationContext {
  return {
    step,
    concept,
    urgency,
    complexity,
    // Add time-based context if needed
    timeOfDay: getTimeOfDay(),
  };
}

/**
 * Personalizes AI response content using PersonalizationEngine
 */
export async function personalizeAIResponse(
  baseResponse: string,
  context: PersonalizedAIContext,
  personalizationEngine: PersonalizationEngine,
): Promise<PersonalizedAIResponse> {
  if (!context.personalizationProfile) {
    // Return base response if no personalization profile available
    return {
      message: baseResponse,
      shouldContinue: true,
    };
  }

  // Create personalization context
  const personalizationContext = createPersonalizationContext(
    context.conversationStep,
    extractConcept(baseResponse),
    "medium",
    estimateComplexity(baseResponse),
  );

  // Get personalization strategy
  const personalizationResult = personalizationEngine.selectPersonalization(
    context.personalizationProfile,
    personalizationContext,
  );

  // Apply personalization to the response
  const personalizedMessage = applyPersonalization(
    baseResponse,
    personalizationResult.analogies,
    personalizationResult.examples,
    personalizationResult.tone,
  );

  // Score effectiveness
  const effectivenessScore = personalizationEngine.scoreEffectiveness(
    personalizedMessage,
    context.personalizationProfile,
  );

  return {
    message: personalizedMessage,
    shouldContinue: true,
    personalization: {
      strategy: personalizationResult.strategy.name,
      confidence: personalizationResult.confidence,
      analogiesUsed: personalizationResult.analogies,
      effectivenessScore,
    },
  };
}

/**
 * Enhanced AI Service class with personalization
 */
export class PersonalizedAIService {
  private personalizationEngine: PersonalizationEngine;

  constructor() {
    this.personalizationEngine = new PersonalizationEngine();
  }

  async generatePersonalizedResponse(
    userMessage: string,
    context: PersonalizedAIContext,
  ): Promise<PersonalizedAIResponse> {
    // First generate base response (this would call your existing AI service)
    const baseResponse = await this.generateBaseResponse(userMessage, context);

    // Then personalize it
    return personalizeAIResponse(
      baseResponse,
      context,
      this.personalizationEngine,
    );
  }

  async generateBaseResponse(
    userMessage: string,
    context: AIContext,
  ): Promise<string> {
    // This would integrate with your existing AI service
    // For now, return a placeholder
    return `Based on your message "${userMessage}", here's my response for step ${context.conversationStep}.`;
  }

  getPersonalizationRecommendations(profile: PersonalizationProfile): string[] {
    return this.personalizationEngine.suggestProfileImprovements(profile);
  }

  analyzePersonalizationPotential(profile: PersonalizationProfile): number {
    const analysis = this.personalizationEngine.analyzeProfile(profile);
    return analysis.personalizationPotential;
  }
}

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

function mapInvestmentGoalToExperience(
  goal?: "growth" | "income" | "preservation",
): "beginner" | "intermediate" | "advanced" | undefined {
  switch (goal) {
    case "preservation":
      return "beginner";
    case "income":
      return "intermediate";
    case "growth":
      return "advanced";
    default:
      return undefined;
  }
}

function mapTimelineToLifestyle(
  timeline?: string,
): "busy" | "flexible" | "structured" | "spontaneous" | undefined {
  if (!timeline) return undefined;

  const timelineNum = parseInt(timeline);
  if (timelineNum <= 2) return "spontaneous";
  if (timelineNum <= 5) return "flexible";
  if (timelineNum <= 10) return "structured";
  return "busy";
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

function extractConcept(response: string): string {
  // Simple concept extraction - in real implementation, this could be more sophisticated
  const concepts = [
    "risk",
    "diversification",
    "compound_interest",
    "allocation",
    "strategy",
    "investment",
  ];
  const lowerResponse = response.toLowerCase();

  for (const concept of concepts) {
    if (lowerResponse.includes(concept)) {
      return concept;
    }
  }

  return "general_finance";
}

function estimateComplexity(response: string): number {
  // Simple complexity estimation based on response length and technical terms
  const technicalTerms = [
    "portfolio",
    "diversification",
    "allocation",
    "compound",
    "leverage",
    "yield",
    "protocol",
  ];
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  let complexity = Math.min(sentences.length / 2, 5); // Base complexity from sentence count

  // Add complexity for technical terms
  technicalTerms.forEach((term) => {
    if (response.toLowerCase().includes(term)) {
      complexity += 0.5;
    }
  });

  return Math.min(Math.max(Math.round(complexity), 1), 10);
}

function applyPersonalization(
  baseResponse: string,
  analogies: string[],
  examples: string[],
  tone: string,
): string {
  let personalizedResponse = baseResponse;

  // Add analogies if available
  if (analogies.length > 0) {
    const analogy = analogies[0];
    personalizedResponse = `${analogy}\n\n${personalizedResponse}`;
  }

  // Add examples if available
  if (examples.length > 0) {
    const example = examples[0];
    personalizedResponse += `\n\n${example}`;
  }

  // Adjust tone (simplified - in real implementation, this would be more sophisticated)
  switch (tone) {
    case "technical":
      personalizedResponse = personalizedResponse.replace(
        /simple/g,
        "straightforward",
      );
      break;
    case "casual":
      personalizedResponse = personalizedResponse.replace(
        /consider/g,
        "you might want to",
      );
      break;
    case "concise":
      // Keep only essential sentences
      const sentences = personalizedResponse.split(/[.!?]+/);
      personalizedResponse =
        sentences.slice(0, Math.ceil(sentences.length / 2)).join(". ") + ".";
      break;
  }

  return personalizedResponse;
}

/**
 * Example usage in existing AI service integration
 */
export const integratePersonalizationExample = `
// In your existing AI service:

import { PersonalizedAIService, convertToPersonalizationProfile } from './personalizationIntegration';

class EnhancedAIService {
  private personalizedService = new PersonalizedAIService();
  
  async generateResponse(userMessage: string, context: AIContext): Promise<AIResponse> {
    // Convert existing user profile to personalization profile
    const personalizationProfile = convertToPersonalizationProfile(context.userProfile);
    
    // Create enhanced context
    const enhancedContext = {
      ...context,
      personalizationProfile
    };
    
    // Generate personalized response
    const response = await this.personalizedService.generatePersonalizedResponse(
      userMessage, 
      enhancedContext
    );
    
    // Log personalization effectiveness for improvement
    if (response.personalization) {
      console.log('Personalization Strategy:', response.personalization.strategy);
      console.log('Effectiveness Score:', response.personalization.effectivenessScore);
    }
    
    return response;
  }
}
`;

export default PersonalizedAIService;
