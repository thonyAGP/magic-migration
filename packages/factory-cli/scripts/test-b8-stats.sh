#!/bin/bash
set -e

export PATH="/c/Program Files/Volta:$PATH"

echo "🔨 Building..."
cd /d/Projects/ClubMed/LecteurMagic/packages/factory-cli
pnpm build >/dev/null

echo "🛑 Killing dashboard..."
PID=$(netstat -ano | findstr :3070 | awk 'NR==1{print $5}')
if [ ! -z "$PID" ]; then
  taskkill //F //PID $PID 2>/dev/null || true
  sleep 2
fi

echo "🚀 Starting dashboard..."
cd /d/Projects/ClubMed/LecteurMagic
node packages/factory-cli/dist/cli.js serve --port 3070 >/dev/null 2>&1 &
DASH_PID=$!

echo "⏳ Waiting for dashboard..."
sleep 10

echo ""
echo "🧪 Testing API /api/status for B8..."
curl -s http://localhost:3070/api/status > ~/b8-stats.json

echo ""
echo "📊 B8 Stats from API:"
cat ~/b8-stats.json | python -m json.tool 2>/dev/null | grep -A 10 '"id": "B8"' || cat ~/b8-stats.json | python -m json.tool | sed -n '/B8/,+10p'

echo ""
echo "Dashboard PID: $DASH_PID (kill manually if needed)"
