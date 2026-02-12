import { useState, useMemo, useEffect } from "react";
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

import { getAllCSSProperties } from "./utils/cssProperties";

// 셰이더 블록 타입 정의
interface ShaderBlock {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  locked?: boolean;
  type?: "global" | "main";
  filename: string;
}

export default function App() {
  const [isSaving, setIsSaving] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProperties, setAllProperties] = useState<string[]>([]);

  // 컴포넌트 마운트 시 브라우저 지원 모든 CSS 속성 가져오기
  useEffect(() => {
    setAllProperties(getAllCSSProperties());
  }, []);

  // 초기 블록 데이터
  const [blocks, setBlocks] = useState<ShaderBlock[]>([
    {
      id: "header",
      name: "Header",
      enabled: true,
      locked: true,
      type: "global",
      filename: "01_header.frag",
      code: headerFrag,
    },
    {
      id: "utils",
      name: "Utils",
      enabled: true,
      locked: true,
      type: "global",
      filename: "02_utils.frag",
      code: utilsFrag,
    },
    {
      id: "setup",
      name: "Setup",
      enabled: true,
      locked: true,
      type: "main",
      filename: "setup.glsl",
      code: setupFrag,
    },
    {
      id: "drop-shadow",
      name: "box-shadow",
      enabled: true,
      type: "main",
      filename: "drop-shadow.glsl",
      code: dropShadowFrag,
    },
    {
      id: "background-color",
      name: "background-color",
      enabled: true,
      type: "main",
      filename: "background-color.glsl",
      code: backgroundColorFrag,
    },
    {
      id: "inner-shadow",
      name: "box-shadow-inner",
      enabled: true,
      type: "main",
      filename: "inner-shadow.glsl",
      code: innerShadowFrag,
    },
    {
      id: "border",
      name: "border",
      enabled: true,
      type: "main",
      filename: "border.glsl",
      code: borderFrag,
    },
    {
      id: "finish",
      name: "Finish",
      enabled: true,
      locked: true,
      type: "main",
      filename: "finish.glsl",
      code: finishFrag,
    },
  ]);

  const [activeId, setActiveId] = useState<string>("background-color");

  // 현재 편집 중인 블록 찾기
  const activeBlock = blocks.find((b) => b.id === activeId) || blocks[0];

  // 로컬 파일 저장 함수
  const saveFile = async (filename: string, code: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/save-shader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, code }),
      });
      if (!response.ok) throw new Error("Failed to save");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // 🔄 셰이더 조립 (Assembler)
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
          code += `  // --- [Fixed: ${block.name}] ---\n`;
          code += block.code + "\n\n";
        } else {
          code += `  // --- [Layer: ${block.name}] ---\n`;
          code += `  {\n${block.code}\n  }\n`;
          code += `  finalColor = blend(finalColor, layer);\n\n`;
        }
      });

    return code;
  }, [blocks]);

  // 이벤트 핸들러들
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

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
    saveFile(activeBlock.filename, newCode);
  };

  const handleAddEffect = async (propertyName: string) => {
    // 이미 존재하는지 확인
    if (blocks.some((b) => b.name === propertyName)) {
      alert("This property is already in the pipeline.");
      return;
    }

    const filename = `${propertyName}.glsl`;
    
    try {
      const response = await fetch("/api/create-shader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      
      if (response.ok) {
        const newBlock: ShaderBlock = {
          id: propertyName,
          name: propertyName,
          filename: filename,
          enabled: true,
          type: "main",
          code: `// CSS: ${propertyName}\nlayer = vec4(0.5, 0.5, 0.5, 1.0); // Default placeholder`,
        };
        
        setBlocks((prev) => {
          const finishIndex = prev.findIndex((b) => b.id === "finish");
          const next = [...prev];
          next.splice(finishIndex, 0, newBlock);
          return next;
        });
        setActiveId(propertyName);
        setShowAddMenu(false);
        setSearchTerm("");
      }
    } catch (err) {
      alert("Failed to create effect file");
    }
  };

  const toggleBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)),
    );
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const block = blocks.find((b) => b.id === id);
    if (!block || block.locked) return;

    if (!confirm(`Are you sure you want to delete the "${block.name}" effect?`)) {
      return;
    }

    try {
      const response = await fetch("/api/delete-shader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: block.filename }),
      });

      if (response.ok) {
        setBlocks((prev) => {
          const next = prev.filter((b) => b.id !== id);
          // 삭제된 블록이 활성화된 블록이었다면 다른 블록 선택
          if (activeId === id) {
            const deletedIndex = prev.findIndex((b) => b.id === id);
            const fallbackIndex = Math.max(0, deletedIndex - 1);
            setActiveId(next[fallbackIndex]?.id || "");
          }
          return next;
        });
      }
    } catch (err) {
      alert("Failed to delete effect file");
    }
  };

  const filteredProperties = allProperties.filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
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
                  onDelete={(e) => handleDelete(block.id, e)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Search/Add Menu */}
          {showAddMenu && (
            <div
              style={{
                position: "absolute",
                bottom: "70px",
                left: "10px",
                right: "10px",
                backgroundColor: "#252526",
                border: "1px solid #3b82f6",
                borderRadius: "6px",
                zIndex: 100,
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "300px",
              }}
            >
              <input
                autoFocus
                placeholder="Search CSS property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "10px",
                  backgroundColor: "#1e1e1e",
                  border: "none",
                  borderBottom: "1px solid #333",
                  color: "white",
                  outline: "none",
                }}
              />
              <div style={{ overflowY: "auto" }}>
                {filteredProperties.map((p) => (
                  <div
                    key={p}
                    onClick={() => handleAddEffect(p)}
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #333",
                      backgroundColor: blocks.some((b) => b.name === p)
                        ? "#1a1a1a"
                        : "transparent",
                      color: blocks.some((b) => b.name === p) ? "#555" : "#ddd",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2d2d2d")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = blocks.some(
                        (b) => b.name === p
                      )
                        ? "#1a1a1a"
                        : "transparent")
                    }
                  >
                    {p} {blocks.some((b) => b.name === p) && "(Added)"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 새 블록 추가 버튼 */}
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          style={{
            margin: "15px",
            padding: "10px",
            background: showAddMenu ? "#ef4444" : "#3b82f6",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>{showAddMenu ? "✕" : "+"}</span>{" "}
          {showAddMenu ? "Cancel" : "Add Effect"}
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
            padding: "10px 20px",
            backgroundColor: "#252526",
            fontSize: "0.8rem",
            color: "#888",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            EDITING:{" "}
            <span style={{ color: "#fff", fontWeight: "bold" }}>
              {activeBlock.name}
            </span>
            <span style={{ marginLeft: "10px", opacity: 0.5 }}>
              ({activeBlock.filename})
            </span>
          </div>
          {isSaving && (
            <div style={{ color: "#3b82f6", fontWeight: "bold" }}>
              ● SAVING...
            </div>
          )}
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
