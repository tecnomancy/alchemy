#!/bin/bash
# Inspect CI status and review comments for a PR.
# Usage: ./scripts/pr-check.sh [pr-number]

set -e

PR=${1:-$(gh pr view --json number -q .number 2>/dev/null)}

if [[ -z "$PR" ]]; then
  echo "Usage: $0 <pr-number>"
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo "=== PR #$PR ==="
echo ""

echo "--- Status ---"
gh api "repos/$REPO/pulls/$PR" \
  --jq '"Title:     \(.title)\nState:     \(.state)\nMergeable: \(.mergeable_state)\nBranch:    \(.head.ref) -> \(.base.ref)"'
echo ""

echo "--- CI Checks ---"
SHA=$(gh api "repos/$REPO/pulls/$PR" --jq .head.sha)
gh api "repos/$REPO/commits/$SHA/check-runs" \
  --jq '.check_runs[] | "\(.conclusion // .status) \(.name)"' 2>/dev/null || echo "No checks found"
echo ""

echo "--- Reviews ---"
gh api "repos/$REPO/pulls/$PR/reviews" \
  --jq '.[] | "[\(.user.login)] \(.state)"' 2>/dev/null || echo "No reviews"
echo ""

echo "--- Inline Comments ---"
COUNT=$(gh api "repos/$REPO/pulls/$PR/comments" --jq 'length')
if [[ "$COUNT" -gt 0 ]]; then
  gh api "repos/$REPO/pulls/$PR/comments" \
    --jq '.[] | "[\(.user.login)] \(.path):\(.line // .original_line)\n\(.body)\n"'
else
  echo "None"
fi
echo ""

echo "--- General Comments ---"
GCOUNT=$(gh api "repos/$REPO/issues/$PR/comments" --jq 'length')
if [[ "$GCOUNT" -gt 0 ]]; then
  gh api "repos/$REPO/issues/$PR/comments" \
    --jq '.[] | "[\(.user.login)]\n\(.body | split("\n")[0:5] | join("\n"))\n---"'
else
  echo "None"
fi
