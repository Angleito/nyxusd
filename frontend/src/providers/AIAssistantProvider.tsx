import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { useAIService } from "../hooks/useAIService";

export type ConversationStep =
  | "initial"
  | "chat"
  | "strategy_choice"
  | "template_selection"
  | "wallet_prompt"
  | "wallet_scanning"
  | "wallet_analyzed"
  | "risk_assessment"
  | "investment_goals"
  | "occupation"
  | "occupation_explanation"
  | "risk_tolerance"
  | "timeline"
  | "amount"
  | "experience_level"
  | "protocol_selection"
  | "strategy_builder"
  | "leverage_optimization"
  | "generating_recommendations"
  | "recommendations"
  | "complete";

export interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
  typing?: boolean;
}

export interface WalletData {
  address?: string;
  assets: {
    symbol: string;
    balance: string;
    valueUSD: number;
  }[];
  totalValueUSD: number;
}

export interface UserProfile {
  // Existing fields (maintained for backward compatibility)
  investmentGoal?: "growth" | "income" | "preservation";
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  timeline?: string;
  monthlyAmount?: number;
  occupation?: string;
  hobbies?: string[];

  // NEW PERSONALIZATION DIMENSIONS:

  // Professional Dimension
  industry?: string;
  workStyle?: "analytical" | "creative" | "collaborative" | "independent";
  careerStage?: "entry" | "mid" | "senior" | "executive" | "retired";

  // Personal Dimension
  interests?: string[];
  lifestyle?: "busy" | "flexible" | "structured" | "spontaneous";
  values?: Array<
    "stability" | "growth" | "innovation" | "sustainability" | "security"
  >;
  personalGoals?: string[];

  // Financial Dimension
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  currentInvestments?: Array<
    "stocks" | "bonds" | "crypto" | "real_estate" | "commodities"
  >;
  financialGoals?: Array<
    "retirement" | "house" | "education" | "emergency" | "wealth_building"
  >;

  // Learning Dimension
  learningStyle?: "visual" | "auditory" | "kinesthetic" | "reading";
  communicationPreference?: "concise" | "detailed" | "analogies" | "examples";

  // Optional Demographic (privacy-respectful)
  ageRange?: "18-25" | "26-35" | "36-45" | "46-55" | "56-65" | "65+";
  familyStatus?: "single" | "married" | "family" | "prefer_not_to_say";
}

// Profile analysis and helper interfaces
export interface ProfileCompleteness {
  overall: number; // 0-100%
  professional: number;
  personal: number;
  financial: number;
  demographic: number;
  learning: number;
  missingFields: string[];
  suggestions: string[];
}

export interface PersonalizationCapabilities {
  analogyGeneration: boolean;
  experienceLevelAdjustment: boolean;
  lifestyleAdaptation: boolean;
  communicationCustomization: boolean;
  goalAlignment: boolean;
}

// Enhanced AI context that uses new profile dimensions
export interface EnhancedAIContext {
  userProfile: UserProfile;
  personalizationLevel?: "basic" | "enhanced" | "advanced";
  profileCompleteness?: ProfileCompleteness;
  personalizationCapabilities?: PersonalizationCapabilities;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  allocation: number;
  expectedReturn: string;
  riskLevel: "low" | "medium" | "high";
  explanation?: string;
}

interface AIAssistantState {
  currentStep: ConversationStep;
  messages: Message[];
  isTyping: boolean;
  walletData: WalletData | null;
  userProfile: UserProfile;
  recommendations: Recommendation[];
  profileCompleteness?: ProfileCompleteness;
  personalizationCapabilities?: PersonalizationCapabilities;
  personalizationLevel?: "basic" | "enhanced" | "advanced";
}

type AIAssistantAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | {
      type: "UPDATE_MESSAGE";
      payload: { id: string; updates: Partial<Message> };
    }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_STEP"; payload: ConversationStep }
  | { type: "SET_WALLET_DATA"; payload: WalletData }
  | { type: "UPDATE_USER_PROFILE"; payload: Partial<UserProfile> }
  | { type: "SET_RECOMMENDATIONS"; payload: Recommendation[] }
  | { type: "ANALYZE_PROFILE_COMPLETENESS" }
  | { type: "UPDATE_PERSONALIZATION_CAPABILITIES" }
  | {
      type: "SET_PERSONALIZATION_LEVEL";
      payload: "basic" | "enhanced" | "advanced";
    }
  | { type: "RESET" };

// Profile analysis and validation functions
export function analyzeProfileCompleteness(
  profile: UserProfile,
): ProfileCompleteness {
  const professionalFields = [
    "occupation",
    "industry",
    "workStyle",
    "careerStage",
  ];
  const personalFields = [
    "hobbies",
    "interests",
    "lifestyle",
    "values",
    "personalGoals",
  ];
  const financialFields = [
    "investmentGoal",
    "riskTolerance",
    "timeline",
    "monthlyAmount",
    "experienceLevel",
    "currentInvestments",
    "financialGoals",
  ];
  const demographicFields = ["ageRange", "familyStatus"];
  const learningFields = ["learningStyle", "communicationPreference"];

  const allFields = [
    ...professionalFields,
    ...personalFields,
    ...financialFields,
    ...demographicFields,
    ...learningFields,
  ];

  const calculateCompleteness = (fields: string[]) => {
    const completed = fields.filter((field) => {
      const value = profile[field as keyof UserProfile];
      return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0)
      );
    }).length;
    return Math.round((completed / fields.length) * 100);
  };

  const professional = calculateCompleteness(professionalFields);
  const personal = calculateCompleteness(personalFields);
  const financial = calculateCompleteness(financialFields);
  const demographic = calculateCompleteness(demographicFields);
  const learning = calculateCompleteness(learningFields);
  const overall = calculateCompleteness(allFields);

  const missingFields = allFields.filter((field) => {
    const value = profile[field as keyof UserProfile];
    return (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    );
  });

  const suggestions = generateProfileSuggestions(profile, missingFields);

  return {
    overall,
    professional,
    personal,
    financial,
    demographic,
    learning,
    missingFields,
    suggestions,
  };
}

export function getPersonalizationCapabilities(
  profile: UserProfile,
): PersonalizationCapabilities {
  return {
    analogyGeneration: !!(
      profile.occupation ||
      profile.industry ||
      profile.interests?.length
    ),
    experienceLevelAdjustment: !!profile.experienceLevel,
    lifestyleAdaptation: !!(profile.lifestyle || profile.workStyle),
    communicationCustomization: !!profile.communicationPreference,
    goalAlignment: !!(
      profile.investmentGoal ||
      profile.financialGoals?.length ||
      profile.personalGoals?.length
    ),
  };
}

export function suggestProfileImprovements(profile: UserProfile): string[] {
  const suggestions: string[] = [];

  if (!profile.experienceLevel) {
    suggestions.push(
      "Add your investment experience level for better recommendations",
    );
  }

  if (!profile.communicationPreference) {
    suggestions.push(
      "Set your communication preference for personalized explanations",
    );
  }

  if (!profile.learningStyle) {
    suggestions.push(
      "Share your learning style for optimized content delivery",
    );
  }

  if (!profile.values?.length) {
    suggestions.push(
      "Define your core values to align recommendations with your principles",
    );
  }

  if (!profile.financialGoals?.length) {
    suggestions.push("Specify your financial goals for targeted advice");
  }

  return suggestions;
}

export function isProfileSufficientFor(
  profile: UserProfile,
  feature: string,
): boolean {
  switch (feature) {
    case "basic_advice":
      return !!(profile.investmentGoal && profile.riskTolerance);
    case "personalized_analogies":
      return !!(profile.occupation || profile.interests?.length);
    case "advanced_recommendations":
      return !!(profile.experienceLevel && profile.financialGoals?.length);
    case "lifestyle_adaptation":
      return !!(profile.lifestyle && profile.workStyle);
    default:
      return false;
  }
}

