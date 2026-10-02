"use server";
import { db } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
export async function authenticate(_: string, form: FormData) {
  const email = z.email().safeParse(form.get("email"));
  const password = String(form.get("password") ?? "");
  if (!email.success || password.length < 8 || password.length > 128)
    return "이메일과 8~128자 비밀번호를 입력해 주세요.";
  const client = await db();
  const { error } = await client.auth.signInWithPassword({
    email: email.data,
    password,
  });
  if (error)
    return "로그인하지 못했습니다. 계정 정보와 이메일 인증 여부를 확인해 주세요.";
  await client.rpc("crm_enroll");
  redirect("/workspace");
}
export async function signout() {
  const client = await db();
  await client.auth.signOut();
  redirect("/login");
}
