# AI Assistant Conversational Flow Test

This document demonstrates the natural language conversational flow of the AI assistant, including the new occupation selection step.

## Test Scenarios

### Scenario 1: Basic Flow with Natural Language

1. **Initial greeting**
   - AI: "Hi! I'm Nyx, your AI investment assistant. I'll help you create a personalized DeFi portfolio based on your goals and experience. Ready to connect your wallet and get started?"
   - User: "ok connect me"
   - Expected: Auto-click the connect wallet button

2. **Wallet Analysis**
   - AI shows wallet scanning animation
   - AI: "Great! I've analyzed your wallet. You have a portfolio worth $16,325 across 3 assets. Now let's understand your investment goals to create the perfect strategy for you."

3. **Investment Goals**
   - AI: "What are your primary investment goals?"
   - User: "I want to grow my wealth"
   - Expected: Auto-select "Capital Growth" option

4. **Occupation Selection** (NEW)
   - AI: "Perfect! Now, to help me explain investment strategies in terms you'll find most relatable, which occupation best describes you?"
   - User: "I'm a trucker"
   - Expected: Auto-select "Truck Driver" option

5. **Risk Tolerance**
   - AI: "Excellent choice! I'll use familiar concepts from your profession to explain our strategies. Now, let's talk about risk - how comfortable are you with market volatility?"
   - User: "I prefer playing it safe"
   - Expected: Auto-select "Conservative" option

6. **Timeline**
   - AI: "Got it! Now, how many years do you plan to keep your investments? This helps me recommend the right strategies for your timeline."
   - User: "10 years"
   - Expected: Auto-fill "10" in the input field

7. **Monthly Amount**
   - AI: "Great timeline! Finally, how much can you comfortably invest each month? Any amount works - I'll optimize strategies for your budget."
   - User: "$1500"
   - Expected: Auto-fill "1500" in the amount field

8. **Recommendations**
   - AI generates personalized recommendations with truck driver analogies

### Scenario 2: Mixed Input Types

Test mixing button clicks with natural language:

- Click "Connect Wallet" button manually
- Say "I want steady income" for investment goals
- Click "Retail Store Manager" manually
- Say "moderate risk please" for risk tolerance
- Type "5" manually for timeline
- Say "2000 dollars per month" for amount

### Scenario 3: Clarification Requests

Test unclear inputs:

- For occupation: "I work" → Should ask for clarification
- For risk: "not sure" → Should explain options
- For amount: "depends" → Should ask for specific amount

## Expected Natural Language Patterns

### Occupation Selection

- Chef: "I'm a chef", "I cook", "restaurant", "kitchen"
- Truck Driver: "trucker", "I drive trucks", "logistics", "transport"
- Retail Manager: "I manage a store", "retail", "sales manager"

### Investment Goals

- Growth: "grow wealth", "maximize returns", "appreciation"
- Income: "passive income", "steady returns", "cash flow"
- Preservation: "protect capital", "safe investment", "preserve wealth"

### Risk Tolerance

- Conservative: "safe", "low risk", "careful"
- Moderate: "balanced", "middle ground"
- Aggressive: "high risk", "maximum returns"

## Visual Feedback

When auto-actions are triggered:

1. Purple glow animation on the element being auto-clicked
2. Scale animation (1.05x) for emphasis
3. "AI thinking..." indicator in bottom right
4. Smooth transitions between steps

## Occupation-Specific Explanations

After selection, recommendations should include occupation-specific analogies:

### Truck Driver Examples:

- Stablecoins: "Like fuel cards that maintain steady value"
- Yield Farming: "Similar to optimizing routes for maximum profit"
- Liquidity Pools: "Like truck stops providing essential services"

### Chef Examples:

- Stablecoins: "Like keeping cash reserves for daily ingredients"
- Yield Farming: "Multiple revenue streams like different menu items"
- Liquidity Pools: "Like a well-stocked pantry others can use"

### Retail Manager Examples:

- Stablecoins: "Like gift cards that hold their value"
- Yield Farming: "Similar to loyalty programs generating repeat business"
- Liquidity Pools: "Like maintaining optimal inventory levels"
