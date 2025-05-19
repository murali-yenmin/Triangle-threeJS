import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./Pyramid.css";

export default function NeonPyramid() {
  const groupRef = useRef();
  const linesRef = useRef();
  const dotsRef = useRef();
  const textRef = useRef();

  const [isHovered, setIsHovered] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [particles, setParticles] = useState([]);
  const [animationPhase, setAnimationPhase] = useState("idle");
  const [showMenus, setShowMenus] = useState(false);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);

  const radius = 10;
  const height = 13;
  const subdivisions = 10;

  const apex = new THREE.Vector3(0, height / 2, 0);
  const baseCorners = [
    new THREE.Vector3(-radius, -height / 2, -radius),
    new THREE.Vector3(radius, -height / 2, -radius),
    new THREE.Vector3(radius, -height / 2, radius),
    new THREE.Vector3(-radius, -height / 2, radius),
  ];

  const basePoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= subdivisions; i++) {
      for (let j = 0; j <= subdivisions; j++) {
        const x = THREE.MathUtils.lerp(
          baseCorners[0].x,
          baseCorners[1].x,
          i / subdivisions
        );
        const z = THREE.MathUtils.lerp(
          baseCorners[0].z,
          baseCorners[3].z,
          j / subdivisions
        );
        points.push(new THREE.Vector3(x, baseCorners[0].y, z));
      }
    }
    return points;
  }, [subdivisions]);

  const sidePoints = useMemo(() => {
    const sides = [];
    for (let sideIndex = 0; sideIndex < 4; sideIndex++) {
      const p0 = apex;
      const p1 = baseCorners[sideIndex];
      const p2 = baseCorners[(sideIndex + 1) % 4];

      const sideGrid = [];
      for (let i = 0; i <= subdivisions; i++) {
        const edgeStart = new THREE.Vector3().lerpVectors(
          p0,
          p1,
          i / subdivisions
        );
        const edgeEnd = new THREE.Vector3().lerpVectors(
          p0,
          p2,
          i / subdivisions
        );
        for (let j = 0; j <= i; j++) {
          const point = new THREE.Vector3().lerpVectors(
            edgeStart,
            edgeEnd,
            j / (i || 1)
          );
          sideGrid.push(point);
        }
      }
      sides.push(sideGrid);
    }
    return sides;
  }, [subdivisions]);

  const linesGeometry = useMemo(() => {
    const vertices = [];
    for (let i = 0; i <= subdivisions; i++) {
      for (let j = 0; j < subdivisions; j++) {
        if (j % 3 !== 0) {
          const p1 = basePoints[i * (subdivisions + 1) + j];
          const p2 = basePoints[i * (subdivisions + 1) + j + 1];
          vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    for (let j = 0; j <= subdivisions; j++) {
      for (let i = 0; i < subdivisions; i++) {
        const p1 = basePoints[i * (subdivisions + 1) + j];
        const p2 = basePoints[(i + 1) * (subdivisions + 1) + j];
        vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }

    sidePoints.forEach((sideGrid) => {
      let index = 0;
      for (let row = 0; row <= subdivisions; row++) {
        for (let col = 0; col < row; col++) {
          const p1 = sideGrid[index + col];
          const p2 = sideGrid[index + col + 1];
          vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
        if (row < subdivisions) {
          for (let col = 0; col <= row; col++) {
            const p1 = sideGrid[index + col];
            const p2 = sideGrid[index + row + 1 + col];
            vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
          }
        }
        index += row + 1;
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [basePoints, sidePoints]);

  const dots = useMemo(() => {
    const allPoints = [...basePoints];
    sidePoints.forEach((sideGrid) => allPoints.push(...sideGrid));
    const uniquePointsMap = new Map();
    allPoints.forEach((pt) => {
      const key = `${pt.x.toFixed(5)}_${pt.y.toFixed(5)}_${pt.z.toFixed(5)}`;
      if (!uniquePointsMap.has(key)) uniquePointsMap.set(key, pt);
    });
    return Array.from(uniquePointsMap.values()).map((pt) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: "#00ffff" })
      );
      dot.position.copy(pt);
      return dot;
    });
  }, [basePoints, sidePoints]);

  const handlePyramidClick = () => {
    setAnimationPhase("shake");
    setShakeCount(0);
  };

  useFrame(() => {
    if (!groupRef.current) return;

    if (animationPhase === "idle" && !isHovered) {
      groupRef.current.rotation.y += 0.01;
    }

    if (animationPhase === "shake") {
      const shakeProgress = (Date.now() % 1000) / 1000;
      const shakeIntensity = 0.3 * Math.sin(shakeProgress * Math.PI * 2);
      groupRef.current.rotation.y = shakeIntensity;
      if (shakeProgress > 0.95) {
        setShakeCount((prev) => prev + 1);
      }
    }

    if (animationPhase === "explode") {
      setParticles((prevParticles) =>
        prevParticles
          .map((p) => {
            p.position.add(p.velocity);
            p.velocity.multiplyScalar(0.95); // Reduced damping
            p.velocity.y -= 0.01; // Reduced gravity
            p.opacity = Math.max(0, p.opacity - 0.01); // Slower fade
            p.scale = Math.max(0, p.scale - 0.0); // Slower shrink
            return p;
          })
          .filter((p) => p.opacity > 0)
      );
      setBackgroundOpacity((prev) => Math.max(0, prev - 0.01)); // Slower background fade
    }
  });

  useEffect(() => {
    if (animationPhase === "shake" && shakeCount >= 3) {
      setAnimationPhase("explode");

      const newParticles = dots.flatMap((dot) => {
        const particlesForDot = [];
        for (let i = 0; i < 20; i++) {
          // Create outward direction from pyramid center
          const centerToDot = new THREE.Vector3()
            .copy(dot.position)
            .normalize();

          // Random direction component
          const randomDirection = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
          ).normalize();

          // Combined direction (mostly outward with some randomness)
          const dir = new THREE.Vector3()
            .addVectors(
              centerToDot.multiplyScalar(1.5),
              randomDirection.multiplyScalar(0.5)
            )
            .normalize();

          // Increased power for bigger explosion
          const power = 100 + Math.random() * 150;

          // Color with some variation
          const color = new THREE.Color(0.3 + Math.random() * 0.7, 1, 1).lerp(
            new THREE.Color("#00ffff"),
            0.5
          );

          particlesForDot.push({
            position: new THREE.Vector3().copy(dot.position),
            velocity: dir.multiplyScalar(power * 0.1),
            color,
            opacity: 1,
            scale: 0.4 + Math.random() * 0.4,
            geometry: new THREE.TetrahedronGeometry(0.5),
          });
        }
        return particlesForDot;
      });

      setParticles(newParticles);
      setTimeout(() => {
        setAnimationPhase("showMenus");
        setShowMenus(true);
      }, 1000); // Increased timeout to match new explosion duration
    }
  }, [shakeCount, animationPhase, dots]);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.display = isHovered ? "block" : "none";
    }
  }, [isHovered]);

  return (
    <>
      {(animationPhase === "idle" || animationPhase === "shake") && (
        <group
          ref={groupRef}
          position={[0, 5, 0]}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
            setIsHovered(true);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
            setIsHovered(false);
          }}
          onClick={handlePyramidClick}
        >
          <lineSegments
            ref={linesRef}
            geometry={linesGeometry}
            material={
              new THREE.LineBasicMaterial({
                color: "#00ffff",
                transparent: true,
                opacity: 0.6,
              })
            }
          />
          <group ref={dotsRef}>
            {dots.map((dot, i) => (
              <primitive key={i} object={dot} />
            ))}
          </group>
        </group>
      )}

      {animationPhase === "explode" &&
        particles.map((p, i) => (
          <mesh
            key={i}
            position={p.position}
            scale={[p.scale, p.scale, p.scale]}
          >
            <primitive object={p.geometry} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={p.opacity}
            />
          </mesh>
        ))}

      {animationPhase === "explode" && (
        <Html fullscreen>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
              pointerEvents: "none",
              transition: "opacity 1s",
            }}
          />
        </Html>
      )}

      {(animationPhase === "idle" || animationPhase === "shake") && (
        <Html>
          <div ref={textRef} className="pyramid-overlay">
            <div className="pyramid-content">
              <div className="pyramid-dot">
                <div className="pyramid-DotInner"></div>
              </div>
              <button className="pyramid-Text" onClick={handlePyramidClick}>
                FMIS
              </button>
            </div>
          </div>
        </Html>
      )}

      {showMenus && (
        <Html fullscreen>
          <div className="menu-ui">
            <button onClick={() => console.log("Menu A clicked")}>
              Menu A
            </button>
            <button onClick={() => console.log("Menu B clicked")}>
              Menu B
            </button>
            <button onClick={() => console.log("Menu C clicked")}>
              Menu C
            </button>
          </div>
        </Html>
      )}
    </>
  );
}
