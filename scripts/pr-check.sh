#!/bin/bash
# Review loop for a feature PR:
#   1. Wait for CI to pass
#   2. Print full diff + context for review
#   3. After review fixes → commit + push
#   4. Merge
#
# Usage: ./scripts/pr-check.sh [pr-number]
#
# This script only handles orchestration.
# The review itself is done by Claude (run this, then invoke the review skill).

set -e

PR=${1:-$(gh pr view --json number -q .number 2>/dev/null)}

if [[ -z "$PR" ]]; then
  echo "Usage: $0 <pr-number>"
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo "================================================================"
echo "  PR #$PR — Review Loop"
echo "================================================================"
echo ""

# ── 1. PR metadata ────────────────────────────────────────────────
echo "── PR Info ──"
gh api "repos/$REPO/pulls/$PR" \
  --jq '"  Title:  \(.title)\n  Branch: \(.head.ref) → \(.base.ref)\n  State:  \(.state)\n  URL:    \(.html_url)"'
echo ""

# ── 2. Wait for CI ────────────────────────────────────────────────
echo "── CI Status ──"
SHA=$(gh api "repos/$REPO/pulls/$PR" --jq .head.sha)

MAX_WAIT=300   # 5 minutes
WAITED=0
INTERVAL=15

while true; do
  CHECKS=$(gh api "repos/$REPO/commits/$SHA/check-runs" \
    --jq '[.check_runs[] | {name: .name, status: .status, conclusion: .conclusion}]')

  PENDING=$(echo "$CHECKS" | python3 -c "
import sys, json
runs = json.load(sys.stdin)
print(sum(1 for r in runs if r['status'] != 'completed'))
")

  if [[ "$PENDING" -eq 0 ]]; then
    break
  fi

  if [[ "$WAITED" -ge "$MAX_WAIT" ]]; then
    echo "  TIMEOUT: CI still running after ${MAX_WAIT}s"
    exit 1
  fi

  echo "  Waiting for CI ($PENDING checks pending)..."
  sleep "$INTERVAL"
  WAITED=$((WAITED + INTERVAL))
done

FAILED=$(gh api "repos/$REPO/commits/$SHA/check-runs" \
  --jq '[.check_runs[] | select(.conclusion != "success" and .conclusion != "skipped")] | length')

echo "$CHECKS" | python3 -c "
import sys, json
runs = json.load(sys.stdin)
for r in runs:
    icon = '✓' if r['conclusion'] in ('success','skipped') else '✗'
    print(f'  {icon} {r[\"name\"]} — {r[\"conclusion\"] or r[\"status\"]}')
"

if [[ "$FAILED" -gt 0 ]]; then
  echo ""
  echo "  FAIL: $FAILED check(s) did not pass. Fix before review."
  exit 1
fi
echo ""

# ── 3. Full diff ──────────────────────────────────────────────────
echo "── Diff (vs main) ──"
gh pr diff "$PR"
echo ""

# ── 4. Test coverage delta ────────────────────────────────────────
echo "── Files changed ──"
gh pr view "$PR" --json files --jq '.files[] | "  \(.additions)+  \(.deletions)-  \(.path)"'
echo ""

# ── 5. Review instructions ────────────────────────────────────────
echo "================================================================"
echo "  REVIEW STEP"
echo "================================================================"
echo ""
echo "  Claude: run the review skill on the diff above."
echo "  Classify each finding as:"
echo ""
echo "    CRITICAL  — must fix before merge (correctness, type safety, breaking API)"
echo "    MINOR     — open as GitHub issue, merge after"
echo "    STYLE     — open as GitHub issue, merge after"
echo ""
echo "  After fixes are pushed to the branch:"
echo ""
echo "    gh pr merge $PR --squash --delete-branch"
echo ""
echo "================================================================"
