import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Object3D } from 'three';

interface ClassroomProps {
  onModelLoaded?: (model: Group) => void;
  onBookshelfClick?: () => void;
  onHierarchyBuilt?: (hierarchy: NodeHierarchy) => void;
}

interface NodeHierarchy {
  name: string;
  type: string;
  children: NodeHierarchy[];
  userData: any;
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export const Classroom: React.FC<ClassroomProps> = ({ onModelLoaded, onBookshelfClick, onHierarchyBuilt }) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/assets/glb/classroom.glb');
  const [scaledScene, setScaledScene] = React.useState<Group | null>(null);
  const [nodeHierarchy, setNodeHierarchy] = React.useState<NodeHierarchy | null>(null);

  // Function to build node hierarchy structure
  const buildNodeHierarchy = (obj: Object3D, depth: number = 0): NodeHierarchy => {
    const hierarchy: NodeHierarchy = {
      name: obj.name || `Unnamed_${obj.type}`,
      type: obj.type,
      children: [],
      userData: { ...obj.userData },
      position: {
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z
      },
      scale: {
        x: obj.scale.x,
        y: obj.scale.y,
        z: obj.scale.z
      },
      rotation: {
        x: obj.rotation.x,
        y: obj.rotation.y,
        z: obj.rotation.z
      }
    };

    // Recursively build children hierarchy
    obj.children.forEach(child => {
      hierarchy.children.push(buildNodeHierarchy(child, depth + 1));
    });

    return hierarchy;
  };

  // Function to identify interactive objects and build hierarchy
  const identifyInteractiveObjects = (obj: Object3D) => {
    const interactiveObjects: { [key: string]: Object3D[] } = {
      'desk': [],
      'bookshelf': [],
      'bulletin': [],
      'board': [],
      'type': [],
      'polySurface': []
    };
    
    obj.traverse((child) => {
      const name = child.name.toLowerCase();
      
      // Categorize objects by type
      if (name.includes('desk')) {
        interactiveObjects['desk'].push(child);
      } else if (name.includes('bookshelf') || name.includes('shelf') || name.includes('book')) {
        interactiveObjects['bookshelf'].push(child);
      } else if (name.includes('bulletin') || name.includes('board') || name.includes('notice')) {
        interactiveObjects['bulletin'].push(child);
      } else if (name.includes('type')) {
        interactiveObjects['type'].push(child);
      } else if (name.includes('polysurface')) {
        interactiveObjects['polySurface'].push(child);
      }
    });
    
    return interactiveObjects;
  };

  useEffect(() => {
    if (scene) {
      // Clone the scene to avoid modifying the original
      const clonedScene = scene.clone();
      
      // Scale the classroom 80 times larger
      clonedScene.scale.set(800, 800, 800);
      clonedScene.position.set(-20, 10, -20);
      
      // Build node hierarchy for the 3D model
      const hierarchy = buildNodeHierarchy(clonedScene);
      setNodeHierarchy(hierarchy);
      
      // Call the hierarchy callback if provided
      if (onHierarchyBuilt) {
        onHierarchyBuilt(hierarchy);
      }
      
      // Identify interactive objects
      identifyInteractiveObjects(clonedScene);
      
      // Create interactive components
      createInteractiveComponents(clonedScene);
      
      // Set the scaled scene for rendering
      setScaledScene(clonedScene);
      
      // Call the onModelLoaded callback if provided
      if (onModelLoaded) {
        onModelLoaded(clonedScene);
      }
    }
  }, [scene, onModelLoaded]);

