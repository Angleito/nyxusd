import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "../../providers/AIAssistantProvider";
import {
  ChevronRight,
  DollarSign,
  Target,
  Clock,
  Briefcase,
  Shield,
} from "lucide-react";

interface QuestionnaireStepProps {
  step: string;
  onComplete: (data?: any) => void;
}

export const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
  step,
  onComplete,
}) => {
  const { updateUserProfile, addMessage } = useAIAssistant();
  const [localValue, setLocalValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Reset local value when step changes
  useEffect(() => {
    setLocalValue("");
    setError("");
  }, [step]);

  const handleSubmit = (value: string, fieldKey: string) => {
    if (!value && step !== "experience_level") {
      // Experience level is optional
      setError("This field is required");
      return;
    }

    // Update user profile
    updateUserProfile({ [fieldKey]: value });

    // Send message to AI
    const questionText = getQuestionText(step);
    const answerText = getFormattedAnswer(step, value);
    addMessage(`${questionText} - My answer: ${answerText}`, "user");

    // Move to next step
    onComplete();
  };

  const getQuestionText = (step: string): string => {
    switch (step) {
      case "strategy_choice":
        return "How would you like to build your strategy?";
      case "template_selection":
        return "Which strategy template would you like to use?";
      case "protocol_selection":
        return "Which protocols would you like to use?";
      case "investment_goals":
        return "What are your primary investment goals?";
      case "occupation":
        return "What is your occupation?";
      case "risk_tolerance":
        return "How would you describe your risk tolerance?";
      case "timeline":
        return "What's your investment timeline?";
      case "amount":
        return "How much can you invest monthly?";
      case "experience_level":
        return "What's your experience level with DeFi?";
      default:
        return "";
    }
  };

  const getFormattedAnswer = (step: string, value: string): string => {
    switch (step) {
      case "investment_goals":
        const goals = {
          growth: "Capital growth",
          income: "Regular income",
          preservation: "Capital preservation",
        };
        return goals[value as keyof typeof goals] || value;
      case "occupation":
        const occupations = {
          chef: "Chef",
          truck_driver: "Truck Driver",
          retail_manager: "Retail Store Manager",
        };
        return occupations[value as keyof typeof occupations] || value;
      case "risk_tolerance":
        const risks = {
          conservative: "Conservative",
          moderate: "Moderate",
          aggressive: "Aggressive",
        };
        return risks[value as keyof typeof risks] || value;
      case "timeline":
        return `${value} years`;
      case "amount":
        return `$${value} per month`;
      case "experience_level":
        const levels = {
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced",
        };
        return levels[value as keyof typeof levels] || value;
      default:
        return value;
    }
  };

  const renderQuestion = () => {
    switch (step) {
      case "strategy_choice": // Strategy Choice
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                How would you like to build your strategy?
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "custom",
                  label: "🎯 Custom Strategy",
                  description: "Build from scratch with full control",
                },
                {
                  value: "template",
                  label: "📊 Use Template",
                  description: "Start with a proven strategy",
                },
                {
                  value: "explore",
                  label: "🔍 Explore Protocols",
                  description: "Browse and learn about protocols",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  data-option={option.value}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    localValue === option.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="strategyChoice"
                    value={option.value}
                    checked={localValue === option.value}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white text-lg">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        localValue === option.value
                          ? "border-purple-500"
                          : "border-gray-600"
                      }`}
                    >
                      {localValue === option.value && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case "template_selection": // Template Selection
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                Which strategy template would you like to use?
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "conservative",
                  label: "🛡️ Conservative Yield Hunter",
                  description: "8-12% APY • Low risk • Stable returns",
                },
                {
                  value: "balanced",
                  label: "⚖️ Balanced DeFi Portfolio",
                  description: "15-25% APY • Moderate risk • Best risk/reward",
                },
                {
                  value: "aggressive",
                  label: "🚀 Aggressive Yield Farmer",
                  description: "30-80% APY • High risk • Maximum returns",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  data-option={option.value}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    localValue === option.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="templateSelection"
                    value={option.value}
                    checked={localValue === option.value}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white text-lg">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        localValue === option.value
                          ? "border-purple-500"
                          : "border-gray-600"
                      }`}
                    >
                      {localValue === option.value && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case "protocol_selection": // Protocol Selection
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                Would you like to proceed with recommended protocols?
              </h3>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <h4 className="text-white font-medium mb-3">
                Recommended Protocols:
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  • <span className="text-purple-400">Aave</span> - Stable
                  lending yields (8-12% APY)
                </li>
                <li>
                  • <span className="text-purple-400">Curve</span> - Low-risk
                  liquidity pools (10-15% APY)
                </li>
                <li>
                  • <span className="text-purple-400">Yearn</span> - Automated
                  yield optimization (12-20% APY)
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "recommended",
                  label: "Use Recommended",
                  description: "Proceed with suggested protocols",
                },
                {
                  value: "explore",
                  label: "Explore Others",
                  description: "See all available protocols",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    localValue === option.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="protocolSelection"
                    value={option.value}
                    checked={localValue === option.value}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        localValue === option.value
                          ? "border-purple-500"
                          : "border-gray-600"
                      }`}
                    >
                      {localValue === option.value && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case "investment_goals": // Investment Goals
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                What are your primary investment goals?
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "growth",
                  label: "Capital Growth",
                  description: "Maximize returns over time",
                },
                {
                  value: "income",
                  label: "Regular Income",
                  description: "Generate steady income streams",
                },
                {
                  value: "preservation",
                  label: "Capital Preservation",
                  description: "Protect wealth from inflation",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    localValue === option.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="investmentGoal"
                    value={option.value}
                    checked={localValue === option.value}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        localValue === option.value
                          ? "border-purple-500"
                          : "border-gray-600"
                      }`}
                    >
                      {localValue === option.value && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case "occupation": // Occupation
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                What is your occupation?
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "chef",
                  label: "Chef",
                  description: "Culinary professional managing kitchens",
                },
                {
                  value: "truck_driver",
                  label: "Truck Driver",
                  description: "Professional freight transportation",
                },
                {
                  value: "retail_manager",
                  label: "Retail Store Manager",
                  description: "Managing retail operations",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  data-option={option.value}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    localValue === option.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="occupation"
                    value={option.value}
                    checked={localValue === option.value}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        localValue === option.value
                          ? "border-purple-500"
                          : "border-gray-600"
                      }`}
                    >
                      {localValue === option.value && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case "risk_tolerance": // Risk Tolerance
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                How would you describe your risk tolerance?
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "conservative",
                  label: "Conservative",
                  description: "Prefer stability over high returns",
                },
                {
                  value: "moderate",
                  label: "Moderate",
                  description: "Balance between risk and reward",
                },
                {
                  value: "aggressive",
                  label: "Aggressive",
                  description: "Comfortable with volatility for higher returns",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    localValue === option.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="riskTolerance"
                    value={option.value}
                    checked={localValue === option.value}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        localValue === option.value
                          ? "border-purple-500"
                          : "border-gray-600"
                      }`}
                    >
                      {localValue === option.value && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case "timeline": // Timeline
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                What's your investment timeline?
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Investment horizon (in years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={localValue}
                  onChange={(e) => {
                    setLocalValue(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {["5", "10", "20"].map((years) => (
                  <button
                    key={years}
                    onClick={() => {
                      setLocalValue(years);
                      setError("");
                    }}
                    className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                  >
                    {years} years
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "amount": // Monthly Investment
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                How much can you invest monthly?
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly investment amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={localValue}
                    onChange={(e) => {
                      setLocalValue(e.target.value);
                      setError("");
                    }}
                    placeholder="1,000"
                    className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {["500", "1000", "2500"].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setLocalValue(amount);
                      setError("");
                    }}
                    className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                  >
                    ${parseInt(amount).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "experience_level": // Experience Level
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                What's your experience level with DeFi?
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "beginner",
                  label: "Beginner",
                  description: "New to DeFi and blockchain",
                },
                {
                  value: "intermediate",
                  label: "Intermediate",
                  description: "Some experience with DeFi protocols",
                },
                {
                  value: "advanced",
                  label: "Advanced",
                  description: "Extensive DeFi experience",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    localValue === option.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={option.value}
                    checked={localValue === option.value}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        localValue === option.value
                          ? "border-purple-500"
                          : "border-gray-600"
                      }`}
                    >
                      {localValue === option.value && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleContinue = () => {
    let fieldKey = "";
    let value = localValue;

    switch (step) {
      case "strategy_choice":
        fieldKey = "strategyChoice";
        break;
      case "template_selection":
        fieldKey = "templateSelection";
        break;
      case "protocol_selection":
        fieldKey = "protocolSelection";
        break;
      case "investment_goals":
        fieldKey = "investmentGoal";
        break;
      case "occupation":
        fieldKey = "occupation";
        break;
      case "risk_tolerance":
        fieldKey = "riskTolerance";
        break;
      case "timeline":
        fieldKey = "timeline";
        if (!value || parseInt(value) < 1) {
          setError("Please enter a valid timeline");
          return;
        }
        break;
      case "amount":
        fieldKey = "monthlyAmount";
        if (!value || parseFloat(value) <= 0) {
          setError("Please enter a valid amount");
          return;
        }
        break;
      case "experience_level":
        fieldKey = "experienceLevel";
        break;
    }

    handleSubmit(value, fieldKey);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          {renderQuestion()}

          <motion.button
            onClick={handleContinue}
            disabled={!localValue}
            data-action="continue"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`mt-6 w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              localValue
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
