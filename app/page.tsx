const modules = [
  { number: "01", name: "병원 관리", detail: "병원 정보와 검수 근거를 확인하는 공간" },
  { number: "02", name: "제안서", detail: "병원별 제안서와 검토 이력을 관리하는 공간" },
  { number: "03", name: "영업 진행", detail: "다음 액션과 연락 이력을 정리하는 공간" },
];

export default function Home() {
  return <div className="app-shell">
    <aside className="sidebar" aria-label="서비스 안내">
      <a className="brand" href="/" aria-label="강현준 CRM 홈"><span className="monogram">H</span><span>강현준 <strong>CRM</strong></span></a>
      <div className="nav-label">WORKSPACE</div>
      <div className="active-item"><span aria-hidden="true">◈</span> 시작하기</div>
      <p className="sidebar-note">병원 영업의 흐름을<br/>한 곳에 모읍니다.</p>
      <div className="sidebar-footer">강현준 CRM <span>초기 구축</span></div>
    </aside>
    <div className="main-area">
      <header className="topbar"><span>워크스페이스 / 시작하기</span><span className="status"><i aria-hidden="true"/> 준비 중</span></header>
      <main id="main">
        <div className="eyebrow">A CLEARER WAY TO WORK</div>
        <h1>새로운 업무 공간을<br/>준비하고 있습니다.</h1>
        <p className="lead">병원 정보부터 제안서, 다음 액션까지.<br/>흩어진 업무를 하나의 흐름으로 연결합니다.</p>
        <section className="setup-card" aria-labelledby="setup-title">
          <div className="setup-symbol" aria-hidden="true">↗</div>
          <div><span className="small-label">현재 단계</span><h2 id="setup-title">서비스 초기 설정</h2><p>데이터베이스와 로그인 연결이 완료되면 업무 화면을 사용할 수 있습니다.</p></div>
          <span className="pill">연결 준비 중</span>
        </section>
        <section aria-labelledby="modules-title" className="module-section">
          <div className="section-title"><h2 id="modules-title">앞으로 사용할 공간</h2><span>구현 예정</span></div>
          <div className="module-grid">{modules.map(m => <article key={m.number}><span className="module-number">{m.number}</span><h3>{m.name}</h3><p>{m.detail}</p><span className="module-state">준비 중</span></article>)}</div>
        </section>
        <footer>현재 화면에는 실제 고객 데이터가 표시되지 않습니다.</footer>
      </main>
    </div>
  </div>;
}
