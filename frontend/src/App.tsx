import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserType } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PdfProvider } from './contexts/PdfContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { ClassroomView } from './components/classroom/ClassroomView';
import { EducatorView } from './components/educator/EducatorView';
import { LatexTest } from './components/LatexTest';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Classroom } from './components/classroom/Classroom';
import './App.css';

// Background 3D Scene Component
function BackgroundScene() {
  const [isBookshelfView, setIsBookshelfView] = useState(false);
  
  const handleModelLoaded = () => {
    // Model loaded successfully
  };
  
  const handleBookshelfClick = () => {
    setIsBookshelfView(true);
  };

  return (
    <Canvas
      camera={{ 
        position: [90, 90, 120], 
        fov: 30,
        near: 0.1,
        far: 2000
      }}
      shadows
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
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
        enablePan={!isBookshelfView}
        enableZoom={true}
        enableRotate={!isBookshelfView}
        minDistance={30}
        maxDistance={500}
        maxPolarAngle={Math.PI / 2}
        target={[30, 70, 50]}
      />
    </Canvas>
  );
}

// Main App Content
function AppContent() {
  const { isAuthenticated, login, signup, logout, isLoading, user } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<'educator' | 'student'>('educator');

  // Debug user data
  console.log('App - user:', user);
  console.log('App - userType:', user?.userType);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleSignup = async (email: string, password: string, name: string, userType: UserType) => {
    await signup(email, password, name, userType);
  };

  const handleLogout = () => {
    logout();
    setShowLanding(true);
    setCurrentView('educator'); // Reset to educator view on logout
  };

  const handleSwitchToStudentView = () => {
    setCurrentView('student');
  };

  const handleSwitchToEducatorView = () => {
    setCurrentView('educator');
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Cogniverse...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Background 3D Scene */}
      <BackgroundScene />
      
      {/* Landing Page Overlay */}
      {showLanding && (
        <LandingPage 
          isAuthenticated={isAuthenticated}
          onGetStarted={handleGetStarted}
        />
      )}
      
      {/* Routes */}
      <Routes>
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? (
              <Navigate to="/classroom" replace />
            ) : (
              <AuthPage 
                onLogin={handleLogin}
                onSignup={handleSignup}
              />
            )
          } 
        />
        <Route 
          path="/classroom" 
          element={
            isAuthenticated ? (
              (user?.userType === 'educator' && currentView === 'educator') ? (
                <EducatorView onLogout={handleLogout} onSwitchToStudentView={handleSwitchToStudentView} />
              ) : (
                <ClassroomView onLogout={handleLogout} onSwitchToEducatorView={handleSwitchToEducatorView} />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route path="/latex-test" element={<LatexTest />} />
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/classroom" replace />
            ) : showLanding ? null : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
}

// Main App Component with Providers
function App() {
  return (
    <AuthProvider>
      <PdfProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </PdfProvider>
    </AuthProvider>
  );
}

export default App;