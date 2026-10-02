import LandingTelemetry from "@/components/LandingTelemetry";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, X } from "lucide-react";
import {
  BRAND,
  COLUMNS,
  COMPARISON,
  CHANNEL_METRICS,
  CTA,
  CTA_NUDGE,
  DIAGNOSIS_CHECKS,
  FORM_NOTE,
  FUNNEL,
  HERO_HOOK,
  HERO_TRUST,
  INTRO_VIDEO,
  KAKAO_CAPTURES,
  LIMITATIONS,
  LONG_REVIEWS,
  LONG_REVIEWS_NOTE,
  OLD_WAYS,
  PAIN_DOMAINS,
  PROCESS_NOTE,
  PROCESS_STEPS,
  PROFILE,
  PROMISE,
  REVIEW_LINK,
  SCARRED,
  SUCCESS_CASES,
  TOOLS,
} from "@/config/site";
import CtaButton from "@/components/CtaButton";
import Faq from "@/components/Faq";
import FloatingCta from "@/components/FloatingCta";
import HeroRotator from "@/components/HeroRotator";
import IntroVideo from "@/components/IntroVideo";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import SlotLine from "@/components/SlotLine";
import StickyBanner from "@/components/StickyBanner";
import TrackedLink from "@/components/TrackedLink";

/* ============================================================
   라이브 랜딩 — 상세페이지(상세페이지/index.html) 디자인을 그대로 이식.

   · 원본: 벤치마크 18p 해부 → GUIDELINE.md 의 15블록 구조
   · 단일 중앙 컬럼(최대 720px), 전 블록 중앙정렬, 알약 CTA
   · PNG와 달리 웹은 클릭이 되므로 'URL 박스' 대신 실제 버튼을 씁니다
   · 카피 수정은 config/site.ts — 상세페이지/materials.js 와 같은 재료를
     쓰는 블록(OLD_WAYS·자리수 등)은 **두 곳을 함께** 고치세요
   ============================================================ */

/** 중앙 컬럼 섹션 — tone: 흰색 | 워시 | 다크 그라데이션 */
function Block({
  id,
  tone = "paper",
  className = "",
  children,
}: {
  id?: string;
  tone?: "paper" | "wash" | "dark";
  className?: string;
  children: React.ReactNode;
}) {
  const toneClass = {
    paper: "bg-paper",
    wash: "bg-accent-wash/60",
    dark: "bg-[linear-gradient(168deg,#12233f_0%,var(--color-navy)_72%)] text-white",
  }[tone];

  return (
    <section id={id} className={`${toneClass} px-6 py-16 sm:py-20 ${className}`}>
      {/* 스크롤 진입 모션을 여기 한 곳에서 걸어 전 섹션에 적용합니다 */}
      <Reveal className="mx-auto w-full max-w-[720px] text-center">
        {children}
      </Reveal>
    </section>
  );
}

/** 섹션 전환 스크롤 유도 — 벤치마크의 ↓ 장치 */
function Flow() {
  return (
    <div className="pt-9 text-2xl font-black text-accent" aria-hidden="true">
      ⌄
    </div>
  );
}

/** [대괄호] 강조 — 벤치마크 시그니처 */
function Brk({ children }: { children: React.ReactNode }) {
  return <span className="font-black text-accent">[ {children} ]</span>;
}

/** 성과 카드의 미니 막대 (장식 비율 — 데이터 축 아님) */
const CASE_CHART: Record<string, [number, number]> = {
  "eye-c": [34, 92],
  "ps-a": [40, 78],
  "eye-a": [38, 70],
  "eye-b": [30, 82],
  "ps-b": [52, 74],
};

