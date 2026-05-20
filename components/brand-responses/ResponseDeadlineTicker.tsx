"use client";

import React from "react";

type Props = {
  label: string;        // "Today 4h left", "Tomorrow 1d left", "Overdue 6h"
  hoursLeft: number;    // negative => overdue
};

export function ResponseDeadlineTicker({ label, hoursLeft }: Props) {
  const overdue = hoursLeft < 0;
  const urgent = !overdue && hoursLeft <= 6;
  const closed = hoursLeft > 100;

  const tone = closed
    ? "bg-[#F3F0EA] text-[#7A7368] border-[#E0DACE]"
    : overdue
    ? "bg-[#1A1A1A] text-[#FFF7E6] border-[#1A1A1A]"
    : urgent
    ? "bg-[#FFEBDF] text-[#B53A0B] border-[#E85D2F]"
    : "bg-[#FFF7E6] text-[#3D3528] border-[#D9C9A8]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${tone}`}
    >
      {urgent || overdue ? (
        <span
          aria-hidden
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            overdue ? "bg-[#FFF7E6]" : "bg-[#E85D2F]"
          } ${urgent || overdue ? "animate-pulse" : ""}`}
        />
      ) : null}
      {label}
    </span>
  );
}
