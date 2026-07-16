import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { listDocuments } from "@/lib/admin/api.functions";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/admin/documents")({
  head: () => ({ meta: [{ title: "Documents · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Page /></AdminGate>,
});

function Page() {
  const { data = [] } = useQuery({ queryKey: ["documents"], queryFn: () => listDocuments() });
  return (
    <>
      <PageTitle title="Documents" subtitle="PDF, DOCX, images — future AI knowledge base source" />
      <Card className="p-6">
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
          Document upload UI will be enabled once storage buckets are configured.
          <br />Files stored here feed the AI knowledge base.
        </div>
        <div className="mt-6 divide-y divide-slate-100">
          {data.map((d: any) => (
            <div key={d.id} className="flex items-center gap-3 py-3">
              <FileText className="h-5 w-5 text-slate-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{d.title}</div>
                <div className="text-xs text-slate-500">{d.file_type} · {new Date(d.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
          {data.length === 0 && <div className="py-6 text-center text-xs text-slate-400">No documents uploaded.</div>}
        </div>
      </Card>
    </>
  );
}
