#!/bin/bash
# Create a standardized branch from an issue number.
# Usage: ./scripts/branch-create.sh <issue-number>

set -e

ISSUE=$1

if [[ -z "$ISSUE" ]]; then
  echo "Usage: $0 <issue-number>"
  echo ""
  echo "Example: $0 3"
  exit 1
fi

cd "$(git rev-parse --show-toplevel)"

TITLE=$(gh issue view "$ISSUE" --json title -q .title)

if [[ -z "$TITLE" ]]; then
  echo "Error: issue #$ISSUE not found"
  exit 1
fi

TYPE=$(echo "$TITLE" | grep -oP '^\w+' | tr '[:upper:]' '[:lower:]')
SLUG=$(echo "$TITLE" | sed 's/.*: //' | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | cut -c1-30 | sed 's/-$//')
BRANCH="$TYPE/issue-$ISSUE-$SLUG"

git checkout main
git pull origin main
git checkout -b "$BRANCH"

echo ""
echo "Branch: $BRANCH"
echo ""
echo "Next:"
echo "  git add . && git commit -m \"$TYPE(scope): description\""
echo "  ./scripts/pr-create.sh"
