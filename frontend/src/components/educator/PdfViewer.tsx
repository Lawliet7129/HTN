import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

interface PdfViewerProps {
  pdfUrl: string | Blob;
  onClose: () => void;
  title?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, onClose, title = 'PDF Viewer' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);

  useEffect(() => {
    loadPDF();
  }, [pdfUrl]);

  const loadPDF = async () => {
    if (!pdfUrl || pdfUrl === '') {
      setError('No PDF URL provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading PDF:', pdfUrl);
      console.log('PDF URL type:', typeof pdfUrl);
      console.log('PDF URL value:', pdfUrl);

      let loadingTask;
      if (pdfUrl instanceof Blob) {
        const arrayBuffer = await pdfUrl.arrayBuffer();
        loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: '/cmaps/',
          cMapPacked: true,
        });
      } else {
        loadingTask = pdfjsLib.getDocument(pdfUrl, {
          cMapUrl: '/cmaps/',
          cMapPacked: true,
        });
      }
      const pdf = await loadingTask.promise;
      
      pdfRef.current = pdf;
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return;

    try {
      const page = await pdfRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render page');
    }
  };

  useEffect(() => {
    if (currentPage && totalPages > 0) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, totalPages]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  if (isLoading) {
    return (
      <div className="pdf-viewer-overlay">
        <div className="pdf-viewer">
          <div className="pdf-viewer-header">
            <h3>{title}</h3>
            <button onClick={onClose} className="close-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="pdf-loading">
            <div className="spinner"></div>
            <p>Loading PDF...</p>
          </div>
        </div>
        
        <style>{`
          .pdf-viewer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
          }
          
          .pdf-viewer {
            background: white;
            border-radius: 8px;
            width: 90%;
            height: 90%;
            max-width: 1200px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .pdf-viewer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          
          .pdf-viewer-header h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
          }
          
          .close-button {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          
          .close-button:hover {
            background: #e5e7eb;
            color: #374151;
          }
          
          .pdf-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            color: #6b7280;
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer-overlay">
        <div className="pdf-viewer">
          <div className="pdf-viewer-header">
            <h3>{title}</h3>
            <button onClick={onClose} className="close-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="pdf-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <h4>Error Loading PDF</h4>
            <p>{error}</p>
            <button onClick={onClose} className="retry-button">
              Close
            </button>
          </div>
        </div>
        
        <style>{`
          .pdf-viewer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
          }
          
          .pdf-viewer {
            background: white;
            border-radius: 8px;
            width: 90%;
            height: 90%;
            max-width: 1200px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .pdf-viewer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          
          .pdf-viewer-header h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
          }
          
          .close-button {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          
          .close-button:hover {
            background: #e5e7eb;
            color: #374151;
          }
          
          .pdf-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            color: #6b7280;
            text-align: center;
            padding: 2rem;
          }
          
          .pdf-error svg {
            color: #ef4444;
            margin-bottom: 1rem;
          }
          
          .pdf-error h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
          }
          
          .pdf-error p {
            margin: 0 0 1.5rem 0;
            color: #6b7280;
          }
          
          .retry-button {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s ease;
          }
          
          .retry-button:hover {
            background: #5a6fd8;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-overlay">
      <div className="pdf-viewer">
        <div className="pdf-viewer-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="pdf-controls">
          <div className="page-controls">
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage <= 1}
              className="control-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Previous
            </button>
            
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={goToNextPage} 
              disabled={currentPage >= totalPages}
              className="control-button"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
          </div>

          <div className="zoom-controls">
            <button onClick={zoomOut} className="control-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
            
            <span className="zoom-info">
              {Math.round(scale * 100)}%
            </span>
            
            <button onClick={zoomIn} className="control-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
            
            <button onClick={resetZoom} className="control-button">
              Reset
            </button>
          </div>
        </div>

        <div className="pdf-content">
          <canvas ref={canvasRef} className="pdf-canvas" />
        </div>
      </div>
      
      <style>{`
        .pdf-viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        
        .pdf-viewer {
          background: white;
          border-radius: 8px;
          width: 95%;
          height: 95%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .pdf-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .pdf-viewer-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }
        
        .close-button {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background: #e5e7eb;
          color: #374151;
        }
        
        .pdf-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          gap: 1rem;
        }
        
        .page-controls, .zoom-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .control-button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .control-button:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-info, .zoom-info {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          min-width: 80px;
          text-align: center;
        }
        
        .pdf-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow: auto;
          background: #f3f4f6;
        }
        
        .pdf-canvas {
          max-width: 100%;
          max-height: 100%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        @media (max-width: 768px) {
          .pdf-viewer {
            width: 100%;
            height: 100%;
            border-radius: 0;
          }
          
          .pdf-controls {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .page-controls, .zoom-controls {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
