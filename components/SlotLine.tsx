"use client";

import { useEffect, useState } from "react";
import { getSlotStatus, slotLine, type SlotStatus } from "@/lib/slots";

type Props = {
  className?: string;
  /** 아이콘 없이 문구만 필요할 때 */
  bare?: boolean;
  render?: (status: SlotStatus, line: string) => React.ReactNode;
};

/**
 * 자리 현황 한 줄.
 * 날짜 계산이 들어가므로 마운트 후에만 렌더해 하이드레이션 불일치를 피합니다.
 */
export default function SlotLine({ className = "", bare, render }: Props) {
  const [status, setStatus] = useState<SlotStatus | null>(null);

  useEffect(() => {
    setStatus(getSlotStatus(new Date()));
  }, []);

  if (!status) {
    return <p className={className} aria-hidden="true" />;
  }

  const line = slotLine(status);

  if (render) return <>{render(status, line)}</>;

  return (
    <p className={`inline-flex items-center gap-2 ${className}`}>
      {!bare && (
        <span
          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
            status.soldOut ? "bg-ink-faint" : "bg-accent"
          }`}
          aria-hidden="true"
        />
      )}
      {line}
    </p>
  );
}

