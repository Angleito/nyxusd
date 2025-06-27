/**
 * @fileoverview Multi-dimensional Personalization Engine for NyxUSD AI Assistant
 *
 * A comprehensive personalization system that analyzes user profiles across multiple dimensions
 * to provide context-aware, highly personalized AI responses. Implements functional programming
 * patterns for maintainable and extensible personalization logic.
 *
 * @author NyxUSD AI Team
 * @version 1.0.0
 */

// Simple local implementations to avoid build issues
const pipe = <T, U>(value: T, fn: (val: T) => U): U => fn(value);
const curry = <A, B, C>(fn: (a: A, b: B) => C) => (a: A) => (b: B) => fn(a, b);
import { ConversationStep } from "../../providers/AIAssistantProvider";

// =====================================================================
// CORE TYPES AND INTERFACES
// =====================================================================

/**
 * Enhanced user profile with multiple personalization dimensions
 */
export interface PersonalizationProfile {
  // Professional dimension
  occupation?: string;
  industry?: string;
  workStyle?: WorkStyle;
  careerStage?: CareerStage;

  // Personal dimension
  hobbies?: string[];
  interests?: string[];
  lifestyle?: Lifestyle;
  values?: Value[];
  goals?: string[];

  // Financial dimension
  experienceLevel?: ExperienceLevel;
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  investmentGoals?: string[];

  // Demographic dimension (optional)
  ageRange?: AgeRange;
  familyStatus?: FamilyStatus;
  location?: string;

  // Learning preferences
  learningStyle?: LearningStyle;
  preferredAnalogies?: string[];
  communicationStyle?: CommunicationStyle;
}

export type WorkStyle =
  | "analytical"
  | "creative"
  | "collaborative"
  | "independent"
  | "detail-oriented"
  | "big-picture";
export type CareerStage =
  | "entry-level"
  | "mid-level"
  | "senior"
  | "executive"
  | "entrepreneur"
  | "retired";
export type Lifestyle =
  | "busy"
  | "flexible"
  | "structured"
  | "spontaneous"
  | "minimalist"
  | "adventurous";
export type Value =
  | "security"
  | "growth"
  | "innovation"
  | "sustainability"
  | "community"
  | "freedom"
  | "stability";
export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";
export type AgeRange = "18-25" | "26-35" | "36-45" | "46-55" | "56-65" | "65+";
export type FamilyStatus =
  | "single"
  | "married"
  | "parent"
  | "caregiver"
  | "empty-nester";
export type LearningStyle =
  | "visual"
  | "auditory"
  | "kinesthetic"
  | "reading"
  | "example-based"
  | "theory-first";
export type CommunicationStyle =
  | "formal"
  | "casual"
  | "technical"
  | "conversational"
  | "concise"
  | "detailed";

/**
 * Context information for personalization selection
 */
export interface PersonalizationContext {
  step: ConversationStep;
  concept: string;
  urgency: "low" | "medium" | "high";
  complexity: number; // 1-10 scale
  userConfidence?: number; // 0-1 scale
  previousPersonalizationEffectiveness?: number; // 0-1 scale
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
}

/**
 * Analysis result of a user's personalization profile
 */
export interface PersonalizationAnalysis {
  completeness: number; // 0-1 scale
  primaryDimensions: PersonalizationDimension[];
  gaps: string[];
  strengths: string[];
  recommendedImprovements: ProfileImprovement[];
  personalizationPotential: number; // 0-1 scale
}

/**
 * Personalization dimensions with weights
 */
export interface PersonalizationDimension {
  type: DimensionType;
  weight: number; // 0-1 scale
  confidence: number; // 0-1 scale
  attributes: Record<string, any>;
}

export type DimensionType =
  | "professional"
  | "personal"
  | "financial"
  | "demographic"
  | "learning";

/**
 * Profile improvement suggestion
 */
export interface ProfileImprovement {
  dimension: DimensionType;
  field: string;
  suggestion: string;
  priority: "low" | "medium" | "high";
  impact: number; // 0-1 scale
}

/**
 * Personalization result with selected strategy
 */
export interface PersonalizationResult {
  strategy: PersonalizationStrategy;
  analogies: string[];
  examples: string[];
  tone: CommunicationStyle;
  complexity: number; // 1-10 scale
  confidence: number; // 0-1 scale
  reasoning: string;
  fallbacks: PersonalizationStrategy[];
}

