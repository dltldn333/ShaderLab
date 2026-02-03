// src/components/Preview.tsx

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";

interface PreviewProps {
  vertexCode: string;
  fragmentCode: string;
}

export function Preview({ vertexCode, fragmentCode }: PreviewProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const controls = useControls("Shader Uniforms", {
    width: { value: 300, min: 10, max: 1000, step: 10 },
    height: { value: 200, min: 10, max: 1000, step: 10 },
    radius: { value: 20, min: 0, max: 100 },
    borderWidth: { value: 2, min: 0, max: 50 },
    color: { value: "#3b82f6" },
    borderColor: { value: "#1e40af" },
    opacity: { value: 1.0, min: 0, max: 1 },
    bgOpacity: { value: 1.0, min: 0, max: 1 },
  });

  const uniforms = useMemo(
    () => ({
      uSize: { value: new THREE.Vector2(controls.width, controls.height) },
      uRadius: { value: controls.radius },
      uBorderWidth: { value: controls.borderWidth },
      uColor: { value: new THREE.Color(controls.color) },
      uBorderColor: { value: new THREE.Color(controls.borderColor) },
      uOpacity: { value: controls.opacity },
      uBgOpacity: { value: controls.bgOpacity },
    }),
    []
  );

  useFrame(() => {
    const mat = materialRef.current;
    
    // ✅ 방어 코드 추가: mat와 uniforms가 존재하는지 먼저 확인
    if (mat && mat.uniforms) {
      // Optional Chaining (?.)을 사용하여 안전하게 접근
      mat.uniforms.uSize?.value.set(controls.width, controls.height);
      if (mat.uniforms.uRadius) mat.uniforms.uRadius.value = controls.radius;
      if (mat.uniforms.uBorderWidth) mat.uniforms.uBorderWidth.value = controls.borderWidth;
      mat.uniforms.uColor?.value.set(controls.color);
      mat.uniforms.uBorderColor?.value.set(controls.borderColor);
      if (mat.uniforms.uOpacity) mat.uniforms.uOpacity.value = controls.opacity;
      if (mat.uniforms.uBgOpacity) mat.uniforms.uBgOpacity.value = controls.bgOpacity;
    }

    // Mesh 스케일 업데이트 (화면에 크게 보이도록 설정)
    if (meshRef.current) {
      meshRef.current.scale.set(controls.width, controls.height, 1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="red" wireframe />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexCode}
        fragmentShader={fragmentCode}
        uniforms={uniforms}
        transparent={true}
        key={fragmentCode} // 코드가 바뀌면 Material 재생성
      />
    </mesh>
  );
}