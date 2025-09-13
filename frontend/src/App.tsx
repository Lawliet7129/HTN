import React, { useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Classroom } from './components/classroom/Classroom';
import { Vector3 } from 'three';
import './App.css';

// Camera controller component
function CameraController({ targetPosition, targetLookAt }: { targetPosition: Vector3, targetLookAt: Vector3 }) {
  const { camera } = useThree();
  
  React.useEffect(() => {
    if (targetPosition && targetLookAt) {
      // Animate camera to new position
      const startPosition = camera.position.clone();
      const startLookAt = new Vector3(0, 0, 0); // Default look at
      
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        const easedProgress = easeInOutCubic(progress);
        
        // Interpolate camera position
        camera.position.lerpVectors(startPosition, targetPosition, easedProgress);
        
        // Update camera look at
        camera.lookAt(targetLookAt);
        camera.updateProjectionMatrix();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [targetPosition, targetLookAt, camera]);
  
  return null;
}

function App() {
  const [cameraTarget, setCameraTarget] = useState<{ position: Vector3, lookAt: Vector3 } | null>(null);
  const [isBookshelfView, setIsBookshelfView] = useState(false);
  
  const handleModelLoaded = (model: any) => {
    // Model loaded successfully
  };
  
  const handleBookshelfClick = () => {
    // Bookshelf position based on your model structure (polySurface104 is likely the main bookshelf)
    // Adjust these coordinates based on your actual bookshelf position
    const bookshelfPosition = new Vector3(90, 80, 90); // Position in front of bookshelf
    const bookshelfLookAt = new Vector3(0, 0, 120); // Look at the bookshelf center
    
    setCameraTarget({ position: bookshelfPosition, lookAt: bookshelfLookAt });
    setIsBookshelfView(true);
  };
  
  const resetCamera = () => {
    const defaultPosition = new Vector3(90, 90, 120);
    const defaultLookAt = new Vector3(0, 0, 0);
    
    setCameraTarget({ position: defaultPosition, lookAt: defaultLookAt });
    setIsBookshelfView(false);
  };

  return (
    <div className="App">
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
          
          {/* Camera Controller */}
          {cameraTarget && (
            <CameraController 
              targetPosition={cameraTarget.position} 
              targetLookAt={cameraTarget.lookAt} 
            />
          )}
          
          {/* Classroom Model */}
          <Classroom onModelLoaded={handleModelLoaded} onBookshelfClick={handleBookshelfClick} />
          
          {/* Controls */}
          <OrbitControls
            enablePan={!isBookshelfView}
            enableZoom={true}
            enableRotate={!isBookshelfView}
            minDistance={30}
            maxDistance={500}
            maxPolarAngle={Math.PI / 2}
            target={[30, 70, 50]}
          />
        </Canvas>
      </div>
      
      <div className="ui-overlay">
        <div className="info-panel">
          <h1>3D Virtual Classroom</h1>
          <p>Click on the bookshelf to focus the camera!</p>
          {isBookshelfView && (
            <button onClick={resetCamera} className="reset-camera-btn">
              Reset Camera View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
