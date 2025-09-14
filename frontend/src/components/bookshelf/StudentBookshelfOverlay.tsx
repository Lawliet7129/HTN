import React, { useState, useEffect } from 'react';
import { PdfDoc, mockPdfDocs } from '../../types/pdf';
import { PdfCard } from '../educator/PdfCard';
import { PdfViewer } from '../educator/PdfViewer';

interface StudentBookshelfOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentBookshelfOverlay: React.FC<StudentBookshelfOverlayProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [pdfs, setPdfs] = useState<PdfDoc[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PdfDoc | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load available PDFs (in a real app, this would be an API call)
      setPdfs(mockPdfDocs);
    }
  }, [isOpen]);

  const handlePdfClick = (pdf: PdfDoc) => {
    if (!pdf.coverUrl) {
      console.warn('No PDF URL available for:', pdf.title);
      return;
    }
    setSelectedPdf(pdf);
  };

  const handleCloseViewer = () => {
    setSelectedPdf(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedPdf) {
        handleCloseViewer();
      } else {
        onClose();
      }
    }
  };

  // Filter PDFs based on search term and selected tag
  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pdf.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pdf.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTag || pdf.tags?.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(pdfs.flatMap(pdf => pdf.tags || [])));

  if (!isOpen) return null;

  return (
    <div 
      className="student-bookshelf-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bookshelf-content">
        {/* Header */}
        <div className="bookshelf-header">
          <div className="header-left">
            <h2>📚 Study Materials</h2>
            <p>Browse and access educational materials created by your educators</p>
          </div>
          <button 
            className="exit-button"
            onClick={onClose}
            aria-label="Close bookshelf"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bookshelf-controls">
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-tags">
            <button
              className={`tag-filter ${selectedTag === null ? 'active' : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                className={`tag-filter ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <span>{filteredPdfs.length} material{filteredPdfs.length !== 1 ? 's' : ''} found</span>
          {selectedTag && (
            <span className="active-filter">
              • Filtered by: <strong>{selectedTag}</strong>
            </span>
          )}
        </div>

        {/* PDF Grid */}
        <div className="pdf-grid">
          {filteredPdfs.length > 0 ? (
            filteredPdfs.map(pdf => (
              <PdfCard
                key={pdf.id}
                pdf={pdf}
                onClick={handlePdfClick}
              />
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                  <path d="M13 12h3l-3-3v3"></path>
                  <path d="M11 12H8l3-3v3"></path>
                </svg>
              </div>
              <h3>No materials found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewer
          pdfUrl={selectedPdf.coverUrl || ''}
          title={selectedPdf.title}
          onClose={handleCloseViewer}
        />
      )}

      <style>{`
        .student-bookshelf-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }

        .bookshelf-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 1200px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .bookshelf-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .header-left h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .header-left p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .exit-button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .exit-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .bookshelf-controls {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .search-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          background: white;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag-filter {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 20px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tag-filter:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .tag-filter.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .results-info {
          padding: 1rem 2rem;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .active-filter {
          margin-left: 1rem;
        }

        .pdf-grid {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          align-content: start;
          max-height: calc(90vh - 300px);
        }

        .pdf-grid .pdf-card {
          height: 200px !important;
          max-height: 200px !important;
          aspect-ratio: 3/4 !important;
        }

        .no-results {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #6b7280;
          text-align: center;
        }

        .no-results-icon {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-results h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #374151;
        }

        .no-results p {
          margin: 0;
          font-size: 0.95rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .student-bookshelf-overlay {
            padding: 1rem;
          }

          .bookshelf-header {
            padding: 1.5rem 1rem 1rem 1rem;
          }

          .bookshelf-controls {
            padding: 1rem;
          }

          .pdf-grid {
            padding: 1rem;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 0.75rem;
            max-height: calc(90vh - 250px);
          }

          .pdf-grid .pdf-card {
            height: 180px !important;
            max-height: 180px !important;
          }

          .filter-tags {
            gap: 0.25rem;
          }

          .tag-filter {
            padding: 0.375rem 0.75rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .pdf-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.5rem;
          }

          .pdf-grid .pdf-card {
            height: 160px !important;
            max-height: 160px !important;
          }

          .bookshelf-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .exit-button {
            align-self: flex-end;
            width: fit-content;
          }
        }

        /* Scrollbar Styling */
        .pdf-grid::-webkit-scrollbar {
          width: 6px;
        }

        .pdf-grid::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .pdf-grid::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .pdf-grid::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};
