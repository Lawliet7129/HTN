import React, { useState, useEffect } from 'react';
import { PdfDoc } from '../../types/pdf';
import { generatePdfThumbnail } from '../../utils/pdfThumbnail';

interface PdfCardProps {
  pdf: PdfDoc;
  onClick: (pdf: PdfDoc) => void;
}

export const PdfCard: React.FC<PdfCardProps> = ({ pdf, onClick }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (pdf.coverUrl) {
        setIsLoadingThumbnail(true);
        try {
          const thumbnail = await generatePdfThumbnail(pdf.coverUrl, 1, { scale: 0.3 });
          setThumbnailUrl(thumbnail);
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
        } finally {
          setIsLoadingThumbnail(false);
        }
      }
    };

    loadThumbnail();
  }, [pdf.coverUrl]);

  const handleClick = () => {
    onClick(pdf);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(pdf);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="pdf-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${pdf.title}`}
    >
      <div className="pdf-cover">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`First page of ${pdf.title}`}
            loading="lazy"
            className="cover-image"
          />
        ) : isLoadingThumbnail ? (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Loading preview...</p>
          </div>
        ) : (
          <div className="cover-placeholder">
            <div className="pdf-preview">
              <div className="pdf-page">
                <div className="page-content">
                  <div className="page-lines">
                    <div className="line line-1"></div>
                    <div className="line line-2"></div>
                    <div className="line line-3"></div>
                    <div className="line line-4"></div>
                    <div className="line line-5"></div>
                  </div>
                  <div className="page-title">{pdf.title}</div>
                </div>
              </div>
            </div>
            <div className="pdf-icon">
              <svg
                width="24"
                height="24"
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
      
      <div className="pdf-info">
        <h3 className="pdf-title" title={pdf.title}>
          {pdf.title}
        </h3>
        
        {pdf.author && (
          <p className="pdf-author" title={pdf.author}>
            {pdf.author}
          </p>
        )}
        
        <div className="pdf-meta">
          <span className="pdf-date">
            {formatDate(pdf.updatedAt)}
          </span>
          {pdf.pages && (
            <span className="pdf-pages">
              {pdf.pages} pages
            </span>
          )}
        </div>
        
        {pdf.tags && pdf.tags.length > 0 && (
          <div className="pdf-tags">
            {pdf.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {pdf.tags.length > 2 && (
              <span className="tag-more">
                +{pdf.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        .pdf-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          aspect-ratio: 3/4;
          display: flex;
          flex-direction: column;
          border: 2px solid transparent;
        }

        .pdf-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #667eea;
        }

        .pdf-card:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .pdf-cover {
          flex: 1;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
          position: relative;
        }

        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-placeholder {
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #f8fafc;
        }

        .pdf-preview {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pdf-page {
          width: 60%;
          height: 80%;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .page-content {
          padding: 0.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .page-lines {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          margin-bottom: 0.5rem;
        }

        .line {
          height: 2px;
          background: #e5e7eb;
          border-radius: 1px;
        }

        .line-1 { width: 100%; }
        .line-2 { width: 85%; }
        .line-3 { width: 90%; }
        .line-4 { width: 75%; }
        .line-5 { width: 80%; }

        .page-title {
          font-size: 0.5rem;
          font-weight: 600;
          color: #374151;
          text-align: center;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        .pdf-icon {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 0.25rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .loading-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          height: 100%;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-placeholder p {
          margin: 0;
          font-size: 0.75rem;
          text-align: center;
        }

        .pdf-info {
          padding: 1rem;
          flex-shrink: 0;
        }

        .pdf-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pdf-author {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0 0 0.75rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pdf-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .pdf-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .tag {
          background: #e5e7eb;
          color: #374151;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .tag-more {
          background: #d1d5db;
          color: #6b7280;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .pdf-info {
            padding: 0.75rem;
          }
          
          .pdf-title {
            font-size: 0.85rem;
          }
          
          .pdf-author {
            font-size: 0.75rem;
          }
          
          .pdf-meta {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};
