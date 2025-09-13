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

export const createPDFDataURL = (pdfBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });
};
