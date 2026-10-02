"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleMore, X } from "lucide-react";
import { CONTACT } from "@/config/site";
import { trackContactClick } from "@/lib/analytics";

/**
 * 떠 있는 문의 채널 버튼 — 카카오톡 · 유튜브 · 인스타그램.
 *
 * 위치가 **왼쪽 아래**인 이유: 오른쪽 아래는 안내봇(ChatWidget), 아래 가운데는
 * 무료진단 플로팅 CTA가 이미 쓰고 있습니다. 셋을 한쪽에 겹쳐 두면 안내봇 패널이
 * 열렸을 때 서로 가려집니다. 안내봇과 좌우 대칭으로 두는 게 가장 덜 부딪힙니다.
 *
 * 주소가 없는 채널은 버튼이 아예 생기지 않습니다 (CONTACT에서 자동 판단).
 */

/* 브랜드 글리프 — lucide v1에는 브랜드 아이콘이 없어 직접 그립니다.
   자사 계정으로 연결하는 용도이고, 알아볼 수 있어야 클릭됩니다. */

function KakaoGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.5 3 2 6.58 2 11c0 2.81 1.87 5.28 4.69 6.7-.19.68-.7 2.52-.8 2.91-.12.49.18.48.38.35.16-.1 2.5-1.7 3.52-2.39.72.1 1.46.16 2.21.16 5.5 0 10-3.58 10-8S17.5 3 12 3Z" />
    </svg>
  );
}

function YoutubeGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.58A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.9.58 9.4.58 9.4.58s7.5 0 9.4-.58a3 3 0 0 0 2.1-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  );
}

function InstagramGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="2.75"
        y="2.75"
        width="18.5"
        height="18.5"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 바깥을 누르거나 ESC를 누르면 접힙니다
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const channels = [
    {
      href: CONTACT.kakaoChannel,
      label: "카카오톡 문의",
      Glyph: KakaoGlyph,
      style: { backgroundColor: "#FEE500", color: "#181600" },
      channel: "kakao_channel" as const,
    },
    {
      href: CONTACT.youtubeChannel,
      label: "유튜브 채널",
      Glyph: YoutubeGlyph,
      style: { backgroundColor: "#FF0000", color: "#ffffff" },
      channel: "youtube" as const,
    },
    {
      href: CONTACT.instagram,
      label: "인스타그램",
      Glyph: InstagramGlyph,
      style: {
        backgroundImage:
          "linear-gradient(45deg,#F9CE34 5%,#EE2A7B 50%,#6228D7 95%)",
        color: "#ffffff",
      },
      channel: "instagram" as const,
    },
  ].filter((c) => c.href);

  if (channels.length === 0) return null;

  return (
    <div
      ref={rootRef}
      // 안내봇(우하단)과 좌우 대칭. 모바일은 하단 CTA 바 위로 띄웁니다.
      className="fixed bottom-24 left-4 z-40 flex flex-col items-start gap-2.5 sm:bottom-6 sm:left-6"
    >
      {/* 채널 목록 — 접혀 있을 때는 클릭도 탭 이동도 막습니다 */}
      <ul
        className={`flex flex-col items-start gap-2.5 transition-all duration-200 ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {channels.map(({ href, label, Glyph, style, channel }) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              onClick={() => {
                trackContactClick(channel);
                setOpen(false);
              }}
              className="group flex items-center gap-2.5"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full shadow-[0_6px_18px_rgba(10,25,47,.28)] transition-transform group-hover:scale-105"
                style={style}
              >
                <Glyph />
              </span>
              <span className="rounded-full bg-navy/95 px-3 py-1.5 text-[12.5px] font-black text-white shadow-[0_4px_14px_rgba(10,25,47,.24)]">
                {label}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "문의 채널 닫기" : "문의 채널 열기"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_8px_28px_rgba(36,86,216,.45)] transition-transform hover:scale-105"
      >
        {open ? (
          <X size={22} strokeWidth={2.75} aria-hidden="true" />
        ) : (
          <MessageCircleMore size={22} strokeWidth={2.25} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

