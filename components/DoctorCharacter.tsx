'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Add type declarations for JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      group: any;
    }
  }
}

// Define component props
interface BoxProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number, number];
  color?: string;
}

interface SphereProps {
  position?: [number, number, number];
  radius?: number;
  color?: string;
}

// Helper components with proper typing
const Box: React.FC<BoxProps> = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  size = [1, 1, 1], 
  color = 'gray' 
}) => (
  <mesh position={position} rotation={rotation}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} />
  </mesh>
);

const Sphere: React.FC<SphereProps> = ({ 
  position = [0, 0, 0], 
  radius = 1, 
  color = 'gray' 
}) => (
  <mesh position={position}>
    <sphereGeometry args={[radius, 32, 32]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

// 3D Doctor Model Component
const DoctorModel: React.FC = () => {
  return (
    <group>
      {/* Head */}
      <Sphere 
        position={[0, 1.6, 0]} 
        radius={0.3} 
        color="#FFD5B8" 
      />
      
      {/* Body */}
      <Box 
        position={[0, 0.8, 0]} 
        size={[0.6, 1, 0.3]} 
        color="#4A86E8" 
      />
      
      {/* Left Arm */}
      <Box 
        position={[0.4, 0.8, 0]} 
        rotation={[0, 0, -0.5]}
        size={[0.6, 0.15, 0.15]} 
        color="#FFD5B8"
      />
      
      {/* Right Arm */}
      <Box 
        position={[-0.4, 0.8, 0]} 
        rotation={[0, 0, 0.5]}
        size={[0.6, 0.15, 0.15]} 
        color="#FFD5B8"
      />
      
      {/* Left Leg */}
      <Box 
        position={[0.15, 0, 0]} 
        size={[0.15, 0.6, 0.2]} 
        color="#1E3A8A"
      />
      
      {/* Right Leg */}
      <Box 
        position={[-0.15, 0, 0]} 
        size={[0.15, 0.6, 0.2]} 
        color="#1E3A8A"
      />
    </group>
  );
};

// Main component with lighting and camera controls
const DoctorCharacter: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '400px', backgroundColor: '#1a1a1a' }}>
      <Canvas
        camera={{ position: [0, 1, 2.5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />
        
        <Suspense fallback={null}>
          <DoctorModel />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default DoctorCharacter;
