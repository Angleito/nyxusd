import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "../../providers/AIAssistantProvider";
import { Briefcase, RefreshCw, ChevronRight, Loader2 } from "lucide-react";

interface OccupationExplanationStepProps {
  onComplete: () => void;
}

export const OccupationExplanationStep: React.FC<
  OccupationExplanationStepProps
> = ({ onComplete }) => {
  const { state, updateUserProfile, addMessage } = useAIAssistant();
  const [isGenerating, setIsGenerating] = useState(true);
  const [explanation, setExplanation] = useState("");
  const [showAdjustOptions, setShowAdjustOptions] = useState(false);
  const occupation = state.userProfile.occupation || "professional";

  useEffect(() => {
    // Generate AI explanation when component mounts
    generateOccupationExplanation();
  }, [occupation]);

  const generateOccupationExplanation = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a dynamic explanation based on occupation
    // In production, this would call the AI service
    setTimeout(() => {
      const generatedExplanation = generateDynamicExplanation(occupation);
      setExplanation(generatedExplanation);
      setIsGenerating(false);
    }, 1500);
  };

  const generateDynamicExplanation = (occ: string) => {
    // This function generates a template-based explanation
    // The actual AI service will provide more personalized content
    const occupationTitle = occ.charAt(0).toUpperCase() + occ.slice(1);
    
    return `As a ${occupationTitle}, I'll explain investment strategies using concepts from your field:

• **Portfolio Management** = Resource Allocation: Just like you manage different aspects of your work, we'll diversify investments across various assets
• **Risk Assessment** = Professional Standards: We'll evaluate investment risks using the same careful approach you apply in your profession
• **Yield Optimization** = Performance Metrics: Understanding returns like you measure success in your field
• **Liquidity** = Operational Flexibility: Having accessible funds when needed, similar to maintaining flexibility in your work

I'll use analogies from your profession to make complex DeFi concepts clear and relatable, drawing parallels to the systems and processes you work with daily.`;
  };

  const handleContinue = () => {
    addMessage(
      "Great! I'll use these familiar concepts throughout our conversation. Now let's assess your risk tolerance.",
      "ai",
    );
    onComplete();
  };

  const handleChangeOccupation = () => {
    // Navigate back to occupation input
    addMessage("Let me update your occupation.", "ai");
    onComplete();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">
              Perfect! Here's how I'll tailor my approach for you
            </h3>
          </div>

          {isGenerating ? (
            <div className="bg-gray-800/50 rounded-lg p-8 mb-6 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
              <p className="text-gray-400">
                Generating personalized explanations for your profession...
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800/50 rounded-lg p-4 mb-6"
            >
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {explanation}
              </p>
            </motion.div>
          )}

          <div className="text-sm text-gray-400 mb-6">
            Does this approach work for you? If not, you can adjust your
            occupation selection.
          </div>

          {!showAdjustOptions ? (
            <div className="flex gap-3">
              <motion.button
                onClick={handleContinue}
                data-action="continue"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                Yes, this works perfectly!
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={handleChangeOccupation}
                data-action="adjust"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isGenerating}
                className="py-3 px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Change
              </motion.button>
            </div>
          ) : null}

          {/* AI-Powered Badge */}
          <div className="mt-6 flex items-center justify-center">
            <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <span className="text-xs text-purple-400">
                ✨ AI-Powered Personalization
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};