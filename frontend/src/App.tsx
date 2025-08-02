import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";
import { NyxHeader } from "./components/layout/NyxHeader";
import { NyxDashboard } from "./components/dashboard/NyxDashboard";
import { CDPDashboard } from "./components/cdp/CDPDashboard";
import { ModernSystemStats } from "./components/stats/ModernSystemStats";
import NyxHeroSection from "./components/dashboard/NyxHeroSection";
import { AIAssistantProvider } from "./providers/AIAssistantProvider";
import { AIAssistant } from "./components/ai-assistant";
import { AboutPage } from "./components/about/AboutPage";
import ContactPage from "./components/contact/ContactPage";
import "./styles/nyx-global.css";
import "./styles/App.css";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Generate starfield effect
    const starfield = document.getElementById('app-starfield');
    if (starfield && starfield.children.length === 0) {
      const starCount = 150;
      
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        starfield.appendChild(star);
      }
    }
  }, []);

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
    <div className="nyx-page">
      {/* Starfield Background */}
      <div className="stars" id="app-starfield" />
      <NyxHeader />
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
                  <NyxHeroSection />
                  <div className="container mx-auto px-4 py-8">
                    <NyxDashboard />
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