  // Log hierarchy information when it's built
  useEffect(() => {
    if (nodeHierarchy) {
      const summary = getInteractiveObjectsSummary(nodeHierarchy);
      const hierarchyText = formatHierarchyForDisplay(nodeHierarchy);
      
      // Store hierarchy information in a way that can be accessed for debugging
      (window as any).classroomHierarchy = {
        hierarchy: nodeHierarchy,
        summary: summary,
        formattedText: hierarchyText
      };
    }
  }, [nodeHierarchy]);

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
        child.userData.hierarchyPath = getObjectHierarchyPath(child);
      }
      
      // Mark type elements as potential bulletin boards or signs
      if (name.includes('type')) {
        interactiveObjects.bulletinBoards.push(child);
        child.userData.isInteractive = true;
        child.userData.interactionType = 'bulletin';
        child.userData.description = 'Q&A forum and discussions';
        child.userData.hierarchyPath = getObjectHierarchyPath(child);
      }
      
      // Mark bookshelf structures as interactive
      if (name.includes('polysurface')) {
        // Check if this is a main bookshelf structure (has many children or is a known bookshelf)
        const isMainBookshelf = child.children.length > 2 || 
                               name.includes('polySurface104') || 
                               name.includes('polySurface111') ||
                               name.includes('polySurface114') ||
                               name.includes('polySurface46');
        
        if (isMainBookshelf) {
          interactiveObjects.bookshelves.push(child);
          child.userData.isInteractive = true;
          child.userData.interactionType = 'bookshelf';
          child.userData.description = 'AI-powered material creation and storage';
          child.userData.hierarchyPath = getObjectHierarchyPath(child);
        } else {
          // Mark smaller polySurface objects as individual books
          child.userData.isInteractive = true;
          child.userData.interactionType = 'book';
          child.userData.description = 'Individual book - click to view material';
          child.userData.hierarchyPath = getObjectHierarchyPath(child);
        }
      }
    });
    
    // Second pass: Mark all descendants of bookshelves
    model.traverse((child) => {
      if (child.userData.interactionType === 'bookshelf') {
        // Mark all descendants as bookshelf parts
        child.traverse((descendant) => {
          if (descendant !== child) {
            descendant.userData.isInteractive = true;
            descendant.userData.interactionType = 'book';
            descendant.userData.description = 'Individual book - click to view material';
            descendant.userData.parentBookshelf = child.name;
            descendant.userData.hierarchyPath = getObjectHierarchyPath(descendant);
          }
        });
      }
    });
    
    return interactiveObjects;
  };

  // Function to get the hierarchy path of an object
  const getObjectHierarchyPath = (obj: Object3D): string => {
    const path: string[] = [];
    let current: Object3D | null = obj;
    
    while (current) {
      path.unshift(current.name || current.type);
      current = current.parent;
    }
    
    return path.join(' → ');
  };

  // Function to format hierarchy for display
  const formatHierarchyForDisplay = (hierarchy: NodeHierarchy, depth: number = 0): string => {
    const indent = '  '.repeat(depth);
    let result = `${indent}${hierarchy.name} (${hierarchy.type})\n`;
    
    if (hierarchy.userData && Object.keys(hierarchy.userData).length > 0) {
      result += `${indent}  UserData: ${JSON.stringify(hierarchy.userData, null, 2)}\n`;
    }
    
    result += `${indent}  Position: (${hierarchy.position.x.toFixed(2)}, ${hierarchy.position.y.toFixed(2)}, ${hierarchy.position.z.toFixed(2)})\n`;
    result += `${indent}  Scale: (${hierarchy.scale.x.toFixed(2)}, ${hierarchy.scale.y.toFixed(2)}, ${hierarchy.scale.z.toFixed(2)})\n`;
    result += `${indent}  Rotation: (${hierarchy.rotation.x.toFixed(2)}, ${hierarchy.rotation.y.toFixed(2)}, ${hierarchy.rotation.z.toFixed(2)})\n`;
    
    hierarchy.children.forEach(child => {
      result += formatHierarchyForDisplay(child, depth + 1);
    });
    
    return result;
  };

  // Function to get interactive objects summary
  const getInteractiveObjectsSummary = (hierarchy: NodeHierarchy): { [key: string]: number } => {
    const summary: { [key: string]: number } = {
      desks: 0,
      bookshelves: 0,
      bulletinBoards: 0,
      books: 0,
      total: 0
    };

    const traverse = (node: NodeHierarchy) => {
      if (node.userData?.isInteractive) {
        summary.total++;
        switch (node.userData.interactionType) {
          case 'desk':
            summary.desks++;
            break;
          case 'bookshelf':
            summary.bookshelves++;
            break;
          case 'bulletin':
            summary.bulletinBoards++;
            break;
          case 'book':
            summary.books++;
            break;
        }
      }
      node.children.forEach(traverse);
    };

    traverse(hierarchy);
    return summary;
  };

  // Animation frame for continuous updates (optional)
  useFrame(() => {
    // You can add any continuous updates here
    // For example, rotating objects, updating animations, etc.
  });

  if (!scaledScene) {
    return null;
  }

  // Function to handle clicks on interactive objects
  const handleObjectClick = (event: any) => {
    const object = event.object;
    
    // Check if this object or its parent is interactive
    let interactiveObject = object;
    let interactionType = object.userData.interactionType;
    
    // If clicked object is a book but has a parent bookshelf, treat it as bookshelf click
    if (object.userData.interactionType === 'book' && object.userData.parentBookshelf) {
      // Find the parent bookshelf object
      const parent = object.parent;
      
      if (parent && parent.userData.interactionType === 'bookshelf') {
        interactiveObject = parent;
        interactionType = 'bookshelf';
      } else {
        // Try to find the bookshelf parent by traversing up the hierarchy
        let currentParent = parent;
        while (currentParent && currentParent.parent) {
          currentParent = currentParent.parent;
          if (currentParent.userData.interactionType === 'bookshelf') {
            interactiveObject = currentParent;
            interactionType = 'bookshelf';
            break;
          }
        }
      }
    }
    
    if (interactiveObject.userData.isInteractive) {
      // Handle different interaction types
      switch (interactionType) {
        case 'desk':
          // TODO: Open scheduling modal/interface
          break;
        case 'bookshelf':
          // Trigger camera animation to focus on bookshelf
          if (onBookshelfClick) {
            onBookshelfClick();
          }
          break;
        case 'book':
          // TODO: Open individual book/material interface
          // Don't trigger camera animation for individual books
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