/**
 * Personalization strategy definition
 */
export interface PersonalizationStrategy {
  id: string;
  name: string;
  primaryDimension: PersonalizationDimension;
  secondaryDimensions: PersonalizationDimension[];
  applicableContexts: ConversationStep[];
  effectivenessScore: number; // 0-1 scale
}

// =====================================================================
// PERSONALIZATION STRATEGIES DATABASE
// =====================================================================

const PERSONALIZATION_STRATEGIES: PersonalizationStrategy[] = [
  {
    id: "professional-analytical",
    name: "Professional Analytical",
    primaryDimension: {
      type: "professional",
      weight: 0.8,
      confidence: 0.9,
      attributes: { workStyle: "analytical" },
    },
    secondaryDimensions: [
      {
        type: "financial",
        weight: 0.6,
        confidence: 0.8,
        attributes: { experienceLevel: "intermediate" },
      },
    ],
    applicableContexts: [
      "risk_assessment",
      "strategy_builder",
      "recommendations",
    ],
    effectivenessScore: 0.85,
  },
  {
    id: "hobby-based-learning",
    name: "Hobby-Based Learning",
    primaryDimension: {
      type: "personal",
      weight: 0.9,
      confidence: 0.8,
      attributes: { hobbies: ["gaming", "cooking", "sports"] },
    },
    secondaryDimensions: [
      {
        type: "learning",
        weight: 0.7,
        confidence: 0.7,
        attributes: { learningStyle: "example-based" },
      },
    ],
    applicableContexts: [
      "occupation_explanation",
      "risk_tolerance",
      "timeline",
    ],
    effectivenessScore: 0.9,
  },
  {
    id: "lifestyle-adaptive",
    name: "Lifestyle Adaptive",
    primaryDimension: {
      type: "personal",
      weight: 0.8,
      confidence: 0.8,
      attributes: { lifestyle: "busy" },
    },
    secondaryDimensions: [
      {
        type: "demographic",
        weight: 0.5,
        confidence: 0.6,
        attributes: { familyStatus: "parent" },
      },
    ],
    applicableContexts: ["timeline", "amount", "investment_goals"],
    effectivenessScore: 0.82,
  },
  {
    id: "experience-based",
    name: "Experience-Based",
    primaryDimension: {
      type: "financial",
      weight: 0.9,
      confidence: 0.9,
      attributes: { experienceLevel: "advanced" },
    },
    secondaryDimensions: [
      {
        type: "professional",
        weight: 0.6,
        confidence: 0.7,
        attributes: { careerStage: "senior" },
      },
    ],
    applicableContexts: [
      "protocol_selection",
      "leverage_optimization",
      "strategy_builder",
    ],
    effectivenessScore: 0.88,
  },
];

// =====================================================================
// ANALOGY AND EXAMPLE DATABASES
// =====================================================================

const PROFESSION_ANALOGIES: Record<string, string[]> = {
  chef: [
    "Like balancing flavors in a dish, portfolio diversification balances risk and return",
    "Just as mise en place prepares you for service, emergency funds prepare you for market volatility",
    "Creating a signature dish takes time - building wealth through compound interest is similar",
  ],
  truck_driver: [
    "Like planning efficient routes, smart investing finds the best path to your financial destination",
    "Just as you maintain your truck for reliability, regular portfolio rebalancing maintains performance",
    "Long-haul success requires patience - similar to long-term investing strategies",
  ],
  teacher: [
    "Like lesson planning, investment planning requires clear objectives and structured approaches",
    "Just as you diversify teaching methods, portfolio diversification reduces risk",
    "Building student knowledge over time mirrors how compound interest builds wealth",
  ],
  software_engineer: [
    "Like code optimization, portfolio optimization maximizes efficiency and minimizes risk",
    "Just as you use version control, investment tracking helps manage changes over time",
    "Building scalable systems parallels creating scalable investment strategies",
  ],
};

