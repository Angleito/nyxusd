import { ConversationStep } from "../../providers/AIAssistantProvider";

export interface ConversationTransition {
  from: ConversationStep;
  to: ConversationStep;
  condition?: (context: any) => boolean;
  description: string;
}

export const CONVERSATION_FLOW: ConversationTransition[] = [
  {
    from: "initial",
    to: "wallet_prompt",
    description: "Start wallet connection flow",
  },
  {
    from: "wallet_prompt",
    to: "wallet_scanning",
    condition: (ctx) => ctx.walletConnected,
    description: "User connected wallet",
  },
  {
    from: "wallet_scanning",
    to: "wallet_analyzed",
    description: "Wallet scan complete",
  },
  {
    from: "wallet_analyzed",
    to: "investment_goals",
    description: "Proceed to goal setting",
  },
  {
    from: "investment_goals",
    to: "occupation",
    description: "Ask about occupation for personalization",
  },
  {
    from: "occupation",
    to: "occupation_explanation",
    description: "Explain using occupation analogies",
  },
  {
    from: "occupation_explanation",
    to: "risk_tolerance",
    description: "Assess risk comfort level",
  },
  {
    from: "risk_tolerance",
    to: "timeline",
    description: "Understand investment horizon",
  },
  {
    from: "timeline",
    to: "amount",
    description: "Ask about investment capacity",
  },
  {
    from: "amount",
    to: "generating_recommendations",
    description: "Process user inputs",
  },
  {
    from: "generating_recommendations",
    to: "recommendations",
    description: "Show personalized strategies",
  },
  {
    from: "recommendations",
    to: "complete",
    description: "Conversation complete",
  },
];

export function getNextStep(
  currentStep: ConversationStep,
  context?: any,
): ConversationStep | null {
  const transitions = CONVERSATION_FLOW.filter((t) => t.from === currentStep);

  for (const transition of transitions) {
    if (!transition.condition || transition.condition(context)) {
      return transition.to;
    }
  }

  return null;
}

export function canTransitionTo(
  from: ConversationStep,
  to: ConversationStep,
  context?: any,
): boolean {
  const transition = CONVERSATION_FLOW.find(
    (t) => t.from === from && t.to === to,
  );

  if (!transition) return false;

  return !transition.condition || transition.condition(context);
}

export const STEP_TIMEOUTS: Partial<Record<ConversationStep, number>> = {
  wallet_scanning: 3000,
  generating_recommendations: 4000,
};

export function getStepTimeout(step: ConversationStep): number | undefined {
  return STEP_TIMEOUTS[step];
}
