#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:3000}"
EMAIL="${EMAIL:-student@example.com}"
PASSWORD="${PASSWORD:-Algebra123}"
PROBLEM_ID="algebra-avengers-basic-1-problem-1"

if ! command -v jq >/dev/null; then
  echo "jq is required for this script." >&2
  exit 1
fi

echo "Logging in as $EMAIL"
LOGIN_RESPONSE="$(curl -s -w '\n%{http_code}' -X POST "$API_BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")"
LOGIN_BODY="${LOGIN_RESPONSE%$'\n'*}"
LOGIN_STATUS="${LOGIN_RESPONSE##*$'\n'}"

if [[ "$LOGIN_STATUS" != "200" ]]; then
  echo "Login failed with status $LOGIN_STATUS" >&2
  echo "$LOGIN_BODY" | jq >&2
  exit 1
fi

TOKEN="$(echo "$LOGIN_BODY" | jq -r '.token')"

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Failed to extract JWT token from login response" >&2
  exit 1
fi

echo "JWT acquired. Fetching problem $PROBLEM_ID"
curl -s "$API_BASE/problems/$PROBLEM_ID" | jq

echo "Submitting correct attempt"
ATTEMPT_RESPONSE="$(curl -s -w '\n%{http_code}' -X POST "$API_BASE/problems/$PROBLEM_ID/attempts" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"outcome":"CORRECT","hintsUsed":1,"timeSpentSec":95,"response":"Solved by isolating x"}')"
ATTEMPT_BODY="${ATTEMPT_RESPONSE%$'\n'*}"
ATTEMPT_STATUS="${ATTEMPT_RESPONSE##*$'\n'}"

echo "Status: $ATTEMPT_STATUS"
echo "$ATTEMPT_BODY" | jq

if [[ "$ATTEMPT_STATUS" != "201" ]]; then
  echo "Attempt failed" >&2
  exit 1
fi

echo "Attempt stored. Check Neon: SELECT * FROM \"UserProgress\";"
