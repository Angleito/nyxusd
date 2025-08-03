import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as fs from 'fs/promises';
import * as path from 'path';
import { mdToPdf } from 'md-to-pdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

/**
 * Types for conversion operations
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
 * Generate PDF from markdown using md-to-pdf
 */
const generatePdf = (markdown: string, outputPath: string): TE.TaskEither<ConversionError, string> =>
  TE.tryCatch(
    async () => {
      const options = {
        dest: outputPath,
        css: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
            font-size: 11pt;
            margin: 40px;
            max-width: none;
          }
          
          h1 {
            font-size: 24pt;
            font-weight: 700;
            color: #0066cc;
            margin: 0 0 8pt 0;
            page-break-after: avoid;
          }
          
          h2 {
            font-size: 18pt;
            font-weight: 600;
            color: #0066cc;
            margin: 24pt 0 12pt 0;
            page-break-after: avoid;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 6pt;
          }
          
          h3 {
            font-size: 14pt;
            font-weight: 600;
            color: #333333;
            margin: 18pt 0 9pt 0;
            page-break-after: avoid;
          }
          
          h4 {
            font-size: 12pt;
            font-weight: 600;
            color: #555555;
            margin: 15pt 0 6pt 0;
            page-break-after: avoid;
          }
          
          p {
            margin: 0 0 12pt 0;
            text-align: justify;
            orphans: 2;
            widows: 2;
          }
          
          ul, ol {
            margin: 12pt 0 12pt 24pt;
            padding: 0;
          }
          
          li {
            margin: 6pt 0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 18pt 0;
            font-size: 10pt;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8pt 12pt;
            text-align: left;
          }
          
          th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          code {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            background-color: #f1f3f4;
            padding: 2pt 4pt;
            border-radius: 3pt;
            font-size: 10pt;
          }
          
          pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4pt;
            padding: 12pt;
            margin: 12pt 0;
            overflow-x: auto;
            font-size: 10pt;
          }
          
          blockquote {
            border-left: 4px solid #0066cc;
            margin: 12pt 0;
            padding: 12pt 18pt;
            background-color: #f8f9fa;
            font-style: italic;
          }
          
          hr {
            border: none;
            border-top: 2px solid #e5e5e5;
            margin: 24pt 0;
          }
          
          a {
            color: #0066cc;
            text-decoration: none;
          }
        `,
        pdf_options: {
          format: 'a4' as const,
          margin: {
            top: '1in',
            right: '1in',
            bottom: '1in',
            left: '1in'
          },
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: `
            <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
              NyxUSD Whitepaper v2.0
            </div>
          `,
          footerTemplate: `
            <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
              Page <span class="pageNumber"></span> of <span class="totalPages"></span>
            </div>
          `,
        }
      };

      const pdf = await mdToPdf({ content: markdown }, options);
      return outputPath;
    },
    (error): ConversionError => ({
      _tag: 'ConversionError',
      message: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
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
        generatePdf(markdown, pdfPath),
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