const HOBBY_ANALOGIES: Record<string, string[]> = {
  gaming: [
    "Like leveling up characters, compound interest levels up your wealth over time",
    "Just as you balance offense and defense, balance growth and stability in investments",
    "Risk management in investing is like managing health points - don't go all-in on risky moves",
  ],
  cooking: [
    "Like following a recipe, investment strategies need measured ingredients and patience",
    "Just as you taste and adjust seasonings, regularly review and rebalance your portfolio",
    "Diversification is like a balanced meal - you need different food groups for optimal nutrition",
  ],
  gardening: [
    "Like planting seeds, investments need time to grow into substantial returns",
    "Just as you water plants regularly, consistent investing nurtures long-term growth",
    "Portfolio diversification is like companion planting - different investments support each other",
  ],
  sports: [
    "Like training for a marathon, investing requires consistent effort and long-term commitment",
    "Just as you have offensive and defensive strategies, balance growth and protective investments",
    "Risk management is like playing defense - protect what you've gained while pursuing more",
  ],
};

const LIFESTYLE_EXAMPLES: Record<Lifestyle, string[]> = {
  busy: [
    "Set up automated investing to build wealth while focusing on your career",
    "Use index funds for hands-off diversification that doesn't require daily management",
    "Consider robo-advisors that handle rebalancing automatically",
  ],
  structured: [
    "Create a detailed investment plan with specific milestones and review dates",
    "Use systematic approaches like dollar-cost averaging for consistent investing",
    "Set up regular portfolio reviews on a fixed schedule",
  ],
  flexible: [
    "Maintain liquid investments for opportunities that align with your changing interests",
    "Consider flexible investment accounts that allow for varying contribution amounts",
    "Build a diversified portfolio that can adapt to different market conditions",
  ],
  spontaneous: [
    'Keep some \"opportunity funds\" for exciting investment prospects',
    "Use apps that round up purchases and invest the change automatically",
    "Consider investments that allow you to participate in trends you're passionate about",
  ],
  minimalist: [
    "Focus on simple, low-cost index funds that provide broad market exposure",
    "Use a three-fund portfolio approach for maximum simplicity",
    "Automate everything to minimize time spent on investment management",
  ],
  adventurous: [
    "Allocate a small portion to high-growth or alternative investments",
    "Consider ESG or thematic investing aligned with causes you care about",
    "Explore new investment platforms and technologies while maintaining a stable core",
  ],
};

// =====================================================================
// CORE PERSONALIZATION ENGINE CLASS
// =====================================================================

export class PersonalizationEngine {
  private readonly strategies: PersonalizationStrategy[];
  private readonly professionAnalogies: Record<string, string[]>;
  private readonly hobbyAnalogies: Record<string, string[]>;
  private readonly lifestyleExamples: Record<Lifestyle, string[]>;

  constructor() {
    this.strategies = PERSONALIZATION_STRATEGIES;
    this.professionAnalogies = PROFESSION_ANALOGIES;
    this.hobbyAnalogies = HOBBY_ANALOGIES;
    this.lifestyleExamples = LIFESTYLE_EXAMPLES;
  }

  /**
   * Analyzes a user profile across all dimensions
   */
  analyzeProfile(profile: PersonalizationProfile): PersonalizationAnalysis {
    return pipe(profile, this.calculateCompleteness, (completeness) => ({
      completeness,
      primaryDimensions: this.identifyPrimaryDimensions(profile),
      gaps: this.identifyGaps(profile),
      strengths: this.identifyStrengths(profile),
      recommendedImprovements: this.generateImprovements(profile),
      personalizationPotential: this.calculatePersonalizationPotential(
        profile,
        completeness,
      ),
    }));
  }

  /**
   * Selects the best personalization strategy for a given context
   */
  selectPersonalization(
    profile: PersonalizationProfile,
    context: PersonalizationContext,
  ): PersonalizationResult {
    const analysis = this.analyzeProfile(profile);
    const strategy = this.selectBestStrategy(analysis, context);

    return {
      strategy,
      analogies: this.generateAnalogies(profile, context),
      examples: this.generateExamples(profile, context),
      tone: this.determineTone(profile, context),
      complexity: this.adjustComplexity(
        context.complexity,
        profile.experienceLevel,
      ),
      confidence: this.calculateConfidence(strategy, analysis),
      reasoning: this.generateReasoning(strategy, analysis, context),
      fallbacks: this.generateFallbacks(strategy, analysis, context),
    };
  }

  /**
   * Scores the effectiveness of a personalization approach
   */
  scoreEffectiveness(
    personalization: string,
    profile: PersonalizationProfile,
  ): number {
    return pipe(
      personalization,
      this.analyzePersonalizationContent,
      (content) => this.calculateEffectivenessScore(content, profile),
    );
  }

