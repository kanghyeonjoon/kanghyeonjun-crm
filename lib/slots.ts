import { SLOTS } from "@/config/site";

/**
 * 무료 진단 자리 현황 계산.
 *
 * ⚠️ 허위 긴급성 금지 — config/site.ts의 SLOTS.left는 반드시 실제 남은 자리와 맞춰야 합니다.
 * 자리가 다 찼는데 숫자를 방치하면 가짜 마감 임박이 되고, 이는 표시광고법상 문제가 됩니다.
 *
 * 월 이름과 마감 D-N은 한국 시간(KST) 기준으로 자동 계산됩니다.
 */

export type SlotStatus = {
  /** 이번 달 (1~12) */
  month: number;
  /** 총 정원 */
  total: number;
  /** 남은 자리 */
  left: number;
  /** 월말까지 남은 날 */
  daysLeft: number;
  /** 자리가 모두 찼는지 — true면 페이지가 '다음 달 대기' 모드로 전환됩니다 */
  soldOut: boolean;
  /** 다음 달부터 정원이 줄어드는지 */
  nextTotal: number | null;
};

/** KST 기준 연·월·일을 추출합니다 (서버 타임존과 무관하게 동작) */
function toKst(date: Date) {
  const kstMs = date.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  return {
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
  };
}

export function getSlotStatus(now: Date): SlotStatus {
  const { year, month, day } = toKst(now);

  // 해당 월의 마지막 날 (UTC 기준으로 계산해도 일수는 동일)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  // SLOTS.left는 asOf 달에만 유효 — 달이 바뀌면 정원(total)으로 자동 리셋.
  // 지난달 "1자리 남음"이 새 달까지 붙어 있는 허위 긴급성을 코드가 차단합니다.
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  const left =
    SLOTS.asOf === ym ? Math.max(0, SLOTS.left) : SLOTS.total;

  return {
    month,
    total: SLOTS.total,
    left,
    daysLeft: Math.max(0, lastDay - day),
    soldOut: left === 0,
    nextTotal: SLOTS.nextTotal,
  };
}

/** 배너·CTA 주변에 표시할 한 줄 문구 */
export function slotLine(status: SlotStatus): string {
  if (status.soldOut) {
    return `${status.month}월 무료진단은 마감되었습니다 · 다음 달 우선 대기 신청 가능`;
  }
  return `${status.month}월 무료진단 ${status.total}자리 중 ${status.left}자리 남음 · 신청 마감 D-${status.daysLeft}`;
}

