import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate, Card } from "@/components/admin/shell";
import { listAppointments, updateAppointment, deleteAppointment } from "@/lib/admin/api.functions";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Home,
  Bot,
  UserCheck,
  Plus,
  Download,
  CalendarDays,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/appointments")({
  head: () => ({ meta: [{ title: "Appointments · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => (
    <AdminGate>
      <Page />
    </AdminGate>
  ),
});

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
type StatusType = (typeof STATUSES)[number];

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["appointments"], queryFn: () => listAppointments() });

  const [activeTab, setActiveTab] = useState<"all" | StatusType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const update = useMutation({
    mutationFn: (v: {
      id: string;
      status?: StatusType;
      assigned_to?: string | null;
      internal_notes?: string | null;
    }) => updateAppointment({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated");
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAppointment({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Deleted");
      if (selectedAppointment) setSelectedAppointment(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  // Derived Summary Counts
  const counts = useMemo(() => {
    const res = { pending: 0, confirmed: 0, completed: 0, cancelled: 0, today: 0 };
    const todayStr = new Date().toISOString().split("T")[0];

    data.forEach((a: any) => {
      if (a.status in res) {
        res[a.status as keyof typeof res]++;
      }
      const createdStr = a.created_at ? new Date(a.created_at).toISOString().split("T")[0] : "";
      if (createdStr === todayStr || a.preferred_date === todayStr) {
        res.today++;
      }
    });
    return res;
  }, [data]);

  // Filtered Appointments
  const filteredData = useMemo(() => {
    return data.filter((a: any) => {
      const matchesTab = activeTab === "all" || a.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q) ||
        a.service?.toLowerCase().includes(q) ||
        a.id?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [data, activeTab, searchQuery]);

  // Helper Initials
  const getInitials = (name?: string) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Helper Badge Colors for Initials Avatar
  const getAvatarBg = (idx: number) => {
    const colors = [
      "bg-purple-100 text-purple-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
      "bg-blue-100 text-blue-700",
      "bg-rose-100 text-rose-700",
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500">Manage all customer appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            Calendar View
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Pending */}
        <Card className="p-4 relative overflow-hidden border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pending</span>
              <div className="mt-1 text-2xl font-bold text-slate-900">{counts.pending}</div>
              <p className="mt-0.5 text-[11px] text-slate-500">Appointments</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 border border-amber-100">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200/50">
              Awaiting confirmation
            </span>
          </div>
        </Card>

        {/* Confirmed */}
        <Card className="p-4 relative overflow-hidden border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Confirmed</span>
              <div className="mt-1 text-2xl font-bold text-slate-900">{counts.confirmed}</div>
              <p className="mt-0.5 text-[11px] text-slate-500">Appointments</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/50">
              Upcoming appointments
            </span>
          </div>
        </Card>

        {/* Completed */}
        <Card className="p-4 relative overflow-hidden border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Completed</span>
              <div className="mt-1 text-2xl font-bold text-slate-900">{counts.completed}</div>
              <p className="mt-0.5 text-[11px] text-slate-500">Appointments</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200/50">
              Successfully completed
            </span>
          </div>
        </Card>

        {/* Cancelled */}
        <Card className="p-4 relative overflow-hidden border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Cancelled</span>
              <div className="mt-1 text-2xl font-bold text-slate-900">{counts.cancelled}</div>
              <p className="mt-0.5 text-[11px] text-slate-500">Appointments</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600 border border-rose-100">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 border border-rose-200/50">
              Cancelled appointments
            </span>
          </div>
        </Card>

        {/* Today's */}
        <Card className="p-4 relative overflow-hidden border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Today's</span>
              <div className="mt-1 text-2xl font-bold text-slate-900">{counts.today}</div>
              <p className="mt-0.5 text-[11px] text-slate-500">Appointments</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 border border-indigo-100">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 border border-indigo-200/50">
              Scheduled for today
            </span>
          </div>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab === "all" ? "All" : tab}
              </button>
            );
          })}
        </div>

        {/* Search & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            Filters
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden border-slate-200/80 shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Appointments List</h2>
            <span className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
              Live
            </span>
          </div>
          <span className="text-xs text-slate-500">{filteredData.length} entries found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Appointment</th>
                <th className="px-4 py-3">Customer Details</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Visit Date & Time</th>
                <th className="px-4 py-3">Booked At</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.map((a: any, idx: number) => {
                const createdDate = new Date(a.created_at);
                const displayId = a.id ? `BA-${a.id.slice(0, 6)}` : `BA-000${idx + 1}`;

                return (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors align-middle">
                    {/* Index */}
                    <td className="px-4 py-3.5 font-semibold text-slate-400">{idx + 1}</td>

                    {/* ID & Badge */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{displayId}</div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{a.preferred_date || "N/A"}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarBg(
                            idx
                          )}`}
                        >
                          {getInitials(a.full_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{a.full_name || "Guest Customer"}</div>
                          {a.phone && <div className="text-[11px] text-slate-500">{a.phone}</div>}
                          {a.email && (
                            <a
                              href={`mailto:${a.email}`}
                              className="text-[11px] text-slate-400 hover:text-indigo-600 hover:underline block truncate max-w-[160px]"
                            >
                              {a.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-1.5">
                        <Home className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-800">{a.service || "General Inquiry"}</div>
                          <span className="mt-0.5 inline-block rounded bg-indigo-50 text-indigo-700 text-[10px] font-medium px-1.5 py-0.2 border border-indigo-100">
                            Service
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Preferred Date & Time */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{a.preferred_date || "Not set"}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{a.preferred_time || "Flexible"}</span>
                      </div>
                    </td>

                    {/* Booked At */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-slate-700">{createdDate.toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">{createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-medium border border-purple-100">
                        <Bot className="h-3.5 w-3.5 text-purple-600" />
                        <span>Sophia Chat AI</span>
                      </div>
                    </td>

                    {/* Status Select Badge */}
                    <td className="px-4 py-3.5">
                      <select
                        value={a.status}
                        onChange={(e) => update.mutate({ id: a.id, status: e.target.value as StatusType })}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize outline-none cursor-pointer transition-colors ${
                          a.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : a.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : a.status === "completed"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-white text-slate-800">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Quick Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status === "pending" && (
                          <button
                            title="Quick Confirm"
                            onClick={() => update.mutate({ id: a.id, status: "confirmed" })}
                            className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 border border-emerald-200/60"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          title="View Details"
                          onClick={() => setSelectedAppointment(a)}
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 border border-blue-200/60"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => confirm("Delete appointment?") && remove.mutate(a.id)}
                          className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 border border-rose-200/60"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Dashboard Info */}
        <Card className="p-4 border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analytics Overview</h3>
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">Total Bookings</div>
              <div className="text-lg font-bold text-slate-900">{data.length}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">Active Rate</div>
              <div className="text-lg font-bold text-emerald-600">
                {data.length ? Math.round(((counts.confirmed + counts.completed) / data.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </Card>

        {/* Action Panel */}
        <Card className="p-4 border-slate-200/80 shadow-xs space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</h3>
          <button
            onClick={() => toast.info("New appointment booking modal connected to your system")}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition"
          >
            <Plus className="h-4 w-4" /> Add New Appointment
          </button>
          <button
            onClick={() => toast.success("Exporting appointments CSV...")}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <Download className="h-4 w-4" /> Export Appointments
          </button>
        </Card>

        {/* AI & Automation Panel */}
        <Card className="p-4 border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Integration</h3>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
              Sophia AI Active
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Appointments created via natural conversation are automatically linked with client profiles and status tracking.
          </p>
        </Card>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-900">Appointment Details</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block mb-1">Customer Name</span>
                  <p className="font-semibold text-slate-900 text-sm">{selectedAppointment.full_name}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Status</span>
                  <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-medium">
                    {selectedAppointment.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Email</span>
                  <p>{selectedAppointment.email || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Phone</span>
                  <p>{selectedAppointment.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Service Requested</span>
                  <p className="font-medium text-slate-800">{selectedAppointment.service || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Preferred Date</span>
                  <p className="font-medium text-slate-800">{selectedAppointment.preferred_date || "N/A"}</p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <span className="text-slate-400 block mb-1">Notes</span>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
