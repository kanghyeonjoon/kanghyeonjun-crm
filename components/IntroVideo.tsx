"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { trackVideo } from "@/lib/analytics";

/**
 * 소개 영상 플레이어.
 *
 * - preload="none": 재생을 누르기 전엔 영상 바이트를 한 톨도 받지 않습니다.
 *   광고 트래픽이 도는 페이지라 방문자 전원에게 9MB씩 쏘면 대역폭이 금방 찹니다.
 * - 파일은 faststart(moov 앞배치)로 재배열돼 있어 누르는 즉시 재생이 시작됩니다.
 *   ⚠️ 영상을 교체할 땐 반드시 같은 처리를 하세요 (안 하면 다 받을 때까지 멈춰 있습니다):
 *      ffmpeg -i 원본.mp4 -c copy -movflags +faststart public/video/mongpd-intro.mp4
 * - 자동재생하지 않습니다. 말로 설명하는 영상이라 소리가 있어야 전달되고,
 *   음소거 자동재생은 모바일에서 데이터도 잡아먹습니다.
 */
export default function IntroVideo({
  src,
  poster,
  title,
}: {
  src: string;
  poster: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  // 25/50/75% 지점을 한 번씩만 보고하기 위한 기록
  const reported = useRef(new Set<number>());

  const start = () => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => {
      // 재생이 막혀도 컨트롤이 열려 있으니 사용자가 직접 누를 수 있습니다
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy shadow-[0_18px_48px_rgba(10,25,47,.28)]">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="none"
        playsInline
        controls={started}
        aria-label={title}
        className="block aspect-video w-full"
        onPlay={() => {
          if (reported.current.size === 0) {
            trackVideo("video_start", { title });
            reported.current.add(0);
          }
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (!v.duration) return;
          const pct = (v.currentTime / v.duration) * 100;
          for (const mark of [25, 50, 75]) {
            if (pct >= mark && !reported.current.has(mark)) {
              reported.current.add(mark);
              trackVideo("video_progress", { title, percent: mark });
            }
          }
        }}
        onEnded={() => {
          if (!reported.current.has(100)) {
            reported.current.add(100);
            trackVideo("video_complete", { title });
          }
        }}
      />

      {/* 첫 재생 전 오버레이 — 네이티브 재생 버튼은 브라우저마다 작거나 안 보여서
          큰 버튼을 직접 올립니다. 한 번 누르면 사라지고 네이티브 컨트롤로 넘어갑니다. */}
      {!started ? (
        <button
          type="button"
          onClick={start}
          aria-label={`${title} 재생`}
          className="group absolute inset-0 flex items-center justify-center bg-navy/25 transition-colors hover:bg-navy/10"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-[0_10px_30px_rgba(36,86,216,.55)] transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
            <Play
              size={30}
              strokeWidth={2.5}
              className="ml-1 fill-white"
              aria-hidden="true"
            />
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-bold text-white">
            1:00
          </span>
        </button>
      ) : null}
    </div>
  );
}

