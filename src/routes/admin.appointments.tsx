import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listAppointments, updateAppointment, deleteAppointment } from "@/lib/admin/api.functions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/appointments")({
  head: () => ({ meta: [{ title: "Appointments · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["appointments"], queryFn: () => listAppointments() });
  const update = useMutation({
    mutationFn: (v: { id: string; status?: "pending" | "confirmed" | "completed" | "cancelled"; assigned_to?: string | null; internal_notes?: string | null }) => updateAppointment({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteAppointment({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  return (
    <>
      <PageTitle title="Appointments" subtitle={`${data.length} total · pending, confirmed, completed, cancelled`} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Preferred</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50 align-top">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{a.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <a href={`mailto:${a.email}`} className="block hover:underline">{a.email}</a>
                    <a href={`tel:${a.phone}`} className="block hover:underline">{a.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.service || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{a.preferred_date || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => update.mutate({ id: a.id, status: e.target.value as any })}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => confirm("Delete appointment?") && remove.mutate(a.id)}
                      className="text-slate-400 hover:text-rose-600"
                    ><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No appointments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
