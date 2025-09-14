import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  fontSize?: number;
  lineHeight?: number;
  margin?: number;
}

export const generatePDFFromText = (
  text: string, 
  title: string = 'OCR Document',
  options: PDFGenerationOptions = {}
): Blob => {
  const {
    fontSize = 12,
    lineHeight = 1.4,
    margin = 20,
    author = 'OCR System',
    subject = 'OCR Generated Document',
    keywords = 'OCR, Text Recognition, Document'
  } = options;

  // Create new PDF document
  const doc = new jsPDF();
  
  // Set document metadata
  doc.setProperties({
    title,
    author,
    subject,
    keywords
  });

  // Set font
  doc.setFont('helvetica');
  doc.setFontSize(fontSize);

  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, margin + 10);
  
  // Add separator line
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 15, doc.internal.pageSize.width - margin, margin + 15);
  
  // Reset font for content
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');

  // Split text into lines and pages
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = pageWidth - (margin * 2);
  const maxHeight = pageHeight - (margin * 2) - 20; // Leave space for title

  // Split text into words
  const words = text.split(/\s+/);
  let currentLine = '';
  let currentY = margin + 25;
  let isFirstPage = true;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = doc.getTextWidth(testLine);

    if (textWidth > maxWidth && currentLine) {
      // Add current line to page
      doc.text(currentLine, margin, currentY);
      currentY += fontSize * lineHeight;
      currentLine = word;

      // Check if we need a new page
      if (currentY > maxHeight) {
        doc.addPage();
        currentY = margin;
        isFirstPage = false;
      }
    } else {
      currentLine = testLine;
    }
  }

  // Add remaining text
  if (currentLine) {
    doc.text(currentLine, margin, currentY);
  }

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 30,
      pageHeight - 10
    );
  }

  // Return as Blob
  return doc.output('blob');
};

export const generatePDFFromHTML = async (
  htmlContent: string,
  title: string = 'HTML Document',
  options: PDFGenerationOptions = {}
): Promise<Blob> => {
  const { margin = 20 } = options;
  
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.padding = `${margin}px`;
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.4';
  container.style.color = '#000';
  container.style.backgroundColor = '#fff';
  
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Create PDF from HTML content
    const doc = new jsPDF();
    
    // Set document metadata
    doc.setProperties({
      title,
      author: 'OCR System',
      subject: 'OCR Generated Document',
      keywords: 'OCR, Text Recognition, Document'
    });

    // Get the container's dimensions
    const rect = container.getBoundingClientRect();
    
    // Add HTML content as text (simplified approach)
    const textContent = container.textContent || container.innerText || '';
    const lines = textContent.split('\n');
    
    let y = margin;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const maxWidth = pageWidth - (margin * 2);
    
    doc.setFont('helvetica');
    doc.setFontSize(12);
    
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      
      // Split long lines
      const words = line.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = doc.getTextWidth(testLine);
        
        if (textWidth > maxWidth && currentLine) {
          doc.text(currentLine, margin, y);
          y += 15;
          currentLine = word;
          
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        doc.text(currentLine, margin, y);
        y += 15;
      }
    }
    
    return doc.output('blob');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

export const downloadPDF = (pdfBlob: Blob, filename: string) => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Enhanced PDF generator that can handle both text and math images using KaTeX
export const generatePDFWithMath = async (
  content: Array<{ type: 'text' | 'math' | 'display-math'; content: string }>,
  title: string = 'OCR Document',
  options: PDFGenerationOptions = {}
): Promise<Blob> => {
  const {
    fontSize = 12,
    lineHeight = 1.4,
    margin = 20,
    author = 'OCR System',
    subject = 'OCR Generated Document',
    keywords = 'OCR, Text Recognition, Document'
  } = options;

  // Import LaTeX renderer dynamically to avoid circular dependencies
  const { renderLatexToImage, renderDisplayLatexToImage } = await import('./latexRenderer');

  // Create new PDF document
  const doc = new jsPDF();
  
  // Set document metadata
  doc.setProperties({
    title,
    author,
    subject,
    keywords
  });

  // Set font
  doc.setFont('helvetica');
  doc.setFontSize(fontSize);

  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, margin + 10);
  
  // Add separator line
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 15, doc.internal.pageSize.width - margin, margin + 15);
  
  // Reset font for content
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = pageWidth - (margin * 2);
  const maxHeight = pageHeight - (margin * 2) - 20;

  let currentY = margin + 25;
  let isFirstPage = true;

  for (const item of content) {
    try {
      if (item.type === 'text') {
        // Handle regular text
        const words = item.content.split(/\s+/);
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = doc.getTextWidth(testLine);

          if (textWidth > maxWidth && currentLine) {
            // Add current line to page
            doc.text(currentLine, margin, currentY);
            currentY += fontSize * lineHeight;
            currentLine = word;

            // Check if we need a new page
            if (currentY > maxHeight) {
              doc.addPage();
              currentY = margin;
              isFirstPage = false;
            }
          } else {
            currentLine = testLine;
          }
        }

        // Add remaining text
        if (currentLine) {
          doc.text(currentLine, margin, currentY);
          currentY += fontSize * lineHeight;
        }

      } else if (item.type === 'math' || item.type === 'display-math') {
        // Handle math expressions using KaTeX
        console.log(`🎨 Rendering ${item.type}: ${item.content}`);
        
        try {
          const imageDataUrl = item.type === 'display-math' 
            ? await renderDisplayLatexToImage(item.content)
            : await renderLatexToImage(item.content);
          
          // Add some spacing before math
          if (item.type === 'display-math') {
            currentY += 10;
          }
          
          // Load image and calculate dimensions
          const img = new Image();
          img.src = imageDataUrl;
          
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          
          // Calculate image dimensions to fit page width
          const imgWidth = Math.min(img.width, maxWidth);
          const imgHeight = (img.height * imgWidth) / img.width;
          
          // Check if we need a new page for the image
          if (currentY + imgHeight > maxHeight) {
            doc.addPage();
            currentY = margin;
            isFirstPage = false;
          }
          
          // Add image to PDF
          doc.addImage(imageDataUrl, 'PNG', margin, currentY, imgWidth, imgHeight);
          
          // Update Y position
          currentY += imgHeight + (item.type === 'display-math' ? 15 : 5);
          
        } catch (error) {
          console.error(`Failed to render math: ${item.content}`, error);
          // Fallback to text representation
          const fallbackText = `[Math: ${item.content}]`;
          doc.text(fallbackText, margin, currentY);
          currentY += fontSize * lineHeight;
        }
      }
    } catch (error) {
      console.error(`Error processing content item:`, error);
      // Fallback to text
      doc.text(item.content, margin, currentY);
      currentY += fontSize * lineHeight;
    }
  }

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 30,
      pageHeight - 10
    );
  }

  // Return as Blob
  return doc.output('blob');
};

export const createPDFDataURL = (pdfBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });
};
