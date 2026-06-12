"use client";

import Image from "next/image";
import { useState } from "react";

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

  const [imageSrc, setImageSrc] = useState("/hero-glass-cube.webp");
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  function handleImageError() {
    if (imageSrc.endsWith(".webp")) {
      setImageSrc("/hero-glass-cube.png");
      return;
    }

    setShowPlaceholder(true);
  }

  return (
    <div className="glass-image-hero" aria-hidden="true">
      <div className="glass-orbit orbit-a" />
      <div className="glass-orbit orbit-b" />

      <div className="glass-image-wrap">
        {showPlaceholder ? (
          <div className="glass-cube-placeholder" />
        ) : (
          <Image
            src={imageSrc}
            alt=""
            width={900}
            height={900}
            priority
            className="glass-cube-image"
            onError={handleImageError}
          />
        )}
      </div>

      <div className="glass-ground-shadow" />
      <div className="glass-caustic caustic-a" />
      <div className="glass-caustic caustic-b" />
    </div>
  );
}
