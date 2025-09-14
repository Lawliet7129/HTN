import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Object3D, Bone, Skeleton, Mesh, MeshStandardMaterial } from 'three';

interface HumanProps {
  onModelLoaded?: (model: Group) => void;
  onHierarchyBuilt?: (hierarchy: any) => void;
  isWalking?: boolean;
  walkingSpeed?: number;
}

interface NodeHierarchy {
  name: string;
  type: string;
  children: NodeHierarchy[];
  userData: any;
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isBone?: boolean;
  isMesh?: boolean;
  isSkeleton?: boolean;
  boneIndex?: number;
  skeletonBones?: string[];
}

export const Human: React.FC<HumanProps> = ({ 
  onModelLoaded, 
  onHierarchyBuilt
}) => {
  const groupRef = useRef<Group>(null);
  const { nodes, materials, scene } = useGLTF('/assets/glb/human.glb');
  const [scaledScene, setScaledScene] = React.useState<Group | null>(null);

  // Function to build node hierarchy structure with detailed logging
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

    // Log bone information
    if (obj instanceof Bone) {
      hierarchy.isBone = true;
      hierarchy.boneIndex = (obj as any).index;
      console.log(`🦴 BONE FOUND: ${obj.name} (Index: ${(obj as any).index})`);
    }

    // Log mesh information
    if (obj instanceof Mesh) {
      hierarchy.isMesh = true;
      console.log(`🎭 MESH FOUND: ${obj.name} (Vertices: ${obj.geometry?.attributes?.position?.count || 'Unknown'})`);
    }

    // Log skeleton information
    if (obj instanceof Skeleton) {
      hierarchy.isSkeleton = true;
      const bones = (obj as any).bones?.map((bone: any) => bone.name) || [];
      hierarchy.skeletonBones = bones;
      console.log(`🦴 SKELETON FOUND: ${obj.name} with ${bones.length} bones:`, bones);
    }

    // Log general object information
    console.log(`${'  '.repeat(depth)}📦 ${obj.name} (${obj.type}) - Pos: (${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})`);

    // Recursively build children hierarchy
    obj.children.forEach((child, index) => {
      console.log(`${'  '.repeat(depth + 1)}└─ Child ${index + 1}: ${child.name} (${child.type})`);
      hierarchy.children.push(buildNodeHierarchy(child, depth + 1));
    });

    return hierarchy;
  };

  // Function to identify and log animation-related objects
  const identifyAnimationObjects = (obj: Object3D) => {
    const animationData = {
      bones: [] as Object3D[],
      meshes: [] as Object3D[],
      skeletons: [] as Object3D[],
      animations: [] as any[],
      materials: [] as any[]
    };

    obj.traverse((child) => {
      // Identify bones
      if (child instanceof Bone) {
        animationData.bones.push(child);
        console.log(`🦴 Animation Bone: ${child.name} - Index: ${(child as any).index}`);
      }

      // Identify meshes
      if (child instanceof Mesh) {
        animationData.meshes.push(child);
        console.log(`🎭 Animated Mesh: ${child.name} - Vertices: ${child.geometry?.attributes?.position?.count || 'Unknown'}`);
        
        // Log material information
        if (child.material) {
          animationData.materials.push(child.material);
          console.log(`🎨 Material: ${child.name} - Type: ${child.material.type}`);
        }
      }

      // Identify skeletons
      if (child instanceof Skeleton) {
        animationData.skeletons.push(child);
        const bones = (child as any).bones || [];
        console.log(`🦴 Skeleton: ${child.name} - Bones: ${bones.length}`);
      }
    });

    // Log animation clips if available
    if ((obj as any).animations) {
      (obj as any).animations.forEach((clip: any, index: number) => {
        animationData.animations.push(clip);
        console.log(`🎬 Animation Clip ${index + 1}: ${clip.name} - Duration: ${clip.duration.toFixed(2)}s - Tracks: ${clip.tracks.length}`);
      });
    }

    return animationData;
  };

  // Function to log bone hierarchy for animation setup
  const logBoneHierarchy = (obj: Object3D) => {
    console.log('\n🦴 BONE HIERARCHY FOR ANIMATION:');
    console.log('=====================================');

    const logBone = (bone: Object3D, depth: number = 0) => {
      const indent = '  '.repeat(depth);
      if (bone instanceof Bone) {
        console.log(`${indent}🦴 ${bone.name} (Bone ${(bone as any).index})`);
        console.log(`${indent}   Position: (${bone.position.x.toFixed(3)}, ${bone.position.y.toFixed(3)}, ${bone.position.z.toFixed(3)})`);
        console.log(`${indent}   Rotation: (${bone.rotation.x.toFixed(3)}, ${bone.rotation.y.toFixed(3)}, ${bone.rotation.z.toFixed(3)})`);
        console.log(`${indent}   Scale: (${bone.scale.x.toFixed(3)}, ${bone.scale.y.toFixed(3)}, ${bone.scale.z.toFixed(3)})`);
      }
      
      bone.children.forEach(child => logBone(child, depth + 1));
    };

    obj.traverse((child) => {
      if (child instanceof Bone && !child.parent) {
        logBone(child);
      }
    });
  };

  // Function to log mesh information for skinning
  const logMeshSkinningInfo = (obj: Object3D) => {
    console.log('\n🎭 MESH SKINNING INFORMATION:');
    console.log('================================');

    obj.traverse((child) => {
      if (child instanceof Mesh) {
        const mesh = child as Mesh;
        const skeleton = (mesh as any).skeleton;
        
        console.log(`🎭 Mesh: ${mesh.name}`);
        console.log(`   Type: ${mesh.type}`);
        console.log(`   Visible: ${mesh.visible}`);
        console.log(`   Cast Shadow: ${mesh.castShadow}`);
        console.log(`   Receive Shadow: ${mesh.receiveShadow}`);
        console.log(`   Vertices: ${mesh.geometry?.attributes?.position?.count || 'Unknown'}`);
        
        // Log material information
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat, i) => {
              console.log(`   Material ${i}: ${mat.type} - Visible: ${mat.visible !== false}`);
            });
          } else {
            console.log(`   Material: ${mesh.material.type}`);
            console.log(`   Material Visible: ${mesh.material.visible !== false}`);
          }
        }
        
        if (skeleton) {
          console.log(`   Skeleton: ${skeleton.name || 'Unnamed'}`);
          console.log(`   Bones: ${skeleton.bones?.length || 0}`);
          
          // Log skin weights if available
          if (mesh.geometry?.attributes?.skinWeight) {
            console.log(`   Skin Weights: ${mesh.geometry.attributes.skinWeight.count} vertices`);
          }
          if (mesh.geometry?.attributes?.skinIndex) {
            console.log(`   Skin Indices: ${mesh.geometry.attributes.skinIndex.count} vertices`);
          }
        }
      }
    });
  };

  // Function to create fallback meshes for problematic SkinnedMeshes
  const createFallbackMeshes = (obj: Object3D) => {
    console.log('\n🔄 CREATING FALLBACK MESHES...');
    console.log('================================');

    obj.traverse((child) => {
      if (child instanceof Mesh && child.type === 'SkinnedMesh') {
        const skinnedMesh = child as any;
        console.log(`🔄 Creating fallback for SkinnedMesh: ${child.name}`);
        
        // Create a simple visible material
        const fallbackMaterial = new MeshStandardMaterial({
          color: 0x87ceeb, // Light blue
          transparent: false,
          opacity: 1,
          visible: true,
          side: 2 // DoubleSide
        });
        
        // Force the material
        skinnedMesh.material = fallbackMaterial;
        skinnedMesh.visible = true;
        skinnedMesh.frustumCulled = false;
        
        // If skeleton exists, try to update it
        if (skinnedMesh.skeleton) {
          skinnedMesh.skeleton.update();
        }
        
        console.log(`✅ Fallback created for ${child.name}`);
      }
    });
  };

  // Function to force create visible materials for problematic meshes
  const forceVisibleMaterials = (obj: Object3D) => {
    console.log('\n🎨 FORCING VISIBLE MATERIALS...');
    console.log('=================================');

    obj.traverse((child) => {
      if (child instanceof Mesh) {
        const mesh = child as Mesh;
        console.log(`🎨 Checking material for mesh: ${mesh.name}`);
        
        let needsNewMaterial = false;
        
        // Check if material is invisible or problematic
        if (!mesh.material) {
          console.log(`   ❌ No material found for ${mesh.name}`);
          needsNewMaterial = true;
        } else if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat, index) => {
            if (!mat.visible || mat.opacity === 0) {
              console.log(`   ❌ Material ${index} is invisible for ${mesh.name}`);
              needsNewMaterial = true;
            }
          });
        } else {
          if (!mesh.material.visible || mesh.material.opacity === 0) {
            console.log(`   ❌ Material is invisible for ${mesh.name}`);
            needsNewMaterial = true;
          }
        }
        
        if (needsNewMaterial) {
          console.log(`   🔧 Creating new visible material for ${mesh.name}`);
          
          // Create a new visible material
          const newMaterial = new MeshStandardMaterial({
            color: mesh.name.includes('Face') ? 0xffdbac : // Skin color for face
                   mesh.name.includes('Hair') ? 0x8b4513 : // Brown for hair
                   0x87ceeb, // Light blue for body
            transparent: false,
            opacity: 1,
            visible: true,
            side: 2 // DoubleSide
          });
          
          mesh.material = newMaterial;
          mesh.visible = true;
          console.log(`   ✅ Created new material for ${mesh.name}`);
        }
      }
    });
  };

  // Function to fix skeleton binding issues
  const fixSkeletonBinding = (obj: Object3D) => {
    console.log('\n🦴 FIXING SKELETON BINDING...');
    console.log('==============================');

    // Find all bones and create a map
    const boneMap = new Map();
    obj.traverse((child) => {
      if (child instanceof Bone) {
        boneMap.set(child.name, child);
      }
    });

    console.log(`🦴 Found ${boneMap.size} bones in the model`);

    // Find all SkinnedMeshes and fix their skeleton binding
    obj.traverse((child) => {
      if (child instanceof Mesh && child.type === 'SkinnedMesh') {
        const skinnedMesh = child as any;
        console.log(`🔧 Fixing skeleton binding for SkinnedMesh: ${child.name}`);
        
        if (skinnedMesh.skeleton) {
          const skeleton = skinnedMesh.skeleton;
          console.log(`   📋 Original skeleton has ${skeleton.bones?.length || 0} bones`);
          
          // Ensure all bones in the skeleton are properly referenced
          if (skeleton.bones) {
            skeleton.bones.forEach((bone: any, index: number) => {
              if (bone && bone.name) {
                const foundBone = boneMap.get(bone.name);
                if (foundBone) {
                  skeleton.bones[index] = foundBone;
                  console.log(`   ✅ Bone ${index}: ${bone.name} properly bound`);
                } else {
                  console.log(`   ⚠️ Bone ${index}: ${bone.name} not found in bone map`);
                }
              }
            });
          }
          
          // Force skeleton update
          skeleton.update();
          console.log(`   🔄 Skeleton updated`);
        } else {
          console.log(`   ❌ No skeleton found for SkinnedMesh: ${child.name}`);
        }
      }
    });
  };

  // Function to fix common rendering issues
  const fixRenderingIssues = (obj: Object3D) => {
    console.log('\n🔧 FIXING RENDERING ISSUES...');
    console.log('===============================');

    obj.traverse((child) => {
      if (child instanceof Mesh) {
        const mesh = child as Mesh;
        const isSkinnedMesh = mesh.type === 'SkinnedMesh';
        
        console.log(`🔧 Processing ${isSkinnedMesh ? 'SkinnedMesh' : 'Mesh'}: ${mesh.name}`);
        
        // Ensure mesh is visible
        mesh.visible = true;
        
        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Special handling for SkinnedMesh
        if (isSkinnedMesh) {
          const skinnedMesh = mesh as any;
          console.log(`   🦴 SkinnedMesh specific fixes for: ${mesh.name}`);
          
          // Ensure skeleton is properly bound
          if (skinnedMesh.skeleton) {
            console.log(`   ✅ Skeleton found: ${skinnedMesh.skeleton.bones?.length || 0} bones`);
            
            // Force skeleton update
            skinnedMesh.skeleton.update();
            
            // Ensure bind matrix is properly set
            if (skinnedMesh.bindMatrix) {
              skinnedMesh.bindMatrixInverse.copy(skinnedMesh.bindMatrix).invert();
            }
          } else {
            console.log(`   ⚠️ No skeleton found for SkinnedMesh: ${mesh.name}`);
          }
          
          // Ensure skin weights and indices are present
          if (mesh.geometry) {
            const geometry = mesh.geometry as any;
            if (geometry.attributes.skinWeight && geometry.attributes.skinIndex) {
              console.log(`   ✅ Skin weights and indices found`);
            } else {
              console.log(`   ⚠️ Missing skin weights or indices`);
            }
          }
          
          // Force the SkinnedMesh to be visible with a fallback approach
          console.log(`   🔧 Applying aggressive visibility fixes for SkinnedMesh: ${mesh.name}`);
          
          // Force material to be visible
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                mat.visible = true;
                mat.transparent = false;
                mat.opacity = 1;
              });
            } else {
              mesh.material.visible = true;
              mesh.material.transparent = false;
              mesh.material.opacity = 1;
            }
          }
          
          // Force geometry to be valid
          if (mesh.geometry) {
            mesh.geometry.computeBoundingBox();
            mesh.geometry.computeBoundingSphere();
            mesh.geometry.computeVertexNormals();
          }
          
          // Force the mesh to be in the scene
          mesh.frustumCulled = false;
          mesh.renderOrder = 0;
        }
        
        // Fix material visibility
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat, index) => {
              mat.visible = true;
              // Ensure material is not transparent if it shouldn't be
              if (mat.transparent && mat.opacity === 0) {
                mat.opacity = 1;
                mat.transparent = false;
              }
              console.log(`   🎨 Material ${index}: ${mat.type} - Visible: ${mat.visible}`);
            });
          } else {
            mesh.material.visible = true;
            // Ensure material is not transparent if it shouldn't be
            if (mesh.material.transparent && mesh.material.opacity === 0) {
              mesh.material.opacity = 1;
              mesh.material.transparent = false;
            }
            console.log(`   🎨 Material: ${mesh.material.type} - Visible: ${mesh.material.visible}`);
          }
        }
        
        // Ensure geometry is properly disposed and updated
        if (mesh.geometry) {
          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
          console.log(`   📐 Geometry bounds computed`);
        }
        
        console.log(`✅ Fixed ${isSkinnedMesh ? 'SkinnedMesh' : 'Mesh'}: ${mesh.name}`);
      }
    });
  };

  useEffect(() => {
    if (scene) {
      console.log('\n🚀 LOADING HUMAN MODEL...');
      console.log('==========================');

      // Clone the scene to avoid modifying the original
      const clonedScene = scene.clone();
      
      // Scale the human model appropriately (adjust as needed)
      clonedScene.scale.set(1, 1, 1);
      clonedScene.position.set(0, 0, 0);
      
      console.log(`📦 Root Object: ${clonedScene.name} (${clonedScene.type})`);
      console.log(`📦 Children Count: ${clonedScene.children.length}`);
      
      // Build node hierarchy for the 3D model
      const hierarchy = buildNodeHierarchy(clonedScene);
      
      // Call the hierarchy callback if provided
      if (onHierarchyBuilt) {
        onHierarchyBuilt(hierarchy);
      }
      
      // Identify animation-related objects
      const animationData = identifyAnimationObjects(clonedScene);
      
      // Log bone hierarchy
      logBoneHierarchy(clonedScene);
      
      // Log mesh skinning information
      logMeshSkinningInfo(clonedScene);
      
      // Force visible materials first
      forceVisibleMaterials(clonedScene);
      
      // Fix skeleton binding issues
      fixSkeletonBinding(clonedScene);
      
      // Fix rendering issues
      fixRenderingIssues(clonedScene);
      
      // Create fallback meshes as last resort
      createFallbackMeshes(clonedScene);
      
      // Log summary
      console.log('\n📊 HUMAN MODEL SUMMARY:');
      console.log('========================');
      console.log(`🦴 Total Bones: ${animationData.bones.length}`);
      console.log(`🎭 Total Meshes: ${animationData.meshes.length}`);
      console.log(`🦴 Total Skeletons: ${animationData.skeletons.length}`);
      console.log(`🎬 Animation Clips: ${animationData.animations.length}`);
      console.log(`🎨 Materials: ${animationData.materials.length}`);
      
      // Set the scaled scene for rendering
      setScaledScene(clonedScene);
      
      // Call the onModelLoaded callback if provided
      if (onModelLoaded) {
        onModelLoaded(clonedScene);
      }
    }
  }, [scene, onModelLoaded, onHierarchyBuilt]);

  // Manual walking animation since the model has no animations
  useEffect(() => {
    console.log('🎬 No animations available, will create manual walking motion');
    console.log('📋 Available nodes:', Object.keys(nodes || {}));
  }, [nodes]);

  // Animation frame for continuous updates and head animation
  useFrame((state) => {
    // Update skeleton for SkinnedMesh rendering
    if (scaledScene) {
      scaledScene.traverse((child) => {
        if (child instanceof Mesh && child.type === 'SkinnedMesh') {
          const skinnedMesh = child as any;
          if (skinnedMesh.skeleton) {
            skinnedMesh.skeleton.update();
          }
        }
      });
    }

    // Adjust human posture to be more natural (arms down from T-pose)
    if (nodes) {
      // Debug: Log which bones are found (only once)
      const time = state.clock.elapsedTime;
      if (Math.floor(time) === 1) {
        console.log('🦴 Human model loaded with bones:');
        console.log('   Left Hip (mixamorigLeftUpLeg_28):', !!nodes.mixamorigLeftUpLeg_28);
        console.log('   Right Hip (mixamorigRightUpLeg_33):', !!nodes.mixamorigRightUpLeg_33);
        console.log('   Left Knee (mixamorigLeftLeg_27):', !!nodes.mixamorigLeftLeg_27);
        console.log('   Right Knee (mixamorigRightLeg_32):', !!nodes.mixamorigRightLeg_32);
        console.log('   Left Arm (mixamorigLeftArm_11):', !!nodes.mixamorigLeftArm_11);
        console.log('   Right Arm (mixamorigRightArm_19):', !!nodes.mixamorigRightArm_19);
        console.log('   Spine (mixamorigSpine_23):', !!nodes.mixamorigSpine_23);
        console.log('   Head (mixamorigHead_3):', !!nodes.mixamorigHead_3);
        console.log('🎯 Adjusting human posture to natural standing pose');
      }

      // Adjust arms to natural position (bring down from T-pose)
      if (nodes.mixamorigLeftArm_11) {
        const leftArm = nodes.mixamorigLeftArm_11 as any;
        // Rotate arm down to natural hanging position
        leftArm.rotation.x = Math.PI / 2; // 90 degrees down from T-pose
        leftArm.rotation.z = 0.1; // Slight natural arm angle
      }
      
      if (nodes.mixamorigRightArm_19) {
        const rightArm = nodes.mixamorigRightArm_19 as any;
        // Rotate arm down to natural hanging position
        rightArm.rotation.x = Math.PI / 2; // 90 degrees down from T-pose
        rightArm.rotation.z = -0.1; // Slight natural arm angle (opposite)
      }

      // Adjust shoulders for natural arm position
      if (nodes.mixamorigLeftShoulder_12) {
        const leftShoulder = nodes.mixamorigLeftShoulder_12 as any;
        leftShoulder.rotation.y = 0.3; // Slight shoulder adjustment
      }
      
      if (nodes.mixamorigRightShoulder_20) {
        const rightShoulder = nodes.mixamorigRightShoulder_20 as any;
        rightShoulder.rotation.y = -0.3; // Slight shoulder adjustment
      }

      // Slight spine adjustment for natural posture
      if (nodes.mixamorigSpine_23) {
        const spine = nodes.mixamorigSpine_23 as any;
        spine.rotation.x = 0.05; // Slight forward lean for natural posture
      }

      // Add very subtle head nodding animation
      if (nodes.mixamorigHead_3) {
        const head = nodes.mixamorigHead_3 as any;
        const time = state.clock.elapsedTime;
        
        // Base natural head position
        const baseRotation = 0.0;
        
        // Very subtle nodding motion
        const nodAmount = Math.sin(time * 1.5) * 0.06; // Very small nodding motion
        head.rotation.x = baseRotation + nodAmount;
        
        // Very subtle side-to-side movement
        const swayAmount = Math.sin(time * 0.8) * 0.02; // Even smaller sway
        head.rotation.z = swayAmount;
      }
    }
  });

  // Use the working approach if nodes and materials are available
  if (nodes && materials) {
    console.log('🎯 Using working GLTF nodes approach');
    console.log('📋 Available nodes:', Object.keys(nodes));
    console.log('🎨 Available materials:', Object.keys(materials));
    console.log('🎬 No animations available');
    
    // Animation control is now handled in the main useEffect above
    
    // Call the onModelLoaded callback if provided
    if (onModelLoaded) {
      onModelLoaded(scene);
    }
    
    return (
      <group ref={groupRef}>
        <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.GLTF_created_0_rootJoint} />
          <skinnedMesh
            geometry={(nodes.Object_7 as any).geometry}
            material={materials['Material.001'] || materials[Object.keys(materials)[0]]}
            skeleton={(nodes.Object_7 as any).skeleton}
          />
        </group>
      </group>
    );
  }

  // Fallback to original approach if nodes/materials not available
  if (!scaledScene) {
    return null;
  }

  return (
    <group ref={groupRef}>
        <primitive 
          object={scaledScene}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        />
    </group>
  );
};

// Preload the GLB file
useGLTF.preload('/assets/glb/human.glb');

export default Human;
