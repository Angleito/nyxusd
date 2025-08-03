#!/usr/bin/env ts-node

import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { convertMainWhitepaper } from '../services/whitepaperConversionService';

/**
 * Standalone script to generate PDF and DOCX files from the whitepaper markdown
 * Usage: ts-node src/scripts/generateWhitepaperFiles.ts
 */
async function main(): Promise<void> {
  console.log('🚀 Starting whitepaper conversion process...');
  console.log('📄 Input: /Users/angel/Projects/nyxusd/frontend/public/whitepaper/whitepaper2.md');
  console.log('📁 Output: /Users/angel/Projects/nyxusd/frontend/public/whitepaper/');
  console.log('');

  const result = await pipe(
    convertMainWhitepaper(),
    TE.fold(
      (error) => async () => {
        console.error('❌ Conversion failed:');
        console.error(`   Type: ${error._tag}`);
        console.error(`   Message: ${error.message}`);
        process.exit(1);
      },
      (result) => async () => {
        console.log('✅ Conversion completed successfully!');
        console.log('');
        console.log('📄 Generated files:');
        console.log(`   📄 PDF:  ${result.pdfPath}`);
        console.log(`   📄 DOCX: ${result.docxPath}`);
        console.log('');
        console.log(`💬 ${result.message}`);
        
        return result;
      }
    )
  )();

  console.log('');
  console.log('🎉 Whitepaper conversion process completed!');
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

export { main };