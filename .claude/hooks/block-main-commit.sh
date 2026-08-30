#!/bin/bash
# blocks commits and pushes to main so every change is forced through a PR

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE '\bgit (commit|push)\b'; then
  BRANCH=$(git branch --show-current 2>/dev/null)
  if [ "$BRANCH" = "main" ]; then
    echo "Blocked: direct commits to main are not allowed. Create a branch and open a PR." >&2
    exit 2
  fi
fi

exit 0