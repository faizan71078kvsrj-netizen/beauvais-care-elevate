import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  listUsers,
} from "@/lib/admin/api.functions";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin/appointments")({
  component: AdminAppointmentsPage,
});

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Appointment {
  id: string;
  user_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  scheduled_at: string;
  status: AppointmentStatus;
  assigned_to?: string | null;
  internal_notes?: string | null;
  created_at: string;
}

function AdminAppointmentsPage() {
  const queryClient = useQueryClient();

  const fetchAppointmentsFn = useServerFn(listAppointments);
  const fetchUsersFn = useServerFn(listUsers);
  const createAppointmentFn = useServerFn(createAppointment);
  const updateAppointmentFn = useServerFn(updateAppointment);
  const deleteAppointmentFn = useServerFn(deleteAppointment);

  // Queries
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: () => fetchAppointmentsFn(),
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchUsersFn(),
  });

  const profiles = usersData?.profiles ?? [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => createAppointmentFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateAppointmentFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
      setEditingAppointment(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAppointmentFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
    },
  });

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    user_id: "",
    full_name: "",
    email: "",
    phone: "",
    service: "",
    scheduled_at: "",
    status: "pending" as AppointmentStatus,
    assigned_to: "",
    internal_notes: "",
  });

  const resetForm = () => {
    setFormData({
      user_id: "",
      full_name: "",
      email: "",
      phone: "",
      service: "",
      scheduled_at: "",
      status: "pending",
      assigned_to: "",
      internal_notes: "",
    });
  };

  const handleUserSelect = (userId: string) => {
    if (!userId) {
      setFormData((prev) => ({ ...prev, user_id: "" }));
      return;
    }
    const selected = profiles.find((p: any) => p.id === userId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        user_id: selected.id,
        full_name: selected.full_name || prev.full_name,
        email: selected.email || prev.email,
        phone: selected.phone || prev.phone,
      }));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...formData,
      user_id: formData.user_id || undefined,
      assigned_to: formData.assigned_to || null,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      service: formData.service || undefined,
      internal_notes: formData.internal_notes || null,
    };
    createMutation.mutate(payload);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    updateMutation.mutate({
      id: editingAppointment.id,
      status: editingAppointment.status,
      assigned_to: editingAppointment.assigned_to || null,
      internal_notes: editingAppointment.internal_notes || null,
    });
  };

  // Filtering
  const filteredAppointments = appointments.filter((appt: Appointment) => {
    const matchesSearch =
      (appt.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (appt.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (appt.service?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (appt.phone || "").includes(searchTerm);

    const matchesStatus = statusFilter === "all" || appt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Appointments</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage scheduling, status updates, and staff assignments.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 w-full sm:w-auto overflow-x-auto">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List / Table */}
      {isLoadingAppointments ? (
        <div className="flex items-center justify-center p-12 bg-slate-900/30 rounded-xl border border-slate-800">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/30 rounded-xl border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white">No appointments found</h3>
          <p className="text-slate-400 text-sm mt-1">
            Try adjusting your search terms or filter settings.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden bg-slate-900/50 rounded-xl border border-slate-800 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Scheduled Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredAppointments.map((appt: Appointment) => {
                  const assignedUser = profiles.find((p: any) => p.id === appt.assigned_to);
                  return (
                    <tr key={appt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{appt.full_name || "N/A"}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          {appt.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {appt.email}
                            </span>
                          )}
                          {appt.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {appt.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{appt.service || "General"}</td>
                      <td className="py-4 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(appt.scheduled_at).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(appt.status)}</td>
                      <td className="py-4 px-4 text-slate-300">
                        {assignedUser ? (
                          <div className="flex items-center gap-1.5 text-indigo-300">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{assignedUser.full_name || assignedUser.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingAppointment(appt)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Edit / Assign"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this appointment?")) {
                                deleteMutation.mutate(appt.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredAppointments.map((appt: Appointment) => {
              const assignedUser = profiles.find((p: any) => p.id === appt.assigned_to);
              return (
                <div
                  key={appt.id}
                  className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-4 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-white">{appt.full_name || "N/A"}</h4>
                      <p className="text-xs text-indigo-400 font-medium mt-0.5">
                        {appt.service || "General Service"}
                      </p>
                    </div>
                    <div>{getStatusBadge(appt.status)}</div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(appt.scheduled_at).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    {appt.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {appt.email}
                      </div>
                    )}
                    {appt.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {appt.phone}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block">Assigned Staff</span>
                      <span className="text-slate-300 font-medium">
                        {assignedUser ? assignedUser.full_name || assignedUser.email : "Unassigned"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingAppointment(appt)}
                        className="p-2 text-slate-400 hover:text-indigo-400 bg-slate-800 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this appointment?")) {
                            deleteMutation.mutate(appt.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">New Appointment</h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              {/* Optional Link User */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Link Existing User (Optional)
                </label>
                <select
                  value={formData.user_id}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Registered User --</option>
                  {profiles.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Service</label>
                  <input
                    type="text"
                    placeholder="e.g. Consultation"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as AppointmentStatus })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Assign Staff Member
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Unassigned --</option>
                  {profiles.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.internal_notes}
                  onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Notes visible to admin and staff only..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Saving..." : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Manage Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Update Appointment
                </h3>
                <p className="text-xs text-slate-400">
                  Client: {editingAppointment.full_name || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setEditingAppointment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select
                  value={editingAppointment.status}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      status: e.target.value as AppointmentStatus,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Assigned Staff
                </label>
                <select
                  value={editingAppointment.assigned_to || ""}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      assigned_to: e.target.value || null,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Unassigned --</option>
                  {profiles.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={4}
                  value={editingAppointment.internal_notes || ""}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      internal_notes: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Notes visible to admin and staff only..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
