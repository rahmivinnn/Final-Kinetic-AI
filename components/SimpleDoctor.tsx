'use client';

import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

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

// Simple 3D Doctor Character using basic shapes
const DoctorModel = () => {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#FFD5B8" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshStandardMaterial color="#4A86E8" />
      </mesh>
      
      {/* Left Arm */}
      <mesh position={[0.4, 0.8, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.6, 0.15, 0.15]} />
        <meshStandardMaterial color="#FFD5B8" />
      </mesh>
      
      {/* Right Arm */}
      <mesh position={[-0.4, 0.8, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.6, 0.15, 0.15]} />
        <meshStandardMaterial color="#FFD5B8" />
      </mesh>
      
      {/* Left Leg */}
      <mesh position={[0.15, 0, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.2]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
      
      {/* Right Leg */}
      <mesh position={[-0.15, 0, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.2]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
    </group>
  );
};

const SimpleDoctor = () => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
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
        
        <DoctorModel />
        
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

export default SimpleDoctor;
