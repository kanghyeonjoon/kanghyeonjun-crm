"use client";

import { trackColumnClick, trackReviewClick, trackToolClick } from "@/lib/analytics";

type Props = {
  href: string;
  kind: "column" | "tool" | "review";
  /** column·tool일 때 몇 번째 항목인지 */
  index?: number;
  className?: string;
  children: React.ReactNode;
};

/** 외부 리드마그넷·후기 링크. 새 탭으로 열고 클릭을 GA4로 보냅니다. */
export default function TrackedLink({
  href,
  kind,
  index = 0,
  className = "",
  children,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (kind === "column") trackColumnClick(index);
        else if (kind === "tool") trackToolClick(index);
        else trackReviewClick();
      }}
      className={className}
    >
      {children}
    </a>
  );
}

