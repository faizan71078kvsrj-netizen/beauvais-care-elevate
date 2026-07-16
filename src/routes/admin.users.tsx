import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listUsers, inviteUser, setUserActive, deleteUser } from "@/lib/admin/api.functions";
import { toast } from "sonner";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users & Roles · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });
  const profiles = data?.profiles ?? [];
  const roles = data?.roles ?? [];
  const rolesFor = (uid: string) => roles.filter((r: any) => r.user_id === uid).map((r: any) => r.role);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "staff" as "admin" | "staff" | "receptionist" });
  const invite = useMutation({
    mutationFn: () => inviteUser({ data: form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setOpen(false); setForm({ email: "", password: "", full_name: "", role: "staff" }); toast.success("User created"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const toggle = useMutation({
    mutationFn: (v: { user_id: string; is_active: boolean }) => setUserActive({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const remove = useMutation({
    mutationFn: (user_id: string) => deleteUser({ data: { user_id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  return (
    <>
      <PageTitle
        title="Users & Roles"
        subtitle="Super Admin, Admin, Staff, Receptionist"
        action={<button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" /> Invite user</button>}
      />
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role(s)</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((p: any) => {
              const r = rolesFor(p.id);
              const isSuper = r.includes("super_admin");
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                    {p.full_name || "—"}
                    {p.is_protected && <span title="Protected YDC account"><ShieldCheck className="h-3.5 w-3.5 text-sky-500" /></span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.map((role: string) => (
                        <span key={role} className={`rounded-full px-2 py-0.5 text-xs ${role === "super_admin" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700"}`}>{role}</span>
                      ))}
                      {r.length === 0 && <span className="text-xs text-slate-400">no role</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block h-2 w-2 rounded-full ${p.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className="ml-2 text-xs text-slate-600">{p.is_active ? "Active" : "Disabled"}</span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {!p.is_protected && (
                      <>
                        <button onClick={() => toggle.mutate({ user_id: p.id, is_active: !p.is_active })} className="text-xs text-slate-600 hover:underline mr-3">{p.is_active ? "Disable" : "Enable"}</button>
                        <button
                          onClick={() => confirm(`Delete ${p.email}?`) && remove.mutate(p.id)}
                          disabled={isSuper}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-40"
                        ><Trash2 className="h-4 w-4 inline" /></button>
                      </>
                    )}
                    {p.is_protected && <span className="text-[11px] text-slate-400">Protected</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900">Invite user</h2>
            <div className="mt-4 space-y-3">
              <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input placeholder="Temporary password (min 8)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-md border border-slate-200 px-3 py-2 text-xs">Cancel</button>
              <button disabled={invite.isPending} onClick={() => invite.mutate()} className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{invite.isPending ? "Creating…" : "Create user"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
