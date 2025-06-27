import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAIAssistant, ConversationStep } from '../../providers/AIAssistantProvider';
import { ChatInterface } from './ChatInterface';
import { WalletConnectionStep } from './WalletConnectionStep';
import { QuestionnaireStep } from './QuestionnaireStep';
import { RecommendationsDisplay } from './RecommendationsDisplay';

export const AIAssistant: React.FC = () => {
  const { state, addMessage, setStep } = useAIAssistant();
  const { currentStep, messages } = state;

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      // Add initial welcome message
      const messageId = addMessage('Welcome to NyxUSD AI Assistant! I\'m here to help you optimize your CDP positions and understand the Midnight Protocol ecosystem. Would you like to connect your wallet to get personalized recommendations?', 'ai');
      
      // After a short delay, move to wallet prompt step
      setTimeout(() => {
        setStep('wallet_prompt');
      }, 1500);
    }
  }, [messages.length, addMessage, setStep]);

  // Handle conversation flow based on current step
  const handleStepComplete = (data?: any) => {
    switch (currentStep) {
      case 'wallet_prompt':
        if (data?.connected) {
          setStep('investment_goals');
          addMessage('Great! Your wallet is connected. Let me ask you a few questions to understand your risk profile and provide personalized recommendations.', 'ai');
        }
        break;
        
      case 'risk_assessment':
      case 'risk_tolerance':
      case 'investment_goals':
      case 'timeline':
      case 'amount':
      case 'experience_level':
        // Progress through questionnaire steps
        const nextSteps = {
          risk_assessment: 'investment_goals',
          investment_goals: 'risk_tolerance',
          risk_tolerance: 'timeline',
          timeline: 'amount',
          amount: 'experience_level',
          experience_level: 'recommendations'
        };
        const nextStep = nextSteps[currentStep as keyof typeof nextSteps];
        if (nextStep) {
          setStep(nextStep as ConversationStep);
        }
        break;
        
      case 'recommendations':
        // User has viewed recommendations, return to chat
        setStep('complete');
        addMessage('I\'ve prepared your personalized CDP recommendations based on your profile. Feel free to ask me any questions about these strategies or anything else related to NyxUSD!', 'ai');
        break;
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Chat Interface */}
      <motion.div 
        className="flex-1 overflow-hidden"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ChatInterface />
      </motion.div>

      {/* Overlay Components based on current step */}
      {currentStep === 'wallet_prompt' && (
        <WalletConnectionStep onComplete={handleStepComplete} />
      )}

      {(currentStep === 'risk_assessment' || 
        currentStep === 'risk_tolerance' ||
        currentStep === 'investment_goals' || 
        currentStep === 'timeline' ||
        currentStep === 'amount' ||
        currentStep === 'experience_level') && (
        <QuestionnaireStep 
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep === 'recommendations' && (
        <RecommendationsDisplay onComplete={handleStepComplete} />
      )}
    </motion.div>
  );
};