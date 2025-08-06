/**
 * @fileoverview Dynamic Analogy Generation Engine for NyxUSD AI Assistant
 *
 * A comprehensive analogy generation system that replaces hard-coded occupation analogies
 * with dynamic, contextual analogies for unlimited occupations, hobbies, and interests.
 *
 * Features:
 * - Dynamic category detection and classification
 * - Template-based analogy generation
 * - Multi-dimensional analogy combination
 * - Quality scoring and fallback mechanisms
 * - Cross-category analogies support
 *
 * @author NyxUSD AI Team
 * @version 1.0.0
 */

// Simple local implementations to avoid build issues
const pipe = <T, U>(value: T, fn: (val: T) => U): U => fn(value);

class Some<T> {
  constructor(public readonly value: T) {}
  isSome(): this is Some<T> { return true; }
  isNone(): this is None { return false; }
}
class None {
  isSome(): this is Some<any> { return false; }
  isNone(): this is None { return true; }
}
type Option<T> = Some<T> | None;

class Ok<T, E> {
  constructor(public readonly value: T) {}
  isOk(): this is Ok<T, E> { return true; }
  isErr(): this is Err<T, E> { return false; }
}
class Err<T, E> {
  constructor(public readonly value: E) {}
  isOk(): this is Ok<T, E> { return false; }
  isErr(): this is Err<T, E> { return true; }
}
type Result<T, E> = Ok<T, E> | Err<T, E>;

class Left<L, R> {
  constructor(public readonly value: L) {}
  isLeft(): this is Left<L, R> { return true; }
  isRight(): this is Right<L, R> { return false; }
}
class Right<L, R> {
  constructor(public readonly value: R) {}
  isLeft(): this is Left<L, R> { return false; }
  isRight(): this is Right<L, R> { return true; }
}
type Either<L, R> = Left<L, R> | Right<L, R>;

// Core interfaces for analogy generation
export interface AnalogyContext {
  occupation?: string;
  hobbies?: string[];
  interests?: string[];
  concept: ConceptType;
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  timeline?: "short" | "medium" | "long";
  experienceLevel?: "beginner" | "intermediate" | "advanced";
}

export interface AnalogyResult {
  primary: string;
  alternative?: string;
  confidence: number;
  categories: string[];
  templateUsed: string;
  crossCategoryMatch?: boolean;
}

export type ConceptType =
  | "growth"
  | "income"
  | "preservation"
  | "diversification"
  | "risk"
  | "liquidity"
  | "leverage"
  | "staking"
  | "yields"
  | "impermanent_loss"
  | "slippage"
  | "smart_contracts"
  | "clmm"
  | "pools";

export type CategoryType =
  | "creative"
  | "analytical"
  | "physical"
  | "service"
  | "technical"
  | "management"
  | "sports"
  | "gaming"
  | "arts"
  | "outdoors"
  | "collecting"
  | "learning"
  | "technology"
  | "finance"
  | "travel"
  | "food"
  | "health"
  | "environment";

// Category classification patterns
const OCCUPATION_PATTERNS: Record<CategoryType, string[]> = {
  creative: [
    "chef",
    "cook",
    "designer",
    "artist",
    "writer",
    "photographer",
    "musician",
    "architect",
    "filmmaker",
    "creative director",
    "content creator",
    "influencer",
  ],
  analytical: [
    "accountant",
    "analyst",
    "researcher",
    "scientist",
    "statistician",
    "data scientist",
    "economist",
    "actuary",
    "auditor",
    "consultant",
  ],
  physical: [
    "truck driver",
    "construction worker",
    "mechanic",
    "athlete",
    "trainer",
    "carpenter",
    "electrician",
    "plumber",
    "landscaper",
    "farmer",
  ],
  service: [
    "teacher",
    "nurse",
    "waiter",
    "retail manager",
    "customer service",
    "social worker",
    "therapist",
    "counselor",
    "receptionist",
    "sales",
  ],
  technical: [
    "engineer",
    "developer",
    "programmer",
    "technician",
    "IT specialist",
    "systems admin",
    "network engineer",
    "cybersecurity",
    "devops",
    "architect",
  ],
  management: [
    "manager",
    "director",
    "ceo",
    "supervisor",
    "coordinator",
    "administrator",
    "project manager",
    "team lead",
    "executive",
    "owner",
    "entrepreneur",
  ],
  sports: [
    "football",
    "basketball",
    "tennis",
    "golf",
    "running",
    "cycling",
    "swimming",
    "hiking",
    "climbing",
    "martial arts",
    "yoga",
    "fitness",
  ],
  gaming: [
    "video games",
    "board games",
    "esports",
    "streaming",
    "chess",
    "poker",
    "card games",
    "rpg",
    "strategy games",
    "puzzle games",
  ],
  arts: [
    "painting",
    "drawing",
    "sculpture",
    "music",
    "photography",
    "writing",
    "poetry",
    "theater",
    "dance",
    "crafting",
    "knitting",
    "woodworking",
  ],
  outdoors: [
    "camping",
    "fishing",
    "hunting",
    "gardening",
    "nature",
    "wildlife",
    "astronomy",
    "geocaching",
    "backpacking",
    "kayaking",
    "skiing",
  ],
  collecting: [
    "coins",
    "stamps",
    "art",
    "books",
    "records",
    "vintage items",
    "sports cards",
    "memorabilia",
    "antiques",
    "watches",
    "wine",
  ],
  learning: [
    "reading",
    "courses",
    "languages",
    "history",
    "science",
    "philosophy",
    "podcasts",
    "documentaries",
    "research",
    "trivia",
    "debate",
  ],
  technology: [
    "coding",
    "gadgets",
    "ai",
    "crypto",
    "blockchain",
    "robotics",
    "vr",
    "ar",
    "iot",
    "electronics",
    "programming",
    "innovation",
  ],
  finance: [
    "investing",
    "trading",
    "budgeting",
    "economics",
    "real estate",
    "retirement planning",
    "taxes",
    "insurance",
    "banking",
    "fintech",
  ],
  travel: [
    "backpacking",
    "cruises",
    "road trips",
    "international travel",
    "adventure travel",
    "cultural exploration",
    "food tourism",
    "photography",
  ],
  food: [
    "cooking",
    "baking",
    "wine tasting",
    "restaurants",
    "nutrition",
    "organic farming",
    "food photography",
    "culinary arts",
    "gastronomy",
  ],
  health: [
    "fitness",
    "nutrition",
    "wellness",
    "meditation",
    "mental health",
    "alternative medicine",
    "supplements",
    "sleep optimization",
    "biohacking",
  ],
  environment: [
    "sustainability",
    "renewable energy",
    "conservation",
    "recycling",
    "climate change",
    "green technology",
    "permaculture",
    "eco-friendly",
  ],
};