export function buildEnhancedProfile(
  basicProfile: Partial<UserProfile>,
): UserProfile {
  // Merge basic profile with enhanced defaults
  return {
    ...basicProfile,
    // Set intelligent defaults based on existing data
    experienceLevel: basicProfile.experienceLevel || "beginner",
    communicationPreference: basicProfile.communicationPreference || "detailed",
    learningStyle: basicProfile.learningStyle || "reading",
    values: basicProfile.values || ["security", "growth"],
  };
}

export function validateProfileField(
  field: keyof UserProfile,
  value: any,
): boolean {
  switch (field) {
    case "investmentGoal":
      return ["growth", "income", "preservation"].includes(value);
    case "riskTolerance":
      return ["conservative", "moderate", "aggressive"].includes(value);
    case "workStyle":
      return [
        "analytical",
        "creative",
        "collaborative",
        "independent",
      ].includes(value);
    case "lifestyle":
      return ["busy", "flexible", "structured", "spontaneous"].includes(value);
    case "experienceLevel":
      return ["beginner", "intermediate", "advanced"].includes(value);
    case "learningStyle":
      return ["visual", "auditory", "kinesthetic", "reading"].includes(value);
    case "communicationPreference":
      return ["concise", "detailed", "analogies", "examples"].includes(value);
    case "ageRange":
      return ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"].includes(
        value,
      );
    case "familyStatus":
      return ["single", "married", "family", "prefer_not_to_say"].includes(
        value,
      );
    case "monthlyAmount":
      return typeof value === "number" && value >= 0;
    case "hobbies":
    case "interests":
    case "personalGoals":
      return Array.isArray(value);
    case "values":
      return (
        Array.isArray(value) &&
        value.every((v) =>
          [
            "stability",
            "growth",
            "innovation",
            "sustainability",
            "security",
          ].includes(v),
        )
      );
    case "currentInvestments":
      return (
        Array.isArray(value) &&
        value.every((v) =>
          ["stocks", "bonds", "crypto", "real_estate", "commodities"].includes(
            v,
          ),
        )
      );
    case "financialGoals":
      return (
        Array.isArray(value) &&
        value.every((v) =>
          [
            "retirement",
            "house",
            "education",
            "emergency",
            "wealth_building",
          ].includes(v),
        )
      );
    default:
      return typeof value === "string" && value.length > 0;
  }
}

export function getProfileDimensions(profile: UserProfile): string[] {
  const dimensions: string[] = [];

  const professionalFields = [
    "occupation",
    "industry",
    "workStyle",
    "careerStage",
  ];
  const personalFields = [
    "hobbies",
    "interests",
    "lifestyle",
    "values",
    "personalGoals",
  ];
  const financialFields = [
    "investmentGoal",
    "riskTolerance",
    "experienceLevel",
    "currentInvestments",
    "financialGoals",
  ];
  const learningFields = ["learningStyle", "communicationPreference"];
  const demographicFields = ["ageRange", "familyStatus"];

  if (professionalFields.some((field) => profile[field as keyof UserProfile])) {
    dimensions.push("professional");
  }
  if (personalFields.some((field) => profile[field as keyof UserProfile])) {
    dimensions.push("personal");
  }
  if (financialFields.some((field) => profile[field as keyof UserProfile])) {
    dimensions.push("financial");
  }
  if (learningFields.some((field) => profile[field as keyof UserProfile])) {
    dimensions.push("learning");
  }
  if (demographicFields.some((field) => profile[field as keyof UserProfile])) {
    dimensions.push("demographic");
  }

  return dimensions;
}

