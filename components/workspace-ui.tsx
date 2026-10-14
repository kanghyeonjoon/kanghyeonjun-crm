"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { signout } from "@/app/(crm)/login/actions";
import { RecordForm } from "./record-form";
import {
  management,
  proposalStates,
  stages,
  type Entity,
} from "@/lib/validation";
type Row = Record<string, string | number | null>;
type Query = { q: string; state: string; from: string; to: string };
const tabs = {
  hospitals: "병원 관리",
  proposals: "제안서",
  opportunities: "영업 진행",
};
const paths = {
  hospitals: "M4 21V5h16v16M9 5V2h6v3M9 21v-5h6v5M8 9h2m4 0h2M8 12h2m4 0h2",
  proposals: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7",
  opportunities: "M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7",
};
function Icon({ type }: { type: Entity }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d={paths[type]} />
    </svg>
  );
}
const number = (n: number) => n.toLocaleString("ko-KR");
export function WorkspaceUI({
  tab,
  email,
  role,
  rows,
  hospitals,
  total,
  totals,
  page,
  size,
  query,
  failed,
}: {
  tab: Entity;
  email: string;
  role: string;
  rows: Row[];
  hospitals: { id: string; name: string }[];
  total: number;
  totals: number[];
  page: number;
  size: number;
  query: Query;
  failed: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [collapsed, setCollapsed] = useState(false);
  const [draft, setDraft] = useState(query);
  const [mode, setMode] = useState("auto");
  const [fit, setFit] = useState(0);
  const grid = useRef<HTMLDivElement>(null);
  const [advanced, setAdvanced] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [jump, setJump] = useState(String(page));
  const canEdit = role === "owner" || role === "operator";
  const statuses: Record<string, string> =
    tab === "hospitals"
      ? management
      : tab === "proposals"
        ? proposalStates
        : stages;
  const names = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));
  const pages = Math.max(1, Math.ceil(total / Math.max(size, 1)));
  function navigate(
    next: Partial<Query> = {},
    p = 1,
    n = size,
    replace = false,
  ) {
    const url =
      "/workspace?" +
      new URLSearchParams({
        tab,
        ...query,
        ...next,
        page: String(p),
        size: String(n),
      });
    start(() =>
      replace
        ? router.replace(url, { scroll: false })
        : router.push(url, { scroll: false }),
    );
  }
  useEffect(() => {
    try {
      const m = localStorage.getItem("erp-page-size");
      if (m && ["auto", "20", "50", "100"].includes(m)) setMode(m);
      setCollapsed(localStorage.getItem("erp-menu-collapsed") === "true");
    } catch {}
  }, []);
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(
        () =>
          setFit(
            window.matchMedia("(max-width: 760px)").matches
              ? 20
              : Math.max(1, Math.min(100, Math.floor((el.clientHeight - 38) / 40))),
          ),
        100,
      );
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    const n = mode === "auto" ? fit : Number(mode);
    if (n && n !== size) navigate({}, 1, n, true);
  }, [fit, mode, size]); // measured grid controls the server page size
  useEffect(() => setJump(String(page)), [page]);
  useEffect(() => {
    if (selected || adding) {
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [selected, adding]);
  function close() {
    setSelected(null);
    setAdding(false);
    setEditing(false);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAdvanced(false);
    navigate(draft);
  }
  function quick(days: number) {
    const today = new Date();
    const date = (d: Date) =>
      new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    setDraft({
      ...draft,
      from: days ? date(new Date(today.getTime() - (days - 1) * 86400000)) : "",
      to: days ? date(today) : "",
    });
  }
  function exportPage() {
    const columns =
      tab === "hospitals"
        ? [
            "name",
            "branch",
            "address",
            "contact",
            "management_state",
            "official_url",
          ]
        : tab === "proposals"
          ? ["title", "hospital_id", "status", "url"]
          : ["hospital_id", "stage", "next_action", "due_date"];
    const safe = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const body =
      "\uFEFF" +
      [
        columns,
        ...rows.map((r) =>
          columns.map((c) =>
            c === "hospital_id" ? names[String(r[c])] : r[c],
          ),
        ),
      ]
        .map((r) => r.map(safe).join(","))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([body], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  const title = (r: Row) =>
    String(
      tab === "hospitals"
        ? r.name
        : tab === "proposals"
          ? r.title
          : (names[String(r.hospital_id)] ?? "병원"),
    );
  const status = (r: Row) => String(r.management_state ?? r.status ?? r.stage);
  const badge = (r: Row) => (
    <span
      className={`erp-status ${["eligible", "reviewed", "won"].includes(status(r)) ? "success" : ["hold", "needs_review", "review_pending"].includes(status(r)) ? "warning" : ["excluded", "lost"].includes(status(r)) ? "danger" : ""}`}
    >
      <span aria-hidden="true">●</span>
      {statuses[status(r)]}
    </span>
  );
  return (
    <div className="erp-admin">
      <aside className={`erp-sidebar ${collapsed ? "is-collapsed" : ""}`}>
        <div className="erp-brand">
          <b className="erp-logo">H</b>
          <div className="erp-nav-label">
            <strong>강현준 ERP</strong>
            <small>병원 영업 관리</small>
          </div>
        </div>
        <nav aria-label="관리자 메뉴">
          <div className="erp-group-label">CRM WORKSPACE</div>
          {Object.entries(tabs).map(([key, label], i) => (
            <Link
              key={key}
              href={`/workspace?tab=${key}`}
              title={label}
              aria-label={label}
              aria-current={key === tab ? "page" : undefined}
            >
              <Icon type={key as Entity} />
              <span className="erp-nav-label">{label}</span>
              <span className="erp-nav-count">{number(totals[i])}</span>
            </Link>
          ))}
          <Link href="/workspace/columns" title="칼럼 관리"><Icon type="proposals" /><span className="erp-nav-label">칼럼 관리</span></Link>
          {role === "owner" && <Link href="/workspace/finance" title="재무 관리"><Icon type="proposals" /><span className="erp-nav-label">재무 관리</span></Link>}
          <Link href="/workspace/diagnoses" title="무료진단 신청"><Icon type="proposals" /><span className="erp-nav-label">무료진단 신청</span></Link>
        </nav>
        <div className="erp-sidebar-bottom">
          <span className="erp-nav-label">병원 정보 · 제안서 · 영업</span>
        </div>
        <button
          className="erp-collapse"
          aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
          onClick={() => {
            setCollapsed(!collapsed);
            try {
              localStorage.setItem("erp-menu-collapsed", String(!collapsed));
            } catch {}
          }}
        >
          <span aria-hidden="true">{collapsed ? "»" : "«"}</span>
          <span className="erp-nav-label">메뉴 접기</span>
        </button>
      </aside>
      <div className="erp-main">
        <header className="erp-topbar">
          <nav aria-label="현재 위치">
            관리자 <span>/</span> CRM <span>/</span>
            <b>{tabs[tab]}</b>
          </nav>
          <div className="erp-account">
            <span>{email}</span>
            <span className="erp-chip">
              {canEdit ? "운영관리자" : "읽기 전용"}
            </span>
            <form action={signout}>
              <button className="erp-button small">로그아웃</button>
            </form>
          </div>
          {pending && (
            <div className="erp-progress">
              <div />
            </div>
          )}
        </header>
        <main className="erp-content">
          <section className="erp-page">
            <div className="erp-page-heading">
              <div>
                <h1>{tabs[tab]}</h1>
                <p>
                  {tab === "hospitals"
                    ? "병원 정보와 검수 상태"
                    : tab === "proposals"
                      ? "제안서 링크와 검토 상태"
                      : "영업 단계와 다음 액션"}{" "}
                  · 한국시간
                </p>
              </div>
              <div className="erp-page-actions">
                <button
                  className="erp-button"
                  disabled={pending}
                  onClick={() => start(() => router.refresh())}
                >
                  ↻ 새로고침
                </button>
                {canEdit && (
                  <button
                    className="erp-button primary"
                    onClick={() => setAdding(true)}
                  >
                    ＋ 추가
                  </button>
                )}
              </div>
            </div>
            <div className="erp-kpi">
              {Object.entries(tabs).map(([k, v], i) => (
                <div key={k}>
                  <p>{v}</p>
                  <strong>
                    {number(totals[i])}
                    <small> 건</small>
                  </strong>
                </div>
              ))}
              <div>
                <p>현재 조회</p>
                <strong>
                  {number(total)}
                  <small> 건</small>
                </strong>
              </div>
            </div>
            <form
              className="erp-search"
              onSubmit={submit}
              onKeyDown={(e) => {
                if (e.key === "Escape") setAdvanced(false);
                if (e.key === "Enter" && e.nativeEvent.isComposing)
                  e.preventDefault();
              }}
            >
              <div className="erp-search-grid">
                <div className="erp-search-field">
                  <label className="erp-field-label" htmlFor="status">
                    상태
                  </label>
                  <div className="erp-field-content">
                    <select
                      id="status"
                      value={draft.state}
                      onChange={(e) =>
                        setDraft({ ...draft, state: e.target.value })
                      }
                    >
                      <option value="">전체 상태</option>
                      {Object.entries(statuses).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="erp-search-field">
                  <label className="erp-field-label" htmlFor="query">
                    검색어
                  </label>
                  <div className="erp-field-content">
                    <input
                      id="query"
                      value={draft.q}
                      placeholder={
                        tab === "hospitals"
                          ? "병원명 입력 후 Enter"
                          : tab === "proposals"
                            ? "제안서 제목 입력 후 Enter"
                            : "다음 액션 입력 후 Enter"
                      }
                      onChange={(e) =>
                        setDraft({ ...draft, q: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="erp-search-footer">
                <button
                  type="button"
                  className="erp-button small"
                  aria-expanded={advanced}
                  onClick={() => setAdvanced(!advanced)}
                >
                  상세검색 {advanced ? "▴" : "▾"}
                  {(query.from || query.to) && (
                    <span className="erp-adv-count">1</span>
                  )}
                </button>
                <div className="erp-chips">
                  {query.state && (
                    <span className="erp-chip">{statuses[query.state]}</span>
                  )}
                  {query.q && <span className="erp-chip">검색: {query.q}</span>}
                  {(query.from || query.to) && (
                    <span className="erp-chip">
                      수정일 {query.from || "전체"} ~ {query.to || "전체"}
                    </span>
                  )}
                </div>
                <div className="erp-search-actions">
                  <button
                    type="button"
                    className="erp-button"
                    onClick={() => {
                      setDraft({ q: "", state: "", from: "", to: "" });
                      setAdvanced(false);
                      navigate({ q: "", state: "", from: "", to: "" });
                    }}
                  >
                    초기화
                  </button>
                  <button
                    className="erp-button primary"
                    disabled={
                      pending ||
                      Boolean(draft.from && draft.to && draft.from > draft.to)
                    }
                  >
                    조회
                  </button>
                </div>
              </div>
              {advanced && (
                <div className="erp-search-advanced">
                  <div className="erp-search-field">
                    <span className="erp-field-label">수정일</span>
                    <div className="erp-field-content">
                      <input
                        type="date"
                        aria-label="시작일"
                        value={draft.from}
                        max={draft.to || undefined}
                        onChange={(e) =>
                          setDraft({ ...draft, from: e.target.value })
                        }
                      />
                      <span>~</span>
                      <input
                        type="date"
                        aria-label="종료일"
                        min={draft.from || undefined}
                        value={draft.to}
                        onChange={(e) =>
                          setDraft({ ...draft, to: e.target.value })
                        }
                      />
                      {[
                        [1, "오늘"],
                        [7, "7일"],
                        [30, "30일"],
                        [0, "전체"],
                      ].map(([n, label]) => (
                        <button
                          key={label}
                          type="button"
                          className="erp-button small"
                          onClick={() => quick(Number(n))}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="erp-search-footer">
                    <span className="muted">수정된 날짜 기준 · 한국시간</span>
                    <button
                      type="button"
                      className="erp-button small"
                      onClick={() => setAdvanced(false)}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </form>
            <div className="erp-grid" aria-busy={pending}>
              <div className="erp-grid-toolbar">
                <b>
                  조회 결과 <span className="count">{number(total)}</span>건
                </b>
                <span className="period">
                  {size
                    ? `${number((page - 1) * size + (rows.length ? 1 : 0))}–${number((page - 1) * size + rows.length)}`
                    : "화면 맞춤 준비"}
                </span>
                <button
                  className="erp-button small"
                  disabled={!rows.length || pending}
                  onClick={exportPage}
                >
                  현재 페이지 CSV ↓
                </button>
              </div>
              <div className="erp-grid-scroll" ref={grid} role="region" aria-label="조회 결과 표, 좌우로 스크롤 가능" tabIndex={0}>
                <table className="erp-table erp-sticky-actions">
                  <thead>
                    <tr>
                      <th className="num">No.</th>
                      <th>{tab === "proposals" ? "제안서 제목" : "병원명"}</th>
                      <th>{tab === "hospitals" ? "주소" : "연결 병원"}</th>
                      <th>상태</th>
                      <th>
                        {tab === "hospitals"
                          ? "연락처·전달 경로"
                          : tab === "proposals"
                            ? "제안서 링크"
                            : "다음 액션"}
                      </th>
                      <th>{tab === "opportunities" ? "예정일" : "수정일"}</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={String(r.id)}>
                        <td className="num">{(page - 1) * size + i + 1}</td>
                        <td className="erp-name" title={title(r)}>
                          {title(r)}
                        </td>
                        <td
                          title={String(
                            tab === "hospitals"
                              ? r.address
                              : names[String(r.hospital_id)],
                          )}
                        >
                          {String(
                            tab === "hospitals"
                              ? r.address || "—"
                              : (names[String(r.hospital_id)] ?? "—"),
                          )}
                        </td>
                        <td>{badge(r)}</td>
                        <td
                          title={String(
                            r.contact ?? r.next_action ?? r.url ?? "",
                          )}
                        >
                          {tab === "hospitals" ? (
                            r.contact || "—"
                          ) : tab === "proposals" ? (
                            r.url ? (
                              <a
                                className="erp-link"
                                href={String(r.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                제안서 열기 ↗
                              </a>
                            ) : (
                              "미등록"
                            )
                          ) : (
                            r.next_action || "—"
                          )}
                        </td>
                        <td>
                          {tab === "opportunities"
                            ? r.due_date || "미정"
                            : new Date(String(r.updated_at)).toLocaleDateString(
                                "ko-KR",
                                { timeZone: "Asia/Seoul" },
                              )}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelected(r);
                              setEditing(false);
                            }}
                          >
                            상세
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => {
                                setSelected(r);
                                setEditing(true);
                              }}
                            >
                              수정
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td colSpan={7}>
                          {failed
                            ? "데이터를 불러오지 못했습니다. 새로고침해 주세요."
                            : !size
                              ? "화면 크기에 맞추고 있습니다…"
                              : "조회 결과가 없습니다. 검색 조건을 변경해 보세요."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="erp-pagination">
                <span>총 {number(total)}건</span>
                <label>
                  페이지당{" "}
                  <select
                    aria-label="페이지당 행 수"
                    value={mode}
                    onChange={(e) => {
                      setMode(e.target.value);
                      try {
                        localStorage.setItem("erp-page-size", e.target.value);
                      } catch {}
                    }}
                  >
                    <option value="auto">자동 ({fit || "…"}개)</option>
                    {[20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}개
                      </option>
                    ))}
                  </select>
                </label>
                <div className="pages">
                  <button
                    aria-label="처음 페이지"
                    disabled={pending || page === 1}
                    onClick={() => navigate({}, 1)}
                  >
                    «
                  </button>
                  <button
                    disabled={pending || page === 1}
                    onClick={() => navigate({}, page - 1)}
                  >
                    이전
                  </button>
                  {Array.from(
                    { length: Math.min(5, pages) },
                    (_, i) => Math.max(1, Math.min(page - 2, pages - 4)) + i,
                  ).map((n) => (
                    <button
                      key={n}
                      className="erp-page-number"
                      aria-current={n === page ? "page" : undefined}
                      disabled={pending}
                      onClick={() => navigate({}, n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={pending || page === pages}
                    onClick={() => navigate({}, page + 1)}
                  >
                    다음
                  </button>
                  <button
                    aria-label="마지막 페이지"
                    disabled={pending || page === pages}
                    onClick={() => navigate({}, pages)}
                  >
                    »
                  </button>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      navigate(
                        {},
                        Math.max(1, Math.min(pages, Number(jump) || 1)),
                      );
                    }}
                  >
                    <input
                      aria-label="이동할 페이지 번호"
                      type="number"
                      min="1"
                      max={pages}
                      value={jump}
                      onChange={(e) => setJump(e.target.value)}
                    />
                    <span> / {pages}</span>
                    <button disabled={pending}>이동</button>
                  </form>
                </div>
              </div>
              {pending && (
                <div className="erp-overlay">
                  <div>
                    <span className="erp-spinner" />
                    불러오는 중…
                  </div>
                </div>
              )}
            </div>
            <div className="erp-bottom-note">
              {tab === "proposals"
                ? "검토 상태와 실제 발송 상태는 별도로 관리합니다."
                : "확인되지 않은 정보는 검수 상태와 원본 기록을 함께 확인하세요."}
            </div>
          </section>
        </main>
      </div>
      <dialog
        ref={dialog}
        aria-label={adding ? `${tabs[tab]} 등록` : `${tabs[tab]} 상세`}
        className="erp-dialog"
        onCancel={close}
        onClose={close}
      >
        <div className="erp-dialog-heading">
          <div>
            <p>{tabs[tab]}</p>
            <h2>{adding ? "새 항목 등록" : selected ? title(selected) : ""}</h2>
          </div>
          <button
            className="erp-button"
            aria-label="상세 창 닫기"
            onClick={close}
          >
            ✕
          </button>
        </div>
        <div className="erp-dialog-body">
          {adding || editing ? (
            <RecordForm
              key={`${selected?.id ?? "new"}-${selected?.version ?? 0}`}
              entity={tab}
              hospitals={hospitals}
              onSaved={close}
              record={selected ?? undefined}
            />
          ) : (
            selected && (
              <>
                <div className="erp-detail-status">
                  {badge(selected)}
                  {canEdit && (
                    <button
                      className="erp-button primary"
                      onClick={() => setEditing(true)}
                    >
                      수정
                    </button>
                  )}
                </div>
                <dl>
                  {Object.entries(selected)
                    .filter(
                      ([k, v]) =>
                        v &&
                        ![
                          "id",
                          "version",
                          "hospital_id",
                          "created_at",
                        ].includes(k),
                    )
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt>
                          {{
                            name: "병원명",
                            branch: "지점",
                            address: "주소",
                            contact: "연락처·전달 경로",
                            official_url: "공식 채널",
                            notes: "검수 근거·메모",
                            title: "제안서 제목",
                            url: "제안서 링크",
                            status: "검토 상태",
                            management_state: "검수 상태",
                            stage: "영업 단계",
                            next_action: "다음 액션",
                            due_date: "예정일",
                            updated_at: "최종 수정",
                          }[k] ?? k}
                        </dt>
                        <dd>
                          {["url", "official_url"].includes(k) ? (
                            <a
                              className="erp-link"
                              href={String(v)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {String(v)} ↗
                            </a>
                          ) : ["status", "stage", "management_state"].includes(
                              k,
                            ) ? (
                            statuses[String(v)]
                          ) : (
                            String(v)
                          )}
                        </dd>
                      </div>
                    ))}
                </dl>
              </>
            )
          )}
        </div>
      </dialog>
    </div>
  );
}
