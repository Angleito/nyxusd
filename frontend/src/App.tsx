import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ModernHeader } from "./components/layout/ModernHeader";
import { ModernDashboard } from "./components/dashboard/ModernDashboard";
import { CDPDashboard } from "./components/cdp/CDPDashboard";
import { ModernSystemStats } from "./components/stats/ModernSystemStats";
import HeroSection from "./components/dashboard/HeroSection";
import { AIAssistantProvider } from "./providers/AIAssistantProvider";
import { AIAssistant } from "./components/ai-assistant";
import "./styles/App.css";

function App() {
  return (
    <div className="min-h-screen theme-midnight">
      <ModernHeader />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <div className="container mx-auto px-4 py-8">
                  <ModernDashboard />
                </div>
              </>
            }
          />
          <Route
            path="/cdp"
            element={
              <div className="container mx-auto px-4 py-8 pt-24">
                <CDPDashboard />
              </div>
            }
          />
          <Route
            path="/system"
            element={
              <div className="container mx-auto px-4 py-8 pt-24">
                <ModernSystemStats />
              </div>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <AIAssistantProvider>
                <div className="container mx-auto px-4 py-8 pt-24">
                  <AIAssistant />
                </div>
              </AIAssistantProvider>
            }
          />
        </Routes>
      </main>
      <Analytics />
    </div>
  );
}

export default App;
