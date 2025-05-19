// App.js
import React from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";
import NeonPyramid from "./NeonPyramid";

export default function App() {
  return (
    <div style={{ height: "100vh", width: "100vw", background: "black" }}>
      <Canvas camera={{ position: [0, 10, 35], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <NeonPyramid />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
            intensity={0.5} 
            radius={0.8}
          />
        </EffectComposer>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

