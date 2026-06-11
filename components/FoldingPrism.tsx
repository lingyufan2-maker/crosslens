"use client";

const faces = ["职业", "城市", "年龄", "资源", "故事", "学科"];

export default function FoldingPrism({
  activeQuestion = "",
  isDrawing = false,
  drawKey = 0
}: {
  activeQuestion?: string;
  isDrawing?: boolean;
  drawKey?: number;
}) {
  return (
    <div className={`folding-prism-wrap ${isDrawing ? "is-drawing" : ""}`} aria-hidden={!activeQuestion}>
      <div className="folding-prism-stage">
        <div key={drawKey} className="folding-prism" aria-hidden="true">
          {faces.map((face, index) => (
            <span key={face} className={`prism-face prism-face-${index + 1}`}>
              <span>{face}</span>
            </span>
          ))}
          <span className="prism-flare" />
        </div>
        {activeQuestion && (
          <div className="prism-question">
            <p>{activeQuestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
