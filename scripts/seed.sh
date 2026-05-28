#!/usr/bin/env bash
# Upload the sample documents to the running backend.
#
# Usage:
#   bash scripts/seed.sh                 # http://localhost:8000
#   API_BASE=http://my-host:8000 bash scripts/seed.sh

set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8000}"
SAMPLE_DIR="$(cd "$(dirname "$0")/.." && pwd)/sample-documents"

echo "→ Seeding knowledge base at $API_BASE from $SAMPLE_DIR"

# Wait for backend to become healthy.
for attempt in $(seq 1 30); do
  if curl -sf "$API_BASE/health" > /dev/null; then
    break
  fi
  echo "  ...waiting for backend (attempt $attempt/30)"
  sleep 1
done

for file in "$SAMPLE_DIR"/*.md "$SAMPLE_DIR"/*.txt "$SAMPLE_DIR"/*.pdf; do
  [ -f "$file" ] || continue
  echo "  uploading $(basename "$file")"
  curl -sf -X POST -F "file=@${file}" "$API_BASE/documents/upload" > /dev/null
done

echo "✓ Seed complete. List documents with: curl $API_BASE/documents | jq"