export default function Home() {
  const [leadCapture, ...restCaptures] = KAKAO_CAPTURES;
  // 장문 후기는 가장 강한 1건(수치 검증 가능)만 폼 직전에 — 여러 개 나열하면 스크롤만 늘어납니다
  const review = LONG_REVIEWS[0];
  // 대표 사례(유튜브 직접 귀인)는 서사 전문 노출, 나머지는 펼침으로
  const [leadCase, ...restCases] = SUCCESS_CASES;

  return (
    <>
      <StickyBanner />

      <><LandingTelemetry /><main className="flex-1">
        {/* ══════════ [1] 히어로 ══════════ */}
        <section
          id="hero"
          className="relative overflow-hidden bg-[linear-gradient(168deg,#12233f_0%,var(--color-navy)_72%)] px-6 pb-14 pt-9 text-center text-white sm:pb-20 sm:pt-12"
        >
          {/* 헤드라인 뒤 은은한 광원 — 시선을 가운데로 모읍니다 (장식, 클릭 막지 않음) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[18%] h-[420px] w-[680px] max-w-[130vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(36,86,216,.30),transparent)] blur-[2px]"
          />

          <div className="relative mx-auto w-full max-w-[720px]">
            {/* 브랜드 마크 — 페이지에 헤더가 없어 여기가 유일한 로고 자리입니다 */}
            <Logo size={34} onDark className="mb-8 justify-center sm:mb-10" />

            {/* 헤드라인이 곧 질문입니다.
                이전 "우리 OO의 유튜브?"는 진료과만 바뀔 뿐 아무 정보를 주지 못했습니다.
                원장님이 실제로 느끼는 간극(조회수 ↔ 매출)을 헤드라인에서 바로 찌릅니다. */}
            <h1 className="rise text-[30px] font-black leading-[1.38] tracking-[-0.03em] sm:text-[42px]">
              우리 <HeroRotator fluid /> 유튜브,
              <br />
              {HERO_HOOK.hope}
              <br />
              <span className="text-mark">{HERO_HOOK.worry}</span>
            </h1>

            {/* 조회수 → 문의 → 매출 사슬.
                매출을 눈에 보이게 두되, 저희가 실제로 움직이는 칸(문의)을 강조합니다.
                ⚠️ 매출을 약속하는 장치가 아닙니다 — [5] 등식(문의 전환 = 병원 매출)과 같은 논리입니다. */}
            <div className="rise mt-7 flex items-center justify-center gap-1.5 sm:gap-3">
              {/* 조회수는 '틀린 것'이 아니라 '거기서 멈추면 안 되는 것' — 취소선 대신 흐리게만 */}
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-[13px] font-bold text-white/40 sm:px-4 sm:text-[15px]">
                조회수
              </span>
              <ChevronRight
                size={16}
                strokeWidth={3}
                className="shrink-0 text-white/25"
                aria-hidden="true"
              />
              <span className="rounded-full border border-accent bg-accent/15 px-3 py-1.5 text-[13px] font-black text-white sm:px-4 sm:text-[15px]">
                신환 문의
              </span>
              <ChevronRight
                size={16}
                strokeWidth={3}
                className="shrink-0 text-white/25"
                aria-hidden="true"
              />
              <span className="rounded-full border border-mark/40 px-3 py-1.5 text-[13px] font-black text-mark sm:px-4 sm:text-[15px]">
                매출
              </span>
            </div>

            {/* 헤드라인이 던진 질문의 답 — 사슬 바로 아래에 둡니다 */}
            <p className="rise mx-auto mt-6 max-w-[480px] text-[17px] font-extrabold leading-[1.7] sm:text-[20px]">
              조회수와 매출 사이엔
              <br />
              <span className="rounded-lg bg-accent px-2.5 py-0.5 font-black text-white">
                신환 문의
              </span>
              가 있습니다
            </p>

            <p className="mx-auto mt-4 max-w-[460px] text-[13.5px] leading-[1.85] text-white/55 sm:text-[15px]">
              저희가 설계하는 건 그 <b className="font-black text-white/75">가운데</b>
              입니다.
              <br />
              기획·촬영·편집·업로드까지 맡는 병원 유튜브 풀대행.
            </p>

            <div className="mt-8">
              <CtaButton location="hero" size="lg" onDark />
            </div>

            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              {HERO_TRUST.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-white/60"
                >
                  <Check size={14} strokeWidth={3} className="text-accent" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>

            <SlotLine className="mt-4 justify-center text-sm text-white/45" />

            {/* 증거 한 줄 — 아래로 스크롤할 이유를 만듭니다.
                수치는 [6] 성과사례와 같은 상수(SUCCESS_CASES)를 씁니다 (따로 적지 않음) */}
            {leadCase ? (
              <div className="mx-auto mt-10 max-w-[420px] rounded-2xl border border-white/12 bg-white/[0.055] px-5 py-4 backdrop-blur-sm">
                <p className="text-[12px] font-extrabold tracking-[0.14em] text-white/40">
                  함께한 병원
                </p>
                <p className="mt-1.5 text-[17px] font-black tracking-tight text-mark">
                  {leadCase.metric ?? leadCase.badge}
                </p>
                <p className="mt-1 text-[13px] leading-[1.7] text-white/55">
                  {leadCase.label} · {leadCase.badge}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {/* ══════════ [1-b] 1분 소개 영상 ══════════
            히어로 메시지를 모션으로 푼 영상이라 히어로 바로 아래가 제자리입니다.
            긴 페이지를 다 읽지 않을 사람에게 "전체를 1분에" 주는 지름길 역할입니다.
            흰 배경 위에 어두운 영상 카드 — 다크 히어로와 워시 [2] 사이 리듬을 끊지 않습니다. */}
        {INTRO_VIDEO.src ? (
          <Block id="intro-video" className="pb-10 sm:pb-14">
            <p className="t-eyebrow text-ink-faint">1분 요약</p>
            <h2 className="t-h2 mt-3">
              이 페이지 전체를
              <br />
              <span className="text-accent">1분</span>으로 줄였습니다
            </h2>
            <div className="mx-auto mt-8 max-w-[640px]">
              <IntroVideo
                src={INTRO_VIDEO.src}
                poster={INTRO_VIDEO.poster}
                title={INTRO_VIDEO.title}
              />
            </div>
          </Block>
        ) : null}

        {/* ══════════ [2] 떠오르는 것 ══════════ */}
        {/* 워시 배경 + 흰 카드 — 히어로(다크) 다음이 계속 흰 바탕이라 눈이 쉴 곳이 없었습니다 */}
        <Block id="oldways" tone="wash">
          <p className="t-eyebrow text-ink-faint">익숙한 장면 3가지</p>
          <h2 className="t-h2 mt-3">
            병원 유튜브 하면
            <br />
            떠오르는 것
          </h2>

          <ul className="mt-10 flex flex-col gap-3.5">
            {OLD_WAYS.map((o, i) => (
              <li
                key={o.title}
                className="card relative overflow-hidden px-5 py-5 text-left sm:px-7 sm:py-6"
              >
                {/* 왼쪽 붉은 띠 — '이건 안 되는 방식'을 색으로 못박습니다 */}
                <span
                  className="absolute inset-y-0 left-0 w-[3px] bg-[#e0574b]"
                  aria-hidden="true"
                />
                <div className="flex items-start gap-4 sm:gap-6">
                  <span className="numeral shrink-0" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#c8493d]">
                      <X size={14} strokeWidth={3.5} aria-hidden="true" />
                      {o.title}
                    </p>
                    {/* 위계 반전 — 원래 이 펀치라인이 작은 회색이라 그냥 지나쳤습니다 */}
                    <p className="mt-2 text-[18px] font-extrabold leading-[1.6] tracking-[-0.01em] sm:text-[20px]">
                      {o.sub}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 훅 — 여기서 끊지 않고 [3]으로 넘길 이유를 만듭니다 */}
          <p className="mt-10 text-[18px] font-extrabold leading-[1.7] sm:text-[21px]">
            셋 다 달라 보이지만,
            <br />
            <span className="uline">원인은 하나</span>입니다.
          </p>
          <Flow />
        </Block>

        {/* ══════════ [3] 방향 못박기 ══════════ */}
        <Block id="pivot" className="pt-4 sm:pt-6">
          <h2 className="t-h2">
            <Brk>신환 문의</Brk>의 핵심은
            <br />
            결국 <Brk>채널 설계</Brk>입니다
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[16px] leading-[1.85] text-ink-soft sm:text-[17px]">
            영상을 잘 만드는 문제가 아니라
            <br />
            <b className="font-black text-ink">무엇을 팔지 정하는 문제</b>입니다
          </p>
        </Block>

        {/* ══════════ [4] 자가진단 ══════════ */}
        <Block id="selfcheck" tone="wash">
          <h2 className="t-h2">
            아래 6가지 중
            <br />
            <span className="mark">단 1가지라도</span> 해당된다면
          </h2>

          {/* 체크리스트 형태 — domain(돈·시간·체력…)은 여태 config에만 있고
              화면에 안 나왔습니다. 라벨이 있어야 "내 얘기"를 빨리 찾습니다. */}
          <ul className="mx-auto mt-9 grid max-w-[620px] gap-3 sm:grid-cols-2">
            {PAIN_DOMAINS.map((p) => (
              <li
                key={p.domain}
                className="flex items-start gap-3 rounded-2xl bg-surface px-5 py-4 text-left shadow-[0_3px_10px_rgba(15,23,42,.05)]"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 border-line-strong"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="inline-block rounded-md bg-accent-wash px-2 py-0.5 text-[11.5px] font-black tracking-wide text-accent-deep">
                    {p.domain}
                  </span>
                  <span className="mt-1.5 block text-[14.5px] font-semibold leading-[1.65]">
                    {p.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* 줄바꿈을 의미 단위로 고정 — 자동 줄바꿈에 맡기면 "채널이/아니라"로 갈라집니다 */}
          <p className="t-h2 mt-10 text-[24px] sm:text-[27px]">
            이 중 단 하나라도 해당되신다면,
            <br />
            채널이 아니라
            <br />
            <span className="text-accent">설계의 문제입니다</span>
          </p>
        </Block>

        {/* ══════════ [5] 등식 ══════════ */}
        <Block id="equation">
          <p className="text-[16px] text-ink-soft">영상 하나를 만들더라도</p>
          <h2 className="t-h2 mt-2">
            <Brk>문의 전환</Brk>이
            <br />
            설계되어야 합니다
          </h2>

          {/* 4단 퍼널 도표 — FUNNEL 데이터는 config에 있었는데 화면에 쓰이지 않고 있었습니다.
              위에서 아래로 좁아지는 폭이 '거르는 과정'을 그대로 보여줍니다. */}
          <ol className="stagger mx-auto mt-10 flex max-w-[600px] flex-col items-center gap-2.5">
            {FUNNEL.map((f, i) => (
              <li
                key={f.step}
                className="w-full rounded-2xl px-5 py-4 text-left text-white sm:px-7 sm:py-5"
                style={{
                  // 100% → 82%: 아래로 갈수록 좁아지는 퍼널 형태
                  width: `${100 - i * 6}%`,
                  // 아래로 갈수록 진해져 '전환'에서 가장 짙어집니다
                  backgroundColor: `color-mix(in srgb, var(--color-accent) ${58 + i * 14}%, var(--color-navy))`,
                }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="shrink-0 rounded-md bg-white/20 px-2 py-0.5 text-[11.5px] font-black tracking-wide">
                    {f.step}
                  </span>
                  <span className="text-[15px] font-black leading-snug sm:text-[16.5px]">
                    {f.title}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-[1.7] text-white/75 sm:text-[13.5px]">
                  {f.desc}
                </p>
              </li>
            ))}
          </ol>

          {/* 퍼널의 끝이 곧 등식 — 도표와 문장을 한 흐름으로 붙입니다 */}
          <div className="mt-9 flex items-center justify-center gap-3 sm:gap-5">
            <b className="text-[21px] font-black tracking-tight sm:text-[28px]">
              문의 전환
            </b>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[20px] font-black text-white sm:h-11 sm:w-11 sm:text-[24px]">
              =
            </span>
            <b className="text-[21px] font-black tracking-tight sm:text-[28px]">
              병원 매출
            </b>
          </div>
        </Block>

        {/* ══════════ [6] 성과사례 ══════════ */}
        <Block id="cases" tone="wash">
          <p className="t-eyebrow text-ink-faint">리드유컴퍼니 협업 프로젝트</p>
          <h2 className="t-h2 mt-3">
            함께한 병원들,
            <br />
            지금은 <span className="text-accent">어떻게</span> 달라졌을까요?
          </h2>

          {/* 대표 사례 — 유튜브에 성과가 직접 귀인된 유일한 건이라 서사 전문을 보여줍니다 */}
          {leadCase ? (
            <article className="mt-9 rounded-2xl border-2 border-accent bg-surface px-6 py-7 text-left shadow-[0_4px_16px_rgba(15,23,42,.06)] sm:px-8">
              <div className="flex items-center justify-between gap-5">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink-faint">
                    {leadCase.label}
                  </p>
                  <p className="mt-1 text-[24px] font-black tracking-tight text-accent-deep sm:text-[27px]">
                    {leadCase.metric ?? leadCase.badge}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    {leadCase.badge}
                    {leadCase.period ? ` · ${leadCase.period}` : ""}
                  </p>
                </div>
                <div className="flex h-[76px] shrink-0 items-end gap-2.5" aria-hidden="true">
                  <div className="w-7 rounded-t-md bg-line" style={{ height: "34%" }} />
                  <div className="w-7 rounded-t-md bg-accent" style={{ height: "92%" }} />
                </div>
              </div>
              <p className="mt-5 border-t border-line pt-5 text-[15.5px] font-extrabold leading-snug">
                {leadCase.summary}
              </p>
              <p className="mt-2.5 text-[14px] leading-[1.9] text-ink-soft">
                {leadCase.detail}
              </p>
            </article>
          ) : null}

          <ul className="mt-4 flex flex-col gap-4">
            {restCases.map((c) => {
              const chart = CASE_CHART[c.id] ?? [40, 80];
              return (
                <li
                  key={c.id}
                  className="rounded-2xl bg-surface px-6 py-6 text-left shadow-[0_4px_16px_rgba(15,23,42,.06)] sm:px-7"
                >
                  <div className="flex items-center justify-between gap-5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-ink-faint">
                        {c.label}
                      </p>
                      <p className="mt-1 text-[21px] font-black tracking-tight text-accent-deep sm:text-[24px]">
                        {c.metric ?? c.badge}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                        {c.badge}
                        {c.period ? ` · ${c.period}` : ""}
                      </p>
                    </div>
                    <div
                      className="flex h-[72px] shrink-0 items-end gap-2.5"
                      aria-hidden="true"
                    >
                      <div
                        className="w-7 rounded-t-md bg-line"
                        style={{ height: `${chart[0]}%` }}
                      />
                      <div
                        className="w-7 rounded-t-md bg-accent"
                        style={{ height: `${chart[1]}%` }}
                      />
                    </div>
                  </div>

                  {/* 서사 전문 — 기본 접힘. JS 없이 동작하는 <details>라 정적 빌드에서도 작동 */}
                  <details className="group mt-3 border-t border-line pt-3">
                    <summary className="cursor-pointer list-none text-[13px] font-black text-accent [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">이야기 자세히 보기 +</span>
                      <span className="hidden group-open:inline">접기 −</span>
                    </summary>
                    <p className="mt-3 text-[14.5px] font-extrabold leading-snug">
                      {c.summary}
                    </p>
                    <p className="mt-2 text-[14px] leading-[1.9] text-ink-soft">
                      {c.detail}
                    </p>
                  </details>
                </li>
              );
            })}
          </ul>

          <p className="t-h2 mt-11 text-accent">&ldquo;과연, 우연일까요?&rdquo;</p>
        </Block>

        {/* ══════════ [7] 비교 겹침 카드 ══════════ */}
        <Block id="compare">
          <p className="t-eyebrow text-ink-faint">같은 값을 내고도</p>
          <h2 className="t-h2 mt-3">
            흔한 대행과
            <br />
            무엇이 다른가요?
          </h2>

          {/* 겹친 카드 두 장 → 행 단위 대비표로 교체.
              이전 레이아웃은 5줄 중 3줄만 쓰고 있었고(2줄 낭비), 좌우가 어긋나 있어
              "무엇 대 무엇"인지 눈으로 짝지어지지 않았습니다. */}
          <div className="mx-auto mt-9 max-w-[600px] overflow-hidden rounded-2xl border border-line">
            <div className="grid grid-cols-2">
              <div className="bg-[#f1f3f6] px-4 py-3 text-[13px] font-black text-ink-faint sm:text-[14px]">
                흔한 대행
              </div>
              <div className="bg-accent px-4 py-3 text-[13px] font-black text-white sm:text-[14px]">
                {BRAND.name}
              </div>
            </div>

            {COMPARISON.map((row) => (
              <div
                key={row.us}
                className="grid grid-cols-2 border-t border-line"
              >
                <div className="flex items-start gap-2 bg-[#f8f9fb] px-4 py-4 text-left">
                  <X
                    size={14}
                    strokeWidth={3.5}
                    className="mt-[3px] shrink-0 text-[#c8493d]"
                    aria-hidden="true"
                  />
                  <span className="text-[13.5px] leading-[1.6] text-ink-faint sm:text-[14px]">
                    {row.them}
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-accent-wash/50 px-4 py-4 text-left">
                  <Check
                    size={14}
                    strokeWidth={3.5}
                    className="mt-[3px] shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="text-[13.5px] font-bold leading-[1.6] text-ink sm:text-[14px]">
                    {row.us}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 훅 — 다섯 줄을 한 문장으로 묶어 다음 섹션(제작 과정)으로 넘깁니다 */}
          <p className="mt-9 text-[18px] font-extrabold leading-[1.7] sm:text-[21px]">
            다섯 줄 모두
            <br />
            <span className="uline">촬영 전에 갈리는 것</span>들입니다.
          </p>
          <Flow />
        </Block>

        {/* ══════════ [7-b] 영상 1편이 나오기까지 — 8단계 프로세스 ══════════
            서비스 범위(썸네일·쇼츠·업로드·채널세팅)와 기획 강점을 한 블록으로.
            8단계 중 5단계가 촬영 전 = "기획이 절반"의 구조적 증거.
            전 항목 실제 제공 범위로 확인 완료(2026-08-18) — 범위가 줄면 여기도 빼세요. */}
        <Block id="process" tone="wash">
          <h2 className="t-h2">
            영상 1편이
            <br />
            나오기까지
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-ink-soft">
            8단계 중 <b className="font-black text-accent">5단계가 촬영 전</b>
            입니다.
            <br />
            기획이 절반이라는 말, 구조가 증명합니다.
          </p>

          {/* 촬영 전/후 비중 게이지 — "5단계가 촬영 전"을 문장이 아니라 길이로 보여줍니다.
              비율은 PROCESS_STEPS 개수에서 계산하므로 단계가 바뀌면 자동으로 맞습니다. */}
          <div className="mx-auto mt-8 max-w-[560px]">
            <div className="flex h-8 w-full overflow-hidden rounded-full border border-line bg-surface">
              <div
                className="flex items-center justify-center bg-accent text-[12px] font-black text-white"
                style={{ width: `${(5 / PROCESS_STEPS.length) * 100}%` }}
              >
                촬영 전 5단계
              </div>
              <div
                className="flex items-center justify-center text-[12px] font-black text-ink-faint"
                style={{ width: `${(1 - 5 / PROCESS_STEPS.length) * 100}%` }}
              >
                촬영 후 {PROCESS_STEPS.length - 5}단계
              </div>
            </div>
          </div>

          {/* 타임라인 — 세로 연결선 + 단계 노드. 기획 구간(1~5)만 파란 노드 */}
          <ol className="relative mx-auto mt-9 max-w-[560px] text-left">
            <span
              className="absolute bottom-4 left-[13px] top-4 w-[2px] bg-line"
              aria-hidden="true"
            />
            {PROCESS_STEPS.map((s, i) => {
              const planning = i < 5;
              return (
                <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                  <span
                    className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11.5px] font-black ${
                      planning
                        ? "bg-accent text-white shadow-[0_0_0_4px_var(--color-accent-wash)]"
                        : "bg-surface text-ink-faint shadow-[0_0_0_4px_var(--color-accent-wash)] ring-1 ring-line-strong"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block text-[15.5px] font-extrabold leading-snug">
                      {s.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-[1.7] text-ink-soft">
                      {s.desc}
                    </span>
                    {i === 4 ? (
                      <span className="mt-2 inline-block rounded-md bg-accent-wash px-2 py-1 text-[11.5px] font-black text-accent-deep">
                        ↑ 여기까지가 기획입니다
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="mx-auto mt-6 max-w-md text-[13px] leading-[1.8] text-ink-faint">
            {PROCESS_NOTE}
          </p>
        </Block>

        {/* ══════════ [7-c] 채널 실측 지표 ══════════
            바로 앞 [7-b]에서 "기획이 절반"이라고 주장했으니, 그 기획이 실제로
            작동했다는 증거를 붙입니다.

            ⚠️ 클릭률이 주인공인 이유: 이 페이지는 "조회수 말고 매출"이라고 말합니다.
               여기서 조회수를 크게 내세우면 자기 말과 정면 충돌합니다.
               클릭률은 제목·썸네일 기획의 결과라 설계 포지셔닝과 결이 맞습니다.
            ⚠️ 노출×클릭률(약 2,370) ≠ 조회수(10,445)입니다. 조회수는 구독 피드·외부
               유입 등이 함께 잡히므로 **둘을 퍼널로 엮지 마세요.** 거짓이 됩니다. */}
        {CHANNEL_METRICS.asOf ? (
          <Block id="metrics">
            <p className="t-eyebrow text-ink-faint">기획이 작동한 증거</p>
            <h2 className="t-h2 mt-3">
              설계한 대로
              <br />
              실제로 <span className="text-accent">눌립니다</span>
            </h2>

            <div className="card mx-auto mt-9 max-w-[560px] px-6 py-7 sm:px-8">
              <p className="text-[13px] font-extrabold tracking-[0.12em] text-ink-faint">
                썸네일 클릭률
              </p>
              <p className="mt-1 text-[46px] font-black leading-none tracking-[-0.04em] text-accent sm:text-[56px]">
                {CHANNEL_METRICS.video.ctr}
              </p>

              {/* 점 100개 중 8개 — 퍼센트를 눈으로 세게 만듭니다 (막대 7.9%는 너무 작습니다) */}
              <div
                className="mx-auto mt-6 grid w-fit grid-cols-10 gap-[5px] sm:gap-1.5"
                aria-hidden="true"
              >
                {Array.from({ length: 100 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${
                      i < 8 ? "bg-accent" : "bg-line"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-5 text-[14.5px] font-bold leading-[1.7]">
                썸네일이 100번 보이면 약 8번 눌립니다.
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.7] text-ink-soft">
                노출 {CHANNEL_METRICS.video.impressionsLabel}회 기준. 제목과
                썸네일이 실제로 작동했다는 신호입니다.
              </p>
            </div>

            {/* 지표 카드 — 스튜디오 캡처를 그대로 쌓으니 회색 화면이 3장 겹쳐
                페이지에서 혼자 겉돌았습니다(사용자 지적). 숫자만 디자인해서 올리고,
                원본은 아래 토글에 넣어 '증거'로만 남깁니다. */}
            <div className="mx-auto mt-4 grid max-w-[560px] gap-3.5 sm:grid-cols-2">
              {[
                {
                  label: "영상 1편",
                  sub: "게시 후 약 1주",
                  rows: [
                    ["조회수", CHANNEL_METRICS.video.views.toLocaleString("ko-KR"), "회"],
                    ["시청 시간", "183.4", "시간"],
                    ["구독자", "+38", "명"],
                  ],
                },
                {
                  label: "채널 전체",
                  sub: CHANNEL_METRICS.channel.period,
                  rows: [
                    ["조회수", CHANNEL_METRICS.channel.views.toLocaleString("ko-KR"), "회"],
                    ["시청 시간", "1,500", "시간"],
                    ["구독자", "+224", "명"],
                  ],
                },
              ].map((g) => (
                <div
                  key={g.label}
                  className="overflow-hidden rounded-2xl bg-navy text-left text-white"
                >
                  <div className="border-b border-white/10 px-5 py-3.5">
                    <p className="text-[14px] font-black">{g.label}</p>
                    <p className="mt-0.5 text-[12px] text-white/45">{g.sub}</p>
                  </div>
                  <dl className="px-5 py-4">
                    {g.rows.map(([k, v, unit]) => (
                      <div
                        key={k}
                        className="flex items-baseline justify-between gap-3 border-t border-white/10 py-3 first:border-t-0 first:pt-0 last:pb-0"
                      >
                        <dt className="shrink-0 text-[13px] text-white/55">{k}</dt>
                        <dd className="text-[22px] font-black leading-none tracking-tight text-mark">
                          {v}
                          <span className="ml-0.5 text-[12px] font-bold text-white/45">
                            {unit}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            {/* 원본 캡처 — 기본은 접힘. "숫자만 적어둔 것"과 "실제 화면"의 차이를
                믿고 싶은 분에게만 보여주면 충분합니다. */}
            <details className="group mx-auto mt-4 max-w-[560px] text-left">
              <summary className="card cursor-pointer list-none px-5 py-3.5 text-[13.5px] font-black text-ink-soft transition-colors hover:text-accent">
                실제 유튜브 스튜디오 화면 보기
                <span className="float-right text-ink-faint group-open:hidden">+</span>
                <span className="float-right hidden text-ink-faint group-open:inline">
                  −
                </span>
              </summary>
              <div className="mt-3 flex flex-col gap-3">
                {CHANNEL_METRICS.shots.map((shot) => (
                  <Image
                    key={shot.src}
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    sizes="(max-width: 640px) 100vw, 560px"
                    className="h-auto w-full rounded-xl border border-line"
                  />
                ))}
              </div>
            </details>

            {/* 출처·한계 — 성과사례와 같은 익명 원칙 */}
            <p className="mx-auto mt-5 max-w-[520px] text-[12.5px] leading-[1.75] text-ink-faint">
              함께한 병원 채널의 유튜브 스튜디오 실측값입니다 (
              {CHANNEL_METRICS.asOf} 기준).
              <br />
              병원명은 밝히지 않습니다. 채널·진료과마다 결과는 다릅니다.
            </p>
          </Block>
        ) : null}

        {/* ══════════ [8] 다크 밴드 — 역할 분담 ══════════ */}
        <Block id="roles" tone="dark" className="py-20 sm:py-24">
          <p className="text-[16px] leading-[1.8] text-white/60">
            {PROMISE.heading.split("\n").map((line, i) => (
              <span key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>

          <h2 className="t-h2 mt-8 text-white">
            {PROMISE.role}
            <br />
            <Brk>{PROMISE.roleHighlight}</Brk>
            {PROMISE.roleTail}
          </h2>
          <h2 className="t-h2 mt-7 text-white">
            {PROMISE.ours}
            <br />
            <Brk>{PROMISE.oursHighlight}</Brk>
            {PROMISE.oursTail}
          </h2>

          <div className="mt-10">
            <CtaButton location="middle" onDark />
          </div>
        </Block>

        {/* ══════════ [8-b] 다른 대행에 데인 원장님께 — 1점 후기 정면 대응 ══════════ */}
        {/* [2] 오래된 방식의 ×(빨강)와 짝을 이루는 ✓(파랑) — 두 섹션이 서로를 받게 합니다 */}
        <Block id="scarred" tone="wash">
          <p className="t-eyebrow text-ink-faint">저희가 드리는 약속</p>
          <h2 className="t-h2 mt-3">
            다른 대행에
            <br />
            데인 적 있으시다면
          </h2>

          <ul className="mx-auto mt-10 flex max-w-[560px] flex-col gap-3.5">
            {SCARRED.map((s) => (
              <li
                key={s.title}
                className="card relative overflow-hidden px-5 py-5 text-left sm:px-7 sm:py-6"
              >
                <span
                  className="absolute inset-y-0 left-0 w-[3px] bg-accent"
                  aria-hidden="true"
                />
                <div className="flex items-start gap-3.5">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent"
                    aria-hidden="true"
                  >
                    <Check size={14} strokeWidth={3.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[17.5px] font-extrabold leading-[1.5] tracking-[-0.01em] sm:text-[19px]">
                      {s.title}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-[1.75] text-ink-soft sm:text-[14.5px]">
                      {s.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 훅 — 바로 다음 [9] 정직 고백으로 넘깁니다 */}
          <p className="mt-10 text-[18px] font-extrabold leading-[1.7] sm:text-[21px]">
            다만, <span className="uline">못 하는 것</span>도 있습니다.
          </p>
          <Flow />
        </Block>

        {/* ══════════ [9] 정직 고백 — 지우지 마세요 ══════════ */}
        <Block id="limits">
          <p className="t-eyebrow text-ink-faint">계약 전에 말씀드립니다</p>
          <h2 className="t-h2 mt-3">
            먼저 말씀드릴 것이
            <br />
            있습니다
          </h2>

          <div className="mx-auto mt-9 max-w-[560px] rounded-2xl border-[2.5px] border-ink px-6 py-7 text-left sm:px-9 sm:py-8">
            {LIMITATIONS.map((l, i) => (
              <div
                key={l.title}
                className={`pb-5 last:pb-0 ${i > 0 ? "border-t border-line pt-5" : "pt-0"}`}
              >
                {/* 번호를 붙여 '고백 목록'으로 읽히게 — 뭉뚱그린 문단이면 그냥 넘깁니다 */}
                <p className="flex items-baseline gap-2.5 text-[17.5px] font-extrabold leading-snug">
                  <span className="shrink-0 text-[13px] font-black text-ink-faint">
                    0{i + 1}
                  </span>
                  {l.title}
                </p>
                <p className="mt-1.5 pl-[26px] text-[14px] leading-[1.75] text-ink-soft">
                  {l.body}
                </p>
              </div>
            ))}
          </div>

          {/* 훅 — 불리한 말을 먼저 한 이유를 밝혀 신뢰로 전환합니다 */}
          <p className="mx-auto mt-8 max-w-[520px] text-[15px] leading-[1.85] text-ink-soft sm:text-[16px]">
            불리한 이야기를 먼저 드리는 건,
            <br />
            <b className="font-black text-ink">
              시작하고 나서 어긋나는 게 서로에게 더 손해
            </b>
            이기 때문입니다.
          </p>
        </Block>

        {/* ══════════ [10] 카톡 캡처 ══════════ */}
        {KAKAO_CAPTURES.length > 0 ? (
          <Block id="proof" tone="wash">
            <h2 className="t-h2">
              작업물을 받은 원장님들이
              <br />
              바로 보내온 말
            </h2>

            <div className="mt-9 flex flex-col items-center gap-4">
              {leadCapture ? (
                <div className="rounded-2xl border border-line bg-surface p-2.5 shadow-[0_4px_14px_rgba(15,23,42,.06)]">
                  <Image
                    src={leadCapture.src}
                    alt={leadCapture.alt}
                    width={leadCapture.width}
                    height={leadCapture.height}
                    className="h-auto rounded-lg"
                    style={{ width: leadCapture.width, maxWidth: "100%" }}
                  />
                </div>
              ) : null}
              {restCaptures.map((cap) => (
                <div
                  key={cap.src}
                  className="rounded-2xl border border-line bg-surface p-2.5 shadow-[0_4px_14px_rgba(15,23,42,.06)]"
                >
                  <Image
                    src={cap.src}
                    alt={cap.alt}
                    width={cap.width}
                    height={cap.height}
                    className="h-auto rounded-lg"
                    style={{ width: cap.width, maxWidth: "100%" }}
                  />
                </div>
              ))}
            </div>

            <p className="mt-6 text-[13px] text-ink-faint">
              개인정보 보호를 위해 이름과 프로필은 가렸습니다
            </p>
          </Block>
        ) : null}

        {/* ══════════ [11] 이 일을 하는 사람 ══════════ */}
        {PROFILE.src ? (
          <Block id="who">
            <p className="text-[12px] font-extrabold tracking-[0.3em] text-ink-faint">
              WHO
            </p>
            <div className="mx-auto mt-8 max-w-[560px] overflow-hidden rounded-2xl">
              <Image
                src={PROFILE.src}
                alt={PROFILE.alt}
                width={PROFILE.width}
                height={PROFILE.height}
                className="h-auto w-full"
              />
            </div>
            <p className="mt-7 text-[25px] font-black">{PROFILE.name}</p>
            <p className="mt-1 text-sm font-bold text-ink-faint">{PROFILE.role}</p>
            {/* 배열 한 칸 = 한 줄 — 자동 줄바꿈이 "정하는/일에"처럼 어절을 가르는 것을 방지 */}
            <p className="mx-auto mt-5 max-w-md text-[16px] leading-[1.85] text-ink-soft">
              {PROFILE.blurb.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
            <p className="mt-6 text-[13px] text-ink-faint">
              {BRAND.company} · 사업자등록번호 {BRAND.businessNumber}
            </p>
          </Block>
        ) : null}

        {/* ══════════ [12] FAQ ══════════ */}
        <Block id="faq" tone="wash">
          <p className="t-eyebrow text-ink-faint">망설이는 이유 대부분은</p>
          <h2 className="t-h2 mt-3">자주 묻는 질문</h2>
          <div className="mx-auto mt-9 max-w-[600px]">
            <Faq />
          </div>
        </Block>

        {/* ══════════ [13] 리드마그넷 — 벤치마크의 칼럼 버튼 블록 ══════════ */}
        {(COLUMNS.length > 0 || TOOLS.length > 0) && (
          <Block id="magnet">
            <h2 className="t-h2">
              &ldquo;정말 될까?&rdquo; 싶은
              <br />
              원장님이라면
            </h2>
            <p className="mt-5 text-[16px] leading-[1.85] text-ink-soft">
              매출로 이어지는 전환 설계,
              <br />
              <b className="font-black text-accent">대가 없이 공개합니다</b>
            </p>

            <div className="mx-auto mt-9 flex max-w-[560px] flex-col gap-3.5">
              {COLUMNS.map((col, i) => (
                <TrackedLink
                  key={col.href}
                  href={col.href}
                  kind="column"
                  index={i}
                  className="block rounded-2xl bg-accent-wash px-6 py-5 text-[15px] font-extrabold leading-snug transition-colors hover:bg-accent hover:text-white"
                >
                  {col.title}
                </TrackedLink>
              ))}
              {TOOLS.map((tool, i) => (
                <TrackedLink
                  key={tool.href}
                  href={tool.href}
                  kind="tool"
                  index={i}
                  className="block rounded-2xl border-2 border-accent bg-surface px-6 py-5 transition-colors hover:bg-accent hover:text-white"
                >
                  <span className="block text-[15px] font-extrabold leading-snug">
                    {tool.title} 직접 해보기
                  </span>
                  <span className="mt-1 block text-[13px] font-medium opacity-70">
                    {tool.desc}
                  </span>
                </TrackedLink>
              ))}
            </div>

            {/* 마침표 기준 줄바꿈 */}
            <p className="mx-auto mt-8 max-w-md text-[14px] leading-[1.85] text-ink-soft">
              칼럼과 도구는 <b className="font-black text-ink">뭐가 문제인지</b>
              까지 알려드립니다.
              <br />
              <span className="uline">뭐부터 손대야 하는지</span>는 원장님
              채널을 직접 봐야 답이 나옵니다.
            </p>
          </Block>
        )}

        {/* ══════════ [13-b] 장문 후기 — 보유 증거 중 가장 무거운 것을 폼 직전에 ══════════ */}
        {review ? (
          <Block id="review" tone="wash">
            <p className="t-eyebrow text-ink-faint">진단을 받아본 분의 이야기</p>
            <h2 className="t-h2 mt-3">
              &ldquo;열심히 하는데
              <br />왜 안 될까?&rdquo;
            </h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-ink-soft">
              같은 지점에서 막혀 있던 분이
              <br className="sm:hidden" /> 진단을 받고 어떻게 달라졌는지
            </p>

            <div className="mx-auto mt-9 max-w-[560px] rounded-2xl bg-surface p-7 text-left shadow-[0_4px_16px_rgba(15,23,42,.06)] sm:p-8">
              {review.metric ? (
                <p className="text-[19px] font-black leading-snug tracking-tight text-accent-deep sm:text-[21px]">
                  {review.metric}
                </p>
              ) : null}
              <p className="mt-1.5 text-[13px] font-bold text-ink-faint">
                {review.label} · {review.situation}
              </p>
              <p className="mt-5 border-t border-line pt-5 text-[14.5px] leading-[1.95] text-ink-soft">
                {review.body}
              </p>
            </div>

            <p className="mx-auto mt-6 max-w-md text-[13px] leading-[1.8] text-ink-faint">
              {LONG_REVIEWS_NOTE}
              {REVIEW_LINK ? (
                <>
                  {" "}
                  <TrackedLink
                    href={REVIEW_LINK}
                    kind="review"
                    className="font-black text-ink underline underline-offset-4 hover:text-accent"
                  >
                    후기 원문 보기 ↗
                  </TrackedLink>
                </>
              ) : null}
            </p>
          </Block>
        ) : null}

        {/* ══════════ [14] 최종 CTA ══════════ */}
        <Block id="apply" tone="dark" className="py-20 sm:py-24">
          <h2 className="text-[34px] font-black leading-[1.3] tracking-[-0.03em] sm:text-[38px]">
            조회수가 안 나오는 이유,
            <br />
            <span className="text-accent">이미</span> 알고 계신가요?
          </h2>

          <p className="mt-9 text-[13px] font-extrabold tracking-[0.15em] text-white/50">
            30분 통화에서 짚어드리는 것
          </p>
          <div className="mx-auto mt-3 max-w-[560px] text-left">
            {DIAGNOSIS_CHECKS.map((c, i) => (
              <div
                key={c.title}
                className="flex items-baseline gap-4 border-t border-white/15 py-3.5 first:border-t-0"
              >
                <span className="text-[14px] font-black text-accent">
                  0{i + 1}
                </span>
                <span>
                  <span className="block text-[16px] font-bold">{c.title}</span>
                  <span className="mt-0.5 block text-[13px] text-white/55">
                    {c.desc}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* 버튼 바로 위 — 전제 효과 + 손실 회피.
              감사 결과 최종 CTA에 이 둘과 너지가 통째로 빠져 있었습니다.
              ⚠️ 여기에 "마감 임박"을 더하면 바로 아래 FORM_NOTE("선착순이 아니라
                 선별합니다")와 정면 충돌합니다. 긴급성은 SLOTS 표기까지가 상한선. */}
          <p className="mx-auto mt-10 max-w-[480px] text-[15px] leading-[1.8] text-white/70 sm:text-[16px]">
            {CTA_NUDGE.before}
            <br />
            <b className="font-black text-white">{CTA_NUDGE.loss}</b>
          </p>

          <div className="mt-6">
            <CtaButton location="final" size="lg" onDark>
              {CTA.primaryLong}
            </CtaButton>
          </div>

          <SlotLine className="mt-6 justify-center text-[15px] font-extrabold text-[#ffd7a8]" />

          {/* 마침표 기준 줄바꿈 */}
          <p className="mx-auto mt-5 max-w-md text-[13px] leading-[1.8] text-white/50">
            {FORM_NOTE.map((line, i) => (
              <span key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>

          {/* 문의 채널 4개 목록을 여기 두었다가 뺐습니다 (2026-09-08).
              화면 왼쪽 아래 플로팅 문의 버튼(FloatingContact)이 같은 채널을 이미 들고 있어
              마지막 화면에 같은 링크가 두 벌 쌓였습니다. CTA 직후엔 선택지를 늘리지 않는 게 낫습니다. */}
        </Block>
      </main></>

      {/* ══════════ 푸터 — 다크, 회사 신원 ══════════ */}
      <footer className="bg-[#071022] px-6 py-10 text-center text-[12.5px] leading-[1.9] text-white/55">
        <Logo size={28} onDark className="mb-4 justify-center opacity-80" />
        <p className="font-bold text-white/75">
          {BRAND.name} | {BRAND.company}
        </p>
        <p>사업자등록번호 {BRAND.businessNumber}</p>
        {BRAND.mailOrderNumber ? <p>통신판매업신고 {BRAND.mailOrderNumber}</p> : null}
        <p className="mt-3">
          <Link
            href="/privacy"
            className="font-bold text-white/75 underline underline-offset-2 transition-colors hover:text-white"
          >
            개인정보처리방침
          </Link>
        </p>
        <p className="mt-3">
          © {BRAND.copyrightYear} {BRAND.company}. All rights reserved.
        </p>
      </footer>

      <FloatingCta />
    </>
  );
}

