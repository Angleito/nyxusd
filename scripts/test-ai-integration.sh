#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 NyxUSD AI Integration Test Suite${NC}"
echo "======================================="

# Function to check if docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
}

# Function to cleanup
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    docker-compose -f docker-compose.test.yml down -v
    rm -rf logs/test-*.log
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Check prerequisites
check_docker

# Create logs directory
mkdir -p logs

# Start test environment
echo -e "\n${BLUE}🚀 Starting test environment...${NC}"
docker-compose -f docker-compose.test.yml up -d test-db test-redis

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Run property tests
echo -e "\n${BLUE}📊 Running property-based tests...${NC}"
echo "--------------------------------------"
npm run test tests/property/ai-service-properties.test.ts -- --verbose 2>&1 | tee logs/test-property.log

# Check property test results
if grep -q "FAIL" logs/test-property.log; then
    echo -e "${RED}❌ Property tests failed!${NC}"
    PROPERTY_TESTS_PASSED=false
else
    echo -e "${GREEN}✅ Property tests passed!${NC}"
    PROPERTY_TESTS_PASSED=true
fi

# Run integration tests with Docker
echo -e "\n${BLUE}🔗 Running integration tests...${NC}"
echo "--------------------------------------"
docker-compose -f docker-compose.test.yml run --rm test-runner 2>&1 | tee logs/test-integration.log

# Start API with logging for manual testing
echo -e "\n${BLUE}🖥️  Starting API with enhanced logging...${NC}"
echo "--------------------------------------"

# Create a test .env file
cat > .env.test <<EOF
NODE_ENV=test
PORT=8080
USE_MOCK_AI=true
LOG_LEVEL=debug
OPENAI_API_KEY=${OPENAI_API_KEY:-mock}
EOF

# Start the API
cd api
LOG_LEVEL=debug npm run dev 2>&1 | tee ../logs/test-api.log &
API_PID=$!
cd ..

# Wait for API to start
echo -e "${YELLOW}⏳ Waiting for API to start...${NC}"
sleep 5

# Run AI service tests
echo -e "\n${BLUE}🤖 Testing AI service endpoints...${NC}"
echo "--------------------------------------"

# Test health endpoint
echo -e "\n${YELLOW}Testing health endpoint...${NC}"
curl -s http://localhost:8080/api/ai/health | jq .

# Test chat endpoint with various scenarios
echo -e "\n${YELLOW}Testing chat endpoint...${NC}"

# Test 1: Wallet connection intent
echo -e "\n1️⃣ Testing wallet connection intent..."
curl -s -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "yes, connect my wallet",
    "sessionId": "test-session-1",
    "context": {
      "conversationStep": "wallet_prompt",
      "userProfile": {}
    }
  }' | jq .

# Test 2: Investment goal selection
echo -e "\n2️⃣ Testing investment goal selection..."
curl -s -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to focus on growth",
    "sessionId": "test-session-2",
    "context": {
      "conversationStep": "investment_goals",
      "userProfile": {}
    }
  }' | jq .

# Test 3: Numeric input for timeline
echo -e "\n3️⃣ Testing numeric input..."
curl -s -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "5 years",
    "sessionId": "test-session-3",
    "context": {
      "conversationStep": "timeline",
      "userProfile": {
        "investmentGoal": "growth"
      }
    }
  }' | jq .

# Analyze logs
echo -e "\n${BLUE}📈 Analyzing logs...${NC}"
echo "--------------------------------------"

# Check for errors in API logs
ERROR_COUNT=$(grep -c "error" logs/test-api.log 2>/dev/null || echo "0")
WARN_COUNT=$(grep -c "warn" logs/test-api.log 2>/dev/null || echo "0")

echo -e "API Log Analysis:"
echo -e "  Errors: ${ERROR_COUNT}"
echo -e "  Warnings: ${WARN_COUNT}"

# Check for AI-specific logs
AI_REQUESTS=$(grep -c "AI request received" logs/test-api.log 2>/dev/null || echo "0")
AI_INTENTS=$(grep -c "Intent detected" logs/test-api.log 2>/dev/null || echo "0")

echo -e "\nAI Service Metrics:"
echo -e "  Total AI requests: ${AI_REQUESTS}"
echo -e "  Intents detected: ${AI_INTENTS}"

# Performance analysis
echo -e "\n${BLUE}⚡ Performance Analysis...${NC}"
echo "--------------------------------------"

if [ -f logs/test-api.log ]; then
    # Extract request durations
    echo "Request durations:"
    grep "AI request completed" logs/test-api.log | grep -oE "duration: [0-9]+ms" | sort -n | head -10
fi

# Generate summary report
echo -e "\n${BLUE}📋 Test Summary Report${NC}"
echo "======================================="

TOTAL_TESTS=0
PASSED_TESTS=0

# Count property test results
if [ "$PROPERTY_TESTS_PASSED" = true ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Count integration test results
if grep -q "All tests completed!" logs/test-integration.log 2>/dev/null; then
    echo -e "${GREEN}✅ Integration tests: PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Integration tests: FAILED${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# API health check
if curl -s http://localhost:8080/api/ai/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ API health check: PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ API health check: FAILED${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo -e "\n${BLUE}Final Score: ${PASSED_TESTS}/${TOTAL_TESTS} tests passed${NC}"

# Stop the API
kill $API_PID 2>/dev/null

# Save test artifacts
echo -e "\n${BLUE}💾 Saving test artifacts...${NC}"
mkdir -p test-results
cp logs/test-*.log test-results/
echo "Test run completed at $(date)" > test-results/summary.txt
echo "Tests passed: ${PASSED_TESTS}/${TOTAL_TESTS}" >> test-results/summary.txt

echo -e "\n${GREEN}✨ Test suite completed!${NC}"
echo "Test results saved in test-results/"