"use client";

import { BookOpen, CirclePlay, MessageCircle, Send } from "lucide-react";
import { CONTACT } from "@/config/site";
import { trackContactClick } from "@/lib/analytics";

/**
 * 폼이 부담스러운 원장님을 위한 보조 경로.
 * `CONTACT`가 전부 비어 있으면 아무것도 렌더하지 않습니다.
 *
 * 채널마다 역할이 다릅니다:
 *   · 오픈프로필   — 친구추가 없이 바로 1:1. 문턱이 가장 낮아 먼저 배치합니다.
 *   · 카카오 채널  — 공식 채널, 상담 이력이 남습니다.
 *   · 유튜브       — "이 사람이 실제로 만드는 영상"을 직접 확인하는 자리.
 *                    (CONTACT.youtubeChannel이 비어 있으면 자동 숨김)
 *   · 네이버 블로그 — 아직 결정 못 한 분이 둘러보고 돌아올 곳.
 */
export default function KakaoContact({
  onDark = false,
  className = "",
}: {
  onDark?: boolean;
  className?: string;
}) {
  const links = [
    {
      href: CONTACT.kakaoOpenProfile,
      label: "카카오톡으로 바로 묻기",
      hint: "친구추가 없이",
      icon: Send,
      channel: "kakao_open" as const,
    },
    {
      href: CONTACT.kakaoChannel,
      label: "카카오톡 채널 추가",
      hint: "새 소식 받기",
      icon: MessageCircle,
      channel: "kakao_channel" as const,
    },
    {
      href: CONTACT.youtubeChannel,
      label: "몽PD 유튜브 채널",
      hint: "만드는 영상 직접 보기",
      icon: CirclePlay,
      channel: "youtube" as const,
    },
    {
      href: CONTACT.blog,
      label: "네이버 블로그",
      hint: "운영 이야기 둘러보기",
      icon: BookOpen,
      channel: "blog" as const,
    },
  ].filter((l) => l.href);

  if (links.length === 0) return null;

  const toneClass = onDark
    ? "border-navy-line text-white/80 hover:border-accent hover:text-white"
    : "border-line text-ink-soft hover:border-accent hover:text-ink";

  return (
    // 링크가 3~4개라 가로 한 줄로 두면 라벨이 깨집니다 → 넓은 화면에서 2열
    <ul className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 ${className}`}>
      {links.map(({ href, label, hint, icon: Icon, channel }) => (
        <li key={href}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContactClick(channel)}
            className={`flex h-full items-center gap-3 rounded-card border px-4 py-3.5 transition-colors ${toneClass}`}
          >
            <Icon size={18} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden="true" />
            <span className="flex flex-col leading-tight">
              <span className="text-[14px] font-black">{label}</span>
              <span className="mt-0.5 text-[12px] opacity-70">{hint}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

