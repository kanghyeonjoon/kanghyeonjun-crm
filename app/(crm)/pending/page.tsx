import { db } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "@/app/(crm)/login/actions";
export default async function Pending() {
  const client = await db();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  return (
    <main className="login">
      <h1>접근 승인 대기</h1>
      <p>
        로그인은 완료됐지만 이 계정에 CRM 업무 권한이 없습니다. 관리자에게 권한
        등록을 요청해 주세요.
      </p>
      <form action={signout}>
        <button>로그아웃</button>
      </form>
    </main>
  );
}
