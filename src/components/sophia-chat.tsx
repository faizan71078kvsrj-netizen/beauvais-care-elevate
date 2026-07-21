/**
 * Sophia — floating chat widget for the public website.
 * Renders a bottom-right launcher + panel. Does NOT modify any existing page.
 * All AI calls proxy through the sophiaChat server function (Gemini stays server-side).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Loader2, Phone } from "lucide-react";
import { sophiaChat } from "@/lib/sophia.functions";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "sophia_session_v1";
const GREETING =
  "Hi! I'm Sophia, your Beauvais Care Assistant. How can I help you today — services, a tour, or booking an appointment?";

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function SophiaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = useServerFn(sophiaChat);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = newSessionId();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const historyForModel = useMemo(
    () => messages.filter((m) => m.content !== GREETING).slice(-8),
    [messages],
  );

  const send = async () => {
    const text = input.trim();
    if (!text || busy || !sessionId) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);

    const payload = {
      session_id: sessionId,
      message: text,
      history: historyForModel,
      page_url: typeof window !== "undefined" ? window.location.href : undefined,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };

    console.log("--> [1] [BEFORE] Dispatching SophiaChat request payload:", JSON.stringify(payload, null, 2));

    try {
      const res = await chat({
        data: payload,
      });

      console.log("<-- [1] [AFTER] Received response from sophiaChat RPC call:", JSON.stringify(res, null, 2));

      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (err: any) {
      console.error("[7] [LOGGED ERROR] Exception caught in frontend SophiaChat send():", err?.stack || err);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Our AI assistant is temporarily unavailable. Please try again shortly, contact us on WhatsApp, or call our office.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Sophia chat"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#2199CE] px-4 py-3 text-white shadow-2xl hover:bg-[#1e88b8] transition"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-semibold">Chat with Sophia</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Sophia — Beauvais Care Assistant"
          className="fixed bottom-4 right-4 z-50 flex h-[min(600px,85vh)] w-[min(380px,92vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#2199CE] to-[#1e88b8] px-4 py-3 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20 font-bold">S</div>
            <div className="flex-1 leading-tight">
              <div className="text-sm font-semibold">Sophia</div>
              <div className="text-[11px] text-white/80">Beauvais Care Assistant · Online</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1 rounded hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 px-3 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-[#2199CE] text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-500 shadow-sm">
                  <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1" /> Sophia is typing…
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-white px-3 py-2">
            <QuickBtn onClick={() => setInput("I'd like to book an appointment.")}>Book appointment</QuickBtn>
            <QuickBtn onClick={() => setInput("What services do you offer?")}>Our services</QuickBtn>
            <QuickBtn onClick={() => setInput("What are your hours and location?")}>Hours & location</QuickBtn>
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2 border-t border-slate-100 bg-white p-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type your message…"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#2199CE] focus:outline-none focus:ring-2 focus:ring-[#2199CE]/20"
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="grid h-10 w-10 place-items-center rounded-lg bg-[#2199CE] text-white disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-center text-[10px] text-slate-500">
            <Phone className="inline h-2.5 w-2.5 mr-1" />
            Emergencies: call 911 · Powered by Your Digital Choices
          </div>
        </div>
      )}
    </>
  );
}

function QuickBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:border-[#2199CE] hover:text-[#2199CE] transition"
    >
      {children}
    </button>
  );
}
