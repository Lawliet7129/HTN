import React, { useState } from 'react';
import { PdfDoc } from '../../types/pdf';
import { PdfViewer } from './PdfViewer';
import { generatePDFFromText, downloadPDF } from '../../utils/pdfGenerator';

interface PdfSheetProps {
  pdf: PdfDoc | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export const PdfSheet: React.FC<PdfSheetProps> = ({ 
  pdf, 
  isOpen, 
  onClose, 
  onRename, 
  onDelete 
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  React.useEffect(() => {
    if (pdf) {
      setNewTitle(pdf.title);
    }
  }, [pdf]);

  const handleRename = () => {
    if (pdf && newTitle.trim() && newTitle.trim() !== pdf.title) {
      onRename(pdf.id, newTitle.trim());
      setIsRenaming(false);
    }
  };

  const handleDelete = () => {
    if (pdf) {
      onDelete(pdf.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handlePreview = () => {
    setShowPdfViewer(true);
  };

  const handleOpen = () => {
    setShowPdfViewer(true);
  };

  const handleDownload = async () => {
    if (!pdf) return;
    
    try {
      if (pdf.id === '1') {
        // Download the sample PDF
        const link = document.createElement('a');
        link.href = '/sample-pdfs/CIS_3200_HW_2.pdf';
        link.download = `${pdf.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (pdf.coverUrl && pdf.coverUrl.startsWith('data:application/pdf')) {
        // Download OCR-generated PDF
        const response = await fetch(pdf.coverUrl);
        const blob = await response.blob();
        downloadPDF(blob, pdf.title);
      } else {
        // Generate PDF from OCR content (if available)
        const ocrContent = `OCR Document: ${pdf.title}\n\nThis document was generated from OCR processing.`;
        const pdfBlob = generatePDFFromText(ocrContent, pdf.title);
        downloadPDF(pdfBlob, pdf.title);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !pdf) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>PDF Details</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close sheet"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="sheet-body">
          <div className="pdf-preview">
            {pdf.coverUrl ? (
              <img
                src={pdf.coverUrl}
                alt={`First page of ${pdf.title}`}
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <div className="pdf-page-large">
                  <div className="page-content-large">
                    <div className="page-lines-large">
                      <div className="line-large line-1"></div>
                      <div className="line-large line-2"></div>
                      <div className="line-large line-3"></div>
                      <div className="line-large line-4"></div>
                      <div className="line-large line-5"></div>
                      <div className="line-large line-6"></div>
                    </div>
                    <div className="page-title-large">{pdf.title}</div>
                  </div>
                </div>
                <div className="pdf-icon-large">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="pdf-details">
            {isRenaming ? (
              <div className="rename-section">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rename-input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setIsRenaming(false);
                  }}
                />
                <div className="rename-actions">
                  <button onClick={handleRename} className="save-button">
                    Save
                  </button>
                  <button onClick={() => setIsRenaming(false)} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h3 className="pdf-title" onClick={() => setIsRenaming(true)}>
                {pdf.title}
              </h3>
            )}

            {pdf.author && (
              <p className="pdf-author">By {pdf.author}</p>
            )}

            <div className="pdf-meta">
              <div className="meta-item">
                <span className="meta-label">Updated:</span>
                <span className="meta-value">{formatDate(pdf.updatedAt)}</span>
              </div>
              {pdf.pages && (
                <div className="meta-item">
                  <span className="meta-label">Pages:</span>
                  <span className="meta-value">{pdf.pages}</span>
                </div>
              )}
            </div>

            {pdf.tags && pdf.tags.length > 0 && (
              <div className="pdf-tags">
                <span className="tags-label">Tags:</span>
                <div className="tags-list">
                  {pdf.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sheet-actions">
          <button onClick={handlePreview} className="action-button preview">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </button>
          
          <button onClick={handleOpen} className="action-button open">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open
          </button>
          
          <button onClick={handleDownload} className="action-button download">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          
          <button 
            onClick={() => setIsRenaming(true)} 
            className="action-button rename"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Rename
          </button>
          
          <button 
            onClick={() => setShowDeleteConfirm(true)} 
            className="action-button delete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete PDF</h3>
            <p>Are you sure you want to delete "{pdf.title}"? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleDelete} className="delete-button">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .sheet-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }

        .sheet-content {
          background: white;
          width: 100%;
          max-width: 400px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
        }

        .sheet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .sheet-header h2 {
          margin: 0;
          font-size: 1.25rem;
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

        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .sheet-body {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .pdf-preview {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .preview-image {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .preview-placeholder {
          width: 120px;
          height: 160px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: #9ca3af;
          position: relative;
        }

        .pdf-page-large {
          width: 80%;
          height: 90%;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .page-content-large {
          padding: 0.75rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .page-lines-large {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          margin-bottom: 0.75rem;
        }

        .line-large {
          height: 3px;
          background: #e5e7eb;
          border-radius: 1px;
        }

        .line-large.line-1 { width: 100%; }
        .line-large.line-2 { width: 85%; }
        .line-large.line-3 { width: 90%; }
        .line-large.line-4 { width: 75%; }
        .line-large.line-5 { width: 80%; }
        .line-large.line-6 { width: 70%; }

        .page-title-large {
          font-size: 0.6rem;
          font-weight: 600;
          color: #374151;
          text-align: center;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        .pdf-icon-large {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 6px;
          padding: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .pdf-details {
          margin-bottom: 1.5rem;
        }

        .pdf-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .pdf-title:hover {
          background: #f3f4f6;
        }

        .pdf-author {
          color: #6b7280;
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
        }

        .pdf-meta {
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .meta-label {
          color: #6b7280;
          font-weight: 500;
        }

        .meta-value {
          color: #374151;
        }

        .pdf-tags {
          margin-bottom: 1rem;
        }

        .tags-label {
          display: block;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: #e5e7eb;
          color: #374151;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .rename-section {
          margin-bottom: 1rem;
        }

        .rename-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .rename-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .rename-actions {
          display: flex;
          gap: 0.5rem;
        }

        .save-button,
        .cancel-button {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-button {
          background: #667eea;
          color: white;
          border: none;
        }

        .save-button:hover {
          background: #5a6fd8;
        }

        .cancel-button {
          background: white;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .cancel-button:hover {
          background: #f9fafb;
        }

        .sheet-actions {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          text-align: left;
        }

        .action-button:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .action-button.delete:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        .delete-confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
        }

        .delete-confirm-modal {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .delete-confirm-modal h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .delete-confirm-modal p {
          margin: 0 0 1.5rem 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .confirm-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .delete-button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .delete-button:hover {
          background: #b91c1c;
        }

        @media (max-width: 640px) {
          .sheet-content {
            max-width: 100%;
          }
          
          .confirm-actions {
            flex-direction: column;
          }
          
          .cancel-button,
          .delete-button {
            width: 100%;
          }
        }
      `}</style>
      
      {showPdfViewer && pdf && (
        <PdfViewer
          pdfUrl={pdf.coverUrl || '/sample-pdfs/CIS_3200_HW_2.pdf'}
          onClose={() => setShowPdfViewer(false)}
          title={pdf.title}
        />
      )}
    </div>
  );
};
