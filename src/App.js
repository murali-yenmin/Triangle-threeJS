// App.jsx

import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { LinearSRGBColorSpace, FrontSide } from "three";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function GlassPyramidLayers() {
  const [hovered, setHovered] = useState(false);
  const meshRefs = useRef([]);

  const layerCount = 4;
  const totalHeight = 3.5;
  const baseRadius = 2.8;
  const segmentHeight = totalHeight / layerCount;

  useFrame(() => {
    if (!hovered) {
      meshRefs.current.forEach((mesh) => {
        if (mesh) mesh.rotation.y += 0.003;
      });
    }
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "default";
    return () => (document.body.style.cursor = "default");
  }, [hovered]);

  return (
    <>
      {Array.from({ length: layerCount }).map((_, i) => {
        const hue = 200 + i * 10;
        const thickness = 0.6 + i * 0.2;
        const ior = 1.2 + i * 0.05;
        const opacity = 0.15 + i * 0.1;

        const bottomRadius = baseRadius * (1 - i / layerCount);
        const topRadius = baseRadius * (1 - (i + 1) / layerCount);
        const yOffset = -totalHeight / 2 + segmentHeight * (i + 0.5);

        return (
          <mesh
            key={i}
            ref={(el) => (meshRefs.current[i] = el)}
            position={[0, yOffset, 0]}
            rotation={[0, Math.PI / 4, 0]}
            onPointerOver={i === 0 ? () => setHovered(true) : undefined}
            onPointerOut={i === 0 ? () => setHovered(false) : undefined}
          >
            {/* Create frustum segment (like a short cone) */}
            <cylinderGeometry
              args={[topRadius, bottomRadius, segmentHeight, 4, 1, true]}
            />

            <meshPhysicalMaterial
              color={`hsl(${hue}, 100%, 60%)`}
              transparent
              opacity={opacity}
              transmission={1}
              roughness={0.02}
              metalness={0.3}
              reflectivity={1}
              clearcoat={1}
              clearcoatRoughness={0}
              thickness={thickness}
              ior={ior}
              envMapIntensity={2}
              specularIntensity={1}
              specularColor="white"
              flatShading={true}
              depthWrite={i === layerCount - 1}
              side={FrontSide}
            />

            <lineSegments>
              <edgesGeometry
                args={[
                  new THREE.CylinderGeometry(
                    topRadius,
                    bottomRadius,
                    segmentHeight,
                    4,
                    1,
                    true
                  ),
                ]}
              />
              <lineBasicMaterial color="white" linewidth={2} />
            </lineSegments>
          </mesh>
        );
      })}
    </>
  );
}

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
        camera={{ position: [0, 3.5, 9], fov: 45 }}
      >
        <ambientLight intensity={0.2} />
        <hemisphereLight intensity={0.4} groundColor="black" />
        <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
        <GlassPyramidLayers />
        <OrbitControls enableZoom={false} />
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
