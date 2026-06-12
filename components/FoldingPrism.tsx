"use client";

const faces = [
  { key: "front", label: "故事" },
  { key: "back", label: "资源" },
  { key: "left", label: "职业" },
  { key: "right", label: "城市" },
  { key: "top", label: "年龄" },
  { key: "bottom", label: "学科" }
];

export default function FoldingPrism({
  isDrawing = false,
  drawKey = 0
}: {
  activeQuestion?: string;
  isDrawing?: boolean;
  drawKey?: number;
}) {
  return (
    <div className={`glass-cube-hero ${isDrawing ? "is-drawing" : ""}`} aria-hidden="true">
      <div className="cube-stage">
        <div key={drawKey} className="cube-net">
          {faces.map((face) => (
            <div key={face.key} className={`cube-face face-${face.key}`}>
              <span>{face.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="cube-ground-glow" />
    </div>
  );
}
