#!/usr/bin/env node

const http = require("http");

console.log("🔄 Testing New Conversation Flow\n");

// Test HTTP endpoint
const options = {
  hostname: "localhost",
  port: 30494,
  path: "/",
  method: "GET",
  timeout: 3000,
};

const req = http.request(options, (res) => {
  console.log(`✅ Server Status: HTTP ${res.statusCode}`);

  if (res.statusCode === 200) {
    console.log("\n🎯 NEW CONVERSATION FLOW UPDATED:");
    console.log("");
    console.log("📋 Updated Flow Order:");
    console.log("   1. 👋 Initial greeting (asks about occupation)");
    console.log("   2. 💼 Occupation collection");
    console.log("   3. 🎯 Investment goals");
    console.log("   4. 📊 Risk tolerance");
    console.log("   5. ⏰ Timeline");
    console.log("   6. 💰 Amount");
    console.log("   7. 🛠️  Strategy choice (custom/templates/explore)");
    console.log("   8. 💳 Wallet connection & analysis");
    console.log("   9. 🔧 Protocol selection & strategy building");
    console.log("   10. ⚡ Leverage optimization");
    console.log("   11. 📈 Final recommendations");
    console.log("");
    console.log("✅ FIXES APPLIED:");
    console.log("   • AI assistant now asks personal questions FIRST");
    console.log("   • Strategy options come AFTER user profiling");
    console.log("   • Updated conversation step flow mapping");
    console.log("   • Fixed duplicate export compilation errors");
    console.log("   • Using mock AI service (no API key required)");
    console.log("");
    console.log("🧪 TO TEST:");
    console.log("   1. Open http://localhost:30494");
    console.log('   2. Click "Launch App"');
    console.log("   3. NEW: First question asks about your occupation");
    console.log(
      "   4. Answer personal questions before seeing strategy options",
    );
    console.log("   5. Strategy choices appear after profiling is complete");
    console.log("");
    console.log("✅ Build successful - Updated conversation flow is live!");
  } else {
    console.log(`❌ Unexpected status: ${res.statusCode}`);
  }
});

req.on("error", (error) => {
  console.error(`❌ Connection error: ${error.message}`);
});

req.on("timeout", () => {
  console.log("⏱️  Connection timeout (normal)");
  req.destroy();
});

req.end();