function generateProfileSuggestions(
  profile: UserProfile,
  missingFields: string[],
): string[] {
  const suggestions: string[] = [];

  // High-impact suggestions based on missing fields
  if (missingFields.includes("experienceLevel")) {
    suggestions.push(
      "Adding your investment experience level will help us tailor advice to your knowledge level",
    );
  }

  if (missingFields.includes("communicationPreference")) {
    suggestions.push(
      "Setting communication preferences will help us explain concepts in your preferred style",
    );
  }

  if (missingFields.includes("financialGoals")) {
    suggestions.push(
      "Defining specific financial goals will enable more targeted recommendations",
    );
  }

  if (missingFields.includes("values")) {
    suggestions.push(
      "Sharing your core values will help align recommendations with your principles",
    );
  }

  if (missingFields.includes("lifestyle")) {
    suggestions.push(
      "Describing your lifestyle will help us recommend strategies that fit your schedule",
    );
  }

  // Strategic suggestions based on field completeness counts
  const professionalFields = [
    "occupation",
    "industry",
    "workStyle",
    "careerStage",
  ];
  const personalFields = [
    "hobbies",
    "interests",
    "lifestyle",
    "values",
    "personalGoals",
  ];

  const professionalCount = professionalFields.filter((field) => {
    const value = profile[field as keyof UserProfile];
    return (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
    );
  }).length;

  const personalCount = personalFields.filter((field) => {
    const value = profile[field as keyof UserProfile];
    return (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
    );
  }).length;

  if (professionalCount < professionalFields.length / 2) {
    suggestions.push(
      "Complete your professional profile for industry-specific insights",
    );
  }

  if (personalCount < personalFields.length / 2) {
    suggestions.push(
      "Add personal interests and values for more personalized advice",
    );
  }

  return suggestions.slice(0, 3); // Limit to top 3 suggestions
}

const initialState: AIAssistantState = {
  currentStep: "initial",
  messages: [],
  isTyping: false,
  walletData: null,
  userProfile: {},
  recommendations: [],
  profileCompleteness: undefined,
  personalizationCapabilities: undefined,
  personalizationLevel: "basic",
};

