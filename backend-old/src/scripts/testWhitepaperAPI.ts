#!/usr/bin/env ts-node

import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { convertMainWhitepaper } from '../services/simpleWhitepaperConverter';

/**
 * Test script to verify the whitepaper conversion API functionality
 * This simulates what the API endpoint would do
 */
async function testWhitepaperAPI(): Promise<void> {
  console.log('🧪 Testing whitepaper conversion API functionality...');
  console.log('');

  const result = await pipe(
    convertMainWhitepaper(),
    TE.fold(
      (error) => async () => ({
        success: false,
        error: error.message,
        errorType: error._tag
      }),
      (result) => async () => ({
        success: true,
        data: result
      })
    )
  )();

  if (result.success) {
    console.log('✅ API Test Result: SUCCESS');
    console.log('');
    console.log('📋 Response would be:');
    console.log(JSON.stringify({
      success: true,
      message: 'Whitepaper successfully converted',
      data: {
        pdfPath: result.data.pdfPath,
        docxPath: result.data.docxPath,
        message: result.data.message
      }
    }, null, 2));
  } else {
    console.log('❌ API Test Result: FAILURE');
    console.log('');
    console.log('📋 Error response would be:');
    console.log(JSON.stringify({
      success: false,
      error: result.error,
      errorType: result.errorType
    }, null, 2));
  }

  console.log('');
  console.log('🎯 API endpoint testing completed!');
}

// Run the test
if (require.main === module) {
  testWhitepaperAPI().catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
}

export { testWhitepaperAPI };