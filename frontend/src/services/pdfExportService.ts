import html2pdf from 'html2pdf.js';

export interface PDFExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  pagebreak?: {
    mode?: string[];
    before?: string[];
    after?: string[];
    avoid?: string[];
  };
  jsPDF?: {
    unit?: string;
    format?: string | [number, number];
    orientation?: 'portrait' | 'landscape';
    compress?: boolean;
  };
}

class PDFExportService {
  /**
   * Exports HTML content to PDF
   * @param element The HTML element to convert to PDF
   * @param options PDF export options
   */
  async exportToPDF(element: HTMLElement, options?: PDFExportOptions): Promise<void> {
    const defaultOptions: PDFExportOptions = {
      filename: 'NyxUSD-Whitepaper-v2.0.pdf',
      margin: [10, 10, 10, 10],
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.pdf-page-break-before',
        after: '.pdf-page-break-after',
        avoid: ['table', 'pre', 'blockquote']
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      ...options
    };

    // Configure html2pdf options
    const html2pdfOptions = {
      margin: defaultOptions.margin,
      filename: defaultOptions.filename,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 2,
        letterRendering: true,
        useCORS: true,
        logging: false
      },
      jsPDF: defaultOptions.jsPDF,
      pagebreak: defaultOptions.pagebreak,
      enableLinks: true
    };

    try {
      // Generate and save the PDF
      await html2pdf()
        .set(html2pdfOptions)
        .from(element)
        .save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Exports markdown content to PDF with custom styling
   * @param markdownContent The markdown content as string
   * @param options PDF export options
   */
  async exportMarkdownToPDF(markdownContent: string, options?: PDFExportOptions): Promise<void> {
    // Create a temporary container for the content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '20mm';
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '11pt';
    container.style.lineHeight = '1.6';
    
    // Add custom styles for PDF
    container.innerHTML = `
      <style>
        @media print {
          .pdf-container {
            background: white !important;
            color: black !important;
          }
          .pdf-container h1 {
            color: #6B46C1 !important;
            font-size: 28pt !important;
            margin-top: 0 !important;
            page-break-after: avoid !important;
          }
          .pdf-container h2 {
            color: #6B46C1 !important;
            font-size: 20pt !important;
            margin-top: 24pt !important;
            page-break-after: avoid !important;
          }
          .pdf-container h3 {
            color: #6B46C1 !important;
            font-size: 16pt !important;
            margin-top: 18pt !important;
            page-break-after: avoid !important;
          }
          .pdf-container p {
            text-align: justify !important;
            margin-bottom: 12pt !important;
          }
          .pdf-container ul, .pdf-container ol {
            margin-left: 20pt !important;
            margin-bottom: 12pt !important;
          }
          .pdf-container li {
            margin-bottom: 6pt !important;
          }
          .pdf-container table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 12pt 0 !important;
            page-break-inside: avoid !important;
          }
          .pdf-container th {
            background-color: #f3f4f6 !important;
            padding: 8pt !important;
            text-align: left !important;
            border: 1px solid #d1d5db !important;
          }
          .pdf-container td {
            padding: 8pt !important;
            border: 1px solid #d1d5db !important;
          }
          .pdf-container blockquote {
            border-left: 4px solid #6B46C1 !important;
            padding-left: 12pt !important;
            margin: 12pt 0 !important;
            font-style: italic !important;
            color: #4b5563 !important;
          }
          .pdf-container code {
            background-color: #f3f4f6 !important;
            padding: 2pt 4pt !important;
            border-radius: 3pt !important;
            font-family: 'Courier New', monospace !important;
            font-size: 10pt !important;
          }
          .pdf-container pre {
            background-color: #f3f4f6 !important;
            padding: 12pt !important;
            border-radius: 6pt !important;
            overflow-x: auto !important;
            page-break-inside: avoid !important;
          }
          .pdf-container pre code {
            background-color: transparent !important;
            padding: 0 !important;
          }
          .pdf-container strong {
            color: #6B46C1 !important;
            font-weight: bold !important;
          }
          .pdf-container a {
            color: #6B46C1 !important;
            text-decoration: underline !important;
          }
          .pdf-page-break-before {
            page-break-before: always !important;
          }
          .pdf-page-break-after {
            page-break-after: always !important;
          }
        }
      </style>
      <div class="pdf-container">
        <!-- Content will be inserted here -->
      </div>
    `;
    
    // Append to document temporarily
    document.body.appendChild(container);
    
    try {
      // Import markdown parsing functionality
      const { marked } = await import('marked');
      
      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      
      // Parse markdown to HTML
      const htmlContent = await marked.parse(markdownContent);
      
      // Insert parsed content
      const contentContainer = container.querySelector('.pdf-container');
      if (contentContainer) {
        contentContainer.innerHTML = htmlContent;
      }
      
      // Add page breaks before major sections
      const h1Elements = container.querySelectorAll('h1');
      h1Elements.forEach((h1, index) => {
        if (index > 0) {
          h1.classList.add('pdf-page-break-before');
        }
      });
      
      // Generate PDF
      await this.exportToPDF(container, options);
      
    } finally {
      // Clean up: remove temporary container
      document.body.removeChild(container);
    }
  }

  /**
   * Prepares the whitepaper content for PDF export
   * @param element The whitepaper viewer element
   * @returns A prepared HTML element ready for PDF export
   */
  prepareWhitepaperForPDF(element: HTMLElement): HTMLElement {
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Remove interactive elements
    const interactiveElements = clonedElement.querySelectorAll('button, input, .sidebar, .header-controls');
    interactiveElements.forEach(el => el.remove());
    
    // Apply PDF-specific styles
    clonedElement.style.backgroundColor = 'white';
    clonedElement.style.color = 'black';
    clonedElement.style.padding = '20mm';
    
    return clonedElement;
  }
}

export const pdfExportService = new PDFExportService();