import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/themes/prism-dark.css";

import { Preview } from "./components/Preview";

// 1. 분리된 셰이더 파일들 Import (Vite 플러그인 덕분에 string으로 들어옴)
import boxVertex from "./shaders/box.vert"; 
import headerFrag from "./shaders/parts/01_header.frag";
import utilsFrag from "./shaders/parts/02_utils.frag";
import mainFrag from "./shaders/parts/03_main.frag";

// 셰이더 조각 타입 정의
interface ShaderPart {
  id: string;
  name: string;
  code: string;
  readOnly?: boolean; // header 같은 건 수정 못하게 막을 수도 있음
}

// 스타일 정의 (간단한 탭 UI 추가)
const styles = {
  container: { display: "flex", width: "100vw", height: "100vh", backgroundColor: "#1e1e1e", color: "#d4d4d4" },
  leftPanel: { width: "50%", display: "flex", flexDirection: "column" as const, borderRight: "1px solid #333" },
  tabs: { display: "flex", backgroundColor: "#252526", borderBottom: "1px solid #333" },
  tab: (isActive: boolean) => ({
    padding: "10px 20px",
    cursor: "pointer",
    backgroundColor: isActive ? "#1e1e1e" : "transparent",
    color: isActive ? "#fff" : "#888",
    borderTop: isActive ? "2px solid #3b82f6" : "2px solid transparent",
    fontSize: "0.85rem",
    fontWeight: "bold" as const,
  }),
  editorWrapper: { flex: 1, overflow: "auto", position: "relative" as const },
  preview: { width: "50%", height: "100%", backgroundColor: "#000" },
};

function App() {
  const [vertCode] = useState(boxVertex); // Vertex는 일단 고정

  // 2. 셰이더 조각들을 상태로 관리 (순서 중요!)
  const [shaderParts, setShaderParts] = useState<ShaderPart[]>([
    { id: "header", name: "01_Header (Uniforms)", code: headerFrag },
    { id: "utils", name: "02_Utils (SDF)", code: utilsFrag },
    { id: "main", name: "03_Main (Logic)", code: mainFrag },
  ]);

  // 현재 활성화된 탭 인덱스
  const [activeTab, setActiveTab] = useState(2); // 기본값: Main 탭

  // 3. 에디터 수정 핸들러
  const handleCodeChange = (newCode: string) => {
    setShaderParts((prev) =>
      prev.map((part, index) =>
        index === activeTab ? { ...part, code: newCode } : part
      )
    );
  };

  // 4. 모든 조각을 하나로 합침 (Merge) -> Preview로 전달
  const fullFragmentCode = useMemo(() => {
    return shaderParts.map((part) => part.code).join("\n\n");
  }, [shaderParts]);

  return (
    <div style={styles.container}>
      {/* LEFT PANEL: Editor with Tabs */}
      <div style={styles.leftPanel}>
        {/* Tabs Area */}
        <div style={styles.tabs}>
          {shaderParts.map((part, index) => (
            <div
              key={part.id}
              style={styles.tab(index === activeTab)}
              onClick={() => setActiveTab(index)}
            >
              {part.name}
            </div>
          ))}
        </div>

        {/* Editor Area */}
        <div style={styles.editorWrapper}>
          <Editor
            value={shaderParts[activeTab].code}
            onValueChange={handleCodeChange}
            highlight={(code) => highlight(code, languages.c, "c")}
            padding={20}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              minHeight: "100%",
            }}
          />
        </div>
      </div>

      {/* RIGHT PANEL: 3D Preview */}
      <div style={styles.preview}>
        <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 10] }}>
          <color attach="background" args={["#111"]} />
          <ambientLight intensity={0.5} />
          <group scale={[1, 1, 1]}>
             {/* 합쳐진 전체 코드를 Preview에 전달 */}
            <Preview vertexCode={vertCode} fragmentCode={fullFragmentCode} />
          </group>
        </Canvas>
      </div>
    </div>
  );
}

export default App;