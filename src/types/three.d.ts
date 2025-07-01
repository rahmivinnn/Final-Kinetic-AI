/// <reference types="@react-three/fiber" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Primitives
      mesh: any;
      group: any;
      
      // Geometries
      boxGeometry: any;
      sphereGeometry: any;
      torusGeometry: any;
      
      // Materials
      meshStandardMaterial: any;
      
      // Lights
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      
      // Misc
      color: any;
    }
  }
}
