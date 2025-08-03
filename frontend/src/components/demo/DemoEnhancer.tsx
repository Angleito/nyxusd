import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Camera, Settings, CheckCircle, TrendingUp, Shield } from 'lucide-react';
import { demoManager, DEMO_SCENARIOS, DEMO_METRICS, isDemoMode } from '../../utils/demoHelper';

interface DemoEnhancerProps {
  onScenarioChange?: (scenario: any) => void;
}

export const DemoEnhancer: React.FC<DemoEnhancerProps> = ({ onScenarioChange }) => {
  const [isVisible, setIsVisible] = useState(isDemoMode());
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        setShowMetrics(!showMetrics);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, showMetrics]);

  const startScenario = (index: number) => {
    const scenario = DEMO_SCENARIOS[index];
    if (scenario) {
      demoManager.startScenario(scenario);
      setCurrentScenario(index);
      onScenarioChange?.(scenario);
      
      // Auto-populate demo data
      localStorage.setItem('demo-scenario', JSON.stringify(scenario));
      
      // Trigger events for components to pick up
      window.dispatchEvent(new CustomEvent('demo-scenario-start', {
        detail: scenario
      }));
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording mode - hide unnecessary UI elements
      document.body.classList.add('recording-mode');
    } else {
      document.body.classList.remove('recording-mode');
    }
  };

  if (!isVisible) {
    return (
      <div 
        className="fixed bottom-4 left-4 z-50 opacity-20 hover:opacity-100 transition-opacity"
        title="Press Ctrl+Shift+D to show demo controls"
      >
        <button
          onClick={() => setIsVisible(true)}
          className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center"
        >
          <Camera size={16} />
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 z-50 bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 w-80"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Camera size={16} className="text-purple-400" />
            Demo Controller
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Recording Status */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
              isRecording 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            {isRecording ? 'Recording' : 'Start Recording'}
          </button>
          
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            <TrendingUp size={12} />
            Metrics
          </button>
        </div>

        {/* Demo Scenarios */}
        <div className="space-y-2 mb-4">
          <p className="text-gray-300 text-sm font-medium">Demo Scenarios:</p>
          {DEMO_SCENARIOS.map((scenario, index) => (
            <button
              key={index}
              onClick={() => startScenario(index)}
              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                currentScenario === index
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Play size={12} />
                <span className="font-medium">{scenario.name}</span>
              </div>
              <p className="text-xs opacity-75 mt-1">{scenario.description}</p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => window.location.href = '/?demo=true'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
          >
            Reload Demo
          </button>
          <button
            onClick={() => localStorage.clear()}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
          >
            Clear Data
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-gray-400 text-xs">Shortcuts:</p>
          <p className="text-gray-500 text-xs">Ctrl+Shift+D: Show/Hide</p>
          <p className="text-gray-500 text-xs">Ctrl+Shift+M: Toggle Metrics</p>
        </div>
      </motion.div>

      {/* Metrics Overlay */}
      {showMetrics && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 left-4 z-50 bg-gray-900/95 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 w-64"
        >
          <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-400" />
            Live Metrics
          </h3>
          
          <div className="space-y-2">
            {Object.entries(DEMO_METRICS).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle size={14} />
              <span>All Systems Operational</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 right-4 z-50 bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">RECORDING</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced AI responses for demo
export const useDemoAI = () => {
  const [demoScenario, setDemoScenario] = useState<any>(null);

  useEffect(() => {
    const handleScenarioStart = (event: CustomEvent) => {
      setDemoScenario(event.detail);
    };

    window.addEventListener('demo-scenario-start', handleScenarioStart as EventListener);
    return () => window.removeEventListener('demo-scenario-start', handleScenarioStart as EventListener);
  }, []);

  const getDemoResponse = (userMessage: string): string => {
    if (!demoScenario) return '';

    const responses = demoScenario.aiResponses || [];
    const messageIndex = Math.floor(Math.random() * responses.length);
    return responses[messageIndex] || "I'm here to help you with your DeFi strategy!";
  };

  return { demoScenario, getDemoResponse };
};