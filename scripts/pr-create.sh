#!/bin/bash
# Create a PR with labels and milestone inherited from the linked issue.
# Adds the PR to the mago-office project automatically.
# Usage: ./scripts/pr-create.sh [issue-number]

set -e

cd "$(git rev-parse --show-toplevel)"

BRANCH=$(git branch --show-current)

if [[ -n "$1" ]]; then
  ISSUE=$1
else
  ISSUE=$(echo "$BRANCH" | grep -oP 'issue-\K\d+' || echo "")
fi

if [[ -z "$ISSUE" ]]; then
  echo "Error: no issue number found in branch name and none provided"
  echo "Usage: $0 <issue-number>"
  exit 1
fi

echo "==> Fetching issue #$ISSUE..."

ISSUE_LABELS=$(gh issue view "$ISSUE" --json labels -q '.labels[].name' 2>/dev/null | tr '\n' ',' | sed 's/,$//')
MILESTONE=$(gh issue view "$ISSUE" --json milestone -q '.milestone.title' 2>/dev/null || echo "")
ISSUE_TITLE=$(gh issue view "$ISSUE" --json title -q '.title' 2>/dev/null || echo "")
ISSUE_BODY=$(gh issue view "$ISSUE" --json body -q '.body' 2>/dev/null || echo "")

TYPE=$(echo "$BRANCH" | cut -d'/' -f1)
case $TYPE in
  feat)  EXTRA="enhancement" ;;
  fix)   EXTRA="bug" ;;
  test)  EXTRA="good first issue" ;;
  docs)  EXTRA="documentation" ;;
  ci|chore) EXTRA="" ;;
  *)     EXTRA="" ;;
esac

if [[ -n "$ISSUE_LABELS" && -n "$EXTRA" ]]; then
  LABELS=$(echo "$ISSUE_LABELS,$EXTRA" | tr ',' '\n' | sort -u | tr '\n' ',' | sed 's/,$//')
elif [[ -n "$ISSUE_LABELS" ]]; then
  LABELS="$ISSUE_LABELS"
else
  LABELS="$EXTRA"
fi

TITLE=$(git log -1 --format=%s)

PR_BODY="Closes #$ISSUE"
if [[ -n "$ISSUE_BODY" ]]; then
  PR_BODY="Closes #$ISSUE

## Context

$ISSUE_BODY"
fi

if ! git ls-remote --heads origin "$BRANCH" | grep -q "$BRANCH"; then
  echo "==> Pushing branch..."
  git push -u origin "$BRANCH"
fi

echo ""
echo "==> Creating PR..."
echo "  Title:     $TITLE"
echo "  Labels:    ${LABELS:-none}"
echo "  Milestone: ${MILESTONE:-none}"
echo "  Issue:     #$ISSUE"
echo ""

ARGS=(--title "$TITLE" --body "$PR_BODY")

if [[ -n "$LABELS" ]]; then
  ARGS+=(--label "$LABELS")
fi

if [[ -n "$MILESTONE" ]]; then
  ARGS+=(--milestone "$MILESTONE")
fi

gh pr create "${ARGS[@]}"

PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null || echo "")
if [[ -n "$PR_NUMBER" ]]; then
  REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
  echo ""
  echo "==> Adding PR to project..."
  gh project item-add 2 --owner roxdavirox \
    --url "https://github.com/$REPO/pull/$PR_NUMBER" 2>/dev/null \
    && echo "  Added to mago-office" \
    || echo "  Could not add to project (non-fatal)"
fi

echo ""
echo "==> Done."
