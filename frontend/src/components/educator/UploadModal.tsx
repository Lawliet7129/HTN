import React, { useState, useRef, useCallback } from 'react';
import { PdfDoc } from '../../types/pdf';
import { generatePdfThumbnailFromFile } from '../../utils/pdfThumbnail';
import { convertImageToText, generatePdfFromText } from '../../utils/ocrService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pdf: Omit<PdfDoc, 'id'>) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrResults, setOcrResults] = useState<{[key: string]: {raw: string, beautified: string}}>({});
  const [showOcrResults, setShowOcrResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type.startsWith('image/')
    );
    
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImageWithOCR = async (file: File) => {
    try {
      const result = await convertImageToText(file);
      if (result.success && result.data) {
        // Store both raw and beautified text for debugging
        setOcrResults(prev => ({
          ...prev,
          [file.name]: {
            raw: result.data!.raw_text || '',
            beautified: result.data!.beautified_text || ''
          }
        }));
        setShowOcrResults(true);
        
        // Debug: Log what we got from backend
        console.log('🔍 Raw OCR text:', result.data!.raw_text);
        console.log('🔍 Beautified LaTeX:', result.data!.beautified_text);
        
        return result.data.beautified_text || result.data.raw_text;
      } else {
        console.error('OCR failed:', result.error);
        return null;
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || files.length === 0) {
      return;
    }

    setIsUploading(true);
    
    try {
      // Check if we have image files for OCR processing
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      
      let finalTitle = title.trim();
      let finalContent = '';
      let thumbnailDataUrl: string | undefined;
      
      // Process images with OCR if any
      if (imageFiles.length > 0) {
        const ocrTexts: string[] = [];
        for (const imageFile of imageFiles) {
          const ocrText = await processImageWithOCR(imageFile);
          if (ocrText) {
            ocrTexts.push(ocrText);
          }
        }
        
        if (ocrTexts.length > 0) {
          finalContent = ocrTexts.join('\n\n---\n\n');
          // Generate a PDF from the OCR text
          const pdfDataUrl = await generatePdfFromText(finalContent, finalTitle);
          thumbnailDataUrl = pdfDataUrl;
        }
      }
      
      // If we have PDF files, use the first one for thumbnail
      if (pdfFiles.length > 0 && !thumbnailDataUrl) {
        try {
          thumbnailDataUrl = await generatePdfThumbnailFromFile(pdfFiles[0], 1, { scale: 0.3 });
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
        }
      }
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPdf: Omit<PdfDoc, 'id'> = {
        title: finalTitle,
        author: 'Current User',
        updatedAt: new Date().toISOString(),
        pages: Math.floor(Math.random() * 100) + 20,
        coverUrl: thumbnailDataUrl,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      onSubmit(newPdf);
      
      // Reset form
      setTitle('');
      setTags('');
      setFiles([]);
      setOcrResults({});
      setShowOcrResults(false);
      onClose();
      
      // Show success message
      const message = imageFiles.length > 0 
        ? `Files processed successfully! ${imageFiles.length} image(s) converted to text using OCR.`
        : 'PDF uploaded successfully! Thumbnail generated from first page.';
      alert(message);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setTitle('');
      setTags('');
      setFiles([]);
      setOcrResults({});
      setShowOcrResults(false);
      onClose();
    }
  };

  const isFormValid = title.trim() && files.length > 0;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New PDF</h2>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={isUploading}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter PDF title"
              required
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label>Files *</label>
            <div
              className={`file-drop-zone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="drop-zone-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <p>Drag and drop PDF or image files here</p>
                <p className="file-types">or</p>
                <button
                  type="button"
                  className="browse-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="remove-file"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showOcrResults && Object.keys(ocrResults).length > 0 && (
            <div className="form-group">
              <label>OCR Results (Debug View)</label>
              <div className="ocr-results">
                {Object.entries(ocrResults).map(([filename, data]) => (
                  <div key={filename} className="ocr-result-item">
                    <h4>{filename}</h4>
                    
                    <div style={{marginBottom: '10px'}}>
                      <strong>Raw OCR Text:</strong>
                      <div className="ocr-text" style={{background: '#f0f0f0', padding: '10px', margin: '5px 0', borderRadius: '4px'}}>
                        {data.raw.length > 300 ? `${data.raw.substring(0, 300)}...` : data.raw}
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '10px'}}>
                      <strong>Beautified LaTeX:</strong>
                      <div className="ocr-text" style={{background: '#e8f4f8', padding: '10px', margin: '5px 0', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'}}>
                        {data.beautified.length > 500 ? `${data.beautified.substring(0, 500)}...` : data.beautified}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isUploading}
              className="submit-button"
            >
              {isUploading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0 1.5rem;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .close-button {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .close-button:hover:not(:disabled) {
          background: #f3f4f6;
          color: #374151;
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-group input[type="text"] {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-group input[type="text"]:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input[type="text"]:disabled {
          background: #f9fafb;
          color: #6b7280;
        }

        .file-drop-zone {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .file-drop-zone.drag-over {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .drop-zone-content {
          color: #6b7280;
        }

        .drop-zone-content svg {
          margin-bottom: 1rem;
          color: #9ca3af;
        }

        .file-types {
          font-size: 0.875rem;
          margin: 0.5rem 0;
        }

        .browse-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .browse-button:hover:not(:disabled) {
          background: #5a6fd8;
        }

        .browse-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .file-list {
          margin-top: 1rem;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #f3f4f6;
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }

        .file-name {
          font-size: 0.875rem;
          color: #374151;
        }

        .remove-file {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .remove-file:hover:not(:disabled) {
          background: #fee2e2;
        }

        .remove-file:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-button {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .cancel-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #5a6fd8;
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ocr-results {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .ocr-result-item {
          margin-bottom: 1rem;
        }

        .ocr-result-item:last-child {
          margin-bottom: 0;
        }

        .ocr-result-item h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .ocr-text {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #4b5563;
          white-space: pre-wrap;
        }

        @media (max-width: 640px) {
          .modal-content {
            margin: 1rem;
            max-width: none;
          }
          
          .modal-actions {
            flex-direction: column;
          }
          
          .cancel-button,
          .submit-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
