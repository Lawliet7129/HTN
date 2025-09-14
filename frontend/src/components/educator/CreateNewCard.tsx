import React from 'react';

interface CreateNewCardProps {
  onClick: () => void;
}

export const CreateNewCard: React.FC<CreateNewCardProps> = ({ onClick }) => {
  const handleClick = () => {
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="create-new-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Create new PDF"
    >
      <div className="create-icon-container">
        <div className="create-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      </div>
      
      <div className="create-label">
        Create New
      </div>
      
      <style>{`
        .create-new-card {
          background: white;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          aspect-ratio: 3/4;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          text-align: center;
        }

        .create-new-card:hover {
          border-color: #667eea;
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .create-new-card:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .create-icon-container {
          margin-bottom: 1rem;
        }

        .create-icon {
          width: 64px;
          height: 64px;
          border: 2px solid #9ca3af;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: all 0.3s ease;
        }

        .create-new-card:hover .create-icon {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .create-label {
          font-size: 1rem;
          font-weight: 600;
          color: #6b7280;
          transition: color 0.3s ease;
        }

        .create-new-card:hover .create-label {
          color: #667eea;
        }

        @media (max-width: 768px) {
          .create-new-card {
            padding: 1rem;
          }
          
          .create-icon {
            width: 48px;
            height: 48px;
          }
          
          .create-icon svg {
            width: 24px;
            height: 24px;
          }
          
          .create-label {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};
