"use client";

import { useEffect, useRef } from "react";
import { trackMetaLead } from "@/lib/analytics";

/**
 * Meta Lead 발화 — /thanks 전용.
 *
 * 발화 조건: 자체 폼 저장 성공 후 세션 표식으로 확인된 방문일 때만 (qualified).
 * 직접 URL 입력·북마크 방문은 조건 미달로 아무것도 보내지 않습니다.
 *
 * 중복 방지 3중 장치:
 *  1) ref 가드 — React 개발 모드의 이펙트 2회 실행 흡수
 *  2) 발화 직후 history.replaceState로 ?src=native 제거 — 새로고침해도 조건 미달
 *  3) sessionStorage 플래그 — 뒤로가기/bfcache 복원까지 차단
 *     (탭 세션 기준이라, 나중에 새로 여는 진짜 재신청은 정상 집계됩니다)
 */
const FIRED_KEY = "meta_lead_fired_at";

export default function MetaLeadEvent({ qualified }: { qualified: boolean }) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (!qualified || ranRef.current) return;
    ranRef.current = true;

    try {
      if (sessionStorage.getItem(FIRED_KEY)) return;
    } catch {
      // 스토리지 접근 불가(시크릿 모드 등)여도 1·2번 장치로 충분합니다
    }

    trackMetaLead(crypto.randomUUID());

    try {
      sessionStorage.setItem(FIRED_KEY, String(Date.now()));
    } catch {
      // 무시 — 발화 자체는 완료됨
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("src");
      window.history.replaceState(
        null,
        "",
        url.pathname + url.search + url.hash,
      );
    } catch {
      // URL 정리는 보조 장치 — 실패해도 sessionStorage가 막습니다
    }
  }, [qualified]);

  return null;
}

