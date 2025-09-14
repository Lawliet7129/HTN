import { generatePDFFromText, generatePDFWithMath, createPDFDataURL } from './pdfGenerator';

export interface OCRResult {
  raw_text: string;
  beautified_text: string;
  error?: string;
}

export interface OCRResponse {
  success: boolean;
  data?: OCRResult;
  error?: string;
}

const BACKEND_URL = 'http://localhost:8000';

export const convertImageToText = async (file: File): Promise<OCRResponse> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please select an image file (PNG, JPG, JPEG, etc.)'
      };
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Make request to backend
    const response = await fetch(`${BACKEND_URL}/convert-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Server error: ${response.status} - ${errorText}`
      };
    }

    const data: OCRResult = await response.json();
    
    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('OCR service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image'
    };
  }
};

export const generatePdfFromText = async (text: string, title: string): Promise<string> => {
  console.log('🚀 generatePdfFromText called with text length:', text.length);
  console.log('📝 First 200 chars:', text.substring(0, 200));
  
  // Check if the text contains LaTeX code
  const hasLatexCode = text.includes('\\documentclass') || 
                      text.includes('\\begin{document}') || 
                      text.includes('\\usepackage') ||
                      text.includes('\\sum_') ||
                      text.includes('\\frac') ||
                      text.includes('\\geq') ||
                      text.includes('\\(') ||
                      text.includes('\\)') ||
                      text.includes('\\[') ||
                      text.includes('\\]');
  
  console.log('🔍 LaTeX detection:', {
    hasDocumentclass: text.includes('\\documentclass'),
    hasBeginDocument: text.includes('\\begin{document}'),
    hasUsepackage: text.includes('\\usepackage'),
    hasSum: text.includes('\\sum_'),
    hasFrac: text.includes('\\frac'),
    hasGeq: text.includes('\\geq'),
    hasInlineParen: text.includes('\\('),
    hasInlineParenClose: text.includes('\\)'),
    hasDisplayBracket: text.includes('\\['),
    hasDisplayBracketClose: text.includes('\\]'),
    hasLatexCode: hasLatexCode
  });
  
  if (hasLatexCode) {
    console.log('✅ LaTeX detected! Compiling with PyLaTeX...');
    
    try {
      // Send LaTeX content to backend for compilation
      const response = await fetch(`${BACKEND_URL}/compile-latex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex_content: text })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LaTeX compilation failed: ${response.status} - ${errorText}`);
      }
      
      // Get PDF blob from response
      const pdfBlob = await response.blob();
      console.log('✅ LaTeX compiled successfully! PDF size:', pdfBlob.size, 'bytes');
      
      // Convert to data URL
      return await createPDFDataURL(pdfBlob);
      
    } catch (error) {
      console.error('❌ LaTeX compilation failed:', error);
      console.log('🔄 Falling back to plain text...');
      const pdfBlob = generatePDFFromText(text, title, {
        fontSize: 12,
        lineHeight: 1.4,
        margin: 20
      });
      return await createPDFDataURL(pdfBlob);
    }
  } else {
    console.log('📄 Plain text detected, generating PDF directly...');
    // Generate PDF from plain text
    const pdfBlob = generatePDFFromText(text, title, {
      fontSize: 12,
      lineHeight: 1.4,
      margin: 20
    });

    return await createPDFDataURL(pdfBlob);
  }
};

// Test function for LaTeX rendering
(window as any).testLatexRendering = async () => {
  console.log('🧪 Testing LaTeX rendering...');
  
  try {
    const { renderLatexToImage } = await import('./latexRenderer');
    const testLatex = '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}';
    const imageDataUrl = await renderLatexToImage(testLatex);
    console.log('✅ Test successful! Image data URL length:', imageDataUrl.length);
    return imageDataUrl;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
};
