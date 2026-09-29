import Link from "next/link";
import { requireMember } from "@/lib/access";
import { signout } from "@/app/login/actions";
import { RecordForm } from "@/components/record-form";
import {
  management,
  proposalStates,
  stages,
  type Entity,
} from "@/lib/validation";
export const dynamic = "force-dynamic";
const tabs = {
  hospitals: "병원 관리",
  proposals: "제안서",
  opportunities: "영업 진행",
};
export default async function Workspace({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    state?: string;
    page?: string;
  }>;
}) {
  const { client, user, role } = await requireMember();
  const params = await searchParams;
  const tab: Entity =
    params.tab === "proposals"
      ? "proposals"
      : params.tab === "opportunities"
        ? "opportunities"
        : "hospitals";
  const page = Math.max(
    1,
    Math.min(10000, parseInt(params.page ?? "1", 10) || 1),
  );
  const q = (params.q ?? "").trim().slice(0, 150);
  const state = params.state ?? "";
  const statuses =
    tab === "hospitals"
      ? management
      : tab === "proposals"
        ? proposalStates
        : stages;
  let query = client
    .from(tab)
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false });
  if (q)
    query = query.ilike(
      tab === "hospitals"
        ? "name"
        : tab === "proposals"
          ? "title"
          : "next_action",
      `%${q.replace(/[\\%_]/g, "")}%`,
    );
  if (state && state in statuses)
    query = query.eq(
      tab === "hospitals"
        ? "management_state"
        : tab === "proposals"
          ? "status"
          : "stage",
      state,
    );
  const [
    { data: rows, error, count },
    { data: hospitals, error: hospitalError },
  ] = await Promise.all([
    query.range((page - 1) * 30, page * 30 - 1),
    client.from("hospitals").select("id,name").order("name").limit(1000),
  ]);
  const canEdit = ["owner", "operator"].includes(role);
  const names = Object.fromEntries(
    (hospitals ?? []).map((h) => [h.id, h.name]),
  );
  const href = (p: number) =>
    `/workspace?${new URLSearchParams({ tab, q, state, page: String(p) })}`;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/workspace">
          <span className="monogram">H</span>강현준 <strong>CRM</strong>
        </Link>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {Object.entries(tabs).map(([key, label]) => (
            <Link
              key={key}
              className={tab === key ? "active-item" : "nav-item"}
              href={`/workspace?tab=${key}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="sidebar-note">
          확인된 정보에서
          <br />
          다음 액션까지.
        </p>
        <div className="sidebar-footer">
          {role === "viewer" ? "읽기 전용" : "업무 관리"}
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span>{user.email}</span>
          <form action={signout}>
            <button className="quiet">로그아웃</button>
          </form>
        </header>
        <main>
          <p className="eyebrow">HOSPITAL WORKSPACE</p>
          <div className="section-title">
            <h1>{tabs[tab]}</h1>
            <span>총 {count ?? 0}건</span>
          </div>
          <p className="lead">
            {tab === "hospitals"
              ? "병원별 검수 상태와 연락 경로를 관리하세요."
              : tab === "proposals"
                ? "제안서 링크와 검토 상태를 함께 확인하세요."
                : "영업 단계와 다음 액션을 기록하세요. 연락은 자동 발송되지 않습니다."}
          </p>
          <form className="filters">
            <input type="hidden" name="tab" value={tab} />
            <input
              name="q"
              aria-label="검색"
              placeholder={
                tab === "hospitals"
                  ? "병원명 검색"
                  : tab === "proposals"
                    ? "제안서 제목 검색"
                    : "다음 액션 검색"
              }
              defaultValue={q}
            />
            <select name="state" aria-label="상태 필터" defaultValue={state}>
              <option value="">전체 상태</option>
              {Object.entries(statuses).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button>검색</button>
          </form>
          {error || hospitalError ? (
            <div className="panel error" role="alert">
              데이터를 불러오지 못했습니다. DB 연결과 접근 권한을 확인해 주세요.
            </div>
          ) : (
            <>
              {canEdit && (
                <details className="panel">
                  <summary>+ {tabs[tab]} 등록</summary>
                  <RecordForm entity={tab} hospitals={hospitals ?? []} />
                </details>
              )}
              {!rows?.length ? (
                <div className="panel empty">
                  <h2>
                    {q || state
                      ? "검색 결과가 없습니다."
                      : "아직 등록된 항목이 없습니다."}
                  </h2>
                  <p>
                    기존 자료는 자동으로 이관되지 않습니다. 검수한 항목부터
                    등록하세요.
                  </p>
                </div>
              ) : (
                <div className="records">
                  {rows.map((row) => {
                    const status = String(
                      row.management_state ?? row.status ?? row.stage,
                    );
                    return (
                      <article
                        className="panel"
                        key={`${row.id}-${row.version}`}
                      >
                        <div className="section-title">
                          <h2>
                            {tab === "hospitals"
                              ? row.name
                              : tab === "proposals"
                                ? row.title
                                : (names[row.hospital_id] ?? "병원")}
                          </h2>
                          <span className="badge">
                            {(statuses as Record<string, string>)[status]}
                          </span>
                        </div>
                        {tab === "hospitals" ? (
                          <p className="muted">
                            {[row.branch, row.address, row.contact]
                              .filter(Boolean)
                              .join(" · ") || "상세 정보 미등록"}
                          </p>
                        ) : (
                          <p className="muted">
                            {names[row.hospital_id] ?? "병원"}
                            {tab === "opportunities" &&
                              ` · ${row.due_date ?? "일정 미정"}`}
                          </p>
                        )}
                        {(row.url || row.official_url) && (
                          <a
                            className="external"
                            href={row.url || row.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tab === "proposals"
                              ? "제안서 열기"
                              : "공식 채널 열기"}{" "}
                            ↗
                          </a>
                        )}
                        {row.next_action && <p>{row.next_action}</p>}
                        {row.notes && <p className="notes">{row.notes}</p>}
                        {canEdit && (
                          <details>
                            <summary>수정</summary>
                            <RecordForm
                              entity={tab}
                              hospitals={hospitals ?? []}
                              record={row}
                            />
                          </details>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
              <div className="pagination">
                {page > 1 && <Link href={href(page - 1)}>← 이전</Link>}
                <span>{page} 페이지</span>
                {page * 30 < (count ?? 0) && (
                  <Link href={href(page + 1)}>다음 →</Link>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
