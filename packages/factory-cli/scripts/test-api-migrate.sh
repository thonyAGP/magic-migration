#!/bin/bash
# Test: API /api/migrate/stream returns correct events with tokens

export PATH="/c/Program Files/Volta:$PATH"
cd /d/Projects/ClubMed/LecteurMagic

echo "🧪 Testing /api/migrate/stream API..."
echo ""

# Launch 1 program migration via API (dry-run, fast)
curl -N "http://localhost:3070/api/migrate/stream?batch=B8&targetDir=../adh-web&parallel=1&dryRun=true" 2>/dev/null | head -100 > /tmp/sse-events.txt &
CURL_PID=$!

echo "⏳ Waiting 15s for events..."
sleep 15

# Kill curl
kill $CURL_PID 2>/dev/null || true

echo ""
echo "📋 Captured events:"
cat /tmp/sse-events.txt

echo ""
echo "🔍 Verifying event structure..."

# Check for phase events
if grep -q "phase_started" /tmp/sse-events.txt; then
  echo "✅ phase_started events present"
else
  echo "❌ phase_started events missing"
fi

if grep -q "phase_completed" /tmp/sse-events.txt; then
  echo "✅ phase_completed events present"
else
  echo "❌ phase_completed events missing"
fi

# Check for program events
if grep -q "program_started" /tmp/sse-events.txt; then
  echo "✅ program_started events present"
else
  echo "❌ program_started events missing"
fi

if grep -q "program_completed" /tmp/sse-events.txt; then
  echo "✅ program_completed events present"
else
  echo "❌ program_completed events missing"
fi

# Check for tokens in events
if grep -q "tokens" /tmp/sse-events.txt; then
  echo "✅ tokens data present in events"
else
  echo "❌ tokens data missing from events"
fi

echo ""
echo "📊 Event types found:"
grep -o 'event: [a-z_]*' /tmp/sse-events.txt | sort | uniq -c || echo "No events found"
