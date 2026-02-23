#!/bin/bash
# Regenerate the migration dashboard and copy to Vercel deployment folder
# Usage: ./dashboard/update-dashboard.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Regenerating migration report..."
cd "$ROOT_DIR/tools/migration-factory"
npx tsx src/cli.ts report --project "$ROOT_DIR" --multi

echo "Copying to dashboard..."
cp "$ROOT_DIR/.openspec/migration/migration-report.html" "$SCRIPT_DIR/index.html"

echo "Dashboard updated. Commit and push to deploy on Vercel."
echo "  git add dashboard/index.html && git commit -m 'chore: update migration dashboard' && git push"
