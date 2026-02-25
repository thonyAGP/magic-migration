#!/bin/bash
set -e

# Test script: Launch dashboard + run visual migration test + cleanup
export PATH="/c/Program Files/Volta:$PATH"

cd "$(dirname "$0")/.."

echo "🚀 Starting dashboard server..."
node dist/cli.js serve --project ADH --port 3070 > /tmp/dashboard.log 2>&1 &
DASHBOARD_PID=$!

echo "⏳ Waiting for dashboard to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:3070 > /dev/null 2>&1; then
    echo "✓ Dashboard is ready (PID: $DASHBOARD_PID)"
    break
  fi
  sleep 1
done

if ! curl -s http://localhost:3070 > /dev/null 2>&1; then
  echo "✗ Dashboard failed to start"
  kill $DASHBOARD_PID 2>/dev/null || true
  exit 1
fi

echo "🎭 Running Playwright visual test..."
pnpm playwright test migrate-modal-visual.spec.ts --project=chromium
TEST_EXIT=$?

echo "🛑 Stopping dashboard..."
kill $DASHBOARD_PID 2>/dev/null || true

if [ $TEST_EXIT -eq 0 ]; then
  echo "✅ Visual test passed!"
  echo "📸 Screenshots in test-results/visual-*.png"
else
  echo "❌ Visual test failed"
fi

exit $TEST_EXIT
