import { FAQ } from "@/config/site";

/**
 * [FAQ] — 거절 핑계 미리 없애기 (법·실력·돈).
 *
 * 상세페이지 디자인과 통일: 접는 아코디언 대신 **답을 펼쳐서 보여줍니다.**
 * 전환용 랜딩에서 답을 숨기면 클릭 안 한 사람에겐 없는 콘텐츠입니다.
 * 검색엔진용 FAQPage JSON-LD는 그대로 유지합니다.
 */
export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <ul className="flex flex-col gap-8 text-left">
        {FAQ.map((item, i) => (
          <li key={item.q}>
            <p className="text-[17px] font-extrabold leading-snug sm:text-lg">
              <span className="text-accent">Q{i + 1}.</span> {item.q}
            </p>
            <div className="mt-3 rounded-2xl bg-accent-wash px-6 py-5 text-[15px] leading-[1.85] text-ink-soft">
              {item.a}
            </div>
          </li>
        ))}
      </ul>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

