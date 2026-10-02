import { PAGE_VARIANT } from "@/config/site";

/**
 * GA4 이벤트 추적.
 *
 * 이벤트 스키마는 기존 랜딩(trendmaster/hospital)과 **동일하게 유지**합니다.
 * 같은 GA4 속성을 쓰기 때문에, 스키마를 바꾸면 기존 데이터와 비교가 끊깁니다.
 *   - cta_click     : CTA 버튼 클릭 (cta_location 파라미터로 위치 구분)
 *   - generate_lead : 전환 의도 (GA4 권장 이벤트)
 *   - column_click  : 리드마그넷 칼럼 클릭
 *   - review_click  : 후기 원문 클릭
 *   - tool_click    : 진단도구 클릭 (신규 — 기존 랜딩에 없던 자산)
 *   - purchase      : 계약금 결제 완료 (결제 페이지 구축 시 추가)
 */

type GtagFn = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>,
) => void;

/** Meta 픽셀 함수 — 기본 코드(app/layout.tsx)가 전역에 심습니다 */
type FbqFn = (
  command: "track" | "init" | "trackCustom",
  eventNameOrId: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: FbqFn;
  }
}

/** CTA가 놓인 위치 — 어느 자리의 버튼이 실제 전환으로 이어지는지 측정합니다 */
export type CtaLocation = "banner" | "hero" | "middle" | "float" | "final";

function send(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, { ...params, page_variant: PAGE_VARIANT });
}

export function trackCtaClick(location: CtaLocation) {
  send("cta_click", { cta_location: location });
  send("generate_lead", { cta_location: location });
}

export function trackColumnClick(index: number) {
  send("column_click", { column_index: index });
}

export function trackToolClick(index: number) {
  send("tool_click", { tool_index: index });
}

export function trackReviewClick() {
  send("review_click");
}

/* ── Meta 픽셀 ──
   GA4와 별개 채널입니다. PageView는 기본 코드(최초 로드) + MetaRouteTracker(라우트 전환)가,
   Lead는 /thanks의 MetaLeadEvent만 보냅니다 — 버튼 클릭·제출 실패에서는 절대 보내지 않습니다. */

/** SPA 라우트 전환 PageView — 최초 로드는 기본 코드가 이미 보냈으므로 전환 시에만 호출 */
export function trackMetaPageView() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "PageView");
}

/**
 * 잠재고객(Lead) — 신청서가 실제로 제출 완료된 뒤에만 호출됩니다.
 * eventID는 중복 제거용(브라우저 재전송·향후 서버 전환 API 병행 대비).
 * 픽셀 스크립트(afterInteractive)가 React 이펙트보다 늦게 실행될 수 있어 최대 5초 재시도합니다.
 */
export function trackMetaLead(eventId: string) {
  if (typeof window === "undefined") return;
  let tries = 0;
  const attempt = () => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", {}, { eventID: eventId });
      return;
    }
    tries += 1;
    if (tries < 25) setTimeout(attempt, 200);
  };
  attempt();
}

/**
 * 소개 영상 — GA4 권장 이벤트 이름(video_start / video_progress / video_complete)을 그대로 씁니다.
 * 60초짜리라 "몇 %까지 보다가 나가는지"가 영상 교체 판단의 근거가 됩니다.
 */
export function trackVideo(
  event: "video_start" | "video_progress" | "video_complete",
  params: { title: string; percent?: number },
) {
  send(event, {
    video_title: params.title,
    ...(params.percent !== undefined ? { video_percent: params.percent } : {}),
  });
}

/** 키트 결제 완료 — GA4 표준 전자상거래 스키마(purchase) */
export function trackPurchase(params: {
  orderId: string;
  value: number;
  itemName: string;
}) {
  send("purchase", {
    transaction_id: params.orderId,
    value: params.value,
    currency: "KRW",
    items: [{ item_name: params.itemName, price: params.value, quantity: 1 }],
  });
}

/** 보조 경로 클릭 — 폼 대신 어떤 경로로 빠지는지 봅니다 */
export function trackContactClick(
  channel: "kakao_channel" | "kakao_open" | "youtube" | "instagram" | "blog",
) {
  send("contact_click", { contact_channel: channel });
}

