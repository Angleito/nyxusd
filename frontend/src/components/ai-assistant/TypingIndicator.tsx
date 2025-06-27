import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const TypingIndicator: React.FC = () => {
  const dotVariants = {
    initial: { y: 0, opacity: 0.5 },
    animate: {
      y: [-3, 0, -3],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-900/30 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-4 h-4 text-white" />
      </motion.div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 0.15, 0.3].map((delay, index) => (
            <motion.div
              key={index}
              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{ delay }}
            />
          ))}
        </div>
        <motion.div
          className="text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          AI is thinking...
        </motion.div>
      </div>
    </motion.div>
  );
};
