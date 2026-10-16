"use client";


import { ArrowRight } from "lucide-react";
import { CTA } from "@/config/site";
import { trackCtaClick, type CtaLocation } from "@/lib/analytics";

type Props = {
  /** 이 버튼이 놓인 위치 — 어느 자리가 전환을 만드는지 측정합니다 */
  location: CtaLocation;
  children?: React.ReactNode;
  size?: "md" | "lg";
  /** 어두운 배경 위에 놓일 때 */
  onDark?: boolean;
  className?: string;
};

/**
 * 알약형 CTA — 상세페이지(벤치마크) 디자인과 통일.
 * 밝은 바탕·어두운 바탕 모두 악센트 단색을 씁니다 (버튼 색이 곧 브랜드 신호).
 */
export default function CtaButton({
  location,
  children,
  size = "md",
  onDark = false,
  className = "",
}: Props) {
  const sizeClass =
    size === "lg"
      ? "px-11 py-5 text-lg sm:text-xl"
      : "px-8 py-4 text-base sm:text-lg";

  const toneClass = onDark
    ? "bg-accent text-white shadow-[0_10px_28px_rgba(0,0,0,.35)] hover:bg-white hover:text-navy"
    : "bg-accent text-white shadow-[0_10px_26px_rgba(36,86,216,.32)] hover:bg-accent-deep";

  return (
    <a
      href={CTA.href}
      onClick={() => trackCtaClick(location)}
      className={`group inline-flex items-center justify-center gap-3 rounded-full font-black tracking-tight transition-colors duration-200 ${sizeClass} ${toneClass} ${className}`}
    >
      {children ?? CTA.primary}
      <ArrowRight
        size={20}
        strokeWidth={2.75}
        className="transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </a>
  );
}

