import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listAuditLogs } from "@/lib/admin/api.functions";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Logs · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const { data = [] } = useQuery({ queryKey: ["audit"], queryFn: () => listAuditLogs() });
  return (
    <>
      <PageTitle title="Audit Logs" subtitle="Every admin action is recorded." />
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Metadata</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((a: any) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-700">{a.actor_email || a.actor_id?.slice(0, 8)}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-800">{a.action}</td>
                <td className="px-4 py-3 text-slate-600">{a.entity ?? "—"} {a.entity_id ? <span className="text-slate-400">· {a.entity_id.slice(0, 8)}</span> : null}</td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono max-w-md truncate">{a.metadata ? JSON.stringify(a.metadata) : ""}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No audit entries yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
