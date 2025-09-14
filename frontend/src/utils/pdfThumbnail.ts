import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  scale?: number;
}

export const generatePdfThumbnail = async (
  pdfUrl: string, 
  pageNumber: number = 1,
  options: ThumbnailOptions = {}
): Promise<string> => {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    // Get the specified page (default to first page)
    const page = await pdf.getPage(pageNumber);
    
    // Set up canvas for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    // Calculate scale and dimensions
    const scale = options.scale || 0.3; // Default scale for thumbnail
    const viewport = page.getViewport({ scale });
    
    // Set canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render the page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to data URL (base64 image)
    return canvas.toDataURL('image/jpeg', 0.8);
    
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    throw error;
  }
};

export const generatePdfThumbnailFromFile = async (
  file: File,
  pageNumber: number = 1,
  options: ThumbnailOptions = {}
): Promise<string> => {
  try {
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document from array buffer
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Get the specified page (default to first page)
    const page = await pdf.getPage(pageNumber);
    
    // Set up canvas for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    // Calculate scale and dimensions
    const scale = options.scale || 0.3; // Default scale for thumbnail
    const viewport = page.getViewport({ scale });
    
    // Set canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render the page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to data URL (base64 image)
    return canvas.toDataURL('image/jpeg', 0.8);
    
  } catch (error) {
    console.error('Error generating PDF thumbnail from file:', error);
    throw error;
  }
};