  /**
   * Suggests improvements to enhance profile completeness
   */
  suggestProfileImprovements(profile: PersonalizationProfile): string[] {
    const analysis = this.analyzeProfile(profile);
    return analysis.recommendedImprovements
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5)
      .map((improvement) => improvement.suggestion);
  }

  // =====================================================================
  // PRIVATE HELPER METHODS
  // =====================================================================

  private calculateCompleteness = (profile: PersonalizationProfile): number => {
    const totalFields = 15; // Total number of profile fields
    const filledFields = Object.values(profile).filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        (Array.isArray(value) ? value.length > 0 : true),
    ).length;

    return Math.min(filledFields / totalFields, 1.0);
  };

  private identifyPrimaryDimensions = (
    profile: PersonalizationProfile,
  ): PersonalizationDimension[] => {
    const dimensions: PersonalizationDimension[] = [];

    // Professional dimension
    if (profile.occupation || profile.industry || profile.workStyle) {
      dimensions.push({
        type: "professional",
        weight: this.calculateDimensionWeight("professional", profile),
        confidence: this.calculateDimensionConfidence("professional", profile),
        attributes: {
          occupation: profile.occupation,
          industry: profile.industry,
          workStyle: profile.workStyle,
          careerStage: profile.careerStage,
        },
      });
    }

    // Personal dimension
    if (
      profile.hobbies?.length ||
      profile.interests?.length ||
      profile.lifestyle
    ) {
      dimensions.push({
        type: "personal",
        weight: this.calculateDimensionWeight("personal", profile),
        confidence: this.calculateDimensionConfidence("personal", profile),
        attributes: {
          hobbies: profile.hobbies,
          interests: profile.interests,
          lifestyle: profile.lifestyle,
          values: profile.values,
        },
      });
    }

    // Financial dimension
    if (
      profile.experienceLevel ||
      profile.riskTolerance ||
      profile.investmentGoals?.length
    ) {
      dimensions.push({
        type: "financial",
        weight: this.calculateDimensionWeight("financial", profile),
        confidence: this.calculateDimensionConfidence("financial", profile),
        attributes: {
          experienceLevel: profile.experienceLevel,
          riskTolerance: profile.riskTolerance,
          investmentGoals: profile.investmentGoals,
        },
      });
    }

    return dimensions.sort((a, b) => b.weight - a.weight);
  };

  private calculateDimensionWeight = (
    dimension: DimensionType,
    profile: PersonalizationProfile,
  ): number => {
    switch (dimension) {
      case "professional":
        return (
          (profile.occupation ? 0.4 : 0) +
          (profile.industry ? 0.2 : 0) +
          (profile.workStyle ? 0.3 : 0) +
          (profile.careerStage ? 0.1 : 0)
        );

      case "personal":
        return (
          (profile.hobbies?.length
            ? Math.min(profile.hobbies.length * 0.15, 0.4)
            : 0) +
          (profile.interests?.length
            ? Math.min(profile.interests.length * 0.1, 0.3)
            : 0) +
          (profile.lifestyle ? 0.2 : 0) +
          (profile.values?.length
            ? Math.min(profile.values.length * 0.05, 0.1)
            : 0)
        );

      case "financial":
        return (
          (profile.experienceLevel ? 0.4 : 0) +
          (profile.riskTolerance ? 0.3 : 0) +
          (profile.investmentGoals?.length
            ? Math.min(profile.investmentGoals.length * 0.1, 0.3)
            : 0)
        );

      default:
        return 0.1;
    }
  };

  private calculateDimensionConfidence = (
    dimension: DimensionType,
    profile: PersonalizationProfile,
  ): number => {
    // Higher confidence with more specific information
    const weight = this.calculateDimensionWeight(dimension, profile);
    return Math.min(weight + 0.3, 1.0);
  };

  private identifyGaps = (profile: PersonalizationProfile): string[] => {
    const gaps: string[] = [];

    if (!profile.occupation) gaps.push("occupation");
    if (!profile.hobbies?.length) gaps.push("hobbies");
    if (!profile.experienceLevel) gaps.push("experience level");
    if (!profile.lifestyle) gaps.push("lifestyle preferences");
    if (!profile.learningStyle) gaps.push("learning style");
    if (!profile.workStyle) gaps.push("work style");

    return gaps;
  };

  private identifyStrengths = (profile: PersonalizationProfile): string[] => {
    const strengths: string[] = [];

    if (profile.occupation) strengths.push("clear professional identity");
    if (profile.hobbies?.length && profile.hobbies.length > 2)
      strengths.push("diverse interests");
    if (profile.experienceLevel) strengths.push("defined financial experience");
    if (profile.values?.length && profile.values.length > 1)
      strengths.push("clear value system");
    if (profile.investmentGoals?.length && profile.investmentGoals.length > 1)
      strengths.push("specific investment goals");

    return strengths;
  };

  private generateImprovements = (
    profile: PersonalizationProfile,
  ): ProfileImprovement[] => {
    const improvements: ProfileImprovement[] = [];

    if (!profile.learningStyle) {
      improvements.push({
        dimension: "learning",
        field: "learningStyle",
        suggestion:
          "Share how you prefer to learn new concepts (visual examples, step-by-step guides, or hands-on practice)",
        priority: "high",
        impact: 0.8,
      });
    }

    if (!profile.hobbies?.length) {
      improvements.push({
        dimension: "personal",
        field: "hobbies",
        suggestion:
          "Tell me about your hobbies and interests so I can use familiar analogies",
        priority: "high",
        impact: 0.9,
      });
    }

    if (!profile.workStyle) {
      improvements.push({
        dimension: "professional",
        field: "workStyle",
        suggestion:
          "Describe your work style (analytical, creative, collaborative) for better-tailored advice",
        priority: "medium",
        impact: 0.6,
      });
    }

    return improvements;
  };

  private calculatePersonalizationPotential = (
    profile: PersonalizationProfile,
    completeness: number,
  ): number => {
    const diversityBonus = this.calculateDiversityBonus(profile);
    const specificityBonus = this.calculateSpecificityBonus(profile);

    return Math.min(completeness + diversityBonus + specificityBonus, 1.0);
  };

  private calculateDiversityBonus = (
    profile: PersonalizationProfile,
  ): number => {
    let bonus = 0;
    if (profile.hobbies && profile.hobbies.length > 2) bonus += 0.1;
    if (profile.interests && profile.interests.length > 2) bonus += 0.1;
    if (profile.values && profile.values.length > 1) bonus += 0.05;
    return Math.min(bonus, 0.2);
  };

  private calculateSpecificityBonus = (
    profile: PersonalizationProfile,
  ): number => {
    let bonus = 0;
    if (profile.occupation && profile.occupation.length > 10) bonus += 0.05;
    if (profile.industry) bonus += 0.05;
    if (profile.investmentGoals && profile.investmentGoals.length > 1)
      bonus += 0.05;
    return Math.min(bonus, 0.1);
  };

  private selectBestStrategy = (
    analysis: PersonalizationAnalysis,
    context: PersonalizationContext,
  ): PersonalizationStrategy => {
    const contextualStrategies = this.strategies.filter((strategy) =>
      strategy.applicableContexts.includes(context.step),
    );

    if (contextualStrategies.length === 0) {
      const fallback = this.strategies[0] || PERSONALIZATION_STRATEGIES[0];
      if (!fallback) {
        throw new Error("No personalization strategies available");
      }
      return fallback;
    }

    return contextualStrategies.reduce((best, current) => {
      const currentScore = this.scoreStrategyForContext(
        current,
        analysis,
        context,
      );
      const bestScore = this.scoreStrategyForContext(best, analysis, context);
      return currentScore > bestScore ? current : best;
    });
  };

  private scoreStrategyForContext = (
    strategy: PersonalizationStrategy,
    analysis: PersonalizationAnalysis,
    context: PersonalizationContext,
  ): number => {
    let score = strategy.effectivenessScore;

    // Boost score if strategy's primary dimension matches user's strong dimensions
    const userDimensions = analysis.primaryDimensions.map((d) => d.type);
    if (userDimensions.includes(strategy.primaryDimension.type)) {
      score += 0.2;
    }

    // Adjust for context urgency
    if (
      context.urgency === "high" &&
      strategy.primaryDimension.type === "financial"
    ) {
      score += 0.1;
    }

    // Adjust for complexity match
    const complexityMatch =
      1 - Math.abs(context.complexity - strategy.effectivenessScore * 10) / 10;
    score += complexityMatch * 0.1;

    return Math.min(score, 1.0);
  };

  private generateAnalogies = (
    profile: PersonalizationProfile,
    _context: PersonalizationContext,
  ): string[] => {
    const analogies: string[] = [];

    // Add profession-based analogies
    if (profile.occupation) {
      const professionAnalogies = this.professionAnalogies[profile.occupation];
      if (professionAnalogies) {
        analogies.push(...professionAnalogies.slice(0, 2));
      }
    }

    // Add hobby-based analogies
    if (profile.hobbies) {
      profile.hobbies.forEach((hobby) => {
        if (this.hobbyAnalogies[hobby]) {
          analogies.push(...this.hobbyAnalogies[hobby].slice(0, 1));
        }
      });
    }

    // Limit to 3 most relevant analogies
    return analogies.slice(0, 3);
  };

  private generateExamples = (
    profile: PersonalizationProfile,
    context: PersonalizationContext,
  ): string[] => {
    const examples: string[] = [];

    // Add lifestyle-based examples
    if (profile.lifestyle && this.lifestyleExamples[profile.lifestyle]) {
      examples.push(...this.lifestyleExamples[profile.lifestyle].slice(0, 2));
    }

    // Add experience-level appropriate examples
    if (profile.experienceLevel) {
      examples.push(
        ...this.generateExperienceLevelExamples(
          profile.experienceLevel,
          context,
        ),
      );
    }

    return examples.slice(0, 3);
  };

  private generateExperienceLevelExamples = (
    level: ExperienceLevel,
    _context: PersonalizationContext,
  ): string[] => {
    const examples: Record<ExperienceLevel, string[]> = {
      beginner: [
        "Start with basic index funds like VTSAX for broad market exposure",
        "Consider using a robo-advisor for automated portfolio management",
        "Begin with small, consistent contributions to build the habit",
      ],
      intermediate: [
        "Explore factor-based investing like value or growth tilts",
        "Consider adding international exposure with developed market funds",
        "Implement tax-loss harvesting strategies in taxable accounts",
      ],
      advanced: [
        "Utilize advanced rebalancing strategies like tax-aware rebalancing",
        "Consider alternative investments like REITs or commodities",
        "Implement direct indexing for tax optimization",
      ],
      expert: [
        "Explore quantitative strategies and factor models",
        "Consider private market investments and alternative strategies",
        "Implement sophisticated tax optimization and estate planning",
      ],
    };

    return examples[level] || examples["beginner"];
  };

  private determineTone = (
    profile: PersonalizationProfile,
    context: PersonalizationContext,
  ): CommunicationStyle => {
    // Default tone based on experience level
    if (
      profile.experienceLevel === "expert" ||
      profile.experienceLevel === "advanced"
    ) {
      return "technical";
    }

    // Adjust based on work style
    if (profile.workStyle === "analytical") {
      return "formal";
    }

    // Adjust based on context urgency
    if (context.urgency === "high") {
      return "concise";
    }

    // Default to conversational for most users
    return "conversational";
  };

  private adjustComplexity = (
    baseComplexity: number,
    experienceLevel?: ExperienceLevel,
  ): number => {
    const adjustments: Record<ExperienceLevel, number> = {
      beginner: -2,
      intermediate: 0,
      advanced: 1,
      expert: 2,
    };

    const adjustment = experienceLevel ? adjustments[experienceLevel] : 0;
    return Math.max(1, Math.min(10, baseComplexity + adjustment));
  };

  private calculateConfidence = (
    strategy: PersonalizationStrategy,
    analysis: PersonalizationAnalysis,
  ): number => {
    let confidence = strategy.effectivenessScore;

    // Boost confidence with higher profile completeness
    confidence += analysis.completeness * 0.2;

    // Boost confidence if we have strong primary dimensions
    const strongDimensions = analysis.primaryDimensions.filter(
      (d) => d.confidence > 0.7,
    ).length;
    confidence += strongDimensions * 0.1;

    return Math.min(confidence, 1.0);
  };

  private generateReasoning = (
    strategy: PersonalizationStrategy,
    analysis: PersonalizationAnalysis,
    context: PersonalizationContext,
  ): string => {
    const reasons: string[] = [];

    reasons.push(
      `Selected ${strategy.name} strategy based on your ${strategy.primaryDimension.type} profile`,
    );

    if (analysis.completeness > 0.7) {
      reasons.push("comprehensive profile information available");
    }

    if (context.complexity > 7) {
      reasons.push("adjusted for high complexity topic");
    }

    return reasons.join(", ");
  };

  private generateFallbacks = (
    strategy: PersonalizationStrategy,
    analysis: PersonalizationAnalysis,
    context: PersonalizationContext,
  ): PersonalizationStrategy[] => {
    return this.strategies
      .filter((s) => s.id !== strategy.id)
      .filter((s) => s.applicableContexts.includes(context.step))
      .sort(
        (a, b) =>
          this.scoreStrategyForContext(b, analysis, context) -
          this.scoreStrategyForContext(a, analysis, context),
      )
      .slice(0, 2);
  };

  private analyzePersonalizationContent = (
    content: string,
  ): {
    hasAnalogies: boolean;
    hasExamples: boolean;
    tone: string;
    complexity: number;
  } => {
    const hasAnalogies = /like|similar to|just as|comparable to/i.test(content);
    const hasExamples = /for example|such as|consider|try/i.test(content);

    // Simple complexity analysis based on sentence length and technical terms
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const complexity = Math.min(
      10,
      Math.max(1, Math.floor(avgSentenceLength / 15)),
    );

    return {
      hasAnalogies,
      hasExamples,
      tone: avgSentenceLength > 100 ? "detailed" : "concise",
      complexity,
    };
  };

  private calculateEffectivenessScore = (
    content: {
      hasAnalogies: boolean;
      hasExamples: boolean;
      tone: string;
      complexity: number;
    },
    profile: PersonalizationProfile,
  ): number => {
    let score = 0.5; // Base score

    // Reward appropriate use of analogies for users with hobbies/occupation
    if (
      content.hasAnalogies &&
      (profile.hobbies?.length || profile.occupation)
    ) {
      score += 0.3;
    }

    // Reward examples for practical learners
    if (content.hasExamples && profile.learningStyle === "example-based") {
      score += 0.2;
    }

    // Adjust for experience level match
    const experienceComplexityMatch = this.getExperienceComplexityMatch(
      profile.experienceLevel,
      content.complexity,
    );
    score += experienceComplexityMatch * 0.3;

    return Math.min(score, 1.0);
  };

  private getExperienceComplexityMatch = (
    level: ExperienceLevel | undefined,
    complexity: number,
  ): number => {
    if (!level) return 0.5;

    const idealComplexity: Record<ExperienceLevel, number> = {
      beginner: 3,
      intermediate: 5,
      advanced: 7,
      expert: 9,
    };

    const ideal = idealComplexity[level];
    return 1 - Math.abs(complexity - ideal) / 10;
  };
}

