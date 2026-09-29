import { z } from "zod";
export const management = {
  needs_review: "검수 필요",
  eligible: "영업 가능",
  hold: "보류",
  excluded: "제외",
};
export const proposalStates = {
  draft: "초안",
  review_pending: "검토 대기",
  reviewed: "검토 완료",
  superseded: "이전 버전",
};
export const stages = {
  research: "조사",
  preparing: "제안 준비",
  contacted: "연락 완료",
  meeting: "상담",
  won: "계약",
  lost: "종료",
  hold: "보류",
};
const text = (max: number) => z.string().trim().max(max);
const link = text(2000).refine(
  (v) => !v || (/^https?:\/\//i.test(v) && URL.canParse(v)),
  "http 또는 https 주소를 입력하세요.",
);
export const hospitalSchema = z.object({
  name: text(150).min(1),
  branch: text(100),
  address: text(500),
  contact: text(300),
  official_url: link,
  management_state: z.enum(["needs_review", "eligible", "hold", "excluded"]),
  notes: text(5000),
});
export const proposalSchema = z.object({
  hospital_id: z.uuid(),
  title: text(200).min(1),
  url: link,
  status: z.enum(["draft", "review_pending", "reviewed", "superseded"]),
  notes: text(5000),
});
export const opportunitySchema = z.object({
  hospital_id: z.uuid(),
  stage: z.enum([
    "research",
    "preparing",
    "contacted",
    "meeting",
    "won",
    "lost",
    "hold",
  ]),
  next_action: text(1000),
  due_date: z.union([z.iso.date(), z.literal("")]).transform((v) => v || null),
});
export const recordSchema = z.object({
  id: z.uuid(),
  version: z.coerce.number().int().positive(),
});
export type Entity = "hospitals" | "proposals" | "opportunities";
