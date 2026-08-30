#!/bin/bash
# blocks the em dash character specifically, not "--", which has legitimate uses in code

INPUT=$(cat)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_str // empty')

if echo "$CONTENT" | grep -q $'\xe2\x80\x94'; then
  echo "Blocked: em dash found. Use a single hyphen instead." >&2
  exit 2
fi

exit 0