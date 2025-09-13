import { generatePDFFromText, createPDFDataURL } from './pdfGenerator';

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
  // Generate actual PDF using jsPDF
  const pdfBlob = generatePDFFromText(text, title, {
    fontSize: 12,
    lineHeight: 1.4,
    margin: 20
  });
  
  // Convert to data URL for display
  return await createPDFDataURL(pdfBlob);
};
