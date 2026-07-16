import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listCustomers, createCustomer } from "@/lib/admin/api.functions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["customers"], queryFn: () => listCustomers() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "" });
  const create = useMutation({
    mutationFn: () => createCustomer({ data: form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setOpen(false); setForm({ full_name: "", email: "", phone: "", address: "" }); toast.success("Customer added"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  return (
    <>
      <PageTitle title="Customers" subtitle={`${data.length} customer profiles`} action={<button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" /> New customer</button>} />
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Added</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{c.full_name}</td>
                <td className="px-4 py-3 text-slate-600">{c.email || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.address || "—"}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No customers yet.</td></tr>}
          </tbody>
        </table>
      </Card>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900">New Customer</h2>
            <div className="mt-4 space-y-3">
              {(["full_name", "email", "phone", "address"] as const).map((k) => (
                <input key={k} placeholder={k.replace("_", " ")} value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-md border border-slate-200 px-3 py-2 text-xs">Cancel</button>
              <button disabled={!form.full_name || create.isPending} onClick={() => create.mutate()} className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{create.isPending ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
