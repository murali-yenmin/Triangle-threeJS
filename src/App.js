import React from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";

import { pyramidLayers, cameraPosition } from "./utils/constants";
import NeonPyramid from "./components/LayerPyramid";
import SceneBackground from "./components/SceneBackground";
// import PowerBIEmbeded from "./components/PowerBIEmbeded";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: cameraPosition, fov: 45 }}>
        <SceneBackground />
        <ambientLight intensity={0.5} />
        <directionalLight position={cameraPosition} intensity={1} castShadow />
        <NeonPyramid layers={pyramidLayers} />
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.2} radius={0.5} />
        </EffectComposer>
        <OrbitControls enableZoom={false} />
      </Canvas>
      {/* <PowerBIEmbeded /> */}
    </div>
  );
}
