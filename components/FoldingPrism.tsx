"use client";

const lenses = [
  { title: "专业维度", desc: "看见能力主场" },
  { title: "资源维度", desc: "看见机会入口" },
  { title: "权力维度", desc: "看见关系不平等" },
  { title: "自我价值", desc: "不被成功符号压倒" },
  { title: "长期主义", desc: "把一次接触变成积累" },
  { title: "关系边界", desc: "知道哪里靠近，哪里保持距离" }
];

export default function FoldingPrism({
  activeQuestion,
  isDrawing,
  drawKey
}: {
  activeQuestion?: string;
  isDrawing?: boolean;
  drawKey?: number;
}) {
  void activeQuestion;
  void isDrawing;
  void drawKey;

  return (
    <div className="lens-field-hero" aria-hidden="true">
      <div className="lens-field-glow" />
      <div className="lens-field-ring" />
      {lenses.map((lens, index) => (
        <div key={lens.title} className={`lens-float-card lens-card-${index + 1}`}>
          <span>{lens.title}</span>
          <p>{lens.desc}</p>
        </div>
      ))}
    </div>
  );
}
