// src/components/Preview.tsx

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls, folder } from "leva";
import { CSS_PROPERTY_METADATA } from "../utils/cssProperties";
import type { ShaderBlock } from "../types/shader";

interface PreviewProps {
  vertexCode: string;
  fragmentCode: string;
  blocks: ShaderBlock[];
}

export function Preview({ vertexCode, fragmentCode, blocks }: PreviewProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // 1. 기본 시스템 컨트롤 (Size 등)
  const systemControls = useControls("System", {
    width: { value: 300, min: 10, max: 1000, step: 10 },
    height: { value: 200, min: 10, max: 1000, step: 10 },
    radius: { value: 20, min: 0, max: 100 },
    opacity: { value: 1.0, min: 0, max: 1 },
    bgOpacity: { value: 1.0, min: 0, max: 1 },
  });

  // 2. 블록 기반 동적 컨트롤 생성
  const levaSchema = useMemo(() => {
    const schema: any = {};
    blocks.forEach((block) => {
      if (!block.enabled || !block.propertyName) return;
      const meta = CSS_PROPERTY_METADATA[block.propertyName];
      if (!meta) return;

      const folderSchema: any = {};
      meta.uniforms.forEach((u) => {
        folderSchema[u.name] = {
          value: u.defaultValue,
          min: u.min,
          max: u.max,
          step: u.step,
          label: u.name.replace(/^u/, ""), // u 접두사 제거해서 보기 좋게
        };
      });
      schema[block.name] = folder(folderSchema);
    });
    return schema;
  }, [blocks]);

  const dynamicControls = useControls("CSS Properties", levaSchema);

  // 3. 유니폼 초기화 및 매핑
  const uniforms = useMemo(() => {
    const baseUniforms: any = {
      uSize: { value: new THREE.Vector2(systemControls.width, systemControls.height) },
      uRadius: { value: systemControls.radius },
      uOpacity: { value: systemControls.opacity },
      uBgOpacity: { value: systemControls.bgOpacity },
      uColor: { value: new THREE.Color("#ffffff") }, // 레거시 대응용
      uBorderColor: { value: new THREE.Color("#ffffff") },
      uBorderWidth: { value: 0.0 },
    };

    // 동적 유니폼 추가
    blocks.forEach((block) => {
      if (!block.enabled || !block.propertyName) return;
      const meta = CSS_PROPERTY_METADATA[block.propertyName];
      if (!meta) return;

      meta.uniforms.forEach((u) => {
        const val = dynamicControls[u.name];
        if (u.type === "color") {
          baseUniforms[u.name] = { value: new THREE.Color(val) };
        } else if (u.type === "vec2") {
          baseUniforms[u.name] = { value: new THREE.Vector2(val[0], val[1]) };
        } else {
          baseUniforms[u.name] = { value: val };
        }
      });
    });

    return baseUniforms;
  }, [blocks, systemControls, dynamicControls]);

  useFrame(() => {
    const mat = materialRef.current;
    if (mat && mat.uniforms) {
      mat.uniforms.uSize.value.set(systemControls.width, systemControls.height);
      mat.uniforms.uRadius.value = systemControls.radius;
      mat.uniforms.uOpacity.value = systemControls.opacity;
      mat.uniforms.uBgOpacity.value = systemControls.bgOpacity;

      // 동적 유니폼 실시간 업데이트
      blocks.forEach((block) => {
        if (!block.enabled || !block.propertyName) return;
        const meta = CSS_PROPERTY_METADATA[block.propertyName];
        if (!meta) return;

        meta.uniforms.forEach((u) => {
          const val = dynamicControls[u.name];
          if (u.type === "color") {
            mat.uniforms[u.name]?.value.set(val);
          } else if (u.type === "vec2") {
            mat.uniforms[u.name]?.value.set(val[0], val[1]);
          } else {
            if (mat.uniforms[u.name]) mat.uniforms[u.name].value = val;
          }
        });
      });
    }

    if (meshRef.current) {
      meshRef.current.scale.set(systemControls.width, systemControls.height, 1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexCode}
        fragmentShader={fragmentCode}
        uniforms={uniforms}
        transparent={true}
        key={fragmentCode}
      />
    </mesh>
  );
}