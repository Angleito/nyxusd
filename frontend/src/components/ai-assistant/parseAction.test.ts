// Test file for parseAction function
const parseAction = (text: string): any | null => {
  // Check for ##ACTION## format (single line)
  const singleLineMatch = text.split('\n').find((l) => l.trim().startsWith('##ACTION##'));
  if (singleLineMatch) {
    const jsonPart = singleLineMatch.replace('##ACTION##', '').trim();
    try {
      return JSON.parse(jsonPart);
    } catch {
      return null;
    }
  }
  
  // Check for ```ACTION format (code block)
  const codeBlockRegex = /```ACTION\s*([\s\S]*?)\s*```/;
  const codeBlockMatch = text.match(codeBlockRegex);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      return null;
    }
  }
  
  return null;
};

// Test cases
console.log('Testing ##ACTION## format:');
const singleLineTest = `This is a test message
##ACTION## {"type":"cdp_create","collateral":"ETH","amount":"1.5"}
More text here`;
console.log(parseAction(singleLineTest));

console.log('\nTesting ```ACTION format:');
const codeBlockTest = `This is a test message
\`\`\`ACTION
{"type":"pool_deposit","pool":"safe","amount":"1000"}
\`\`\`
More text here`;
console.log(parseAction(codeBlockTest));

console.log('\nTesting ```ACTION format without newlines:');
const codeBlockTest2 = 'This is a test message ```ACTION {"type":"yield_check","pool":"medium"} ``` More text here';
console.log(parseAction(codeBlockTest2));