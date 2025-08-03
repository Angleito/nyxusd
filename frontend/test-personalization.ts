// Test file to verify PersonalizationEngine types are correct
import { PersonalizationEngine, PersonalizationProfile, PersonalizationContext } from './src/services/ai/personalizationEngine';

const engine = new PersonalizationEngine();

const testProfile: PersonalizationProfile = {
  occupation: 'software_engineer',
  experienceLevel: 'intermediate',
  riskTolerance: 'moderate',
  hobbies: ['gaming', 'cooking'],
  workStyle: 'analytical',
};

const testContext: PersonalizationContext = {
  step: 'risk_assessment',
  concept: 'portfolio diversification',
  urgency: 'medium',
  complexity: 5
};

// Test analysis
const analysis = engine.analyzeProfile(testProfile);
console.log('Analysis completeness:', analysis.completeness);

// Test personalization selection
const result = engine.selectPersonalization(testProfile, testContext);
console.log('Selected strategy:', result.strategy.name);

// Test effectiveness scoring
const score = engine.scoreEffectiveness('Like optimizing code, portfolio optimization maximizes efficiency', testProfile);
console.log('Effectiveness score:', score);