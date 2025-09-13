import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

interface LandingPageProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ isAuthenticated, onGetStarted }) => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // User is logged in - transition to 3D classroom
      setIsTransitioning(true);
      setTimeout(() => {
        onGetStarted();
      }, 500); // Allow time for blur transition
    } else {
      // User is not logged in - go to auth page
      navigate('/auth');
    }
  };

  return (
    <div className={`landing-overlay ${isTransitioning ? 'transitioning' : ''}`}>
      <div className="landing-content">
        <div className="logo-section">
          <h1 className="logo">Canvasify</h1>
          <p className="tagline">Transform your classroom into an interactive 3D learning space</p>
        </div>
        
        <div className="cta-section">
          <button 
            className="get-started-btn"
            onClick={handleGetStarted}
            disabled={isTransitioning}
          >
            {isTransitioning ? 'Loading...' : 'Get Started'}
          </button>
          
          {!isAuthenticated && (
            <p className="auth-hint">
              Sign up or log in to access your virtual classroom
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
