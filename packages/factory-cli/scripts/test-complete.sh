#!/bin/bash
set -e

# COMPLETE TEST SCRIPT: Build + Dashboard + Playwright + Screenshots
# This script MUST pass before claiming "c'est fait"

export PATH="/c/Program Files/Volta:$PATH"

echo "═══════════════════════════════════════════════"
echo "  COMPLETE TEST - Migration Modal UI"
echo "═══════════════════════════════════════════════"

# Step 1: Build
echo ""
echo "📦 Step 1: Building TypeScript..."
cd /d/Projects/ClubMed/LecteurMagic/packages/factory-cli
pnpm build

# Step 2: Verify build
echo ""
echo "🔍 Step 2: Verifying build contains new columns..."
if ! grep -q '<th>Phase</th>' dist/dashboard/html-report.js; then
  echo "❌ FAIL: Phase column missing!"
  exit 1
fi
if ! grep -q '<th>En cours</th>' dist/dashboard/html-report.js; then
  echo "❌ FAIL: En cours column missing!"
  exit 1
fi
if ! grep -q '<th>Tokens</th>' dist/dashboard/html-report.js; then
  echo "❌ FAIL: Tokens column missing!"
  exit 1
fi
echo "✅ All columns present in build"

# Step 3: Kill old dashboards
echo ""
echo "🛑 Step 3: Killing old dashboard processes..."
netstat -ano | findstr :3070 | awk '{print $5}' | sort -u | xargs -I {} taskkill //F //PID {} 2>/dev/null || true
sleep 2

# Step 4: Start fresh dashboard from PROJECT ROOT
echo ""
echo "🚀 Step 4: Starting dashboard from project root..."
cd /d/Projects/ClubMed/LecteurMagic
node packages/factory-cli/dist/cli.js serve --port 3070 > /tmp/dashboard-final.log 2>&1 &
DASH_PID=$!
echo "Dashboard PID: $DASH_PID"

# Step 5: Wait for ready
echo ""
echo "⏳ Step 5: Waiting for dashboard..."
for i in {1..30}; do
  if curl -s http://localhost:3070 >/dev/null 2>&1; then
    echo "✅ Dashboard is UP"
    break
  fi
  sleep 1
done

# Step 6: Verify project loaded
echo ""
echo "🔍 Step 6: Verifying ADH project loaded..."
PROJECT_COUNT=$(curl -s http://localhost:3070 | grep -o "projets" | wc -l)
if [ "$PROJECT_COUNT" -lt 1 ]; then
  echo "❌ FAIL: No projects loaded!"
  cat /tmp/dashboard-final.log
  kill $DASH_PID
  exit 1
fi
echo "✅ Projects loaded"

# Step 7: Run Playwright test
echo ""
echo "🎭 Step 7: Running Playwright visual test..."
cd /d/Projects/ClubMed/LecteurMagic/packages/factory-cli
pnpm playwright test migrate-proof.spec.ts --project=chromium

TEST_RESULT=$?

# Step 8: Show screenshots
echo ""
echo "📸 Step 8: Screenshots captured:"
ls -lh test-results/proof-*.png 2>/dev/null || echo "No screenshots found"

# Cleanup
echo ""
echo "🧹 Cleanup: Stopping dashboard..."
kill $DASH_PID 2>/dev/null || true

if [ $TEST_RESULT -eq 0 ]; then
  echo ""
  echo "═══════════════════════════════════════════════"
  echo "✅  ALL TESTS PASSED"
  echo "═══════════════════════════════════════════════"
else
  echo ""
  echo "═══════════════════════════════════════════════"
  echo "❌  TESTS FAILED - See above for details"
  echo "═══════════════════════════════════════════════"
  exit 1
fi
