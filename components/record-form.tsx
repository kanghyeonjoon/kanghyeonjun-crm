"use client";
import { useActionState, useEffect } from "react";
import { saveRecord } from "@/app/workspace/actions";
import {
  management,
  proposalStates,
  stages,
  type Entity,
} from "@/lib/validation";
type Row = Record<string, string | number | null>;
export function RecordForm({
  entity,
  hospitals = [],
  record,
  onSaved,
}: {
  entity: Entity;
  hospitals?: { id: string; name: string }[];
  record?: Row;
  onSaved?: () => void;
}) {
  const [result, action, pending] = useActionState(saveRecord, {
    ok: false,
    message: "",
  });
  useEffect(() => {
    if (result.ok) onSaved?.();
  }, [result.ok, onSaved]);
  function input(
    name: string,
    label: string,
    max: number,
    type = "text",
    required = false,
  ) {
    return (
      <label>
        {label}
        <input
          name={name}
          type={type}
          maxLength={max}
          required={required}
          defaultValue={String(record?.[name] ?? "")}
        />
      </label>
    );
  }
  function select(
    name: string,
    label: string,
    options: Record<string, string>,
  ) {
    return (
      <label>
        {label}
        <select
          name={name}
          defaultValue={String(record?.[name] ?? Object.keys(options)[0])}
        >
          {Object.entries(options).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <form action={action} className="stack">
      <input type="hidden" name="entity" value={entity} />
      {record && (
        <>
          <input type="hidden" name="id" value={String(record.id)} />
          <input type="hidden" name="version" value={String(record.version)} />
        </>
      )}
      {entity === "hospitals" ? (
        <>
          <div className="two">
            {input("name", "병원명", 150, "text", true)}
            {input("branch", "지점", 100)}
          </div>
          {input("address", "주소", 500)}
          {input("contact", "연락처·전달 경로", 300)}
          {input("official_url", "공식 채널 주소", 2000, "url")}
          {select("management_state", "검수 상태", management)}
        </>
      ) : (
        <>
          {select(
            "hospital_id",
            "병원 선택",
            Object.fromEntries(hospitals.map((h) => [h.id, h.name])),
          )}
          {entity === "proposals" ? (
            <>
              {input("title", "제안서 제목", 200, "text", true)}
              {input("url", "제안서 링크", 2000, "url")}
              {select("status", "검토 상태", proposalStates)}
            </>
          ) : (
            <>
              {select("stage", "영업 단계", stages)}
              {input("next_action", "다음 액션", 1000)}
              {input("due_date", "예정일", 10, "date")}
            </>
          )}
        </>
      )}
      {entity !== "opportunities" && (
        <label>
          검수 근거·메모
          <textarea
            name="notes"
            maxLength={5000}
            rows={3}
            defaultValue={String(record?.notes ?? "")}
          />
        </label>
      )}
      <button
        disabled={pending || (entity !== "hospitals" && !hospitals.length)}
      >
        {pending ? "저장 중…" : record ? "변경 저장" : "등록"}
      </button>
      {result.message && (
        <p role="status" className={result.ok ? "success" : "error"}>
          {result.message}
        </p>
      )}
    </form>
  );
}
