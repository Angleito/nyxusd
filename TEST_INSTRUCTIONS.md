# Testing Instructions for NyxUSD AI Assistant

## Application Status

✅ Docker containers are running successfully

- Frontend: http://localhost:4001
- Mock API: http://localhost:4080

## What's Been Implemented

### 1. Occupation-Based Investment Explanations

- Added occupation selection step to the AI assistant questionnaire
- Three occupations available: Chef, Truck Driver, Retail Store Manager
- Each occupation receives customized investment strategy explanations

### 2. Launch App Navigation

- The "Launch App" button on the hero section now navigates directly to the AI Assistant
- Navigation menu includes "AI Portfolio Assistant" link

## Testing Steps

### 1. Access the Application

Open your browser and navigate to: http://localhost:4001

### 2. Test the Launch App Button

1. On the home page, click the purple "Launch App" button
2. You should be taken directly to the AI Assistant page

### 3. Complete the AI Assistant Flow

#### Step 1: Welcome

- You'll see a welcome message from Nyx, the AI assistant

#### Step 2: Wallet Connection

- Click "Connect Wallet" (mock wallet will be connected)

#### Step 3: Investment Goals

Select one of:

- Capital Growth
- Regular Income
- Capital Preservation

#### Step 4: Occupation Selection (NEW!)

Select your occupation:

- **Chef** - Restaurant or culinary professional
- **Truck Driver** - Professional driver or logistics
- **Retail Store Manager** - Retail management or operations

#### Step 5: Risk Tolerance

Select your risk level:

- Conservative
- Moderate
- Aggressive

#### Step 6: Investment Timeline

Enter your investment horizon in years (e.g., 10)

#### Step 7: Monthly Investment Amount

Enter how much you can invest monthly (e.g., 1000)

#### Step 8: View Recommendations

You'll receive personalized investment recommendations with:

- Portfolio allocation pie chart
- Risk-appropriate strategies
- **Occupation-specific explanations** for each strategy

## Example Occupation-Specific Explanations

### For a Chef (Conservative Strategy):

> "Like keeping cash reserves for daily ingredient purchases, this strategy provides steady income (4-8% APY) without the volatility. It's your working capital that earns while staying liquid for operations."

### For a Truck Driver (Moderate Strategy):

> "Similar to taking consistent contract freight with performance bonuses. Reliable base pay with upside potential based on efficiency."

### For a Retail Manager (Aggressive Strategy):

> "Like opening pop-up stores in high-traffic seasons - higher risk and effort but potentially exceptional returns."

## Troubleshooting

If containers aren't running:

```bash
docker compose -f docker-compose.simple.yml down
docker compose -f docker-compose.simple.yml up -d
```

To view logs:

```bash
docker compose -f docker-compose.simple.yml logs -f
```

To rebuild after changes:

```bash
npm run build:frontend
docker compose -f docker-compose.simple.yml restart frontend
```

## Clean Up

When done testing:

```bash
docker compose -f docker-compose.simple.yml down
```
