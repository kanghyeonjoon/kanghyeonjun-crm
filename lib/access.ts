import { redirect } from "next/navigation";
import { db } from "./supabase/server";
export async function requireMember(write = false) {
  const client = await db();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: member, error: memberError } = await client
    .from("crm_members")
    .select("role,active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (memberError || !member?.active) redirect("/pending");
  if (write && !["owner", "operator"].includes(member.role))
    throw new Error("수정 권한이 없습니다.");
  return { client, user, role: member.role };
}
