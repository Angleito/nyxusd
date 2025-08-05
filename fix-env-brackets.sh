#!/bin/bash

# Fix all process.env bracket notation in API files
echo "Fixing environment variable access patterns..."

# List of files to fix
FILES=(
  "api/voice-health.ts"
  "api/utils/cors.ts"
  "api/voice/stt.ts"
  "api/voice/conversational-agent.ts"
  "api/voice/session.ts"
  "api/voice/tts.ts"
  "api/voice/config.ts"
  "api/ai/chat.ts"
  "api/ai/test-config.ts"
  "api/ai/chat-stream.ts"
  "api/system.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "/Users/angel/Projects/nyxusd/$file" ]; then
    echo "Processing $file..."
    # Replace process.env['VAR'] with process.env.VAR
    sed -i '' "s/process\.env\['\([^']*\)'\]/process.env.\1/g" "/Users/angel/Projects/nyxusd/$file"
  fi
done

echo "✅ Fixed environment variable access patterns"