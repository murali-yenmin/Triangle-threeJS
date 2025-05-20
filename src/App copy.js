import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { LinearSRGBColorSpace } from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import GlassPyramidLayers from "./GlassPyramidLayers";

export default function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        margin: 0,
        padding: 0,
      }}
    >
      <Canvas
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor("black");
          gl.outputColorSpace = LinearSRGBColorSpace;
        }}
        camera={{ position: [0, 0, 9], fov: 45 }}
        shadows
      >
        <ambientLight intensity={0.2} />
        <hemisphereLight intensity={0.4} groundColor="black" />
        <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
        <GlassPyramidLayers />
        <OrbitControls enableZoom={false} enableRotate={false} />
        <Environment preset="sunset" background={false} />
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
