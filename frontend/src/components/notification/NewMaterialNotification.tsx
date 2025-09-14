import React from 'react';
import faceImage from '../../assets/models/face.png';

interface NewMaterialNotificationProps {
  isVisible: boolean;
  materialTitle: string;
  onClose: () => void;
  onViewMaterial?: () => void;
}

export const NewMaterialNotification: React.FC<NewMaterialNotificationProps> = ({
  isVisible,
  materialTitle,
  onClose,
  onViewMaterial
}) => {
  if (!isVisible) return null;

  return (
    <div className="new-material-notification">
      <div className="notification-content">
        <div className="notification-box">
          <span className="notification-text">
            New Material Uploaded! ({materialTitle})
          </span>
        </div>
        
        <div className="notification-connector"></div>
        
        <div className="notification-image-container">
          <img 
            src={faceImage} 
            alt="New Material" 
            className="notification-image"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="notification-actions">
        <button 
          className="view-button"
          onClick={onViewMaterial}
        >
          View Material
        </button>
        <button 
          className="dismiss-button"
          onClick={onClose}
        >
          Dismiss
        </button>
      </div>

      <style>{`
        .new-material-notification {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          animation: slideUpIn 0.4s ease-out;
        }

        @keyframes slideUpIn {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .notification-content {
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #333;
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          margin-bottom: 1rem;
        }

        .notification-box {
          background: #f5f5f5;
          border: 2px solid #333;
          border-radius: 8px;
          padding: 1rem 1.5rem;
          margin: 0.5rem;
        }

        .notification-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: #333;
          text-align: center;
          white-space: nowrap;
        }

        .notification-connector {
          width: 20px;
          height: 2px;
          background: #333;
          margin: 0 0.5rem;
        }

        .notification-image-container {
          width: 60px;
          height: 60px;
          border: 2px solid #333;
          border-radius: 50%;
          overflow: hidden;
          margin: 0.5rem;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .notification-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .view-button, .dismiss-button {
          padding: 0.5rem 1rem;
          border: 2px solid #333;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .view-button {
          background: #333;
          color: white;
        }

        .view-button:hover {
          background: #555;
          transform: translateY(-1px);
        }

        .dismiss-button {
          background: white;
          color: #333;
        }

        .dismiss-button:hover {
          background: #f5f5f5;
          transform: translateY(-1px);
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .new-material-notification {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            transform: none;
          }

          .notification-content {
            flex-direction: column;
            text-align: center;
            padding: 1rem;
          }

          .notification-box {
            margin: 0 0 1rem 0;
            padding: 0.75rem 1rem;
          }

          .notification-text {
            white-space: normal;
            font-size: 0.9rem;
          }

          .notification-connector {
            width: 2px;
            height: 20px;
            margin: 0.5rem 0;
          }

          .notification-image-container {
            width: 50px;
            height: 50px;
            margin: 0;
          }

          .notification-actions {
            flex-direction: column;
            width: 100%;
          }

          .view-button, .dismiss-button {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
