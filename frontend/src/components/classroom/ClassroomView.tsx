import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Classroom } from './Classroom';
import { Human } from './Human';
import { StudentBookshelfOverlay } from '../bookshelf/StudentBookshelfOverlay';
import { NewMaterialNotification } from '../notification/NewMaterialNotification';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import './ClassroomView.css';


interface ClassroomViewProps {
  onLogout: () => void;
  onSwitchToEducatorView?: () => void;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({ onLogout, onSwitchToEducatorView }) => {
  const [isBookshelfOverlayOpen, setIsBookshelfOverlayOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{ title: string; id: string } | null>(null);
  const { user } = useAuth();
  const { notifications, markAsRead, hasUnreadNotifications } = useNotifications();

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

  // Handle notifications
  useEffect(() => {
    if (notifications.length > 0 && hasUnreadNotifications) {
      const latestUnreadNotification = notifications.find(n => !n.isRead);
      if (latestUnreadNotification) {
        setCurrentNotification({
          title: latestUnreadNotification.title,
          id: latestUnreadNotification.id
        });
        setShowNotification(true);
        
        // Auto-hide notification after 5 seconds
        const timer = setTimeout(() => {
          setShowNotification(false);
          markAsRead(latestUnreadNotification.id);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [notifications, hasUnreadNotifications, markAsRead]);

  const handleNotificationClose = () => {
    setShowNotification(false);
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
  };

  const handleViewMaterial = () => {
    handleNotificationClose();
    setIsBookshelfOverlayOpen(true);
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
            position: [60, 75, 85], 
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
          
          {/* Human Character */}
          <group position={[-40, 10, -65]} scale={[34, 34, 34]}>
            <Human 
              isWalking={false}
              walkingSpeed={1.5}
              onModelLoaded={(model) => {
                console.log('Human model loaded in classroom:', model);
              }}
              onHierarchyBuilt={(hierarchy) => {
                console.log('Human hierarchy built in classroom:', hierarchy);
              }}
            />
          </group>
          
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

      {/* New Material Notification */}
      {currentNotification && (
        <NewMaterialNotification
          isVisible={showNotification}
          materialTitle={currentNotification.title}
          onClose={handleNotificationClose}
          onViewMaterial={handleViewMaterial}
        />
      )}
    </div>
  );
};
