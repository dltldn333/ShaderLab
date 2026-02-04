import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/themes/prism-dark.css";

// DnD 관련
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

// 컴포넌트 및 셰이더 조각
import { Preview } from "./components/Preview";
import { SortableBlock } from "./components/SortableBlock";
import boxVertex from "./shaders/box.vert";
import headerFrag from "./shaders/parts/01_header.frag";
import utilsFrag from "./shaders/parts/02_utils.frag";
import setupFrag from "./shaders/parts/setup.glsl";
import finishFrag from "./shaders/parts/finish.glsl";

// 셰이더 블록 타입 정의
interface ShaderBlock {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
}

export default function App() {
  // 초기 블록 데이터 (여기가 핵심!)
  const [blocks, setBlocks] = useState<ShaderBlock[]>([
    {
      id: "shape",
      name: "1. Base Shape (SDF)",
      enabled: true,
      code: `  // 1. 박스 형태 정의
  d = sdRoundedBox(p, halfSize, uRadius);`,
    },
    {
      id: "fill",
      name: "2. Fill Logic",
      enabled: true,
      code: `  // 2. 내부 채우기 계산
  float smoothEdge = 1.0;
  fillAlpha = 1.0 - smoothstep(-uBorderWidth - smoothEdge, -uBorderWidth, d);`,
    },
    {
      id: "border",
      name: "3. Border Logic",
      enabled: true,
      code: `  // 3. 테두리 계산 및 색상 합성
  float borderAlpha = 0.0;
  if (uBorderWidth > 0.01) {
    borderAlpha = (1.0 - smoothstep(0.0, 1.0, d)) - fillAlpha;
  }
  
  float totalAlpha = borderAlpha + fillAlpha;
  if (totalAlpha > 0.001) {
     finalColor = mix(uColor, uBorderColor, borderAlpha / totalAlpha);
  }
  
  // 배경 투명도 적용
  finalAlpha = borderAlpha + (fillAlpha * uBgOpacity);`,
    },
  ]);

  const [activeId, setActiveId] = useState<string>("shape");

  // 현재 편집 중인 블록 찾기
  const activeBlock = blocks.find((b) => b.id === activeId) || blocks[0];

  // 🔄 셰이더 조립 (Assembler)
  const fullFragmentCode = useMemo(() => {
    // 1. Header & Utils (Global Scope)
    let code = headerFrag + "\n" + utilsFrag + "\n";

    // 2. Main Start
    code += "void main() {\n";
    code += setupFrag + "\n\n"; // 변수 초기화 (d, finalColor 등)

    // 3. Enabled Blocks (Tasks)
    blocks.forEach((block) => {
      if (block.enabled) {
        code += `  // --- [Block: ${block.name}] ---\n`;
        code += block.code + "\n\n";
      }
    });

    // 4. Main End
    code += finishFrag;

    return code;
  }, [blocks]); // 블록 순서나 내용이 바뀌면 재조립

  // 이벤트 핸들러들
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCodeChange = (newCode: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === activeId ? { ...b, code: newCode } : b)),
    );
  };

  const toggleBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 클릭 이벤트 버블링 방지
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)),
    );
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
      }}
    >
      {/* Left Panel: Task List (DnD) */}
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #333",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "15px",
            fontWeight: "bold",
            borderBottom: "1px solid #333",
            backgroundColor: "#252526",
          }}
        >
          Pipeline Tasks
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  id={block.id}
                  name={block.name}
                  isActive={block.id === activeId}
                  isEnabled={block.enabled}
                  onClick={() => setActiveId(block.id)}
                  onToggle={(e) => toggleBlock(block.id, e)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        {/* 새 블록 추가 버튼 (추후 구현) */}
        <button
          style={{
            padding: "10px",
            background: "#3b82f6",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          + Add Effect
        </button>
      </div>

      {/* Center Panel: Code Editor */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #333",
        }}
      >
        <div
          style={{
            padding: "10px",
            backgroundColor: "#252526",
            fontSize: "0.8rem",
            color: "#888",
          }}
        >
          EDITING:{" "}
          <span style={{ color: "#fff", fontWeight: "bold" }}>
            {activeBlock.name}
          </span>
        </div>
        <div style={{ flex: 1, overflow: "auto", backgroundColor: "#1e1e1e" }}>
          <Editor
            value={activeBlock.code}
            onValueChange={handleCodeChange}
            highlight={(code) => highlight(code, languages.c, "c")}
            padding={20}
            style={{
              fontFamily: '"Fira code", monospace',
              fontSize: 14,
              minHeight: "100%",
            }}
          />
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div style={{ width: "40%", height: "100%", backgroundColor: "#000" }}>
        <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 10] }}>
          <color attach="background" args={["#111"]} />
          <group scale={[1, 1, 1]}>
            <Preview vertexCode={boxVertex} fragmentCode={fullFragmentCode} />
          </group>
        </Canvas>
      </div>
    </div>
  );
}
