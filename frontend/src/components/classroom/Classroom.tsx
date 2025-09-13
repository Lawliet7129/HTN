import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Bone, Skeleton, Object3D } from 'three';
import * as THREE from 'three';

interface ClassroomProps {
  onModelLoaded?: (model: Group) => void;
}

export const Classroom: React.FC<ClassroomProps> = ({ onModelLoaded }) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/assets/glb/classroom.glb');
  const [scaledScene, setScaledScene] = React.useState<Group | null>(null);

  // Function to recursively log object structure (removed for performance)
  const logObjectStructure = (obj: Object3D, depth: number = 0, parentName: string = '') => {
    // Console logging removed for better performance
  };

  // Function to find and mark interactive objects (console logs removed)
  const findAndLogObjects = (obj: Object3D) => {
    const foundObjects: { [key: string]: Object3D[] } = {
      'desk': [],
      'bookshelf': [],
      'bulletin': [],
      'board': [],
      'type': [],
      'polySurface': []
    };
    
    obj.traverse((child) => {
      const name = child.name.toLowerCase();
      
      // Look for desks (we know Desk1 and Desk2 exist)
      if (name.includes('desk')) {
        foundObjects['desk'].push(child);
      }
      
      // Look for bookshelf elements (might be in polySurface or other objects)
      if (name.includes('bookshelf') || name.includes('shelf') || name.includes('book')) {
        foundObjects['bookshelf'].push(child);
      }
      
      // Look for bulletin board elements
      if (name.includes('bulletin') || name.includes('board') || name.includes('notice')) {
        foundObjects['bulletin'].push(child);
      }
      
      // Look for type/text elements (typeMesh1, typeMesh2, typeMesh3)
      if (name.includes('type')) {
        foundObjects['type'].push(child);
      }
      
      // Look for complex surfaces that might be interactive areas
      if (name.includes('polysurface')) {
        foundObjects['polySurface'].push(child);
      }
    });
    
    return foundObjects;
  };

  // Function to log skeleton and bone information (console logs removed)
  const logSkeletonInfo = (obj: Object3D) => {
    // Console logging removed for better performance
  };

  // Function to log material information (console logs removed)
  const logMaterialInfo = (obj: Object3D) => {
    // Console logging removed for better performance
  };

  useEffect(() => {
    if (scene) {
      // Clone the scene to avoid modifying the original
      const clonedScene = scene.clone();
      
      // Scale the classroom 80 times larger
      clonedScene.scale.set(800, 800, 800);
      clonedScene.position.set(-20, 10, -20);
      
      // Find and mark interactive objects
      findAndLogObjects(clonedScene);
      
      // Create interactive components
      const interactiveComponents = createInteractiveComponents(clonedScene);
      
      // Set the scaled scene for rendering
      setScaledScene(clonedScene);
      
      // Call the onModelLoaded callback if provided
      if (onModelLoaded) {
        onModelLoaded(clonedScene);
      }
    }
  }, [scene, onModelLoaded]);

  // Function to create interactive components based on model structure
  const createInteractiveComponents = (model: Group) => {
    // Find and mark interactive objects
    const interactiveObjects: { [key: string]: Object3D[] } = {
      desks: [],
      bookshelves: [],
      bulletinBoards: []
    };
    
    model.traverse((child) => {
      const name = child.name.toLowerCase();
      
      // Mark desks as interactive
      if (name.includes('desk')) {
        interactiveObjects.desks.push(child);
        child.userData.isInteractive = true;
        child.userData.interactionType = 'desk';
        child.userData.description = 'Scheduling and meeting management';
      }
      
      // Mark type elements as potential bulletin boards or signs
      if (name.includes('type')) {
        interactiveObjects.bulletinBoards.push(child);
        child.userData.isInteractive = true;
        child.userData.interactionType = 'bulletin';
        child.userData.description = 'Q&A forum and discussions';
      }
      
      // Mark complex surfaces as potential bookshelves
      if (name.includes('polysurface') && child.children.length > 5) {
        interactiveObjects.bookshelves.push(child);
        child.userData.isInteractive = true;
        child.userData.interactionType = 'bookshelf';
        child.userData.description = 'AI-powered material creation and storage';
      }
    });
    
    return interactiveObjects;
  };

  // Animation frame for continuous updates (optional)
  useFrame((state, delta) => {
    // You can add any continuous updates here
    // For example, rotating objects, updating animations, etc.
  });

  if (!scaledScene) {
    return null;
  }

  // Function to handle clicks on interactive objects
  const handleObjectClick = (event: any) => {
    const object = event.object;
    
    if (object.userData.isInteractive) {
      // Handle different interaction types
      switch (object.userData.interactionType) {
        case 'desk':
          // TODO: Open scheduling modal/interface
          break;
        case 'bookshelf':
          // TODO: Open bookshelf interface
          break;
        case 'bulletin':
          // TODO: Open bulletin board interface
          break;
        default:
          break;
      }
      
      // Prevent event bubbling
      event.stopPropagation();
    }
  };

  return (
    <group ref={groupRef}>
      <primitive 
        object={scaledScene} 
        onClick={handleObjectClick}
        onPointerOver={(event: any) => {
          if (event.object.userData.isInteractive) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={(event: any) => {
          if (event.object.userData.isInteractive) {
            document.body.style.cursor = 'auto';
          }
        }}
      />
    </group>
  );
};

// Preload the GLB file
useGLTF.preload('/assets/glb/classroom.glb');

export default Classroom;
