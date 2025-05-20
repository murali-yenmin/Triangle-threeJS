import React, { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import GlassLayer from "./GlassLayer";

export default function GlassPyramidLayers() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [clicked, setClicked] = useState(Array(4).fill(false));
  const meshRefs = useRef([]);

  const layerCount = 4;
  const totalHeight = 3.5;
  const baseRadius = 2.8;
  const segmentHeight = totalHeight / layerCount;

  useFrame(() => {
    meshRefs.current.forEach((mesh, i) => {
      if (mesh && !clicked[i]) {
        mesh.rotation.y += 0.003;
      }
    });
  });

  useEffect(() => {
    document.body.style.cursor = hoveredIndex !== null ? "pointer" : "default";
    return () => (document.body.style.cursor = "default");
  }, [hoveredIndex]);

  return (
    <>
      {Array.from({ length: layerCount }).map((_, i) => 
        clicked[i] ?null: (
          <GlassLayer
            key={i}
            i={i}
            clicked={clicked[i]}
            // onClick={() => {
            //   const updated = [...clicked];
            //     updated[i] = true;
            //     console.log(updated,"updated")
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
    </>
  );
}
