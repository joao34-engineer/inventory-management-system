#!/bin/bash
# End-to-End Test Runner for SafeSite API
# This script starts the API server and runs comprehensive E2E tests

set -e  # Exit on error

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}SafeSite API - E2E Test Runner${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if database is configured
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Warning: DATABASE_URL not set. Using default from .env${NC}"
fi

# Set test environment
export APP_STAGE=test
export PORT=${PORT:-3001}
export API_URL="http://localhost:${PORT}"

echo -e "${BLUE}→${NC} Environment: ${GREEN}test${NC}"
echo -e "${BLUE}→${NC} Port: ${GREEN}${PORT}${NC}"
echo -e "${BLUE}→${NC} API URL: ${GREEN}${API_URL}${NC}\n"

# Check if server is already running
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Server is already running on port ${PORT}${NC}"
    echo -e "${YELLOW}Using existing server instance...${NC}\n"
    SERVER_ALREADY_RUNNING=true
else
    SERVER_ALREADY_RUNNING=false
    
    # Push database schema
    echo -e "${BLUE}→${NC} Setting up database schema...\n"
    npm run db:push
    
    echo -e "\n${BLUE}→${NC} Starting API server on port ${PORT}...\n"
    
    # Start server in background
    APP_STAGE=test PORT=${PORT} node src/index.ts > /tmp/safesite-e2e-server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to be ready
    echo -e "${BLUE}→${NC} Waiting for server to be ready..."
    MAX_RETRIES=30
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s "${API_URL}/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Server is ready!\n"
            break
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            echo -e "${RED}✗ Server failed to start after ${MAX_RETRIES} seconds${NC}"
            echo -e "\n${YELLOW}Server logs:${NC}"
            cat /tmp/safesite-e2e-server.log
            kill $SERVER_PID 2>/dev/null || true
            exit 1
        fi
        
        sleep 1
        echo -n "."
    done
fi

# Run E2E tests
echo -e "${BOLD}${BLUE}Running E2E Tests...${NC}\n"

# Run the test script
if node scripts/e2e-test.ts; then
    TEST_EXIT_CODE=0
    echo -e "${GREEN}${BOLD}✓ E2E tests completed successfully!${NC}\n"
else
    TEST_EXIT_CODE=$?
    echo -e "${RED}${BOLD}✗ E2E tests failed${NC}\n"
fi

# Cleanup: Stop server if we started it
if [ "$SERVER_ALREADY_RUNNING" = false ]; then
    echo -e "${BLUE}→${NC} Stopping server (PID: ${SERVER_PID})..."
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Server stopped\n"
fi

# Generate HTML report if test results exist
if [ -f "reports/e2e-results.json" ]; then
    echo -e "${BLUE}→${NC} Generating HTML report..."
    if [ -f "scripts/generate-report.ts" ]; then
        node scripts/generate-report.ts
        if [ -f "reports/e2e-report.html" ]; then
            echo -e "${GREEN}✓${NC} HTML report generated: ${BLUE}reports/e2e-report.html${NC}\n"
        fi
    fi
fi

# Exit with test status
exit $TEST_EXIT_CODE
