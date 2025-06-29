import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";
import { ModernHeader } from "./components/layout/ModernHeader";
import { ModernDashboard } from "./components/dashboard/ModernDashboard";
import { CDPDashboard } from "./components/cdp/CDPDashboard";
import { ModernSystemStats } from "./components/stats/ModernSystemStats";
import HeroSection from "./components/dashboard/HeroSection";
import { AIAssistantProvider } from "./providers/AIAssistantProvider";
import { AIAssistant } from "./components/ai-assistant";
import { AboutPage } from "./components/about/AboutPage";
import ContactPage from "./components/contact/ContactPage";
import "./styles/App.css";

function App() {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
  };

  return (
    <div className="min-h-screen theme-midnight">
      <ModernHeader />
      <main>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <HeroSection />
                  <div className="container mx-auto px-4 py-8">
                    <ModernDashboard />
                  </div>
                </motion.div>
              }
            />
            <Route
              path="/cdp"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="container mx-auto px-4 py-8 pt-24"
                >
                  <CDPDashboard />
                </motion.div>
              }
            />
            <Route
              path="/system"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="container mx-auto px-4 py-8 pt-24"
                >
                  <ModernSystemStats />
                </motion.div>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <AIAssistantProvider>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="container mx-auto px-4 py-8 pt-24"
                  >
                    <AIAssistant />
                  </motion.div>
                </AIAssistantProvider>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="container mx-auto px-4 py-8 pt-24"
                >
                  <AboutPage />
                </motion.div>
              }
            />
            <Route
              path="/contact"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="container mx-auto px-4 py-8 pt-24"
                >
                  <ContactPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Analytics />
    </div>
  );
}

export default App;
