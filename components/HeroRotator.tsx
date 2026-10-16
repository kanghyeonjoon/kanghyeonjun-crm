"use client";

import { useEffect, useRef, useState } from "react";
import { ROTATE_WORDS } from "@/config/site";

const INTERVAL_MS = 2400;
const FADE_MS = 320;

/**
 * 히어로 헤드라인에서 진료과를 순환시킵니다.
 * 원장이 자기 진료과를 발견하는 순간 몰입도가 올라갑니다.
 *
 * prefers-reduced-motion 사용자에게는 순환하지 않고 첫 단어만 고정 노출합니다.
 */
export default function HeroRotator({
  className = "",
  /**
   * 폭 고정을 끕니다.
   * 문장 **중간**에 놓일 때 고정 폭을 쓰면 짧은 단어(안과)에서 뒷말과의 사이가
   * 크게 벌어집니다. 이 경우 fluid로 두고, 대신 헤드라인 줄 수가 고정이라
   * 폭 변화는 가운데 정렬이 살짝 움직이는 정도로만 보입니다.
   */
  fluid = false,
}: {
  className?: string;
  fluid?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (ROTATE_WORDS.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      setPhase("out");
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATE_WORDS.length);
        setPhase("in");
        const t2 = setTimeout(() => setPhase("idle"), FADE_MS);
        timers.current.push(t2);
      }, FADE_MS);
      timers.current.push(t);
    }, INTERVAL_MS);

    const pending = timers.current;
    return () => {
      clearInterval(interval);
      pending.forEach(clearTimeout);
    };
  }, []);

  const phaseClass =
    phase === "out" ? "rotator-out" : phase === "in" ? "rotator-in" : "";

  // 가장 긴 단어 기준으로 폭을 고정해 글자 수가 바뀔 때 줄이 밀리지 않게 합니다.
  const widest = [...ROTATE_WORDS].sort((a, b) => b.length - a.length)[0];

  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      {fluid ? null : (
        <span className="invisible col-start-1 row-start-1" aria-hidden="true">
          {widest}
        </span>
      )}
      <span
        className={`col-start-1 row-start-1 text-accent ${phaseClass}`}
        aria-live="off"
      >
        {ROTATE_WORDS[index]}
      </span>
    </span>
  );
}

