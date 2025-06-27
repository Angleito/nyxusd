import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MousePointer, CheckCircle } from "lucide-react";

interface AutoActionHandlerProps {
  action: string;
  targetElement?: string;
  onComplete: () => void;
  children?: React.ReactNode;
}

export const AutoActionHandler: React.FC<AutoActionHandlerProps> = ({
  action,
  targetElement,
  onComplete,
  children,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (action && targetElement) {
      // Start animation sequence
      setIsAnimating(true);
      setShowPointer(true);

      // Find the target element
      const element = document.querySelector(targetElement) as HTMLElement;
      if (element) {
        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // Simulate pointer movement
        setTimeout(() => {
          // Add visual focus
          element.classList.add("auto-action-focus");

          // Simulate click after a delay
          setTimeout(() => {
            element.click();
            setShowPointer(false);
            setShowSuccess(true);

            // Clean up and complete
            setTimeout(() => {
              element.classList.remove("auto-action-focus");
              setShowSuccess(false);
              setIsAnimating(false);
              onComplete();
            }, 1000);
          }, 1500);
        }, 800);
      }
    }
  }, [action, targetElement, onComplete]);

  return (
    <>
      {/* Overlay during animation */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Animated pointer */}
      <AnimatePresence>
        {showPointer && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [0, 100, 200],
              y: [0, 50, 100],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 1.5,
              x: { duration: 1.5, ease: "easeInOut" },
              y: { duration: 1.5, ease: "easeInOut" },
            }}
            style={{ top: "50%", left: "50%" }}
          >
            <div className="relative">
              <MousePointer className="w-8 h-8 text-purple-500 drop-shadow-lg" />
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-full h-full bg-purple-500 rounded-full blur-xl" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success indicator */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <div className="bg-green-500 rounded-full p-4 shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant animation indicator */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="fixed bottom-4 right-4 z-50 bg-gray-900 rounded-lg p-4 shadow-xl border border-purple-500/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-purple-500" />
              </motion.div>
              <span className="text-white text-sm">
                AI Assistant is helping you...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global styles for auto-action focus */}
      <style>{`
        .auto-action-focus {
          position: relative;
          animation: pulse-glow 2s ease-in-out infinite;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.5);
          transform: scale(1.05);
          transition: all 0.3s ease;
          z-index: 30;
        }

        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.5);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.4);
          }
          100% {
            box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.5);
          }
        }

        .auto-action-focus::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          background: linear-gradient(45deg, transparent, rgba(168, 85, 247, 0.2), transparent);
          animation: rotate-gradient 3s linear infinite;
        }

        @keyframes rotate-gradient {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {children}
    </>
  );
};
