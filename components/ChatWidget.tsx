"use client";

import { useEffect, useRef, useState } from "react";

import { MessageCircleQuestion, Send, X } from "lucide-react";

/**
 * 안내봇 위젯 — docs/안내봇-설계안.md 의 구현체.
 *
 * · "상담봇"이 아니라 "안내봇": 검수된 사이트 내용만 답하고, 나머지는 무료진단으로
 * · 세션당 질문 20개 제한 (남용 방지 1차 방어 — 서버에도 메시지 수 제한 있음)
 * · 모바일에서는 플로팅 CTA(하단 풀폭)와 겹치지 않게 버튼을 그 위에 띄웁니다
 */

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME =
  "안녕하세요, 몽PD 안내봇입니다. 병원 유튜브 대행에 대해 궁금하신 걸 물어보세요. 자세한 진단은 30분 무료진단에서 짚어드립니다.";

const SUGGESTIONS = [
  "뭘 해주는 서비스예요?",
  "제 얼굴이 꼭 나와야 하나요?",
  "무료진단에선 뭘 봐주나요?",
];

const MAX_USER_MESSAGES = 20;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionId = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 익명 세션 ID — 로그 분석용, 개인정보 아님
    const existing = sessionStorage.getItem("chat-session");
    sessionId.current = existing ?? crypto.randomUUID();
    if (!existing) sessionStorage.setItem("chat-session", sessionId.current);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy, open]);

  const userCount = messages.filter((m) => m.role === "user").length;
  const capped = userCount >= MAX_USER_MESSAGES;

  async function ask(text: string) {
    const q = text.trim();
    if (!q || busy || capped) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, messages: next }),
      });
      const answer = res.ok
        ? await res.text()
        : "잠시 연결이 원활하지 않습니다. 급하신 내용은 무료진단 신청이나 카카오톡으로 남겨주세요.";
      setMessages([...next, { role: "assistant", content: answer }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "네트워크 오류가 났습니다. 잠시 후 다시 시도하시거나 무료진단으로 문의해주세요.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* 열기 버튼 — 모바일: 플로팅 CTA 위 / 데스크톱: 우하단 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "안내봇 닫기" : "안내봇 열기"}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-[0_8px_28px_rgba(10,25,47,.4)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      >
        {open ? <X size={24} strokeWidth={2.5} /> : <MessageCircleQuestion size={26} strokeWidth={2.25} />}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="몽PD 안내봇"
          className="fixed inset-x-3 bottom-[10.5rem] z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(10,25,47,.3)] sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[380px]"
        >
          {/* 헤더 */}
          <div className="bg-navy px-5 py-4 text-white">
            <p className="text-[15px] font-black">몽PD 안내봇</p>
            <p className="mt-0.5 text-[12px] text-white/60">
              궁금한 것만 빠르게 — 정확한 진단은 30분 통화에서
            </p>
          </div>

          {/* 대화 */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <Bubble role="assistant">{WELCOME}</Bubble>

            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border border-accent/40 bg-accent-wash px-3.5 py-2 text-[13px] font-bold text-accent-deep transition-colors hover:bg-accent hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.content}
              </Bubble>
            ))}

            {busy ? (
              <Bubble role="assistant">
                <span className="animate-pulse">답변 작성 중…</span>
              </Bubble>
            ) : null}

            {capped ? (
              <div className="rounded-xl bg-accent-wash px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                대화가 길어졌네요. 여기서부터는{" "}
                <a href="/diagnosis" className="font-black text-accent-deep underline">
                  30분 무료진단
                </a>
                에서 직접 짚어드리는 게 정확합니다.
              </div>
            ) : null}
          </div>

          {/* 입력 */}
          <form
            className="flex items-center gap-2 border-t border-line px-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={capped ? "무료진단에서 이어가주세요" : "질문을 입력하세요"}
              disabled={busy || capped}
              maxLength={500}
              className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-[14px] outline-none placeholder:text-ink-faint focus:border-accent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || capped || !input.trim()}
              aria-label="보내기"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-deep disabled:opacity-40"
            >
              <Send size={17} strokeWidth={2.5} />
            </button>
          </form>

          <p className="border-t border-line bg-paper px-4 py-2 text-center text-[11px] text-ink-faint">
            대화는 익명으로 기록되어 안내 품질 개선에 쓰입니다
          </p>
        </div>
      ) : null}
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14px] leading-[1.7] ${
          isUser ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-accent-wash text-ink"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
