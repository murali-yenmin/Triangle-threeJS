import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import bgImg from "../assests/images/fmisBg.jpg";

export default function SceneBackground() {
  const texture = useLoader(THREE.TextureLoader, bgImg);
  const { viewport } = useThree();

  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 1.5]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
