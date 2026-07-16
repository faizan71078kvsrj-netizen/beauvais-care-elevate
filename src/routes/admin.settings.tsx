import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { getSettings, updateSetting } from "@/lib/admin/api.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data.length && Object.keys(values).length === 0) {
      const seeded: Record<string, string> = {};
      data.forEach((s: any) => { seeded[s.key] = JSON.stringify(s.value, null, 2); });
      setValues(seeded);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (v: { key: string; value: any }) => updateSetting({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const submit = (key: string) => {
    try {
      const parsed = JSON.parse(values[key]);
      save.mutate({ key, value: parsed });
    } catch { toast.error("Invalid JSON"); }
  };

  return (
    <>
      <PageTitle title="Settings" subtitle="Branding, business info, and system configuration" />
      <div className="space-y-4">
        {data.map((s: any) => (
          <Card key={s.key} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-900 uppercase tracking-widest">{s.key}</div>
              <button onClick={() => submit(s.key)} className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">Save</button>
            </div>
            <textarea
              value={values[s.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
              rows={8}
              className="w-full font-mono text-xs rounded-md border border-slate-200 px-3 py-2"
            />
            <div className="mt-2 text-[11px] text-slate-500">Edit as JSON. Changes are audit-logged.</div>
          </Card>
        ))}
      </div>
    </>
  );
}
