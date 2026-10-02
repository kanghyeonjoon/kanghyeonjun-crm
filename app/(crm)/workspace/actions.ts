"use server";
import { requireMember } from "@/lib/access";
import {
  hospitalSchema,
  proposalSchema,
  opportunitySchema,
  recordSchema,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";
export type SaveState = { ok: boolean; message: string };
export async function saveRecord(
  _: SaveState,
  form: FormData,
): Promise<SaveState> {
  const table = String(form.get("entity"));
  if (!["hospitals", "proposals", "opportunities"].includes(table))
    return { ok: false, message: "잘못된 요청입니다." };
  const schema =
    table === "hospitals"
      ? hospitalSchema
      : table === "proposals"
        ? proposalSchema
        : opportunitySchema;
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      ok: false,
      message:
        "입력값을 확인해 주세요. 필수 항목·주소·날짜 형식 또는 길이가 올바르지 않습니다.",
    };
  const edit = form.get("id");
  const identity = edit
    ? recordSchema.safeParse(Object.fromEntries(form))
    : null;
  if (identity && !identity.success)
    return { ok: false, message: "수정 대상이 올바르지 않습니다." };
  const { client, role } = await requireMember();
  if (!["owner", "operator"].includes(role))
    return { ok: false, message: "수정 권한이 없습니다." };
  const payload: Record<string, string | number | null> = parsed.data;
  const query = identity?.success
    ? client
        .from(table)
        .update<typeof payload>(payload)
        .eq("id", identity.data.id)
        .eq("version", identity.data.version)
    : client.from(table).insert<typeof payload>(payload);
  const { data, error } = await query.select("id");
  if (error)
    return {
      ok: false,
      message:
        "저장하지 못했습니다. 연결 상태와 권한을 확인한 후 다시 시도해 주세요.",
    };
  if (!data?.length)
    return {
      ok: false,
      message:
        "다른 사용자가 먼저 수정했거나 접근할 수 없는 항목입니다. 새로고침 후 다시 확인하세요.",
    };
  revalidatePath("/workspace");
  return { ok: true, message: "저장했습니다." };
}
