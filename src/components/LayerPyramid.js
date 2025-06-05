import React, { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";
import AnimatedLabel from "./AnimatedLabel";
import * as THREE from "three";
import "../assests/css/layer-pyramid.css";

export default function NeonPyramid({ layers = [] }) {
  const groupRef = useRef();
  const pyramidRefs = useRef([]);
  const bubbleInitFlags = useRef({});


  const [activeHoverIndex, setActiveHoverIndex] = useState(null);
  const [bubbleHoverIndex, setBubbleHoverIndex] = useState(null);
  const [strictBubbleHoverIndex, setStrictBubbleHoverIndex] = useState(null);
  const [hoveredAreaCounts, setHoveredAreaCounts] = useState({});

  const { viewport } = useThree();

  // Responsive scale factor based on viewport width
  const scaleFactor = useMemo(() => Math.min(viewport.width / 10, 1), [viewport.width]);

  const config = useMemo(() => {
    const adjustedRadius = viewport.width < 6 ? 6 : 10;
    return {
      radius: adjustedRadius,
      height: 15,
      color: new THREE.Color("#009000"),
    };
  }, [viewport.width]);

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
    if (groupRef.current) groupRef.current.rotation.y += 0.02;

    pyramidRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const offset = activeHoverIndex !== null && index >= activeHoverIndex ? 3 : 0;
      ref.position.y = THREE.MathUtils.lerp(
        ref.position.y,
        baseY(index) + offset,
        0.1
      );

      const bubbleGroup = ref.getObjectByName(`bubble-${index}`);
      if (bubbleGroup) {
        const isZeroLayer = index === 0;
        const layerHeight = config.height / layers.length;
        const sphereRadius = 0.8;
        const verticalNudge = 0.5;


        const centerInsideLayer = -layerHeight / 2 + sphereRadius / 2 + verticalNudge;
        const baseDrop = -layerHeight / 2 - sphereRadius - 0.5;
        const baseExtraPush = 0.3;
        const zeroLayerExtraPush = 0.6;

        const totalDrop =
          baseDrop
          - baseExtraPush
          - (isZeroLayer ? zeroLayerExtraPush : 0);

        const targetY =
          activeHoverIndex === index
            ? totalDrop
            : isZeroLayer
              ? centerInsideLayer
              : 0;

        if (isZeroLayer && !bubbleInitFlags.current[index]) {
          bubbleGroup.position.y = targetY;
          bubbleInitFlags.current[index] = true;
        } else {
          bubbleGroup.position.y = THREE.MathUtils.lerp(
            bubbleGroup.position.y,
            targetY,
            0.1
          );
        }
      }

    });

  });

  return (
    <>
      <Environment preset="warehouse" background={false} />
      <group
        ref={groupRef}
        position={[0, viewport.height < 6 ? 1 : 2, 0]}
        scale={[scaleFactor, scaleFactor, scaleFactor]}
      >
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
              {/* Layer Mesh */}
              <mesh
                geometry={new THREE.CylinderGeometry(top, bottom, layerHeight, 4)}
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

              {/* Invisible Hover Area for Gap */}
              <mesh
                position={[0, -2, 0]}
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


                {/* Bubble Symbol */}
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

                <Html position={[0, 0, 0]}>
                  <AnimatedLabel
                    text={layer.text}
                    visible={strictBubbleHoverIndex === i}
                  />
                </Html>
              </group>
            </group>
          );

        })}
      </group>
    </>

  );
}

