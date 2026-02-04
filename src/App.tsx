import { useState } from "react";

import { Canvas } from "@react-three/fiber";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c"; // GLSL 하이라이팅용
import "prismjs/themes/prism-dark.css"; // 다크 테마

import { Preview } from "./components/Preview";
import { defaultFragment, defaultVertex } from "./shaders/defaultCode";
const [fragCode, setFragCode] = useState(defaultFragment);


const styles = {
  container: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#1e1e1e",
  },
  editor: {
    width: "50%",
    height: "100%",
    overflow: "auto",
    borderRight: "1px solid #333",
  },
  preview: { width: "50%", height: "100%", backgroundColor: "#000" }, // 캔버스 배경 검정
  label: {
    color: "#888",
    padding: "10px",
    fontSize: "0.8rem",
    fontWeight: "bold" as const,
    backgroundColor: "#252526",
  },
};

function App() {
  const [fragCode, setFragCode] = useState(defaultFragment);
  // Vertex Shader는 보통 고정이지만 필요시 에디터 추가 가능
  const [vertCode] = useState(defaultVertex);

  return (
    <div style={styles.container}>
      {/* Left: Code Editor */}
      <div style={styles.editor}>
        <div style={styles.label}>FRAGMENT SHADER (GLSL)</div>
        <Editor
          value={fragCode}
          onValueChange={(code) => setFragCode(code)}
          highlight={(code) => highlight(code, languages.c, "c")}
          padding={20}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            color: "#d4d4d4",
            backgroundColor: "#1e1e1e",
            minHeight: "100%",
          }}
        />
      </div>

      {/* Right: 3D Preview */}
      <div style={styles.preview}>
        <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 10] }}>
          {/* Orthographic 카메라를 사용하여 2D UI처럼 보이게 설정 
             (MirageEngine의 특성 반영)
          */}
          <color attach="background" args={["#111"]} />
          <ambientLight intensity={0.5} />

          {/* 중앙 정렬 및 픽셀 단위 매칭을 위한 스케일 조정 */}
          <group scale={[1, 1, 1]}>
            <Preview vertexCode={vertCode} fragmentCode={fragCode} />
          </group>
        </Canvas>
      </div>
    </div>
  );
}

export default App;
