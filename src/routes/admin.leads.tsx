import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listLeads, createLead } from "@/lib/admin/api.functions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({ meta: [{ title: "Leads · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["leads"], queryFn: () => listLeads() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", service: "", source: "", notes: "" });
  const create = useMutation({
    mutationFn: () => createLead({ data: { ...form, status: "new" } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); setOpen(false); setForm({ full_name: "", email: "", phone: "", service: "", source: "", notes: "" }); toast.success("Lead added"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <>
      <PageTitle
        title="Leads"
        subtitle={`${data.length} leads`}
        action={<button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" /> New lead</button>}
      />
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Added</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((l: any) => (
              <tr key={l.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{l.full_name}</td>
                <td className="px-4 py-3 text-slate-600">{l.email || l.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{l.service || "—"}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{l.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{l.source || "—"}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(l.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No leads yet.</td></tr>}
          </tbody>
        </table>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900">New Lead</h2>
            <div className="mt-4 space-y-3">
              {(["full_name", "email", "phone", "service", "source"] as const).map((k) => (
                <input key={k} placeholder={k.replace("_", " ")} value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              ))}
              <textarea placeholder="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-md border border-slate-200 px-3 py-2 text-xs">Cancel</button>
              <button disabled={!form.full_name || create.isPending} onClick={() => create.mutate()} className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{create.isPending ? "Saving…" : "Save lead"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
