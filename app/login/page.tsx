import { LoginForm } from "@/components/login-form";
export default function Login() {
  return (
    <main className="login">
      <a className="brand" href="/">
        <span className="monogram">H</span>강현준 CRM
      </a>
      <p className="eyebrow">HOSPITAL WORKSPACE</p>
      <h1>업무의 다음 흐름</h1>
      <p className="lead">병원 정보, 제안서, 다음 액션을 한 곳에서.</p>
      <section className="panel">
        <h2>워크스페이스 로그인</h2>
        <p className="muted">승인된 업무 계정으로 로그인하세요.</p>
        <LoginForm />
      </section>
      <p className="muted">
        Supabase 관리 사이트의 로그인과 별개입니다.
        <br />
        처음 사용하시는 경우 관리자에게 CRM 계정 등록을 요청하세요.
      </p>
    </main>
  );
}
