import { useMemo } from "react";
import { a, useSpring } from "@react-spring/three";
import { FrontSide, RepeatWrapping, TextureLoader } from "three";
import * as THREE from "three";

import grainTextureSrc from "./asfalt-light.png";

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
  const thickness = 0.4 + 0.3 * Math.sin(i * 1.5);
  const ior = 1.3 + 0.15 * (i % 3);
  const transmission = 0.85 + 0.1 * Math.cos(i);
  const roughness = 0.05 + 0.1 * (i / layerCount);
  const clearcoat = 0.8 + 0.4 * (i / layerCount);
  const envMapIntensity = 1 + 0.5 * Math.sin(i);
  const specularIntensity = 0.8 + 0.4 * Math.cos(i * 0.7);

  const specularColor = useMemo(() => {
    return new THREE.Color().setHSL(((hue + i * 20) % 360) / 360, 0.7, 0.9);
  }, [hue, i]);

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

  const cylinderGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(topRadius, bottomRadius, segmentHeight, 4, 1, true);
  }, [topRadius, bottomRadius, segmentHeight]);

  const rotation = useMemo(() => [0, Math.PI / 4, 0], []);

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
      rotation={rotation}
      geometry={cylinderGeometry}
      onPointerOver={() => setHoveredIndex(i)}
      onPointerOut={() => setHoveredIndex(null)}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <a.meshPhysicalMaterial
        color={`hsl(${hue}, 60%, 80%)`}
        transparent
        opacity={spring.opacity}
        transmission={transmission}
        roughnessMap={grainTexture}
        roughness={roughness}
        metalness={0}
        reflectivity={0.9}
        clearcoat={clearcoat}
        clearcoatRoughness={0.05}
        thickness={thickness}
        ior={ior}
        envMapIntensity={envMapIntensity}
        specularIntensity={specularIntensity}
        specularColor={specularColor}
        flatShading={false}
        depthWrite={false}
        depthTest={true}
        side={FrontSide}
      />
    </a.mesh>
  );
}
