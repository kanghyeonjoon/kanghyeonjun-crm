import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BRAND, CONTACT, PRIVACY } from "@/config/site";
import KakaoContact from "@/components/KakaoContact";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${BRAND.name}(${BRAND.company}) 무료 유튜브 진단 신청 관련 개인정보 수집·이용·보관·파기 안내.`,
  robots: { index: true, follow: true },
};

/**
 * 개인정보처리방침 — 법적 고지 문서.
 *
 * 원칙 두 가지:
 *  1) 사실만 씁니다. 수탁업체 목록은 실제 코드가 연동한 서비스에서 가져왔습니다
 *     (Tally·Supabase·Vercel·Telegram·분석도구·토스). 추측으로 채우지 않습니다.
 *  2) 코드에 없는 사업자 정보(책임자·이메일·주소)는 지어내지 않고 config/site.ts의
 *     PRIVACY에서 읽어오며, 비어 있으면 화면에 "[입력 필요]"로 드러냅니다.
 */

/** 수집 항목 — 신청서(Tally) 문항 기준 */
const COLLECTED_ITEMS = [
 "유입 경로", "이름", "전화번호", "이메일", "신청 이유", "성별", "연령대", "유튜브 채널 주소", "개인정보 동의 여부와 동의문 버전", "접수 시각 및 중복·남용 방지를 위한 IP 해시"
] as const;

/** 이용 목적 */
const PURPOSES = [
  "무료 유튜브 진단 신청 확인",
  "상담 대상 검토",
  "상담 일정 및 서비스 안내",
] as const;

/**
 * 처리 위탁 현황 — 실제 연동된 서비스만 적었습니다.
 * 연동을 추가·해지하면 이 목록도 함께 고쳐야 합니다.
 */
const PROCESSORS = [
  {
    name: "Resend",
    task: "이메일 발송 설정 후 신청자 접수 확인 및 관리자 알림 처리",
    country: "미국",
  },
  {
    name: "Supabase, Inc.",
    task: "신청 내역 보관 (데이터 저장 위치: 대한민국 서울)",
    country: "미국",
  },
  {
    name: "Vercel, Inc.",
    task: "웹사이트 호스팅 및 서버 운영",
    country: "미국",
  },
  {
    name: "누리고(SOLAPI)",
    task: "몽PD 템플릿 승인 및 발송 설정 후 신청자 알림톡 처리 (현재 미사용)",
    country: "대한민국",
  },
  {
    name: "토스페이먼츠(주)",
    task: "유료 상품 구매 시 결제 처리 (무료 진단 신청에는 해당하지 않음)",
    country: "대한민국",
  },
] as const;

/** 자동 수집 도구 — 설정된 것만 표시합니다 (config/site.ts ANALYTICS) */
const TRACKERS = [
  { name: "Google Analytics 4", task: "방문 통계 분석", country: "미국" },
  { name: "Microsoft Clarity", task: "방문 행동 분석", country: "미국" },
  { name: "Meta 픽셀", task: "광고 성과 측정", country: "미국" },
] as const;

/** 비어 있는 사업자 정보를 눈에 띄게 드러냅니다 — 실수로 방치하면 바로 보이도록 */
function Blank({ label }: { label: string }) {
  return (
    <span className="rounded border border-dashed border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[13px] font-bold text-amber-800">
      [{label} 입력 필요]
    </span>
  );
}

/** 번호가 붙은 조항 — 모바일에서 번호와 제목이 붙어 읽히도록 baseline 정렬 */
function Clause({
  no,
  title,
  children,
}: {
  no: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="flex items-baseline gap-3 text-[18px] font-black leading-[1.45] tracking-[-0.02em]">
        <span className="shrink-0 text-[14px] font-black text-accent">
          {String(no).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 pl-0 text-[15px] leading-[1.9] text-ink-soft sm:pl-9">
        {children}
      </div>
    </section>
  );
}

/** 항목·수탁자처럼 나열되는 정보 — 모바일에서 표가 깨지지 않게 세로로 쌓습니다 */
function Row({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="border-t border-line py-3 first:border-t-0">
      <p className="text-[15px] font-bold text-ink">{label}</p>
      {desc ? (
        <p className="mt-0.5 text-[14px] leading-[1.75] text-ink-soft">{desc}</p>
      ) : null}
    </div>
  );
}

export default function PrivacyPage() {
  const officer = PRIVACY.officerName ? (
    <>
      {PRIVACY.officerName}
      {PRIVACY.officerTitle ? ` (${PRIVACY.officerTitle})` : ""}
    </>
  ) : (
    <Blank label="개인정보 보호책임자 성명" />
  );

  const email = PRIVACY.contactEmail ? (
    <a
      href={`mailto:${PRIVACY.contactEmail}`}
      className="font-bold text-accent underline underline-offset-2"
    >
      {PRIVACY.contactEmail}
    </a>
  ) : (
    <Blank label="문의 이메일" />
  );

  return (
    <main className="flex-1">
      {/* ── 슬림 다크 헤더 (사이트 공통 언어) ── */}
      <section className="bg-[linear-gradient(168deg,#12233f_0%,var(--color-navy)_72%)] px-6 pb-12 pt-10 text-white">
        <div className="mx-auto w-full max-w-[720px]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} strokeWidth={2.5} aria-hidden="true" />
            {BRAND.name} 병원 유튜브
          </Link>

          <h1 className="mt-7 text-[28px] font-black leading-[1.3] tracking-[-0.03em] sm:text-[34px]">
            개인정보처리방침
          </h1>
          <p className="mt-4 text-[14px] leading-[1.8] text-white/60">
            {BRAND.name}({BRAND.company})는 무료 유튜브 진단 신청 과정에서
            수집하는 개인정보를
            <br className="hidden sm:block" /> 아래와 같이 처리합니다.
          </p>
          <p className="mt-4 text-[13px] text-white/45">
            시행일 {PRIVACY.effectiveDate}
          </p>
        </div>
      </section>

      {/* ── 본문 ── */}
      <div className="px-6 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[720px]">
          {/* 수집 주체 — 조항 번호 없이 머리말로 */}
          <section className="rounded-2xl bg-accent-wash px-6 py-5 text-[15px] leading-[1.9] text-ink-soft">
            <p>
              <b className="font-black text-ink">개인정보 수집 주체</b>
              <br />
              {BRAND.name}({BRAND.company})
              <br />
              사업자등록번호 {BRAND.businessNumber}
              {PRIVACY.address ? (
                <>
                  <br />
                  {PRIVACY.address}
                </>
              ) : null}
            </p>
          </section>

          <div className="mt-10 space-y-10">
            <Clause no={1} title="수집하는 개인정보 항목">
              <p>
                무료 유튜브 진단 신청서를 통해 아래 항목을 수집합니다. 직접 입력한 정보와 접수 기록을 수집하며, 주민등록번호 등 고유식별정보는
                수집하지 않습니다.
              </p>
              <div className="mt-1">
                {COLLECTED_ITEMS.map((item) => (
                  <Row key={item} label={item} />
                ))}
              </div>
            </Clause>

            <Clause no={2} title="개인정보의 수집 및 이용 목적">
              <p>수집한 개인정보는 아래 목적으로만 이용합니다.</p>
              <div className="mt-1">
                {PURPOSES.map((p) => (
                  <Row key={p} label={p} />
                ))}
              </div>
              <p>
                목적이 달라지는 경우에는 미리 알리고 별도로 동의를 받습니다.
              </p>
            </Clause>

            <Clause no={3} title="개인정보의 보유 및 이용 기간">
              <p>
                <b className="font-black text-ink">
                  상담 종료 또는 신청일로부터 1년까지 보관한 뒤 파기합니다.
                </b>{" "}
                두 시점 중 먼저 도래하는 때를 기준으로 하며, 신청자가 그 전에
                삭제를 요청하면 지체 없이 파기합니다.
              </p>
              <p>
                다만 관계 법령에 따라 보존이 필요한 정보는 해당 법령에서 정한
                기간 동안 보관합니다.
              </p>
            </Clause>

            <Clause no={4} title="개인정보 제공 동의를 거부할 권리">
              <p>
                신청자는 개인정보 제공에 동의하지 않을 권리가 있습니다. 동의를
                거부하셔도 불이익은 없습니다.
              </p>
              <p>
                다만 위 항목은 신청 확인과 연락에 필요한 정보이므로,{" "}
                <b className="font-black text-ink">
                  동의를 거부하시면 무료 진단 신청과 상담 안내가 제한될 수
                  있습니다.
                </b>
              </p>
            </Clause>

            <Clause no={5} title="개인정보의 제3자 제공">
              <p>
                수집한 개인정보를{" "}
                <b className="font-black text-ink">
                  제3자에게 제공하지 않습니다.
                </b>{" "}
                판매·대여·공유하지 않으며, 광고나 마케팅 목적으로 외부에 넘기지
                않습니다.
              </p>
              <p>
                제공이 필요한 경우가 생기면 제공받는 자, 제공 항목, 이용 목적,
                보유 기간을 알리고 미리 동의를 받습니다. 법령에 근거한 수사기관
                등의 적법한 요청이 있는 경우는 예외입니다.
              </p>
            </Clause>

            <Clause no={6} title="개인정보 처리의 위탁">
              <p>
                서비스 운영에 필요한 범위에서 아래와 같이 처리 업무를 위탁하고
                있습니다. 알림 서비스는 발신자 설정을 완료한 경우에만 사용합니다.
              </p>
              <div className="mt-1">
                {PROCESSORS.map((p) => (
                  <Row
                    key={p.name}
                    label={p.name}
                    desc={`${p.task} · 소재 ${p.country}`}
                  />
                ))}
              </div>
              <p>
                위 수탁자 중 국외 사업자에게는 서비스 제공에 필요한 기간 동안
                각 서비스의 실제 처리 위치와 정책에 따라 개인정보가 처리될 수 있습니다. 신청자는 국외 이전을
                거부할 수 있으며, 이 경우 신청서 접수가 제한될 수 있습니다.
              </p>
            </Clause>

            <Clause no={7} title="개인정보 파기 절차 및 방법">
              <p>
                보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이
                파기합니다.
              </p>
              <div className="mt-1">
                <Row
                  label="파기 절차"
                  desc="보유 기간 만료 또는 목적 달성 여부를 확인한 뒤, 내부 책임자의 승인을 거쳐 파기합니다. 다른 법령에 따라 보존해야 하는 정보는 별도로 분리해 보관한 뒤 해당 기간이 끝나면 파기합니다."
                />
                <Row
                  label="전자적 파일"
                  desc="복구·재생할 수 없는 방법으로 영구 삭제합니다."
                />
                <Row
                  label="종이 문서"
                  desc="분쇄하거나 소각합니다."
                />
              </div>
            </Clause>

            <Clause no={8} title="이용자의 권리와 행사 방법">
              <p>
                신청자는 언제든지 본인의 개인정보에 대해 아래 권리를 행사할 수
                있습니다.
              </p>
              <div className="mt-1">
                <Row label="열람 요청" desc="어떤 정보가 저장돼 있는지 확인" />
                <Row label="정정 요청" desc="잘못되거나 바뀐 정보의 수정" />
                <Row label="삭제 요청" desc="보유 중인 정보의 삭제" />
                <Row
                  label="처리정지 요청"
                  desc="더 이상 처리하지 않도록 중지"
                />
              </div>
              <p>
                아래 문의처로 이메일 또는 카카오톡으로 요청하시면 본인 확인 후{" "}
                <b className="font-black text-ink">10일 이내</b>에 처리하고 결과를
                알려드립니다. 법정대리인이나 위임받은 사람을 통해서도 요청할 수
                있습니다.
              </p>
              <p>
                처리 결과에 이의가 있으시면 개인정보 분쟁조정위원회(1833-6972,
                www.kopico.go.kr) 또는 개인정보침해 신고센터(국번없이 118,
                privacy.kisa.or.kr)에 도움을 요청하실 수 있습니다.
              </p>
            </Clause>

            <Clause no={9} title="쿠키 등 자동 수집 도구">
              <p>
                랜딩 홈페이지에서 방문 통계와 광고 성과 측정을 사용합니다. 자체 신청서와 CRM 화면에는 이 추적 스크립트를 불러오지 않습니다.
                이름·연락처 같은 신청서 정보와 결합해 개인을 식별하는 용도로는
                사용하지 않습니다.
              </p>

              <p>
                브라우저 설정에서 쿠키 저장을 거부하실 수 있습니다. 거부하셔도
                사이트 이용에는 제한이 없습니다.
              </p>
            </Clause>

            <Clause no={10} title="개인정보 보호책임자 및 문의처">
              <p>
                개인정보 처리에 관한 문의, 열람·정정·삭제 요청, 피해 구제는 아래로
                연락해 주세요.
              </p>
              <div className="mt-1">
                <div className="border-t border-line py-3 first:border-t-0">
                  <p className="text-[15px] font-bold text-ink">
                    개인정보 보호책임자
                  </p>
                  <p className="mt-1 text-[14px] leading-[1.75] text-ink-soft">
                    {officer}
                  </p>
                </div>
                <div className="border-t border-line py-3">
                  <p className="text-[15px] font-bold text-ink">이메일</p>
                  <p className="mt-1 text-[14px] leading-[1.75] text-ink-soft">
                    {email}
                  </p>
                </div>
                {PRIVACY.contactPhone ? (
                  <div className="border-t border-line py-3">
                    <p className="text-[15px] font-bold text-ink">전화</p>
                    <p className="mt-1 text-[14px] leading-[1.75] text-ink-soft">
                      {PRIVACY.contactPhone}
                    </p>
                  </div>
                ) : null}
                {PRIVACY.address ? (
                  <div className="border-t border-line py-3">
                    <p className="text-[15px] font-bold text-ink">주소</p>
                    <p className="mt-1 text-[14px] leading-[1.75] text-ink-soft">
                      {PRIVACY.address}
                    </p>
                  </div>
                ) : null}
              </div>

              {CONTACT.kakaoOpenProfile || CONTACT.kakaoChannel ? (
                <div className="pt-2">
                  <p className="mb-3 text-[13px] text-ink-faint">
                    카카오톡으로도 요청하실 수 있습니다.
                  </p>
                  <KakaoContact />
                </div>
              ) : null}
            </Clause>

            <Clause no={11} title="방침의 변경">
              <p>
                법령이나 서비스 내용이 바뀌어 이 방침을 변경할 때에는 변경 사항을
                이 페이지에 게시하고, 시행일을 함께 표시합니다.
              </p>
              <p className="text-ink">
                <b className="font-black">시행일</b> — {PRIVACY.effectiveDate}
              </p>
            </Clause>
          </div>

          <div className="mt-12 border-t border-line pt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[14px] font-black text-accent transition-colors hover:text-accent-deep"
            >
              <ArrowLeft size={15} strokeWidth={2.75} aria-hidden="true" />
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      {/* 사이트 공통 다크 푸터와 같은 신원 표기 */}
      <footer className="bg-[#071022] px-6 py-10 text-center text-[12.5px] leading-[1.9] text-white/55">
        <p className="font-bold text-white/75">
          {BRAND.name} | {BRAND.company}
        </p>
        <p>사업자등록번호 {BRAND.businessNumber}</p>
        {BRAND.mailOrderNumber ? (
          <p>통신판매업신고 {BRAND.mailOrderNumber}</p>
        ) : null}
        <p className="mt-3">
          © {BRAND.copyrightYear} {BRAND.company}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

