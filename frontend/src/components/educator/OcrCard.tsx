import React, { useState, useRef } from 'react';
import { convertImageToText, generatePdfFromText } from '../../utils/ocrService';

interface OcrCardProps {
  onOcrComplete: (title: string, content: string) => void;
}

export const OcrCard: React.FC<OcrCardProps> = ({ onOcrComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      processImage(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const result = await convertImageToText(file);
      
      if (result.success && result.data) {
        const text = result.data.beautified_text || result.data.raw_text;
        const title = `OCR: ${file.name.replace(/\.[^/.]+$/, '')}`;
        
        onOcrComplete(title, text);
      } else {
        alert(`OCR failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="ocr-card">
      <div
        className={`ocr-drop-zone ${dragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="ocr-content">
          {isProcessing ? (
            <>
              <div className="spinner"></div>
              <h3>Processing Image...</h3>
              <p>Converting handwriting to text</p>
            </>
          ) : (
            <>
              <div className="ocr-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
              <h3>OCR Converter</h3>
              <p>Drop image or click to convert handwriting to text</p>
              <div className="ocr-features">
                <span>• Handwriting recognition</span>
                <span>• Text extraction</span>
                <span>• PDF generation</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <style>{`
        .ocr-card {
          aspect-ratio: 3/4;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .ocr-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .ocr-drop-zone {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #d1d5db;
          transition: all 0.3s ease;
          position: relative;
        }

        .ocr-drop-zone.drag-over {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .ocr-drop-zone.processing {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .ocr-content {
          text-align: center;
          padding: 1.5rem;
          color: #6b7280;
        }

        .ocr-icon {
          margin-bottom: 1rem;
          color: #9ca3af;
        }

        .ocr-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .ocr-content p {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .ocr-features {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .processing h3 {
          color: #10b981;
        }

        .processing p {
          color: #059669;
        }

        @media (max-width: 768px) {
          .ocr-content {
            padding: 1rem;
          }
          
          .ocr-content h3 {
            font-size: 1rem;
          }
          
          .ocr-content p {
            font-size: 0.8rem;
          }
          
          .ocr-features {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};
