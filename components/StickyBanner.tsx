"use client";


import { ChevronRight } from "lucide-react";
import { CTA } from "@/config/site";
import { trackCtaClick } from "@/lib/analytics";
import SlotLine from "./SlotLine";

/**
 * [0] 상단 고정 배너.
 *
 * 교재 5-4가 지적한 리드유의 약점: 배너가 카피만 떠 있고 클릭 타깃이 불명확했다.
 * → 배너 전체를 실제 링크로 만들어 클릭 기회를 흘리지 않습니다.
 */
export default function StickyBanner() {
  return (
    <a
      href={CTA.href}
      onClick={() => trackCtaClick("banner")}
      className="group sticky top-0 z-50 flex items-center justify-center gap-2 bg-accent px-4 py-2.5 text-center text-[13px] font-bold tracking-tight text-white transition-colors hover:bg-accent-deep sm:text-sm"
    >
      <SlotLine
        bare
        className="truncate"
        render={(_status, line) => <span className="truncate">{line}</span>}
      />
      <ChevronRight
        size={16}
        strokeWidth={3}
        className="shrink-0 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

