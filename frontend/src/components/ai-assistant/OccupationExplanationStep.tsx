import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "../../providers/AIAssistantProvider";
import { Briefcase, RefreshCw, ChevronRight } from "lucide-react";

interface OccupationExplanationStepProps {
  onComplete: () => void;
}

export const OccupationExplanationStep: React.FC<
  OccupationExplanationStepProps
> = ({ onComplete }) => {
  const { state, updateUserProfile, addMessage } = useAIAssistant();
  const [showAdjustOptions, setShowAdjustOptions] = useState(false);
  const occupation = state.userProfile.occupation;

  const getOccupationDetails = (occ: string) => {
    const details = {
      chef: {
        title: "Chef",
        approach: `As a chef, I'll explain investment strategies using culinary concepts you work with every day:

• **Portfolio Management** = Menu Planning: Just like balancing appetizers, mains, and desserts, we'll diversify your investments
• **Risk Assessment** = Food Safety Protocols: We'll manage investment risks like you manage kitchen safety
• **Yield Optimization** = Profit Margins: Understanding returns like calculating dish profitability
• **Liquidity** = Mise en Place: Having assets ready when needed, like prepped ingredients

I'll use kitchen analogies to make complex DeFi concepts crystal clear, drawing parallels to inventory management, seasonal menus, and restaurant operations.`,
      },
      truck_driver: {
        title: "Truck Driver",
        approach: `As a truck driver, I'll explain investment strategies using logistics and transportation concepts:

• **Portfolio Management** = Route Planning: Diversifying investments like balancing local and long-haul routes
• **Risk Assessment** = Pre-Trip Inspections: Checking investment health like inspecting your rig
• **Yield Optimization** = Fuel Efficiency: Maximizing returns like optimizing miles per gallon
• **Liquidity** = Available Parking: Having accessible funds like finding truck stops when needed

I'll use trucking analogies to explain DeFi concepts, relating them to freight rates, fuel management, and route optimization strategies you use daily.`,
      },
      retail_manager: {
        title: "Retail Store Manager",
        approach: `As a retail store manager, I'll explain investment strategies using retail and inventory concepts:

• **Portfolio Management** = Product Mix: Balancing investments like managing diverse inventory
• **Risk Assessment** = Loss Prevention: Managing investment risks like preventing shrinkage
• **Yield Optimization** = Inventory Turnover: Understanding returns like calculating product profitability
• **Liquidity** = Cash Flow Management: Keeping assets accessible like maintaining register float

I'll use retail analogies to clarify DeFi concepts, connecting them to sales strategies, seasonal planning, and customer loyalty programs you manage.`,
      },
    };

    return details[occ as keyof typeof details] || details.chef;
  };

  const handleContinue = () => {
    addMessage(
      "Great! I'll use these familiar concepts throughout our conversation. Now let's assess your risk tolerance.",
      "ai",
    );
    onComplete();
  };

  const handleAdjustOccupation = (newOccupation: string) => {
    updateUserProfile({ occupation: newOccupation });
    addMessage(
      `Changed occupation to ${getOccupationDetails(newOccupation).title}`,
      "user",
    );
    setShowAdjustOptions(false);
  };

  const occupationInfo = getOccupationDetails(occupation || "chef");

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
              Perfect! Here's how I'll tailor my approach for a{" "}
              {occupationInfo.title}
            </h3>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
              {occupationInfo.approach}
            </p>
          </div>

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
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                Yes, this works perfectly!
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={() => setShowAdjustOptions(true)}
                data-action="adjust"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Change
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <p className="text-sm text-gray-400 mb-3">
                Select a different occupation:
              </p>
              {["chef", "truck_driver", "retail_manager"].map((occ) => {
                const info = getOccupationDetails(occ);
                return (
                  <motion.button
                    key={occ}
                    onClick={() => handleAdjustOccupation(occ)}
                    data-option={occ}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      occupation === occ
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                    }`}
                  >
                    <div className="font-medium text-white">{info.title}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {occ === "chef" &&
                        "Culinary professional managing kitchens"}
                      {occ === "truck_driver" &&
                        "Professional freight transportation"}
                      {occ === "retail_manager" && "Managing retail operations"}
                    </div>
                  </motion.button>
                );
              })}

              <motion.button
                onClick={() => setShowAdjustOptions(false)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
