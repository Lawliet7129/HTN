import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Classroom } from './components/classroom/Classroom';
import './App.css';

function App() {
  const handleModelLoaded = (model: any) => {
    // Model loaded successfully
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
          <ambientLight intensity={0.4} />
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
          <Classroom onModelLoaded={handleModelLoaded} />
          
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
      
      
    </div>
  );
}

export default App;