// Analogy templates organized by category and concept
interface AnalogyTemplate {
  template: string;
  variables: string[];
  confidence: number;
  crossCategorySupport: boolean;
}

const ANALOGY_TEMPLATES: Record<
  CategoryType,
  Record<ConceptType, AnalogyTemplate[]>
> = {
  creative: {
    growth: [
      {
        template:
          "Like developing your artistic skills over time - each project builds on the last, creating increasingly sophisticated work that commands higher prices",
        variables: [
          "skill_development",
          "project_progression",
          "price_appreciation",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
      {
        template:
          "Think of it like building a portfolio of creative works - the more diverse and refined your collection, the more valuable it becomes",
        variables: [
          "portfolio_building",
          "diversification",
          "value_appreciation",
        ],
        confidence: 0.85,
        crossCategorySupport: false,
      },
    ],
    income: [
      {
        template:
          "Like having multiple revenue streams from your creative work - selling originals, prints, licensing, and commissions all provide steady income",
        variables: [
          "multiple_streams",
          "consistent_revenue",
          "diversified_income",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    preservation: [
      {
        template:
          "Like carefully storing your best pieces in climate-controlled conditions - protecting your most valuable creations from damage",
        variables: [
          "asset_protection",
          "valuable_items",
          "preservation_methods",
        ],
        confidence: 0.8,
        crossCategorySupport: false,
      },
    ],
    diversification: [
      {
        template:
          "Like working in multiple mediums - if the market for paintings slows down, you still have photography and digital art bringing in income",
        variables: ["multiple_mediums", "market_hedging", "skill_variety"],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    risk: [
      {
        template:
          "Like experimenting with new techniques - sometimes breakthrough innovations pay off big, but there's always a chance the experiment doesn't work",
        variables: [
          "experimentation",
          "innovation_risk",
          "potential_breakthrough",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    liquidity: [
      {
        template:
          "Like having both quick-selling prints and high-value originals - prints provide immediate cash flow when needed",
        variables: ["quick_sales", "immediate_cash", "flexible_inventory"],
        confidence: 0.8,
        crossCategorySupport: false,
      },
    ],
    leverage: [
      {
        template:
          "Like using gallery representation to amplify your reach - the gallery's connections and marketing power multiply your artistic impact",
        variables: [
          "amplified_reach",
          "partnership_power",
          "multiplied_impact",
        ],
        confidence: 0.75,
        crossCategorySupport: true,
      },
    ],
    staking: [
      {
        template:
          "Like lending your artwork to prestigious exhibitions - your pieces are temporarily locked up but earn recognition and increase in value",
        variables: [
          "temporary_commitment",
          "prestige_building",
          "value_increase",
        ],
        confidence: 0.8,
        crossCategorySupport: false,
      },
    ],
    yields: [
      {
        template:
          "Like the ongoing royalties from licensed artwork - your creative investment continues generating returns long after the initial work",
        variables: ["ongoing_royalties", "passive_income", "long_term_returns"],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    impermanent_loss: [
      {
        template:
          "Like collaborating on a joint exhibition where market tastes shift - your solo work might have performed better, but the collaboration isn't a loss, just temporarily less optimal",
        variables: [
          "collaboration_tradeoffs",
          "market_shifts",
          "temporary_suboptimal",
        ],
        confidence: 0.7,
        crossCategorySupport: false,
      },
    ],
    slippage: [
      {
        template:
          "Like pricing your art for a gallery opening, but by the time pieces sell, market demand has shifted and final prices differ from expectations",
        variables: [
          "price_expectations",
          "market_changes",
          "execution_difference",
        ],
        confidence: 0.75,
        crossCategorySupport: true,
      },
    ],
    smart_contracts: [
      {
        template:
          "Like automatic royalty systems that pay you whenever your digital art is resold - no need to track sales manually, the system enforces payment rules",
        variables: [
          "automatic_execution",
          "royalty_enforcement",
          "no_manual_tracking",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    clmm: [
      {
        template:
          "Like focusing your creative energy on the styles and subjects that are currently most in-demand, rather than spreading effort equally across all possibilities",
        variables: [
          "focused_effort",
          "demand_targeting",
          "efficient_allocation",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    pools: [
      {
        template:
          "Like joining an artist collective where everyone contributes work and shares in the group's sales success",
        variables: [
          "collective_participation",
          "shared_contribution",
          "group_success",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
  },

  analytical: {
    growth: [
      {
        template:
          "Like compound analysis where each insight builds on previous discoveries, creating exponentially more valuable conclusions over time",
        variables: [
          "compound_insights",
          "building_knowledge",
          "exponential_value",
        ],
        confidence: 0.95,
        crossCategorySupport: true,
      },
      {
        template:
          "Think of it like expanding your analytical models - more sophisticated frameworks yield increasingly accurate predictions and better outcomes",
        variables: [
          "model_sophistication",
          "prediction_accuracy",
          "outcome_improvement",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    income: [
      {
        template:
          "Like having multiple data streams feeding into your analysis - each source provides steady, reliable information that generates consistent insights",
        variables: ["multiple_sources", "steady_flow", "consistent_output"],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    preservation: [
      {
        template:
          "Like maintaining robust backup systems and version control - protecting your valuable data and analysis from corruption or loss",
        variables: ["data_protection", "backup_systems", "loss_prevention"],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    diversification: [
      {
        template:
          "Like analyzing multiple datasets across different domains - if one data source becomes unreliable, you have other analytical angles to maintain insights",
        variables: [
          "multiple_datasets",
          "domain_variety",
          "analytical_redundancy",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    risk: [
      {
        template:
          "Like testing new analytical methodologies - advanced techniques might yield breakthrough insights, but there's uncertainty in unproven approaches",
        variables: [
          "methodology_testing",
          "breakthrough_potential",
          "approach_uncertainty",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    liquidity: [
      {
        template:
          "Like having both real-time dashboards and deep analytical reports - quick insights are immediately available when decisions need to be made",
        variables: [
          "real_time_access",
          "immediate_insights",
          "decision_support",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    leverage: [
      {
        template:
          "Like using machine learning to amplify your analytical capabilities - algorithms multiply your ability to process and understand complex patterns",
        variables: [
          "capability_amplification",
          "pattern_recognition",
          "processing_multiplication",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    staking: [
      {
        template:
          "Like committing computational resources to long-running analyses that will yield valuable insights once complete",
        variables: [
          "resource_commitment",
          "long_term_processing",
          "valuable_outcomes",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    yields: [
      {
        template:
          "Like the ongoing value generated from a well-designed analytical framework - initial setup effort continues producing insights over time",
        variables: [
          "framework_value",
          "ongoing_insights",
          "compounding_returns",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    impermanent_loss: [
      {
        template:
          "Like optimizing for specific conditions that change - your analysis was perfect for the original parameters, but shifting variables make it temporarily less effective",
        variables: [
          "optimization_specificity",
          "parameter_changes",
          "temporary_effectiveness",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    slippage: [
      {
        template:
          "Like data latency affecting real-time analysis - by the time your calculations complete, market conditions have shifted from your initial assumptions",
        variables: ["data_latency", "calculation_time", "assumption_drift"],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    smart_contracts: [
      {
        template:
          "Like automated analytical triggers that execute predetermined actions when specific conditions are met - no manual intervention needed",
        variables: [
          "automated_triggers",
          "condition_monitoring",
          "predetermined_actions",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    clmm: [
      {
        template:
          "Like concentrating analytical resources on the most volatile and informative data ranges rather than analyzing everything equally",
        variables: [
          "resource_concentration",
          "high_value_data",
          "efficient_analysis",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    pools: [
      {
        template:
          "Like shared analytical resources where multiple researchers contribute data and computing power to solve complex problems together",
        variables: [
          "shared_resources",
          "collaborative_analysis",
          "collective_intelligence",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
  },

  physical: {
    growth: [
      {
        template:
          "Like building strength and skill over time - each workout or practice session adds to your capabilities, creating exponentially better performance",
        variables: [
          "strength_building",
          "skill_accumulation",
          "performance_improvement",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
      {
        template:
          "Think of it like upgrading your equipment and tools - better gear enables you to take on bigger, more profitable jobs",
        variables: [
          "equipment_upgrades",
          "capability_expansion",
          "profit_increase",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    income: [
      {
        template:
          "Like having multiple types of work - regular contracts provide steady income while specialized jobs offer bonus opportunities",
        variables: ["work_variety", "steady_contracts", "bonus_opportunities"],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    preservation: [
      {
        template:
          "Like maintaining your tools and equipment properly - regular care protects your investment and prevents costly breakdowns",
        variables: [
          "equipment_maintenance",
          "investment_protection",
          "breakdown_prevention",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    diversification: [
      {
        template:
          "Like learning multiple skills - if demand drops for one type of work, you can shift to other areas where you're qualified",
        variables: ["skill_variety", "demand_flexibility", "work_alternatives"],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    risk: [
      {
        template:
          "Like taking on challenging jobs that pay more - higher difficulty means higher reward, but also greater chance of complications",
        variables: ["challenge_level", "reward_scaling", "complication_risk"],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    liquidity: [
      {
        template:
          "Like having both quick repair jobs and long-term projects - short work provides immediate cash when you need it",
        variables: ["job_variety", "immediate_payment", "cash_availability"],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    leverage: [
      {
        template:
          "Like using power tools and machinery to multiply your individual capabilities - the right equipment amplifies what you can accomplish",
        variables: [
          "tool_amplification",
          "capability_multiplication",
          "efficiency_gains",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    staking: [
      {
        template:
          "Like investing in professional certifications that are locked in training but increase your earning potential long-term",
        variables: [
          "certification_investment",
          "training_commitment",
          "earning_increase",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    yields: [
      {
        template:
          "Like the ongoing income from well-maintained rental equipment - initial investment continues generating returns through regular use",
        variables: [
          "equipment_rental",
          "ongoing_income",
          "maintenance_returns",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    impermanent_loss: [
      {
        template:
          "Like specializing in seasonal work when demand patterns shift - you're not losing skills, but market timing makes other work temporarily more profitable",
        variables: [
          "seasonal_specialization",
          "demand_patterns",
          "market_timing",
        ],
        confidence: 0.75,
        crossCategorySupport: false,
      },
    ],
    slippage: [
      {
        template:
          "Like material costs changing between job estimate and purchase - price fluctuations affect your expected profit margins",
        variables: ["cost_fluctuations", "estimate_accuracy", "margin_impact"],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    smart_contracts: [
      {
        template:
          "Like automated safety systems that shut down equipment when dangerous conditions are detected - programmed responses that don't require human monitoring",
        variables: [
          "automated_safety",
          "condition_monitoring",
          "programmed_responses",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    clmm: [
      {
        template:
          "Like focusing your effort on the most profitable job types during peak demand periods rather than taking every available job equally",
        variables: ["effort_focus", "peak_demand", "selective_work"],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    pools: [
      {
        template:
          "Like contractor cooperatives where everyone contributes equipment and shares in large project profits",
        variables: ["equipment_sharing", "cooperative_work", "shared_profits"],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
  },

  service: {
    growth: [
      {
        template:
          "Like building your reputation and client base over time - satisfied customers become repeat business and referrals, creating exponential growth",
        variables: [
          "reputation_building",
          "client_retention",
          "referral_growth",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    income: [
      {
        template:
          "Like having regular customers plus walk-in business - steady clients provide predictable income while new customers add growth",
        variables: [
          "regular_customers",
          "predictable_income",
          "growth_opportunities",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    preservation: [
      {
        template:
          "Like maintaining excellent customer relationships - protecting your client base from competitive threats and service disruptions",
        variables: [
          "relationship_maintenance",
          "client_protection",
          "service_continuity",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    diversification: [
      {
        template:
          "Like serving different customer segments - if one market segment slows down, others can maintain your overall business",
        variables: [
          "customer_segments",
          "market_variety",
          "business_stability",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    risk: [
      {
        template:
          "Like expanding into new service areas - growth opportunities come with the uncertainty of unfamiliar customer needs",
        variables: [
          "service_expansion",
          "growth_opportunities",
          "market_uncertainty",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    liquidity: [
      {
        template:
          "Like offering both appointment-based and walk-in services - flexible scheduling provides immediate income opportunities",
        variables: [
          "service_flexibility",
          "scheduling_options",
          "immediate_opportunities",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    leverage: [
      {
        template:
          "Like using customer management systems and automation to serve more clients without proportionally increasing effort",
        variables: [
          "system_leverage",
          "automation_benefits",
          "efficiency_scaling",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    staking: [
      {
        template:
          "Like committing to exclusive partnerships with key clients - restricting other opportunities but ensuring steady, premium business",
        variables: [
          "exclusive_partnerships",
          "opportunity_restriction",
          "premium_business",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    yields: [
      {
        template:
          "Like the ongoing value from excellent service reputation - initial effort to build trust continues generating customer loyalty and referrals",
        variables: ["reputation_value", "trust_building", "loyalty_generation"],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    impermanent_loss: [
      {
        template:
          "Like staffing for expected busy periods when customer patterns change - you're not losing capability, but timing makes your preparation temporarily excessive",
        variables: [
          "staffing_preparation",
          "pattern_changes",
          "timing_mismatch",
        ],
        confidence: 0.75,
        crossCategorySupport: false,
      },
    ],
    slippage: [
      {
        template:
          "Like quoted service prices changing due to unexpected complexity - the final cost differs from initial estimates",
        variables: ["price_quotes", "service_complexity", "cost_variance"],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    smart_contracts: [
      {
        template:
          "Like loyalty programs that automatically reward customers based on predefined spending or visit thresholds",
        variables: [
          "automatic_rewards",
          "threshold_tracking",
          "customer_incentives",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    clmm: [
      {
        template:
          "Like concentrating your best staff and resources during peak service hours rather than spreading them evenly throughout the day",
        variables: [
          "resource_concentration",
          "peak_optimization",
          "staff_allocation",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    pools: [
      {
        template:
          "Like service cooperatives where businesses share resources and refer customers to provide comprehensive solutions",
        variables: [
          "service_cooperation",
          "resource_sharing",
          "comprehensive_solutions",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
  },

  technical: {
    growth: [
      {
        template:
          "Like scaling system architecture - adding more efficient components and optimizations creates exponentially better performance over time",
        variables: [
          "system_scaling",
          "efficiency_improvements",
          "performance_gains",
        ],
        confidence: 0.95,
        crossCategorySupport: true,
      },
    ],
    income: [
      {
        template:
          "Like having multiple revenue streams from your technical skills - consulting, products, and services all generate steady income",
        variables: ["skill_monetization", "multiple_streams", "steady_income"],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    preservation: [
      {
        template:
          "Like implementing robust backup and security systems - protecting your valuable code, data, and infrastructure from threats",
        variables: [
          "system_protection",
          "data_security",
          "infrastructure_safety",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    diversification: [
      {
        template:
          "Like working across multiple technology stacks - if one platform becomes obsolete, you have expertise in others to maintain your career",
        variables: [
          "technology_variety",
          "platform_diversity",
          "career_resilience",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    risk: [
      {
        template:
          "Like adopting cutting-edge technologies - early adoption can provide competitive advantages, but comes with stability and support uncertainties",
        variables: [
          "technology_adoption",
          "competitive_advantage",
          "stability_tradeoffs",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    liquidity: [
      {
        template:
          "Like having both automated systems and manual override capabilities - you can quickly adjust or access resources when immediate changes are needed",
        variables: [
          "system_flexibility",
          "quick_adjustments",
          "immediate_access",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    leverage: [
      {
        template:
          "Like using APIs and cloud services to amplify your development capabilities - third-party services multiply what you can build individually",
        variables: [
          "service_leverage",
          "capability_amplification",
          "development_multiplication",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    staking: [
      {
        template:
          "Like committing computing resources to blockchain networks or distributed systems that provide rewards for network participation",
        variables: [
          "resource_commitment",
          "network_participation",
          "participation_rewards",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    yields: [
      {
        template:
          "Like well-architected systems that continue providing value with minimal maintenance - initial engineering investment pays ongoing dividends",
        variables: [
          "system_architecture",
          "ongoing_value",
          "engineering_dividends",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    impermanent_loss: [
      {
        template:
          "Like optimizing code for specific hardware that gets upgraded - your optimization was perfect for the original system but temporarily less effective on new infrastructure",
        variables: [
          "code_optimization",
          "hardware_specificity",
          "infrastructure_changes",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    slippage: [
      {
        template:
          "Like API rate limits affecting expected throughput - system performance differs from projections due to external constraints",
        variables: [
          "rate_limiting",
          "throughput_expectations",
          "external_constraints",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    smart_contracts: [
      {
        template:
          "Like automated deployment pipelines that execute predefined workflows when code changes meet specific criteria",
        variables: [
          "automated_deployment",
          "workflow_execution",
          "criteria_triggers",
        ],
        confidence: 0.95,
        crossCategorySupport: true,
      },
    ],
    clmm: [
      {
        template:
          "Like allocating computing resources efficiently by concentrating processing power where workload demand is highest",
        variables: [
          "resource_allocation",
          "processing_concentration",
          "demand_optimization",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    pools: [
      {
        template:
          "Like shared computing clusters where multiple developers contribute resources and access collective processing power",
        variables: [
          "resource_pooling",
          "collective_computing",
          "shared_infrastructure",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
  },

  management: {
    growth: [
      {
        template:
          "Like building organizational capability - each new process, team member, and system creates compounding improvements in overall performance",
        variables: [
          "organizational_growth",
          "capability_building",
          "performance_compounding",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    income: [
      {
        template:
          "Like having diversified business units - different revenue streams provide stability while growth areas add upside potential",
        variables: [
          "business_diversification",
          "revenue_stability",
          "growth_potential",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    preservation: [
      {
        template:
          "Like maintaining strong operational procedures and risk management - protecting the organization from disruptions and threats",
        variables: [
          "operational_procedures",
          "risk_management",
          "organizational_protection",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    diversification: [
      {
        template:
          "Like managing a portfolio of projects and initiatives - if one area underperforms, others can maintain overall organizational success",
        variables: [
          "project_portfolio",
          "initiative_variety",
          "performance_balance",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    risk: [
      {
        template:
          "Like strategic investments in new markets or capabilities - potential for significant returns balanced against execution uncertainties",
        variables: [
          "strategic_investment",
          "market_expansion",
          "execution_risk",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    liquidity: [
      {
        template:
          "Like maintaining operational flexibility - having resources and capabilities that can be quickly reallocated when priorities change",
        variables: [
          "operational_flexibility",
          "resource_reallocation",
          "priority_adaptation",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    leverage: [
      {
        template:
          "Like using organizational systems and delegation to multiply your individual impact across the entire operation",
        variables: [
          "system_leverage",
          "delegation_power",
          "impact_multiplication",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    staking: [
      {
        template:
          "Like committing key personnel to long-term strategic projects that restrict short-term flexibility but build future capabilities",
        variables: [
          "personnel_commitment",
          "strategic_projects",
          "capability_building",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    yields: [
      {
        template:
          "Like the ongoing returns from well-designed organizational processes - initial investment in systems continues generating efficiency gains",
        variables: [
          "process_returns",
          "system_investment",
          "efficiency_generation",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    impermanent_loss: [
      {
        template:
          "Like structuring teams for expected market conditions that shift - your organization was optimized for the original environment but temporarily less suited to new conditions",
        variables: [
          "team_structure",
          "market_optimization",
          "environmental_shifts",
        ],
        confidence: 0.75,
        crossCategorySupport: true,
      },
    ],
    slippage: [
      {
        template:
          "Like budget allocations changing between planning and execution due to shifting operational requirements",
        variables: [
          "budget_planning",
          "execution_variance",
          "requirement_changes",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    smart_contracts: [
      {
        template:
          "Like automated approval workflows that process requests based on predefined criteria without manual intervention",
        variables: [
          "automated_workflows",
          "criteria_processing",
          "approval_systems",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    clmm: [
      {
        template:
          "Like concentrating management attention and resources on the highest-impact opportunities rather than spreading effort equally across all possibilities",
        variables: [
          "attention_concentration",
          "high_impact_focus",
          "resource_optimization",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    pools: [
      {
        template:
          "Like industry consortiums where companies share resources and expertise to tackle challenges too large for individual organizations",
        variables: [
          "consortium_participation",
          "resource_sharing",
          "collective_capability",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
  },

  // Adding hobby/interest categories with appropriate templates
  sports: {
    growth: [
      {
        template:
          "Like training progression in athletics - consistent practice and gradually increasing intensity leads to exponentially better performance over time",
        variables: [
          "training_progression",
          "consistent_practice",
          "performance_improvement",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    income: [
      {
        template:
          "Like multiple income streams from athletic involvement - coaching, sponsorships, and competition winnings all contribute steady revenue",
        variables: [
          "athletic_income",
          "multiple_sources",
          "consistent_revenue",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    preservation: [
      {
        template:
          "Like injury prevention and recovery protocols - protecting your physical capabilities from damage and maintaining peak condition",
        variables: [
          "injury_prevention",
          "capability_protection",
          "condition_maintenance",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    diversification: [
      {
        template:
          "Like cross-training in multiple sports - if you can't compete in one due to injury or conditions, you have other athletic outlets",
        variables: ["cross_training", "sport_variety", "alternative_outlets"],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    risk: [
      {
        template:
          "Like attempting advanced techniques or entering higher-level competitions - greater challenges offer bigger rewards but higher chance of setbacks",
        variables: [
          "advanced_techniques",
          "higher_competition",
          "reward_risk_balance",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    liquidity: [
      {
        template:
          "Like having both endurance base and sprint capabilities - you can quickly access high-intensity performance when needed",
        variables: [
          "performance_flexibility",
          "quick_access",
          "intensity_options",
        ],
        confidence: 0.75,
        crossCategorySupport: false,
      },
    ],
    leverage: [
      {
        template:
          "Like using proper equipment and technique to amplify your natural athletic ability - the right gear and form multiply your performance",
        variables: [
          "equipment_advantage",
          "technique_leverage",
          "performance_multiplication",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    staking: [
      {
        template:
          "Like committing to intensive training camps that restrict other activities but significantly improve competitive performance",
        variables: [
          "training_commitment",
          "activity_restriction",
          "performance_gains",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    yields: [
      {
        template:
          "Like the ongoing benefits from maintaining fitness - initial training investment continues providing health and performance returns",
        variables: [
          "fitness_maintenance",
          "ongoing_benefits",
          "health_returns",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    impermanent_loss: [
      {
        template:
          "Like specializing in indoor sports when outdoor conditions become ideal - you're not losing fitness, but timing makes outdoor activities temporarily more rewarding",
        variables: [
          "specialization_timing",
          "condition_optimization",
          "activity_rewards",
        ],
        confidence: 0.7,
        crossCategorySupport: false,
      },
    ],
    slippage: [
      {
        template:
          "Like race conditions changing between training and competition - your preparation was for different circumstances than what you actually face",
        variables: [
          "condition_changes",
          "preparation_mismatch",
          "circumstance_variance",
        ],
        confidence: 0.75,
        crossCategorySupport: true,
      },
    ],
    smart_contracts: [
      {
        template:
          "Like fitness trackers that automatically adjust training plans based on performance metrics and recovery data",
        variables: [
          "automatic_adjustments",
          "performance_tracking",
          "data_driven_plans",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    clmm: [
      {
        template:
          "Like focusing training time on your weakest skills that need the most improvement rather than practicing everything equally",
        variables: [
          "focused_training",
          "weakness_targeting",
          "improvement_concentration",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    pools: [
      {
        template:
          "Like training groups where athletes share coaches, facilities, and knowledge to collectively improve performance",
        variables: [
          "group_training",
          "shared_resources",
          "collective_improvement",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
  },

  gaming: {
    growth: [
      {
        template:
          "Like leveling up your character and skills - each game session builds experience and capabilities, creating exponentially better performance",
        variables: [
          "character_progression",
          "skill_building",
          "experience_accumulation",
        ],
        confidence: 0.9,
        crossCategorySupport: true,
      },
    ],
    income: [
      {
        template:
          "Like multiple revenue streams from gaming - streaming, competitions, coaching, and content creation all provide steady income",
        variables: ["gaming_income", "content_creation", "multiple_streams"],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    preservation: [
      {
        template:
          "Like backing up game saves and protecting your valuable in-game assets from loss or corruption",
        variables: ["save_protection", "asset_security", "loss_prevention"],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    diversification: [
      {
        template:
          "Like playing multiple game genres - if one type of game loses appeal or becomes less popular, you have skills in other areas",
        variables: [
          "genre_variety",
          "skill_diversification",
          "appeal_insurance",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    risk: [
      {
        template:
          "Like attempting difficult achievements or entering competitive tournaments - higher challenges offer greater rewards but increased chance of failure",
        variables: [
          "challenge_attempts",
          "competitive_risk",
          "achievement_difficulty",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    liquidity: [
      {
        template:
          "Like having both casual games for quick sessions and deep games for extended play - flexibility to match your available time",
        variables: ["game_flexibility", "time_matching", "session_options"],
        confidence: 0.75,
        crossCategorySupport: false,
      },
    ],
    leverage: [
      {
        template:
          "Like using advanced strategies and optimal builds to multiply your individual gaming skill and achieve better results",
        variables: [
          "strategy_leverage",
          "optimal_builds",
          "skill_multiplication",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    staking: [
      {
        template:
          "Like committing time to guild activities or team practice that restricts solo play but provides group benefits and achievements",
        variables: ["guild_commitment", "team_practice", "group_benefits"],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
    yields: [
      {
        template:
          "Like the ongoing enjoyment and social connections from gaming communities - initial time investment continues providing entertainment and friendship returns",
        variables: [
          "community_value",
          "social_connections",
          "entertainment_returns",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    impermanent_loss: [
      {
        template:
          "Like specializing in a game that receives major balance updates - your expertise was optimal for the previous version but temporarily less effective in the new meta",
        variables: ["specialization_updates", "balance_changes", "meta_shifts"],
        confidence: 0.75,
        crossCategorySupport: false,
      },
    ],
    slippage: [
      {
        template:
          "Like server lag affecting competitive performance - your inputs and reactions don't translate to expected results due to technical delays",
        variables: ["server_performance", "input_delays", "execution_variance"],
        confidence: 0.75,
        crossCategorySupport: true,
      },
    ],
    smart_contracts: [
      {
        template:
          "Like automated loot distribution systems that fairly allocate rewards based on predetermined contribution rules",
        variables: [
          "automated_distribution",
          "fair_allocation",
          "contribution_rules",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    clmm: [
      {
        template:
          "Like focusing your practice time on the game modes and strategies where you can improve most effectively rather than playing everything equally",
        variables: [
          "practice_focus",
          "improvement_efficiency",
          "strategic_concentration",
        ],
        confidence: 0.85,
        crossCategorySupport: true,
      },
    ],
    pools: [
      {
        template:
          "Like gaming clans where members share resources, strategies, and achievements to collectively succeed in competitive environments",
        variables: [
          "clan_cooperation",
          "resource_sharing",
          "collective_success",
        ],
        confidence: 0.8,
        crossCategorySupport: true,
      },
    ],
  },

  // Additional categories - empty for now
  health: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  arts: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  outdoors: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  collecting: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  learning: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  technology: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  finance: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  travel: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  food: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  },
  environment: {
    growth: [],
    income: [],
    preservation: [],
    diversification: [],
    risk: [],
    liquidity: [],
    leverage: [],
    staking: [],
    yields: [],
    impermanent_loss: [],
    slippage: [],
    smart_contracts: [],
    clmm: [],
    pools: []
  }
};

// Cross-category combination logic
interface CategoryCombination {
  primary: CategoryType;
  secondary: CategoryType;
  blendRatio: number; // 0.5 = equal blend, 0.7 = 70% primary, 30% secondary
}

/**
 * Main Analogy Engine Class
 */
export class AnalogyEngine {
  private readonly templates = ANALOGY_TEMPLATES;
  private readonly patterns = OCCUPATION_PATTERNS;

  /**
   * Generate a contextual analogy based on user profile and concept
   */
  public generateAnalogy(context: AnalogyContext): AnalogyResult {
    const categories = this.detectAllCategories(context);

    if (categories.length === 0) {
      return this.generateFallbackAnalogy(context);
    }

    // Try single category first
    if (categories.length === 1 && categories[0]) {
      return this.generateSingleCategoryAnalogy(context, categories[0]);
    }

    // Try cross-category combination
    return this.generateCrossCategoryAnalogy(context, categories);
  }

  /**
   * Detect categories from occupation, hobbies, and interests
   */
  public detectCategories(input: string): CategoryType[] {
    const normalizedInput = input.toLowerCase().trim();
    const detectedCategories: CategoryType[] = [];

    // Check each category pattern
    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (
          normalizedInput.includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(normalizedInput)
        ) {
          detectedCategories.push(category as CategoryType);
          break; // Found match for this category, move to next
        }
      }
    }

    return detectedCategories;
  }

  /**
   * Combine multiple analogies into a cohesive explanation
   */
  public combineAnalogies(analogies: string[]): string {
    if (analogies.length === 0) return "";
    if (analogies.length === 1 && analogies[0]) return analogies[0];

    // For 2 analogies, blend them
    if (analogies.length === 2 && analogies[0] && analogies[1]) {
      return `Think of it like ${analogies[0].toLowerCase()}. Or alternatively, ${analogies[1].toLowerCase()}`;
    }

    // For more analogies, pick the best and provide alternatives
    const primary = analogies[0];
    const alternatives = analogies.slice(1, 3); // Take up to 2 alternatives

    return `${primary} You could also think of it as ${alternatives.join(" or ")}.`;
  }

  /**
   * Score analogy quality based on context match and template confidence
   */
  private scoreAnalogy(
    template: AnalogyTemplate,
    categories: CategoryType[],
    context: AnalogyContext,
  ): number {
    let score = template.confidence;

    // Boost score for cross-category support when we have multiple categories
    if (categories.length > 1 && template.crossCategorySupport) {
      score += 0.1;
    }

    // Boost score for experience level match
    if (context.experienceLevel === "beginner" && template.confidence > 0.8) {
      score += 0.05; // Prefer high-confidence templates for beginners
    }

    // Slight penalty for overly complex templates with beginners
    if (
      context.experienceLevel === "beginner" &&
      template.variables.length > 3
    ) {
      score -= 0.05;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Detect all categories from context
   */
  private detectAllCategories(context: AnalogyContext): CategoryType[] {
    const allCategories = new Set<CategoryType>();

    // Detect from occupation
    if (context.occupation) {
      const occupationCategories = this.detectCategories(context.occupation);
      occupationCategories.forEach((cat) => allCategories.add(cat));
    }

    // Detect from hobbies
    if (context.hobbies) {
      context.hobbies.forEach((hobby) => {
        const hobbyCategories = this.detectCategories(hobby);
        hobbyCategories.forEach((cat) => allCategories.add(cat));
      });
    }

    // Detect from interests
    if (context.interests) {
      context.interests.forEach((interest) => {
        const interestCategories = this.detectCategories(interest);
        interestCategories.forEach((cat) => allCategories.add(cat));
      });
    }

    return Array.from(allCategories);
  }

  /**
   * Generate analogy for single category
   */
  private generateSingleCategoryAnalogy(
    context: AnalogyContext,
    category: CategoryType,
  ): AnalogyResult {
    const categoryTemplates = this.templates[category];
    if (!categoryTemplates || !categoryTemplates[context.concept]) {
      return this.generateFallbackAnalogy(context);
    }

    const conceptTemplates = categoryTemplates[context.concept];
    if (conceptTemplates.length === 0) {
      return this.generateFallbackAnalogy(context);
    }

    // Score and select best template
    const scoredTemplates = conceptTemplates
      .map((template) => ({
        template,
        score: this.scoreAnalogy(template, [category], context),
      }))
      .sort((a, b) => b.score - a.score);

    const best = scoredTemplates[0];
    if (!best) {
      return {
        primary: "Think of this as a basic investment principle",
        alternative: undefined,
        confidence: 0.3,
        categories: [category],
        templateUsed: `${category}-${context.concept}`,
        crossCategoryMatch: false,
      };
    }
    
    const alternative =
      scoredTemplates.length > 1 ? scoredTemplates[1] : undefined;

    return {
      primary: best.template.template,
      alternative: alternative?.template.template,
      confidence: best.score,
      categories: [category],
      templateUsed: `${category}-${context.concept}`,
      crossCategoryMatch: false,
    };
  }

  /**
   * Generate cross-category analogy
   */
  private generateCrossCategoryAnalogy(
    context: AnalogyContext,
    categories: CategoryType[],
  ): AnalogyResult {
    // Try to find templates that support cross-category usage
    const crossCategoryResults = categories
      .map((category) => this.generateSingleCategoryAnalogy(context, category))
      .filter((result) => result.confidence > 0.7); // Only high-confidence analogies

    if (crossCategoryResults.length === 0) {
      return this.generateFallbackAnalogy(context);
    }

    // Select the best primary analogy
    const primary = crossCategoryResults.reduce((best, current) =>
      current.confidence > best.confidence ? current : best,
    );

    // Create alternative from other categories if available
    const alternatives = crossCategoryResults
      .filter((result) => result !== primary)
      .map((result) => result.primary)
      .slice(0, 2);

    const combinedAlternative =
      alternatives.length > 0 ? this.combineAnalogies(alternatives) : undefined;

    return {
      primary: primary.primary,
      alternative: combinedAlternative,
      confidence: Math.min(primary.confidence + 0.1, 1.0), // Slight boost for cross-category
      categories: categories,
      templateUsed: `cross-category-${categories.join("-")}`,
      crossCategoryMatch: true,
    };
  }

  /**
   * Generate fallback analogy for unknown contexts
   */
  private generateFallbackAnalogy(context: AnalogyContext): AnalogyResult {
    const fallbackTemplates: Record<ConceptType, string> = {
      growth:
        "Like planting a garden - initial effort and patience lead to increasingly abundant harvests over time as your investment compounds.",
      income:
        "Like multiple streams flowing into a river - different sources provide steady, reliable flow that continues regardless of individual variations.",
      preservation:
        "Like a strong foundation protecting a valuable building - maintaining stability and security for what matters most.",
      diversification:
        "Like not putting all your eggs in one basket - spreading resources across different areas reduces the impact of any single setback.",
      risk: "Like choosing between familiar paths and unexplored territory - new routes might lead to better destinations, but come with uncertainty.",
      liquidity:
        "Like having both savings and checking accounts - some money is readily available when you need it immediately.",
      leverage:
        "Like using tools to multiply your individual capabilities - the right resources amplify what you can accomplish alone.",
      staking:
        "Like committing resources to a long-term project that restricts short-term flexibility but builds future value.",
      yields:
        "Like the ongoing returns from a well-tended investment - initial work continues providing benefits over time.",
      impermanent_loss:
        "Like optimizing for specific conditions that change - your approach was perfect for the original situation but temporarily less effective in new circumstances.",
      slippage:
        "Like prices changing between decision and execution - the final outcome differs from initial expectations due to timing.",
      smart_contracts:
        "Like automated systems that execute predetermined actions when specific conditions are met - no manual oversight needed.",
      clmm: "Like focusing resources where they're most effective rather than spreading them equally across all possibilities.",
      pools:
        "Like community resources where everyone contributes and shares in the collective benefits.",
    };

    return {
      primary:
        fallbackTemplates[context.concept] ||
        `A ${context.concept} strategy that balances opportunity with your comfort level.`,
      confidence: 0.6,
      categories: ["general"],
      templateUsed: "fallback-general",
      crossCategoryMatch: false,
    };
  }
}

// Utility functions for integration
export const createAnalogyEngine = (): AnalogyEngine => new AnalogyEngine();

export const generateQuickAnalogy = (
  concept: ConceptType,
  occupation?: string,
  hobbies?: string[],
): string => {
  const engine = createAnalogyEngine();
  const context: AnalogyContext = {
    concept,
    occupation,
    hobbies,
  };

  const result = engine.generateAnalogy(context);
  return result.primary;
};

// Enhanced analogy generation with context awareness
export const generateContextualAnalogy = (
  concept: ConceptType,
  userProfile: {
    occupation?: string;
    hobbies?: string[];
    interests?: string[];
    riskTolerance?: "conservative" | "moderate" | "aggressive";
    experienceLevel?: "beginner" | "intermediate" | "advanced";
  },
): AnalogyResult => {
  const engine = createAnalogyEngine();
  const context: AnalogyContext = {
    concept,
    ...userProfile,
  };

  return engine.generateAnalogy(context);
};

// Batch analogy generation for multiple concepts
export const generateAnalogySet = (
  concepts: ConceptType[],
  context: Omit<AnalogyContext, "concept">,
): Record<ConceptType, AnalogyResult> => {
  const engine = createAnalogyEngine();
  const results: Record<string, AnalogyResult> = {};

  concepts.forEach((concept) => {
    results[concept] = engine.generateAnalogy({ ...context, concept });
  });

  return results as Record<ConceptType, AnalogyResult>;
};

// Default export
export default AnalogyEngine;
