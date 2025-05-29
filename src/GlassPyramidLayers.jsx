import React, { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import GlassLayer from "./GlassLayer";
import * as THREE from "three";

export default function GlassPyramidLayers() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [clicked, setClicked] = useState(Array(4).fill(false));
  const meshRefs = useRef([]);

  const layerCount = 4;
  const totalHeight = 3.5;
  const baseRadius = 2.8;
  const segmentHeight = totalHeight / layerCount;

  const [textPosition, setTextPosition] = useState([0, 0, 0]);
  const [textVisible, setTextVisible] = useState(false);

  useFrame(() => {
    meshRefs.current.forEach((mesh, i) => {
      if (mesh && !clicked[i]) {
        mesh.rotation.y += 0.003;
      }
    });

    if (hoveredIndex !== null && meshRefs.current[hoveredIndex]) {
      const mesh = meshRefs.current[hoveredIndex];
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);

      const bbox = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      const offset = new THREE.Vector3(2.2, 0, 0); // right offset
      const finalPos = center.clone().add(offset);

      setTextPosition([finalPos.x, finalPos.y, finalPos.z]);
      setTextVisible(true);
    } else {
      setTextVisible(false);
    }
  });

  useEffect(() => {
    document.body.style.cursor = hoveredIndex !== null ? "pointer" : "default";
    return () => (document.body.style.cursor = "default");
  }, [hoveredIndex]);

  return (
    <>
      {Array.from({ length: layerCount }).map((_, i) =>
        clicked[i] ? null : (
          <GlassLayer
            key={i}
            i={i}
            clicked={clicked[i]}
            // onClick={() => {
            //   const updated = [...clicked];
            //   updated[i] = true;
            //   setClicked(updated);
            // }}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            segmentHeight={segmentHeight}
            baseRadius={baseRadius}
            layerCount={layerCount}
            meshRef={(el) => (meshRefs.current[i] = el)}
          />
        )
      )}

      {textVisible && (
        <Text
          position={textPosition}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineColor="#000"
          outlineWidth={0.02}
          rotation={[0, 0, 0]}
        >
          Menu
        </Text>
      )}
    </>
  );
}
