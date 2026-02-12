import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  id: string;
  name: string;
  isActive: boolean;
  isEnabled: boolean;
  isLocked?: boolean;
  onClick: () => void;
  onToggle: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const LockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.6 }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export function SortableBlock({
  id,
  name,
  isActive,
  isEnabled,
  isLocked,
  onClick,
  onToggle,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled: isLocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px 12px",
    marginBottom: "4px",
    backgroundColor: isLocked ? "#1a1a1b" : isActive ? "#2d2d2d" : "#1e1e1e",
    borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
    borderRadius: "6px",
    cursor: isLocked ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: isEnabled ? (isLocked ? "#888" : "#d4d4d4") : "#555",
    border: isLocked ? "1px dashed #333" : "1px solid transparent",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} onClick={onClick}>
      {isLocked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, transparent 45%, #ffffff05 50%, transparent 55%)",
            backgroundSize: "10px 10px",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 1,
        }}
      >
        {!isLocked ? (
          <span
            {...listeners}
            style={{
              cursor: "grab",
              fontSize: "0.9rem",
              opacity: 0.4,
              color: "#fff",
            }}
          >
            ⠿
          </span>
        ) : (
          <LockIcon />
        )}
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: isLocked ? 600 : 400,
            letterSpacing: "0.02em",
          }}
        >
          {name}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 1,
        }}
      >
        {isLocked ? (
          <span
            style={{
              fontSize: "0.65rem",
              backgroundColor: "#333",
              padding: "2px 6px",
              borderRadius: "4px",
              color: "#aaa",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            System
          </span>
        ) : (
          <>
            <button
              onClick={onDelete}
              style={{
                background: "none",
                border: "none",
                color: "#ff4444",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                opacity: 0.6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              title="Delete block"
            >
              <TrashIcon />
            </button>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={() => {}}
              onClick={onToggle}
              style={{
                cursor: "pointer",
                width: "14px",
                height: "14px",
                accentColor: "#3b82f6",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
