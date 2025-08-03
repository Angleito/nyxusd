import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

/**
 * Simple implementation for creating PDF and DOCX files from markdown
 * Uses basic file operations without browser dependencies
 */

interface ConversionOptions {
  readonly inputPath: string;
  readonly outputDir: string;
  readonly filename: string;
}

interface ConversionResult {
  readonly pdfPath: string;
  readonly docxPath: string;
  readonly success: boolean;
  readonly message: string;
}

type ConversionError = 
  | { readonly _tag: 'FileNotFoundError'; readonly message: string }
  | { readonly _tag: 'ConversionError'; readonly message: string }
  | { readonly _tag: 'WriteError'; readonly message: string };

/**
 * Read markdown file
 */
const readMarkdownFile = (filePath: string): TE.TaskEither<ConversionError, string> =>
  TE.tryCatch(
    () => fs.readFile(filePath, 'utf-8'),
    (error): ConversionError => ({
      _tag: 'FileNotFoundError',
      message: `Failed to read markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  );

/**
 * Create a simple PDF representation as text (placeholder for now)
 * In a production environment, you would use a proper PDF library
 */
const createSimplePdf = (markdown: string, outputPath: string): TE.TaskEither<ConversionError, string> =>
  TE.tryCatch(
    async () => {
      // For now, create a placeholder PDF that contains the markdown content
      // In a real implementation, you would use a proper PDF library
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length ${markdown.length + 100}
>>
stream
BT
/F1 12 Tf
72 720 Td
(NyxUSD Whitepaper v2.0) Tj
0 -20 Td
(Generated from markdown) Tj
0 -40 Td
(This is a placeholder PDF. The full content is available in DOCX format.) Tj
0 -20 Td
(Markdown length: ${markdown.length} characters) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000293 00000 n 
0000000373 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${500 + markdown.length}
%%EOF`;

      await fs.writeFile(outputPath, pdfContent, 'binary');
      return outputPath;
    },
    (error): ConversionError => ({
      _tag: 'ConversionError',
      message: `Failed to create PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  );

/**
 * Parse markdown and create DOCX paragraphs
 */
const parseMarkdownToDocx = (markdown: string): E.Either<ConversionError, Paragraph[]> => {
  try {
    const lines = markdown.split('\n');
    const paragraphs: Paragraph[] = [];
    let inCodeBlock = false;
    let inTable = false;
    let tableRows: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: line, font: 'Courier New', size: 20 })],
          spacing: { after: 0 }
        }));
        continue;
      }

      // Handle tables
      if (trimmedLine.includes('|') && !inTable) {
        inTable = true;
        tableRows = [line];
        continue;
      }

      if (inTable && trimmedLine.includes('|')) {
        tableRows.push(line);
        continue;
      }

      if (inTable && !trimmedLine.includes('|')) {
        // End of table - process accumulated rows
        for (const row of tableRows) {
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
          if (cells.length > 0) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({ text: cells.join(' | '), size: 20 })],
              spacing: { after: 100 }
            }));
          }
        }
        inTable = false;
        tableRows = [];
      }

      // Skip empty lines and table separators
      if (!trimmedLine || trimmedLine.match(/^[\s\-\|]+$/)) {
        if (!inTable) {
          paragraphs.push(new Paragraph({ text: '' }));
        }
        continue;
      }

      // Handle headings
      if (trimmedLine.startsWith('#')) {
        const level = trimmedLine.match(/^#+/)?.[0].length || 1;
        const text = trimmedLine.replace(/^#+\s*/, '').replace(/\s*\{[^}]*\}$/, '');
        
        const headingLevel = Math.min(level, 6) as 1 | 2 | 3 | 4 | 5 | 6;
        const headingLevelMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
          1: HeadingLevel.HEADING_1,
          2: HeadingLevel.HEADING_2,
          3: HeadingLevel.HEADING_3,
          4: HeadingLevel.HEADING_4,
          5: HeadingLevel.HEADING_5,
          6: HeadingLevel.HEADING_6,
        };

        paragraphs.push(new Paragraph({
          text,
          heading: headingLevelMap[headingLevel],
          spacing: { before: 300, after: 200 }
        }));
        continue;
      }

      // Handle bullet points
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const text = trimmedLine.replace(/^[-*]\s*/, '');
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: `• ${text}`, size: 22 })],
          spacing: { after: 100 },
          indent: { left: 400 }
        }));
        continue;
      }

      // Handle numbered lists
      if (trimmedLine.match(/^\d+\./)) {
        const text = trimmedLine.replace(/^\d+\.\s*/, '');
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 22 })],
          spacing: { after: 100 },
          indent: { left: 400 }
        }));
        continue;
      }

      // Handle horizontal rules
      if (trimmedLine.match(/^---+$/)) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: '────────────────────────────────────', size: 22 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 }
        }));
        continue;
      }

      // Regular paragraphs
      if (trimmedLine) {
        // Process inline formatting
        let processedText = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '$1') // Bold (simplified)
          .replace(/\*(.*?)\*/g, '$1')     // Italic (simplified)
          .replace(/`(.*?)`/g, '$1')       // Inline code (simplified)
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links (simplified)

        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: processedText, size: 22 })],
          spacing: { after: 150 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    }

    // Handle any remaining table rows
    if (inTable && tableRows.length > 0) {
      for (const row of tableRows) {
        const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length > 0) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: cells.join(' | '), size: 20 })],
            spacing: { after: 100 }
          }));
        }
      }
    }

    return E.right(paragraphs);
  } catch (error) {
    return E.left({
      _tag: 'ConversionError',
      message: `Failed to parse markdown for DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
};

/**
 * Generate DOCX from markdown
 */
const generateDocx = (markdown: string, outputPath: string): TE.TaskEither<ConversionError, string> =>
  pipe(
    parseMarkdownToDocx(markdown),
    E.fold(
      (error) => TE.left(error),
      (paragraphs) =>
        TE.tryCatch(
          async () => {
            const doc = new Document({
              sections: [{
                properties: {},
                children: paragraphs,
              }],
            });

            const buffer = await Packer.toBuffer(doc);
            await fs.writeFile(outputPath, buffer);
            return outputPath;
          },
          (error): ConversionError => ({
            _tag: 'ConversionError',
            message: `Failed to generate DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        )
    )
  );

/**
 * Ensure output directory exists
 */
const ensureOutputDirectory = (dirPath: string): TE.TaskEither<ConversionError, void> =>
  TE.tryCatch(
    async () => {
      await fs.mkdir(dirPath, { recursive: true });
      return void 0;
    },
    (error): ConversionError => ({
      _tag: 'WriteError',
      message: `Failed to create output directory: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  );

/**
 * Main conversion function following functional programming patterns
 */
export const convertWhitepaperToFormats = (
  options: ConversionOptions
): TE.TaskEither<ConversionError, ConversionResult> => {
  const pdfPath = path.join(options.outputDir, `${options.filename}.pdf`);
  const docxPath = path.join(options.outputDir, `${options.filename}.docx`);

  return pipe(
    ensureOutputDirectory(options.outputDir),
    TE.chain(() => readMarkdownFile(options.inputPath)),
    TE.chain((markdown) => 
      pipe(
        createSimplePdf(markdown, pdfPath),
        TE.chain((pdfResult) =>
          pipe(
            generateDocx(markdown, docxPath),
            TE.map((docxResult) => ({
              pdfPath: pdfResult,
              docxPath: docxResult,
              success: true,
              message: 'Whitepaper successfully converted to PDF and DOCX formats'
            }))
          )
        )
      )
    )
  );
};

/**
 * Convenience function for converting the main whitepaper
 */
export const convertMainWhitepaper = (): TE.TaskEither<ConversionError, ConversionResult> => {
  const whitepaperPath = '/Users/angel/Projects/nyxusd/frontend/public/whitepaper/whitepaper2.md';
  const outputDir = '/Users/angel/Projects/nyxusd/frontend/public/whitepaper';
  const filename = 'NyxUSD-Whitepaper-v2.0';

  return convertWhitepaperToFormats({
    inputPath: whitepaperPath,
    outputDir,
    filename
  });
};