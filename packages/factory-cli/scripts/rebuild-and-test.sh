#!/bin/bash
set -e

# Script: Rebuild + Restart Dashboard + Verify
# Usage: bash scripts/rebuild-and-test.sh

export PATH="/c/Program Files/Volta:$PATH"
cd "$(dirname "$0")/.."

echo "🔨 Building TypeScript..."
pnpm build

echo "🔍 Verifying build contains new columns..."
if ! grep -q '<th>Phase</th>' dist/dashboard/html-report.js; then
  echo "❌ ERROR: Phase column missing in build!"
  exit 1
fi
if ! grep -q '<th>En cours</th>' dist/dashboard/html-report.js; then
  echo "❌ ERROR: En cours column missing in build!"
  exit 1
fi
if ! grep -q '<th>Tokens</th>' dist/dashboard/html-report.js; then
  echo "❌ ERROR: Tokens column missing in build!"
  exit 1
fi
echo "✓ All 3 columns present in build"

echo "🛑 Killing old dashboard processes..."
pkill -f "cli.js serve" 2>/dev/null || true
taskkill //F //FI "WINDOWTITLE eq *serve*" 2>/dev/null || true
sleep 2

echo "🚀 Starting dashboard on port 3070..."
node dist/cli.js serve --project ADH --port 3070 > /tmp/dashboard-test.log 2>&1 &
DASHBOARD_PID=$!
echo "Dashboard PID: $DASHBOARD_PID"

echo "⏳ Waiting for dashboard to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:3070 > /dev/null 2>&1; then
    echo "✓ Dashboard is responding"
    break
  fi
  sleep 1
done

if ! curl -s http://localhost:3070 > /dev/null 2>&1; then
  echo "❌ Dashboard failed to start!"
  cat /tmp/dashboard-test.log
  exit 1
fi

echo ""
echo "✅ Dashboard ready at http://localhost:3070"
echo ""
echo "📸 MANUAL TEST REQUIRED:"
echo "1. Open http://localhost:3070 in browser"
echo "2. Navigate to ADH project"
echo "3. Select batch B8"
echo "4. Click 'Migrer Module' button"
echo "5. Launch migration"
echo "6. VERIFY:"
echo "   - Table has 9 columns: IDE, Programme, Icon, Durée, Phase, Phases, En cours, ETA, Tokens"
echo "   - 'En cours' column fills with current phase name"
echo "   - 'Phase' column shows last completed phase"
echo "   - 'Tokens' column shows 'X.XK/X.XK' format after completion"
echo ""
echo "Dashboard logs: tail -f /tmp/dashboard-test.log"
echo "Stop dashboard: kill $DASHBOARD_PID"
