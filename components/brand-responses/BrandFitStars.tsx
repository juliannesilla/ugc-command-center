"use client";

import React from "react";

type Props = {
  value: 1 | 2 | 3 | 4 | 5;
  editable?: boolean;
  onChange?: (v: 1 | 2 | 3 | 4 | 5) => void;
  size?: "sm" | "md" | "lg";
};

export function BrandFitStars({ value, editable = false, onChange, size = "md" }: Props) {
  const sizeMap = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Brand fit ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        return (
          <button
            key={i}
            type="button"
            disabled={!editable}
            onClick={() => editable && onChange?.(i as 1 | 2 | 3 | 4 | 5)}
            className={`${editable ? "cursor-pointer" : "cursor-default"} transition-transform ${
              editable ? "hover:scale-110" : ""
            }`}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`${sizeMap[size]} ${filled ? "fill-[#E85D2F]" : "fill-none"} stroke-[#1A1A1A] stroke-[1.5]`}
            >
              <path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.6 1.4 6.6L12 17.2l-6 3.4 1.4-6.6L2.5 9.4l6.6-.7L12 2.5z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
