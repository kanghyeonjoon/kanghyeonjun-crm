"use client";
import { useActionState } from "react";
import { authenticate } from "@/app/login/actions";
export function LoginForm() {
  const [message, action, pending] = useActionState(authenticate, "");
  return (
    <form action={action} className="stack">
      <label>
        이메일
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        비밀번호
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          maxLength={128}
          required
        />
      </label>
      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}
      <button disabled={pending}>{pending ? "확인 중…" : "로그인"}</button>
    </form>
  );
}