function aiAssistantReducer(
  state: AIAssistantState,
  action: AIAssistantAction,
): AIAssistantState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg,
        ),
      };

    case "SET_TYPING":
      return {
        ...state,
        isTyping: action.payload,
      };

    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "SET_WALLET_DATA":
      return {
        ...state,
        walletData: action.payload,
      };

    case "UPDATE_USER_PROFILE":
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          ...action.payload,
        },
      };

    case "SET_RECOMMENDATIONS":
      return {
        ...state,
        recommendations: action.payload,
      };

    case "ANALYZE_PROFILE_COMPLETENESS":
      return {
        ...state,
        profileCompleteness: analyzeProfileCompleteness(state.userProfile),
      };

    case "UPDATE_PERSONALIZATION_CAPABILITIES":
      return {
        ...state,
        personalizationCapabilities: getPersonalizationCapabilities(
          state.userProfile,
        ),
      };

    case "SET_PERSONALIZATION_LEVEL":
      return {
        ...state,
        personalizationLevel: action.payload,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

interface AIAssistantContextValue {
  state: AIAssistantState;
  addMessage: (content: string, sender: "user" | "ai") => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setTyping: (isTyping: boolean) => void;
  setStep: (step: ConversationStep) => void;
  setWalletData: (data: WalletData) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  analyzeProfileCompleteness: () => void;
  updatePersonalizationCapabilities: () => void;
  setPersonalizationLevel: (level: "basic" | "enhanced" | "advanced") => void;
  reset: () => void;
  sendMessage: (content: string) => void;
  // Helper function access
  getProfileCompleteness: () => ProfileCompleteness | undefined;
  getPersonalizationCapabilities: () => PersonalizationCapabilities | undefined;
  getEnhancedAIContext: () => EnhancedAIContext;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

export function AIAssistantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(aiAssistantReducer, initialState);
  const {
    sendMessage: sendAIMessage,
    reset: resetAI,
    isLoading: aiLoading,
  } = useAIService({
    onError: (error) => {
      console.error("AI Service Error:", error);
      addMessage(
        "I apologize, but I encountered an error. Let me try again or use a simpler approach.",
        "ai",
      );
    },
  });

  // Auto-analyze profile when it changes
  useEffect(() => {
    if (Object.keys(state.userProfile).length > 0) {
      dispatch({ type: "ANALYZE_PROFILE_COMPLETENESS" });
      dispatch({ type: "UPDATE_PERSONALIZATION_CAPABILITIES" });
    }
  }, [state.userProfile]);

  const addMessage = useCallback(
    (content: string, sender: "user" | "ai"): string => {
      const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const message: Message = {
        id,
        sender,
        content,
        timestamp: new Date(),
        typing: sender === "ai",
      };
      dispatch({ type: "ADD_MESSAGE", payload: message });
      return id;
    },
    [],
  );

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    dispatch({ type: "UPDATE_MESSAGE", payload: { id, updates } });
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    dispatch({ type: "SET_TYPING", payload: isTyping });
  }, []);

  const setStep = useCallback((step: ConversationStep) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const setWalletData = useCallback((data: WalletData) => {
    dispatch({ type: "SET_WALLET_DATA", payload: data });
  }, []);

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    dispatch({ type: "UPDATE_USER_PROFILE", payload: profile });
  }, []);

  const setRecommendations = useCallback(
    (recommendations: Recommendation[]) => {
      dispatch({ type: "SET_RECOMMENDATIONS", payload: recommendations });
    },
    [],
  );

  const analyzeProfileCompletenessCallback = useCallback(() => {
    dispatch({ type: "ANALYZE_PROFILE_COMPLETENESS" });
  }, []);

  const updatePersonalizationCapabilitiesCallback = useCallback(() => {
    dispatch({ type: "UPDATE_PERSONALIZATION_CAPABILITIES" });
  }, []);

  const setPersonalizationLevel = useCallback(
    (level: "basic" | "enhanced" | "advanced") => {
      dispatch({ type: "SET_PERSONALIZATION_LEVEL", payload: level });
    },
    [],
  );

  const getProfileCompleteness = useCallback(() => {
    return state.profileCompleteness;
  }, [state.profileCompleteness]);

  const getPersonalizationCapabilitiesCallback = useCallback(() => {
    return state.personalizationCapabilities;
  }, [state.personalizationCapabilities]);

  const getEnhancedAIContext = useCallback((): EnhancedAIContext => {
    return {
      userProfile: state.userProfile,
      personalizationLevel: state.personalizationLevel,
      profileCompleteness: state.profileCompleteness,
      personalizationCapabilities: state.personalizationCapabilities,
    };
  }, [
    state.userProfile,
    state.personalizationLevel,
    state.profileCompleteness,
    state.personalizationCapabilities,
  ]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    resetAI();
  }, [resetAI]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message
      addMessage(content, "user");
      setTyping(true);

      // Create AI message placeholder
      const aiMessageId = addMessage("", "ai");

      try {
        const response = await sendAIMessage(
          content,
          state.currentStep,
          state.userProfile,
          state.walletData || undefined,
          (chunk) => {
            // Handle streaming chunks
            dispatch({
              type: "UPDATE_MESSAGE",
              payload: {
                id: aiMessageId,
                updates: {
                  content:
                    state.messages.find((m) => m.id === aiMessageId)?.content +
                      chunk || chunk,
                  typing: true,
                },
              },
            });
          },
        );

        if (response) {
          // Update the message with final content
          updateMessage(aiMessageId, {
            content: response.message,
            typing: false,
          });

          // Handle step transitions
          if (response.nextStep && response.nextStep !== state.currentStep) {
            setStep(response.nextStep);
          }

          // Handle intent-based actions
          if (response.intent) {
            handleIntentAction(response.intent);
          }
        } else {
          // Fallback message if AI fails
          updateMessage(aiMessageId, {
            content:
              "I apologize, but I'm having trouble processing your request. Please try again.",
            typing: false,
          });
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        updateMessage(aiMessageId, {
          content:
            "I encountered an error. Please try again or refresh the page.",
          typing: false,
        });
      } finally {
        setTyping(false);
      }
    },
    [
      addMessage,
      sendAIMessage,
      state,
      updateMessage,
      setTyping,
      setStep,
      dispatch,
    ],
  );

  const handleIntentAction = useCallback(
    (intent: any) => {
      // Handle specific intents that affect the UI
      if (intent.action === "select_option" && intent.extractedValue) {
        // Update user profile based on extracted values
        const value = intent.extractedValue;

        // Legacy profile fields
        if (["growth", "income", "preservation"].includes(value)) {
          updateUserProfile({ investmentGoal: value as any });
        } else if (["conservative", "moderate", "aggressive"].includes(value)) {
          updateUserProfile({ riskTolerance: value as any });
        } else if (["chef", "truck_driver", "retail_manager"].includes(value)) {
          updateUserProfile({ occupation: value });
        }

        // Enhanced profile fields
        else if (
          ["analytical", "creative", "collaborative", "independent"].includes(
            value,
          )
        ) {
          updateUserProfile({ workStyle: value as any });
        } else if (
          ["busy", "flexible", "structured", "spontaneous"].includes(value)
        ) {
          updateUserProfile({ lifestyle: value as any });
        } else if (["beginner", "intermediate", "advanced"].includes(value)) {
          updateUserProfile({ experienceLevel: value as any });
        } else if (
          ["visual", "auditory", "kinesthetic", "reading"].includes(value)
        ) {
          updateUserProfile({ learningStyle: value as any });
        } else if (
          ["concise", "detailed", "analogies", "examples"].includes(value)
        ) {
          updateUserProfile({ communicationPreference: value as any });
        } else if (
          ["entry", "mid", "senior", "executive", "retired"].includes(value)
        ) {
          updateUserProfile({ careerStage: value as any });
        } else if (
          ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"].includes(value)
        ) {
          updateUserProfile({ ageRange: value as any });
        } else if (
          ["single", "married", "family", "prefer_not_to_say"].includes(value)
        ) {
          updateUserProfile({ familyStatus: value as any });
        }
      } else if (intent.action === "input_value" && intent.extractedValue) {
        const value = intent.extractedValue;

        if (state.currentStep === "timeline") {
          updateUserProfile({ timeline: `${value} years` });
        } else if (state.currentStep === "amount") {
          updateUserProfile({ monthlyAmount: Number(value) });
        }
      } else if (intent.action === "multi_select" && intent.extractedValues) {
        // Handle array-based profile fields
        const values = intent.extractedValues;
        const fieldType = intent.fieldType;

        if (fieldType === "values" && Array.isArray(values)) {
          const validValues = values.filter((v) =>
            [
              "stability",
              "growth",
              "innovation",
              "sustainability",
              "security",
            ].includes(v),
          );
          if (validValues.length > 0) {
            updateUserProfile({ values: validValues as any });
          }
        } else if (
          fieldType === "currentInvestments" &&
          Array.isArray(values)
        ) {
          const validInvestments = values.filter((v) =>
            [
              "stocks",
              "bonds",
              "crypto",
              "real_estate",
              "commodities",
            ].includes(v),
          );
          if (validInvestments.length > 0) {
            updateUserProfile({ currentInvestments: validInvestments as any });
          }
        } else if (fieldType === "financialGoals" && Array.isArray(values)) {
          const validGoals = values.filter((v) =>
            [
              "retirement",
              "house",
              "education",
              "emergency",
              "wealth_building",
            ].includes(v),
          );
          if (validGoals.length > 0) {
            updateUserProfile({ financialGoals: validGoals as any });
          }
        } else if (
          ["interests", "hobbies", "personalGoals"].includes(fieldType) &&
          Array.isArray(values)
        ) {
          updateUserProfile({ [fieldType]: values });
        }
      }
    },
    [state.currentStep, updateUserProfile],
  );

  const value: AIAssistantContextValue = {
    state,
    addMessage,
    updateMessage,
    setTyping,
    setStep,
    setWalletData,
    updateUserProfile,
    setRecommendations,
    analyzeProfileCompleteness: analyzeProfileCompletenessCallback,
    updatePersonalizationCapabilities:
      updatePersonalizationCapabilitiesCallback,
    setPersonalizationLevel,
    reset,
    sendMessage,
    getProfileCompleteness,
    getPersonalizationCapabilities: getPersonalizationCapabilitiesCallback,
    getEnhancedAIContext,
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error("useAIAssistant must be used within AIAssistantProvider");
  }
  return context;
}
