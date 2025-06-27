import { ConversationStep } from "../../providers/AIAssistantProvider";

export interface UserIntent {
  action:
    | "connect_wallet"
    | "select_option"
    | "input_value"
    | "continue"
    | "skip"
    | "help"
    | "unclear";
  confidence: number;
  extractedValue?: string | number;
  originalMessage: string;
}

// Patterns for detecting user intents
const INTENT_PATTERNS = {
  connect_wallet: [
    /^(ok|okay|yes|sure|alright|yeah|yep|yup)?\s*(connect|link|sync|add)\s*(me|my|the)?\s*wallet?/i,
    /^connect\s*(me|my)?\s*(up|wallet)?/i,
    /^(let'?s|lets)\s*(do|go|connect)\s*(it|this)?/i,
    /^(yes|sure|ok|okay)\s*(please|thanks)?$/i,
    /^go\s*ahead/i,
    /^do\s*it/i,
    /^sounds\s*good/i,
    /^i'?m\s*ready/i,
    /^(please\s*)?proceed/i,
  ],
  strategy_choice: {
    custom: /\b(custom|scratch|build|create|1)\b/i,
    template: /\b(template|proven|ready|existing|2)\b/i,
    explore: /\b(explore|browse|look|see|protocols|3)\b/i,
  },
  template_selection: {
    conservative: /\b(conservative|safe|stable|low risk|yield hunter)\b/i,
    balanced: /\b(balanced|moderate|middle|diversified)\b/i,
    aggressive: /\b(aggressive|high|maximum|farmer)\b/i,
  },
  occupation_confirm: [
    /^(yes|yeah|yep|yup|sure|ok|okay)?\s*(that|this)?\s*(works|sounds\s*good|perfect|great)/i,
    /^(perfect|excellent|great|good)$/i,
    /^continue$/i,
    /^let'?s\s*(go|continue|proceed)/i,
  ],
  occupation_change: [
    /^(no|nope|change|adjust|different|switch)/i,
    /^(i\s*want|let\s*me|can\s*i)\s*(to\s*)?(change|adjust|switch)/i,
    /^actually/i,
  ],
  select_option: {
    // Investment goals
    growth: /\b(growth|grow|increase|maximize|appreciation)\b/i,
    income: /\b(income|yield|passive|regular|steady|cash\s*flow)\b/i,
    preservation: /\b(preserv|protect|safe|stable|security)\b/i,

    // Risk tolerance
    conservative: /\b(conservative|low\s*risk|safe|careful|cautious)\b/i,
    moderate: /\b(moderate|medium|balanced|middle)\b/i,
    aggressive: /\b(aggressive|high\s*risk|risky|bold)\b/i,

    // Occupation
    chef: /\b(chef|cook|culinary|restaurant|kitchen)\b/i,
    truck_driver: /\b(truck|driver|trucker|haul|logistics|transport)\b/i,
    retail_manager: /\b(retail|store|manager|shop|sales)\b/i,

    // Experience
    beginner: /\b(begin|new|novice|first\s*time|no\s*experience)\b/i,
    intermediate: /\b(intermediate|some\s*experience|moderate|medium)\b/i,
    advanced: /\b(advanced|expert|experienced|pro)\b/i,
  },
  input_value: {
    timeline: /\b(\d+)\s*(year|yr|month|mo)s?\b/i,
    amount:
      /\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollar|usd|buck|per\s*month|monthly)?/i,
  },
  continue: [
    /^(continue|next|proceed|go\s*on|keep\s*going)$/i,
    /^(that'?s?\s*)?(correct|right|good|fine)$/i,
    /^confirmed?$/i,
  ],
  skip: [/^(skip|pass|no\s*thanks|not\s*now|later)$/i],
  help: [
    /^(help|what|how|explain|tell\s*me\s*more|i\s*don'?t\s*understand)$/i,
    /\?$/,
  ],
};

export const detectUserIntent = (
  message: string,
  currentStep: ConversationStep,
): UserIntent => {
  // const normalizedMessage = message.trim().toLowerCase(); // Reserved for future use

  // Check for strategy choice intent
  if (currentStep === "strategy_choice") {
    for (const [choice, pattern] of Object.entries(
      INTENT_PATTERNS.strategy_choice,
    )) {
      if (pattern.test(message)) {
        return {
          action: "select_option",
          confidence: 0.9,
          extractedValue: choice,
          originalMessage: message,
        };
      }
    }
  }

  // Check for template selection intent
  if (currentStep === "template_selection") {
    for (const [template, pattern] of Object.entries(
      INTENT_PATTERNS.template_selection,
    )) {
      if (pattern.test(message)) {
        return {
          action: "select_option",
          confidence: 0.9,
          extractedValue: template,
          originalMessage: message,
        };
      }
    }
  }

  // Check for wallet connection intent
  if (currentStep === "wallet_prompt") {
    for (const pattern of INTENT_PATTERNS.connect_wallet) {
      if (pattern.test(message)) {
        return {
          action: "connect_wallet",
          confidence: 0.9,
          originalMessage: message,
        };
      }
    }
  }

  // Check for occupation explanation responses
  if (currentStep === "occupation_explanation") {
    // Check for confirmation
    for (const pattern of INTENT_PATTERNS.occupation_confirm) {
      if (pattern.test(message)) {
        return {
          action: "continue",
          confidence: 0.9,
          originalMessage: message,
        };
      }
    }

    // Check for change request
    for (const pattern of INTENT_PATTERNS.occupation_change) {
      if (pattern.test(message)) {
        return {
          action: "select_option",
          confidence: 0.85,
          extractedValue: "change",
          originalMessage: message,
        };
      }
    }

    // Check if they're selecting a different occupation directly
    const occupations = ["chef", "truck_driver", "retail_manager"];
    for (const occ of occupations) {
      const patterns =
        INTENT_PATTERNS.select_option[
          occ as keyof typeof INTENT_PATTERNS.select_option
        ];
      if (patterns && patterns.test(message)) {
        return {
          action: "select_option",
          confidence: 0.85,
          extractedValue: occ,
          originalMessage: message,
        };
      }
    }
  }

  // Check for option selection based on current step
  if (
    [
      "investment_goals",
      "risk_tolerance",
      "occupation",
      "experience_level",
    ].includes(currentStep)
  ) {
    const optionMap = {
      investment_goals: ["growth", "income", "preservation"],
      risk_tolerance: ["conservative", "moderate", "aggressive"],
      occupation: ["chef", "truck_driver", "retail_manager"],
      experience_level: ["beginner", "intermediate", "advanced"],
    };

    const validOptions = optionMap[currentStep as keyof typeof optionMap] || [];

    for (const option of validOptions) {
      const patterns =
        INTENT_PATTERNS.select_option[
          option as keyof typeof INTENT_PATTERNS.select_option
        ];
      if (patterns && patterns.test(message)) {
        return {
          action: "select_option",
          confidence: 0.85,
          extractedValue: option,
          originalMessage: message,
        };
      }
    }
  }

  // Check for numeric input
  if (currentStep === "timeline") {
    const match = message.match(INTENT_PATTERNS.input_value.timeline);
    if (match) {
      const value = parseInt(match[1]!);
      const unit = match[2]?.toLowerCase();
      const years = unit?.startsWith("mo") ? Math.round(value / 12) : value;

      return {
        action: "input_value",
        confidence: 0.9,
        extractedValue: years,
        originalMessage: message,
      };
    }
  }

  if (currentStep === "amount") {
    const match = message.match(INTENT_PATTERNS.input_value.amount);
    if (match) {
      const value = parseFloat(match[1]!.replace(/,/g, ""));
      return {
        action: "input_value",
        confidence: 0.9,
        extractedValue: value,
        originalMessage: message,
      };
    }
  }

  // Check for continue intent
  for (const pattern of INTENT_PATTERNS.continue) {
    if (pattern.test(message)) {
      return {
        action: "continue",
        confidence: 0.7,
        originalMessage: message,
      };
    }
  }

  // Check for help intent
  for (const pattern of INTENT_PATTERNS.help) {
    if (pattern.test(message)) {
      return {
        action: "help",
        confidence: 0.8,
        originalMessage: message,
      };
    }
  }

  // Default to unclear
  return {
    action: "unclear",
    confidence: 0.3,
    originalMessage: message,
  };
};

export const generateClarificationMessage = (
  currentStep: ConversationStep,
): string => {
  const clarifications: Record<string, string> = {
    strategy_choice:
      "Would you like to: 1) Build a custom strategy, 2) Use a template, or 3) Explore protocols? Just type 1, 2, or 3.",
    template_selection:
      "Which template would you prefer? Conservative (8-12% APY), Balanced (15-25% APY), or Aggressive (30-80% APY)?",
    wallet_prompt:
      "I didn't quite catch that. Would you like me to connect your wallet? You can say 'yes', 'connect me', or 'ok'.",
    investment_goals:
      "Please choose your primary investment goal: growth (maximize returns), income (steady cash flow), or preservation (protect capital).",
    risk_tolerance:
      "What's your risk comfort level? You can say conservative (low risk), moderate (balanced), or aggressive (high risk).",
    occupation:
      "Which occupation best describes you? Chef, truck driver, or retail store manager?",
    occupation_explanation:
      "Does this approach work for you? You can say 'yes', 'that works', or 'change' if you'd like to select a different occupation.",
    timeline:
      "How many years do you plan to invest? Just tell me a number like '5 years' or '10'.",
    amount:
      "How much can you invest monthly? You can say something like '$1000' or '500 dollars'.",
    protocol_selection:
      "Would you like to proceed with the recommended protocols or explore other options?",
    strategy_builder:
      "Shall we proceed with this allocation? You can say 'yes' or suggest changes.",
    leverage_optimization:
      "Would you like to add leverage to boost your yields? You can say 'yes' or 'no leverage'.",
    experience_level:
      "What's your DeFi experience? Beginner, intermediate, or advanced?",
  };

  return (
    clarifications[currentStep] ||
    "I'm not sure what you mean. Could you please rephrase that?"
  );
};

export const generateConfirmationMessage = (
  action: string,
  value?: string | number,
): string => {
  const confirmations: Record<string, string> = {
    connect_wallet: "Great! I'm connecting your wallet now...",
    growth:
      "Excellent choice! Focusing on capital growth. Let me note that down.",
    income:
      "Perfect! Regular income generation it is. I've recorded your preference.",
    preservation: "Smart choice! Capital preservation is important. Got it.",
    conservative: "Conservative approach - safety first! I understand.",
    moderate: "Balanced risk tolerance - a wise middle ground. Noted!",
    aggressive: "High risk, high reward strategy. I like your confidence!",
    chef: "A chef! I'll use culinary analogies to explain investment strategies.",
    truck_driver:
      "Truck driver - I'll use logistics and route analogies for your investments.",
    retail_manager:
      "Retail manager - I'll explain strategies using inventory and sales concepts.",
    beginner: "No worries! I'll keep explanations simple and clear.",
    intermediate: "Great! You have some experience to build on.",
    advanced: "Excellent! We can dive into more sophisticated strategies.",
  };

  if (typeof value === "number") {
    if (action === "timeline") {
      return `Perfect! Planning for ${value} year${value > 1 ? "s" : ""}. That's a good investment horizon.`;
    }
    if (action === "amount") {
      return `Great! $${value.toLocaleString()} per month is a solid commitment. Let me calculate the best strategies for you.`;
    }
  }

  return (
    confirmations[value as string] || "Got it! Let me process that for you."
  );
};
