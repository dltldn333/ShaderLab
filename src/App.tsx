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
import backgroundColorFrag from "./shaders/parts/background-color.glsl";
import borderFrag from "./shaders/parts/border.glsl";
import dropShadowFrag from "./shaders/parts/drop-shadow.glsl";
import innerShadowFrag from "./shaders/parts/inner-shadow.glsl";

// 셰이더 블록 타입 정의
interface ShaderBlock {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  locked?: boolean;
  type?: "global" | "main";
}

export default function App() {
  // 초기 블록 데이터 (여기가 핵심!)
  const [blocks, setBlocks] = useState<ShaderBlock[]>([
    {
      id: "header",
      name: "Header",
      enabled: true,
      locked: true,
      type: "global",
      code: headerFrag,
    },
    {
      id: "utils",
      name: "Utils",
      enabled: true,
      locked: true,
      type: "global",
      code: utilsFrag,
    },
    {
      id: "setup",
      name: "Setup",
      enabled: true,
      locked: true,
      type: "main",
      code: setupFrag,
    },
    {
      id: "drop-shadow",
      name: "drop-shadow",
      enabled: true,
      type: "main",
      code: dropShadowFrag,
    },
    {
      id: "background-color",
      name: "background-color",
      enabled: true,
      type: "main",
      code: backgroundColorFrag,
    },
    {
      id: "inner-shadow",
      name: "inner-shadow",
      enabled: true,
      type: "main",
      code: innerShadowFrag,
    },
    {
      id: "border",
      name: "border",
      enabled: true,
      type: "main",
      code: borderFrag,
    },
    {
      id: "finish",
      name: "Finish",
      enabled: true,
      locked: true,
      type: "main",
      code: finishFrag,
    },
  ]);

  const [activeId, setActiveId] = useState<string>("background-color");

  // 현재 편집 중인 블록 찾기
  const activeBlock = blocks.find((b) => b.id === activeId) || blocks[0];

  //  셰이더 조립 (Assembler)
  const fullFragmentCode = useMemo(() => {
    let code = "";

    // 1. Global Blocks (Header, Utils)
    blocks
      .filter((b) => b.enabled && b.type === "global")
      .forEach((b) => {
        code += `// --- [Global: ${b.name}] ---\n${b.code}\n\n`;
      });

    // 2. Main Start
    code += "void main() {\n";

    // 3. Main Blocks (Setup, Layers, Finish)
    blocks
      .filter((b) => b.enabled && b.type === "main")
      .forEach((block) => {
        if (block.locked) {
          // Setup과 Finish는 래핑하지 않고 그대로 넣음
          code += `  // --- [Fixed: ${block.name}] ---\n`;
          code += block.code + "\n\n";
        } else {
          code += `  // --- [Layer: ${block.name}] ---\n`;
          code += `  {\n${block.code}\n  }\n`;
          code += `  finalColor = blend(finalColor, layer);\n\n`;
        }
      });

    return code;
  }, [blocks]); // 블록 순서나 내용이 바뀌면 재조립

  // 이벤트 핸들러들
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        // Locked 블록의 위치를 침범하지 못하도록 방지
        if (items[oldIndex].locked || items[newIndex].locked) {
          return items;
        }

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
                  isLocked={block.locked}
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
