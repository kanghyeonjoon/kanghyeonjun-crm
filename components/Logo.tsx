/**
 * 몽PD 로고 — 뷰파인더 브래킷 + 프레임 + 눈.
 *
 * SVG 인라인인 이유: 어두운 히어로에서는 네이비 획이 배경에 묻혀 보이지 않습니다.
 * onDark일 때 네이비를 흰색으로 바꿔야 해서 색을 코드에서 제어합니다.
 *
 * ⚠️ 이 마크는 원본 로고 파일이 없어 제가 도형으로 재현한 버전입니다.
 *    원본 파일(AI/SVG/PNG)이 있으면 public/에 넣고 이 컴포넌트를 <Image>로 교체하세요.
 */

const SKY = "#74AFCA";

export function LogoMark({
  size = 32,
  onDark = false,
  className = "",
}: {
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  // 어두운 배경에서는 네이비가 묻히므로 흰색으로 바꿉니다
  const deep = onDark ? "#ffffff" : "#0D3B5E";
  const eyeGlint = onDark ? "#0a1930" : "#ffffff";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* 두 L이 겹치는 끝을 대각선으로 잘라 맞물린 것처럼 보이게 합니다.
          (브래킷까지 잘리면 안 되므로 프레임 획에만 각각 적용) */}
      <defs>
        <mask id="cut-sky">
          <rect width="120" height="120" fill="#fff" />
          <polygon points="56,120 120,56 120,120" fill="#000" />
        </mask>
        <mask id="cut-deep">
          <rect width="120" height="120" fill="#fff" />
          <polygon points="0,0 64,0 0,64" fill="#000" />
        </mask>
      </defs>

      {/* 뷰파인더 브래킷 4개 */}
      <g stroke={SKY} strokeWidth="7.5" strokeLinecap="butt" fill="none">
        <path d="M4 32 V4 H32" />
        <path d="M88 4 H116 V32" />
        <path d="M116 88 V116 H88" />
        <path d="M32 116 H4 V88" />
      </g>

      {/* 프레임 — 하늘색 L(왼쪽+아래) + 네이비 L(위+오른쪽) */}
      <path
        d="M32 26 V70 A18 18 0 0 0 50 88 H94"
        stroke={SKY}
        strokeWidth="12"
        fill="none"
        mask="url(#cut-sky)"
      />
      <path
        d="M26 32 H70 A18 18 0 0 1 88 50 V94"
        stroke={deep}
        strokeWidth="12"
        fill="none"
        mask="url(#cut-deep)"
      />

      {/* 눈 — 네이비 원 + 좌상단 초승달 하이라이트 */}
      <circle cx="60" cy="60" r="14.5" fill={deep} />
      <circle cx="55.5" cy="55.5" r="8" fill={eyeGlint} />
      <circle cx="58.5" cy="58.5" r="8" fill={deep} />
    </svg>
  );
}

/** 아이콘 + 워드마크 가로 조합 */
export default function Logo({
  size = 30,
  onDark = false,
  showWordmark = true,
  className = "",
}: {
  size?: number;
  onDark?: boolean;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} onDark={onDark} />
      {showWordmark ? (
        <span
          className={`text-[19px] font-black tracking-[-0.02em] ${
            onDark ? "text-white" : "text-[#0D3B5E]"
          }`}
          style={{ fontSize: size * 0.62 }}
        >
          Mong PD
        </span>
      ) : null}
    </span>
  );
}

