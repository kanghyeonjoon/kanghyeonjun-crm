import { LoginForm } from "@/components/login-form";
export default function Login() {
  return (
    <main className="login">
      <a className="brand" href="/">
        <span className="monogram">H</span>강현준 ERP
      </a>
      <p className="eyebrow">HOSPITAL OPERATIONS</p>
      <h1>운영관리자 로그인</h1>
      <p className="lead">병원 정보, 제안서, 다음 액션을 한 곳에서.</p>
      <section className="panel">
        <h2>워크스페이스 로그인</h2>
        <p className="muted">승인된 업무 계정으로 로그인하세요.</p>
        <LoginForm />
      </section>
      <p className="muted">
        승인된 계정으로 업무 공간에 접근할 수 있습니다.
        <br />
        처음 사용하시는 경우 관리자에게 CRM 계정 등록을 요청하세요.
      </p>
    </main>
  );
}
