import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  id: string;
  name: string;
  isActive: boolean;
  isEnabled: boolean;
  onClick: () => void;
  onToggle: (e: React.MouseEvent) => void;
}

export function SortableBlock({
  id,
  name,
  isActive,
  isEnabled,
  onClick,
  onToggle,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    marginBottom: "4px",
    backgroundColor: isActive ? "#2d2d2d" : "#1e1e1e",
    borderLeft: isActive ? "4px solid #3b82f6" : "4px solid transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: isEnabled ? "#d4d4d4" : "#666", // 꺼진 건 흐리게
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* 드래그 핸들 (listeners를 여기에만 적용하면 핸들 잡고만 이동 가능) */}
        <span {...listeners} style={{ cursor: "grab", fontSize: "1.2rem" }}>
          ☰
        </span>
        <span style={{ fontWeight: 500 }}>{name}</span>
      </div>

      {/* ON/OFF 토글 (이벤트 전파 막기 중요) */}
      <input
        type="checkbox"
        checked={isEnabled}
        onChange={() => {}} // 부모의 onToggle에서 처리
        onClick={onToggle}
        style={{ cursor: "pointer", width: "16px", height: "16px" }}
      />
    </div>
  );
}
