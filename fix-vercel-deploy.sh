#!/bin/bash

echo "🔧 Fixing Vercel deployment issues..."

# Check if environment variables are set
echo "📝 Checking environment variables..."

if ! vercel env ls --prod 2>/dev/null | grep -q "ELEVENLABS_API_KEY"; then
    echo "⚠️  ELEVENLABS_API_KEY not found in production"
    echo "Please run: vercel env add ELEVENLABS_API_KEY production"
fi

if ! vercel env ls --prod 2>/dev/null | grep -q "JWT_SECRET"; then
    echo "⚠️  JWT_SECRET not found in production"
    echo "Please run: vercel env add JWT_SECRET production"
    echo "You can generate one with: openssl rand -base64 32"
fi

if ! vercel env ls --prod 2>/dev/null | grep -q "OPENAI_API_KEY"; then
    echo "⚠️  OPENAI_API_KEY not found in production"
    echo "Please run: vercel env add OPENAI_API_KEY production"
fi

echo ""
echo "📋 Summary of fixes applied:"
echo "1. ✅ Removed 'public: true' from vercel.json to fix manifest.json 401"
echo "2. ✅ API routes already handle OPTIONS correctly"
echo "3. ⚠️  Need to add missing environment variables (see above)"
echo ""
echo "After adding env vars, deploy with: vercel --prod"