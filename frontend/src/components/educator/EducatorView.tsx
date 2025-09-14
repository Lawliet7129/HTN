import React, { useState, useMemo } from 'react';
import { PdfDoc } from '../../types/pdf';
import { SearchBar } from './SearchBar';
import { PdfCard } from './PdfCard';
import { CreateNewCard } from './CreateNewCard';
import { UploadModal } from './UploadModal';
import { PdfSheet } from './PdfSheet';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePdfs } from '../../contexts/PdfContext';

interface EducatorViewProps {
  onLogout: () => void;
  onSwitchToStudentView?: () => void;
}

export const EducatorView: React.FC<EducatorViewProps> = ({ onLogout, onSwitchToStudentView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<PdfDoc | null>(null);
  const [isPdfSheetOpen, setIsPdfSheetOpen] = useState(false);
  const { addNotification } = useNotifications();
  const { pdfs, addPdf, updatePdf, deletePdf } = usePdfs();

  // Filter PDFs based on search query
  const filteredPdfs = useMemo(() => {
    if (!searchQuery.trim()) return pdfs;
    
    const query = searchQuery.toLowerCase();
    return pdfs.filter(pdf => 
      pdf.title.toLowerCase().includes(query) ||
      pdf.author?.toLowerCase().includes(query) ||
      pdf.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [pdfs, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateNew = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (newPdf: Omit<PdfDoc, 'id'>) => {
    addPdf(newPdf);
    
    // Add notification for new material upload
    addNotification(newPdf.title);
  };

  const handlePdfClick = (pdf: PdfDoc) => {
    setSelectedPdf(pdf);
    setIsPdfSheetOpen(true);
  };

  const handleRename = (id: string, newTitle: string) => {
    updatePdf(id, { title: newTitle });
  };

  const handleDelete = (id: string) => {
    deletePdf(id);
  };

  const handleClosePdfSheet = () => {
    setIsPdfSheetOpen(false);
    setSelectedPdf(null);
  };


  return (
    <div className="educator-view">
      <header className="educator-header">
        <div className="header-content">
          <h1 className="header-title">Cogniverse</h1>
          <div className="header-buttons">
            {onSwitchToStudentView && (
              <button onClick={onSwitchToStudentView} className="student-view-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-3-3m0 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
                </svg>
                Student View
              </button>
            )}
            <button onClick={onLogout} className="logout-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="educator-main">
        <div className="educator-container">
          <SearchBar onSearch={handleSearch} />
          
          {filteredPdfs.length === 0 && searchQuery ? (
            <div className="empty-state">
              <div className="empty-illustration">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <line x1="11" y1="8" x2="11" y2="14"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
              <h3>No PDFs found</h3>
              <p>Try adjusting your search terms or create a new PDF.</p>
              <button onClick={handleCreateNew} className="create-new-button">
                Create New PDF
              </button>
            </div>
          ) : (
            <div className="pdf-grid">
              <CreateNewCard onClick={handleCreateNew} />
              {filteredPdfs.map((pdf) => (
                <PdfCard
                  key={pdf.id}
                  pdf={pdf}
                  onClick={handlePdfClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
      />

      <PdfSheet
        pdf={selectedPdf}
        isOpen={isPdfSheetOpen}
        onClose={handleClosePdfSheet}
        onRename={handleRename}
        onDelete={handleDelete}
      />
      
      <style>{`
        .educator-view {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .educator-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .student-view-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .student-view-button:hover {
          background: #218838;
          transform: translateY(-1px);
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          background: #5a6fd8;
          transform: translateY(-1px);
        }

        .educator-main {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .educator-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .pdf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: white;
        }

        .empty-illustration {
          margin-bottom: 2rem;
          opacity: 0.7;
        }

        .empty-state h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .empty-state p {
          margin: 0 0 2rem 0;
          font-size: 1.1rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .create-new-button {
          background: white;
          color: #667eea;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .create-new-button:hover {
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 0 1rem;
          }
          
          .header-title {
            font-size: 1.5rem;
          }
          
          .educator-container {
            padding: 0 1rem;
          }
          
          .pdf-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
          }
          
          .empty-state {
            padding: 2rem 1rem;
          }
          
          .empty-illustration svg {
            width: 80px;
            height: 80px;
          }
        }

        @media (max-width: 480px) {
          .pdf-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
