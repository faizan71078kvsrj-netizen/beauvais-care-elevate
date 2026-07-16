import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminGate, PageTitle, Card } from "@/components/admin/shell";
import { dashboardStats } from "@/lib/admin/api.functions";
import { CalendarClock, MessageSquare, Users, FileText, Bot, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Dashboard /></AdminGate>,
});

function Dashboard() {
  const { data } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => dashboardStats() });
  const stats = [
    { label: "Appointments (30d)", value: data?.appointments30d ?? "—", icon: CalendarClock, color: "sky" },
    { label: "Pending appointments", value: data?.appointmentsPending ?? "—", icon: CalendarClock, color: "amber" },
    { label: "Contacts (30d)", value: data?.contacts30d ?? "—", icon: MessageSquare, color: "emerald" },
    { label: "Leads", value: data?.leads ?? "—", icon: BarChart3, color: "violet" },
    { label: "Customers", value: data?.customers ?? "—", icon: Users, color: "rose" },
    { label: "Documents", value: data?.documents ?? "—", icon: FileText, color: "slate" },
  ];
  return (
    <>
      <PageTitle title="Dashboard" subtitle="Overview of activity across the last 30 days." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-slate-500">{s.label}</div>
              <s.icon className={`h-4 w-4 text-${s.color}-500`} />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{s.value}</div>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-semibold text-slate-900">Welcome to YDC Admin</div>
          <p className="mt-2 text-sm text-slate-600">Use the sidebar to manage appointments, CRM, users, and settings. Every action is logged in the audit trail.</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Bot className="h-4 w-4 text-sky-500" /> AI-ready</div>
          <p className="mt-2 text-sm text-slate-600">Upload documents in the Documents section — these will feed the future AI knowledge base.</p>
        </Card>
      </div>
    </>
  );
}
