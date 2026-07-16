import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listChatSessions } from "@/lib/admin/api.functions";

export const Route = createFileRoute("/admin/ai-chat")({
  head: () => ({ meta: [{ title: "AI Chats · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const { data = [] } = useQuery({ queryKey: ["chat"], queryFn: () => listChatSessions() });
  return (
    <>
      <PageTitle title="AI Chats" subtitle="Visitor conversations with the site AI" />
      <Card className="divide-y divide-slate-100">
        {data.map((m: any, i: number) => (
          <div key={i} className="p-4 text-sm">
            <div className="text-[11px] text-slate-400 mb-1">
              {new Date(m.created_at).toLocaleString()} · session {String(m.session_id).slice(0, 8)} · {m.role}
            </div>
            <div className="text-slate-700 whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {data.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">No chat activity yet.</div>}
      </Card>
    </>
  );
}
