import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listKnowledge, upsertKnowledge, deleteKnowledge, listAiErrors } from "@/lib/sophia.functions";
import { getSettings, updateSetting } from "@/lib/admin/api.functions";
import { toast } from "sonner";
import { Bot, Plus, Trash2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/ai")({
  head: () => ({ meta: [{ title: "Sophia AI · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const qc = useQueryClient();
  const { data: knowledge = [] } = useQuery({ queryKey: ["knowledge"], queryFn: () => listKnowledge() });
  const { data: errors = [] } = useQuery({ queryKey: ["ai_errors"], queryFn: () => listAiErrors() });
  const { data: settings = [] } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const aiSetting = (settings as any[]).find((s) => s.key === "ai")?.value ?? { enabled: true, model: "gemini-2.5-flash" };

  const [form, setForm] = useState({ title: "", source: "", content: "", tags: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (v: any) => upsertKnowledge({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge"] });
      setForm({ title: "", source: "", content: "", tags: "" });
      setEditingId(null);
      toast.success("Knowledge saved — Sophia will use it right away.");
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteKnowledge({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge"] }); toast.success("Removed"); },
  });

  const toggleAI = useMutation({
    mutationFn: (enabled: boolean) => updateSetting({ data: { key: "ai", value: { ...aiSetting, enabled } } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success("Updated"); },
  });

  const changeModel = useMutation({
    mutationFn: (model: string) => updateSetting({ data: { key: "ai", value: { ...aiSetting, model } } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success("Model updated"); },
  });

  return (
    <>
      <PageTitle title="Sophia AI" subtitle="Knowledge base, model, and error monitoring for the Beauvais Care Assistant" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-900 font-semibold"><Bot className="h-4 w-4" /> Assistant status</div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => toggleAI.mutate(!aiSetting.enabled)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${aiSetting.enabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}
            >
              {aiSetting.enabled ? "Enabled" : "Disabled"}
            </button>
            <span className="text-xs text-slate-500">Toggle Sophia on/off site-wide</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-slate-900 font-semibold">Gemini model</div>
          <select
            value={aiSetting.model || "gemini-2.5-flash"}
            onChange={(e) => changeModel.mutate(e.target.value)}
            className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="gemini-2.5-flash">gemini-2.5-flash (free tier)</option>
            <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
          </select>
          <p className="mt-2 text-[11px] text-slate-500">API key loaded from server env <code>GEMINI_API_KEY</code> — never exposed to the frontend.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-900 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-500" /> Recent AI errors</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{errors.length}</div>
          <div className="text-[11px] text-slate-500">Includes rate limits and API failures (last 200)</div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-slate-900">{editingId ? "Edit knowledge" : "Add knowledge"}</div>
          {editingId && <button onClick={() => { setEditingId(null); setForm({ title: "", source: "", content: "", tags: "" }); }} className="text-xs text-slate-500">Cancel</button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Title (e.g. Adult Day Health FAQ)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Source (optional — e.g. brochure.pdf)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <textarea
          placeholder="Paste content, FAQ text, service description, policy, hours, etc. Sophia uses this automatically."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={8}
          className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
        <button
          onClick={() => save.mutate({
            id: editingId ?? undefined,
            title: form.title,
            source: form.source || undefined,
            content: form.content,
            tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            is_active: true,
          })}
          disabled={!form.title || !form.content || save.isPending}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> {editingId ? "Update" : "Add to knowledge base"}
        </button>
      </Card>

      <Card className="divide-y divide-slate-100">
        {(knowledge as any[]).map((k) => (
          <div key={k.id} className="p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900">{k.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{k.source ?? "manual"} · {new Date(k.updated_at).toLocaleString()}</div>
              <div className="text-xs text-slate-600 mt-1.5 line-clamp-2">{k.content}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditingId(k.id); setForm({ title: k.title, source: k.source ?? "", content: k.content, tags: (k.tags ?? []).join(", ") }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
              >Edit</button>
              <button onClick={() => remove.mutate(k.id)} className="rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {(knowledge as any[]).length === 0 && <div className="p-10 text-center text-slate-400 text-sm">No knowledge yet. Add services, FAQs, policies, and hours to train Sophia.</div>}
      </Card>

      {errors.length > 0 && (
        <>
          <div className="mt-8 mb-2 text-sm font-semibold text-slate-900">AI error log</div>
          <Card className="divide-y divide-slate-100">
            {(errors as any[]).slice(0, 20).map((e) => (
              <div key={e.id} className="p-3 text-xs">
                <div className="text-slate-500">{new Date(e.created_at).toLocaleString()} · {e.code}</div>
                <div className="text-slate-700 mt-0.5 line-clamp-2">{e.message}</div>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}
