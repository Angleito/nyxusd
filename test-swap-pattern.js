// Test the swap detection pattern fix
const testPattern = /(?:want\s+to\s+)?swap\s+(?:tokens\s+)?(\w+)\s+(?:and|for|to|with)\s+(\w+)/i;

const testCases = [
  "I want to swap tokens aero and eth",
  "swap tokens aero and eth", 
  "I want to swap USDC and AERO",
  "swap ETH for USDC",
  "want to swap tokens bitcoin and ethereum"
];

console.log("Testing swap pattern detection:\n");

testCases.forEach(testCase => {
  const match = testCase.match(testPattern);
  if (match) {
    console.log(`✓ "${testCase}"`);
    console.log(`  Input: ${match[1].toUpperCase()}, Output: ${match[2].toUpperCase()}\n`);
  } else {
    console.log(`✗ "${testCase}" - NO MATCH\n`);
  }
});