import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Classroom } from './Classroom';
import { StudentBookshelfOverlay } from '../bookshelf/StudentBookshelfOverlay';
import { useAuth } from '../../contexts/AuthContext';
import './ClassroomView.css';


interface ClassroomViewProps {
  onLogout: () => void;
  onSwitchToEducatorView?: () => void;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({ onLogout, onSwitchToEducatorView }) => {
  const [isBookshelfOverlayOpen, setIsBookshelfOverlayOpen] = useState(false);
  const { user } = useAuth();

  const handleModelLoaded = () => {
    // Model loaded successfully
  };

  const handleBookshelfClick = () => {
    // When in ClassroomView, always show the bookshelf overlay
    // This provides the same experience for both students and educators in student view mode
    setIsBookshelfOverlayOpen(true);
  };


  const handleCloseBookshelfOverlay = () => {
    setIsBookshelfOverlayOpen(false);
  };

  return (
    <div className="classroom-view">
      <div className="classroom-header">
        <h1>Cogniverse</h1>
        <div className="header-buttons">
          {onSwitchToEducatorView && user?.userType === 'educator' && (
            <button onClick={onSwitchToEducatorView} className="educator-view-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Educator View
            </button>
          )}
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      
      <div className="canvas-container">
        <Canvas
          camera={{ 
            position: [90, 90, 120], 
            fov: 30,
            near: 0.1,
            far: 2000
          }}
          shadows
        >
          {/* Lighting */}
          <directionalLight
            position={[200, 200, 100]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-200, -200, -200]} intensity={0.5} />
          
          {/* Environment */}
          <Environment preset="apartment" />
          
          
          {/* Classroom Model */}
          <Classroom onModelLoaded={handleModelLoaded} onBookshelfClick={handleBookshelfClick} />
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={30}
            maxDistance={500}
            maxPolarAngle={Math.PI / 2}
            target={[30, 70, 50]}
          />
        </Canvas>
      </div>
      
      <div className="classroom-ui">
        <div className="info-panel">
          <h2>Interactive Classroom</h2>
          <p>Click on the bookshelf to browse study materials and PDFs!</p>
        </div>
      </div>

      {/* Student Bookshelf Overlay */}
      <StudentBookshelfOverlay
        isOpen={isBookshelfOverlayOpen}
        onClose={handleCloseBookshelfOverlay}
      />
    </div>
  );
};
