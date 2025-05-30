import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import "../assests/css/layer-pyramid.css";

export default function NeonPyramid({ layers = [] }) {
  const groupRef = useRef();
  const pyramidRefs = useRef([]);

  const [activeHoverIndex, setActiveHoverIndex] = useState(null);
  const [bubbleHoverIndex, setBubbleHoverIndex] = useState(null);
  const [strictBubbleHoverIndex, setStrictBubbleHoverIndex] = useState(null);
  const [hoveredAreaCounts, setHoveredAreaCounts] = useState({}); // NEW

  const config = useMemo(
    () => ({
      radius: 10,
      height: 15,
      color: new THREE.Color("#009000"),
    }),
    []
  );

  const baseY = (i) => {
    const layerH = config.height / layers.length;
    const gap = 0.3;
    return -config.height / 2 + i * (layerH + gap) + layerH / 2;
  };

  const incrementHover = (i) => {
    setHoveredAreaCounts((prev) => {
      const next = { ...prev, [i]: (prev[i] || 0) + 1 };
      setActiveHoverIndex(i);
      return next;
    });
  };

  const decrementHover = (i) => {
    setHoveredAreaCounts((prev) => {
      const nextCount = (prev[i] || 0) - 1;
      const next = { ...prev, [i]: nextCount };
      if (nextCount <= 0) {
        delete next[i];
        setActiveHoverIndex((curr) => (curr === i ? null : curr));
        setBubbleHoverIndex(null);
        setStrictBubbleHoverIndex(null);
      }
      return next;
    });
  };

  useFrame(() => {
    groupRef.current.rotation.y += 0.01;

    pyramidRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const offset =
        activeHoverIndex !== null && index >= activeHoverIndex ? 3 : 0;
      ref.position.y = THREE.MathUtils.lerp(
        ref.position.y,
        baseY(index) + offset,
        0.1
      );

      const bubbleGroup = ref.getObjectByName(`bubble-${index}`);
      if (bubbleGroup) {
        bubbleGroup.position.y = THREE.MathUtils.lerp(
          bubbleGroup.position.y,
          activeHoverIndex === index ? -3.5 : 0,
          0.1
        );
      }
    });
  });

  return (
    <>
      <Environment preset="warehouse" background={false} />
      <group ref={groupRef} position={[0, 2, 0]}>
        {layers.map((layer, i) => {
          const layerHeight = config.height / layers.length;
          const top = config.radius * ((layers.length - i - 1) / layers.length);
          const bottom = config.radius * ((layers.length - i) / layers.length);

          return (
            <group
              key={i}
              ref={(el) => (pyramidRefs.current[i] = el)}
              position={[0, baseY(i), 0]}
            >
              {/* Layer */}
              <mesh
                geometry={
                  new THREE.CylinderGeometry(top, bottom, layerHeight, 4)
                }
                material={
                  new THREE.MeshStandardMaterial({
                    color: config.color,
                    roughness: 0.2,
                    metalness: 0.5,
                  })
                }
                onPointerOver={(e) => {
                  e.stopPropagation();
                  incrementHover(i);
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  decrementHover(i);
                  document.body.style.cursor = "default";
                }}
              />

              {/* Edges */}
              <lineSegments
                geometry={
                  new THREE.EdgesGeometry(
                    new THREE.CylinderGeometry(top, bottom, layerHeight, 4)
                  )
                }
                material={new THREE.LineBasicMaterial({ color: config.color })}
              />

              {/* Gap Hover Area */}
              <mesh
                position={[0, -1.75, 0]}
                scale={[1.5, 1.5, 1.5]}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  incrementHover(i);
                  setBubbleHoverIndex(i);
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  decrementHover(i);
                }}
              >
                <cylinderGeometry args={[1.5, 1.5, 3, 8]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>

              {/* Bubble Group */}
              <group name={`bubble-${i}`} position={[0, 0, 0]}>
                {/* Bubble Mesh */}
                <mesh
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    incrementHover(i);
                    setBubbleHoverIndex(i);
                    setStrictBubbleHoverIndex(i);
                    document.body.style.cursor = "pointer";
                  }}
                  onPointerOut={(e) => {
                    e.stopPropagation();
                    decrementHover(i);
                    setStrictBubbleHoverIndex(null);
                  }}
                >
                  <sphereGeometry args={[0.8, 32, 32]} />
                  <meshStandardMaterial
                    color={layer.color}
                    roughness={0.2}
                    metalness={0.5}
                  />
                </mesh>

                {/* Symbol */}
                <Html position={[0, 0, 0]} center>
                  <a
                    href="https://www.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bubble-symbol"
                    onMouseEnter={() => {
                      incrementHover(i);
                      setBubbleHoverIndex(i);
                      setStrictBubbleHoverIndex(i);
                      document.body.style.cursor = "pointer";
                    }}
                    onMouseLeave={() => {
                      decrementHover(i);
                      setStrictBubbleHoverIndex(null);
                    }}
                  >
                    {layer.symbol}
                  </a>
                </Html>

                {/* Bubble Label */}
                {strictBubbleHoverIndex === i && (
                  <Html position={[0, 0, 0]}>
                    <div className="bubble-label">{layer.text}</div>
                  </Html>
                )}
              </group>
            </group>
          );
        })}
      </group>
    </>
  );
}
