import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listContacts, markContactRead } from "@/lib/admin/api.functions";

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({ meta: [{ title: "Contact Forms · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => listContacts() });
  const toggle = useMutation({
    mutationFn: (v: { id: string; is_read: boolean }) => markContactRead({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
  return (
    <>
      <PageTitle title="Contact Forms" subtitle={`${data.length} submissions`} />
      <Card className="divide-y divide-slate-100">
        {data.map((c: any) => (
          <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-slate-900">{c.full_name}</span>
                {!c.is_read && <span className="rounded-full bg-sky-100 text-sky-700 text-[10px] font-medium px-2 py-0.5">NEW</span>}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                {c.phone && <> · <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></>}
                <> · {new Date(c.created_at).toLocaleString()}</>
              </div>
              {c.subject && <div className="mt-2 text-sm font-medium text-slate-700">{c.subject}</div>}
              <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{c.message}</p>
            </div>
            <div>
              <button
                onClick={() => toggle.mutate({ id: c.id, is_read: !c.is_read })}
                className="text-xs rounded-md border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
              >{c.is_read ? "Mark unread" : "Mark read"}</button>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">No contact submissions yet.</div>}
      </Card>
    </>
  );
}
