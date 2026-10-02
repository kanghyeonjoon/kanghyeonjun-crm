"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTA } from "@/config/site";
import { trackCtaClick } from "@/lib/analytics";

/**
 * 스크롤을 따라다니는 CTA.
 * 히어로를 지나면 나타나고, 최종 신청 섹션이 보이면 숨깁니다 (버튼 중복 방지).
 *
 * 모바일  — 하단 전체폭 바 (엄지 닿는 자리)
 * 데스크톱 — 하단 **중앙** 알약. 우하단은 안내봇 버튼(ChatWidget: sm:bottom-6 sm:right-6)
 *            자리라 겹치지 않도록 가운데로 뺐습니다.
 */
export default function FloatingCta() {
  const [pastHero, setPastHero] = useState(false);
  const [applyVisible, setApplyVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const apply = document.getElementById("apply");
    const observers: IntersectionObserver[] = [];

    if (hero) {
      const o = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting));
      o.observe(hero);
      observers.push(o);
    }
    if (apply) {
      const o = new IntersectionObserver(([e]) =>
        setApplyVisible(e.isIntersecting),
      );
      o.observe(apply);
      observers.push(o);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const show = pastHero && !applyVisible;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] transition-all duration-300 sm:pb-7 ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {/* bob은 데스크톱에서만 — 모바일 전체폭 바가 흔들리면 산만합니다 */}
      <div className="w-full sm:w-auto sm:motion-safe:animate-[bob_3.2s_ease-in-out_infinite]">
        <Link
          href={CTA.href}
          onClick={() => trackCtaClick("float")}
          tabIndex={show ? 0 : -1}
          aria-hidden={!show}
          className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-4 text-lg font-black tracking-tight text-white shadow-[0_-8px_32px_rgba(10,25,47,0.28)] transition-colors hover:bg-accent-deep sm:w-auto sm:px-8 sm:py-4 sm:text-[17px] sm:shadow-[0_10px_34px_rgba(10,25,47,0.34)]"
        >
          {CTA.primary}
          <ArrowRight
            size={20}
            strokeWidth={2.75}
            className="transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}

