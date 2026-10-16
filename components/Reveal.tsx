"use client";

import { useEffect, useRef } from "react";

/**
 * 스크롤로 들어올 때 한 번 페이드-업.
 *
 * 안전장치가 둘 있습니다 — 콘텐츠가 영원히 숨는 사고를 막기 위해서입니다.
 *  1) 관찰자가 끝내 안 울려도 1.2초 뒤에는 무조건 보여줍니다
 *     (실제로 렌더가 멈춘 환경에서 IntersectionObserver가 한 번도 안 도는 걸 겪었습니다)
 *  2) prefers-reduced-motion은 globals.css에서 전역으로 전환을 끕니다
 */
export default function Reveal({
  children,
  className = "",
  /** 순차 등장 지연(ms). 목록 항목을 살짝 계단식으로 띄울 때만 씁니다 */
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.setAttribute("data-reveal", "in");

    // 이미 화면 안이면 관찰 없이 즉시
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      show();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);

    // 안전장치 — 관찰자가 안 울려도 반드시 노출
    const fallback = setTimeout(show, 1200);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal="out"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}