// =====================================================================
// FUNCTIONAL UTILITIES
// =====================================================================

/**
 * Curried function to create personalization analysis
 */
export const analyzeUserProfile = curry(
  (
    engine: PersonalizationEngine,
    profile: PersonalizationProfile,
  ): PersonalizationAnalysis => engine.analyzeProfile(profile),
);

/**
 * Curried function to select personalization strategy
 */
export const selectPersonalizationStrategy = curry(
  (
    engine: PersonalizationEngine,
    profile: PersonalizationProfile,
    context: PersonalizationContext,
  ): PersonalizationResult => engine.selectPersonalization(profile, context),
);

/**
 * Curried function to score personalization effectiveness
 */
export const scorePersonalizationEffectiveness = curry(
  (
    engine: PersonalizationEngine,
    profile: PersonalizationProfile,
    personalization: string,
  ): number => engine.scoreEffectiveness(personalization, profile),
);

/**
 * Higher-order function to create context-aware personalization selector
 */
export const createContextAwareSelector =
  (engine: PersonalizationEngine) =>
  (context: PersonalizationContext) =>
  (profile: PersonalizationProfile): PersonalizationResult =>
    engine.selectPersonalization(profile, context);

/**
 * Compose multiple personalization improvements
 */
export const composePersonalizationImprovements = (
  ...improvements: ProfileImprovement[][]
): ProfileImprovement[] =>
  improvements
    .flat()
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 10); // Limit to top 10 improvements

/**
 * Default personalization engine instance
 */
export const defaultPersonalizationEngine = new PersonalizationEngine();

// =====================================================================
// EXPORTS
// =====================================================================

export default PersonalizationEngine;
