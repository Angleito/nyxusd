import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";
import { NyxHeader } from "./components/layout/NyxHeader";
import { Dashboard } from "./components/dashboard/Dashboard";
import NyxMascotDashboard from "./components/dashboard/NyxMascotDashboard";
import HeroSection from "./components/dashboard/HeroSection";
import CDPHub from "./components/cdp/CDPHub";
import { ModernSystemStats } from "./components/stats/ModernSystemStats";
import { UnifiedAIAssistant, StandaloneAIAssistant } from "./components/ai-assistant/UnifiedAIAssistant";
import { AboutPage } from "./components/about/AboutPage";
import ContactPage from "./components/contact/ContactPage";
import WhitepaperPage from "./pages/WhitepaperPage";
import { DemoEnhancer } from "./components/demo/DemoEnhancer";
import { DemoModeIndicator } from "./components/demo/DemoModeIndicator";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeTransition, ThemeBackground } from "./components/theme/ThemeTransition";
import "./styles/nyx-global.css";
import "./styles/App.css";
import "./theme/styles/themes.css";
import { useEffect, useRef } from "react";
import PoolsSelector from "./components/pools/PoolsSelector";

function App() {
  const demoModeRef = useRef<{ simulateCommand: (command: string) => void } | null>(null);

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
    <ThemeProvider>
      <ThemeTransition>
        <div className="nyx-page">
          {/* Theme-aware Background */}
          <ThemeBackground />
          
          {/* Starfield Background (for Midnight theme) */}
          <div className="stars" id="app-starfield" />
          
          <NyxHeader />
          
          {/* Global AI Assistant - Available on all pages */}
          <UnifiedAIAssistant position="bottom-right" />
          
          {/* Demo Mode Indicator - Shows demo scenarios */}
          <DemoModeIndicator 
            onScenarioSelect={(command) => {
              // TODO: Send command to AI assistant
              console.log('Demo command:', command);
            }}
          />
          
          {/* Demo Controller for Video Recording */}
          <DemoEnhancer />
          
          <main className="relative z-10">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Nyx Mascot Dashboard as the default home page */}
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
                      <NyxMascotDashboard />
                    </motion.div>
                  }
                />
                {/* Classic dashboard with hero section */}
                <Route
                  path="/classic"
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
                        <Dashboard variant="modern" />
                      </div>
                    </motion.div>
                  }
                />
                {/* Keep other routes unchanged */}
                <Route
                  path="/pools"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                      className="container mx-auto px-4 py-8"
                    >
                      <PoolsSelector />
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
                      className="pt-24"
                    >
                      <CDPHub />
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
                      className="py-8"
                    >
                      <ModernSystemStats />
                    </motion.div>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                      className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]"
                    >
                      <StandaloneAIAssistant />
                    </motion.div>
                  }
                />
                {/* Optional: legacy alias to ensure deep links still work */}
                <Route
                  path="/chat"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                      className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]"
                    >
                      <StandaloneAIAssistant />
                    </motion.div>
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
                    >
                      <ContactPage />
                    </motion.div>
                  }
                />
                <Route
                  path="/whitepaper"
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <WhitepaperPage />
                    </motion.div>
                  }
                />
              </Routes>
            </AnimatePresence>
          </main>
      <Analytics />
    </div>
      </ThemeTransition>
    </ThemeProvider>
  );
}

export default App;