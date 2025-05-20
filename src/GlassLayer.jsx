import React, { useMemo } from "react";
import { a, useSpring } from "@react-spring/three";
import { FrontSide, RepeatWrapping, TextureLoader } from "three";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import grainTextureSrc from "./asfalt-light.png"; // Ensure this file exists

export default function GlassLayer({
  i,
  clicked,
  onClick,
  hoveredIndex,
  setHoveredIndex,
  segmentHeight,
  baseRadius,
  layerCount,
  meshRef,
}) {
  const hue = 200 + i * 10;
  const thickness = 0.6 + i * 0.2;
  const ior = 1.45;

  const bottomRadius = baseRadius * (1 - i / layerCount);
  const topRadius = baseRadius * (1 - (i + 1) / layerCount);
  const yOffset = -((segmentHeight * layerCount) / 2) + segmentHeight * (i + 0.5);

  const grainTexture = useMemo(() => {
    const loader = new TextureLoader();
    const tex = loader.load(grainTextureSrc);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(10, 5);
    return tex;
  }, []);

  const spring = useSpring({
    position: clicked ? [0, -5, 0] : [0, yOffset, 0],
    opacity: clicked ? 0 : 1,
    scale: clicked ? [0.3, 0.3, 0.3] : [1, 1, 1],
    config: { mass: 1, tension: 120, friction: 18 },
  });

  return (
    <a.mesh
      ref={meshRef}
      position={spring.position}
      scale={spring.scale}
      rotation={[0, Math.PI / 4, 0]}
      onPointerOver={() => setHoveredIndex(i)}
      onPointerOut={() => setHoveredIndex(null)}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <cylinderGeometry
        args={[topRadius, bottomRadius, segmentHeight, 4, 1, true]}
      />
      <a.meshPhysicalMaterial
        color={`hsl(${hue}, 60%, 80%)`}
        transparent
        opacity={spring.opacity}
        transmission={0.95}
        roughnessMap={grainTexture}
        roughness={0.1}
        metalness={0}
        reflectivity={0.9}
        clearcoat={1}
        clearcoatRoughness={0.05}
        thickness={thickness}
        ior={ior}
        envMapIntensity={1.5}
        specularIntensity={1}
        specularColor="white"
        flatShading={false}
        depthWrite={false}
        depthTest={true}
        side={FrontSide}
      />

      {/* Add 3D $ icon */}
      <Text
        position={[0, 0, 0.1]} // Slightly in front of center
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineColor="#000"
        outlineWidth={0.02}
      >
        $
      </Text>

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
    </a.mesh>
  );
}
