"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackMetaPageView } from "@/lib/analytics";

/**
 * Meta 픽셀 SPA 보정 — next/link 클라이언트 전환은 기본 코드를 다시 실행하지 않으므로
 * 경로가 바뀔 때마다 PageView를 보냅니다.
 * 최초 로드는 기본 코드(app/layout.tsx)가 이미 보냈기 때문에 건너뜁니다 (중복 방지).
 */
export default function MetaRouteTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === null) {
      lastTracked.current = pathname;
      return;
    }
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    trackMetaPageView();
  }, [pathname]);

  return null;
}

