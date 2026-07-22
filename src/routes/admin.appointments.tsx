ort { useState, useMemo, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate, Card } from "@/components/admin/shell";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/lib/admin/api.functions";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Home,
  Bot,
  Plus,
  Download,
  CalendarDays,
  Bell,
  X,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  FileCode,
  TrendingUp,
  Printer,
  ShieldCheck,
  Globe,
  Monitor,
  Cpu,
  User,
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

const SOURCES = ["Website", "Sophia AI", "Admin Panel", "API"] as const;

export function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["appointments"], queryFn: () => listAppointments() });

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT & PERSISTENT READ NOTIFICATIONS
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<"all" | StatusType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Filter Popover & Controls
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterService, setFilterService] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [presetRange, setPresetRange] = useState<"all" | "today" | "week" | "month">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // UI Modals & Dropdowns
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week" | "day">("month");
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Read Notifications state synced with LocalStorage & DB Read Markers
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("read_appointment_notifs_v2");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("read_appointment_notifs_v2", JSON.stringify(Array.from(readNotifIds)));
    } catch (e) {
      console.error(e);
    }
  }, [readNotifIds]);

  // Service Dropdown state inside Add Modal
  const [serviceSearch, setServiceSearch] = useState("");
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  const currentUserRole = useMemo(() => {
    return "Administrator";
  }, []);

  // New Appointment Form State
  const [newAppt, setNewAppt] = useState({
    full_name: "",
    email: "",
    phone: "",
    service: "",
    preferred_date: new Date().toISOString().split("T")[0],
    preferred_time: "10:00 AM",
    source: "Admin Panel",
    notes: "",
  });

  const filterRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // API MUTATIONS & REFRESH HANDLERS
  // ---------------------------------------------------------------------------
  const refreshAllSystemViews = () => {
    qc.invalidateQueries({ queryKey: ["appointments"] });
  };

  const create = useMutation({
    mutationFn: (v: any) => createAppointment({ data: v }),
    onSuccess: () => {
      refreshAllSystemViews();
      toast.success("Appointment created successfully");
      setShowAddModal(false);
      setNewAppt({
        full_name: "",
        email: "",
        phone: "",
        service: "",
        preferred_date: new Date().toISOString().split("T")[0],
        preferred_time: "10:00 AM",
        source: "Admin Panel",
        notes: "",
      });
      setServiceSearch("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Creation failed"),
  });

  const update = useMutation({
    mutationFn: (v: {
      id: string;
      status?: StatusType;
      assigned_to?: string | null;
      internal_notes?: string | null;
      source?: string;
      is_read?: boolean;
    }) => updateAppointment({ data: v }),
    onSuccess: () => {
      refreshAllSystemViews();
      toast.success("Appointment updated");
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAppointment({ data: { id } }),
    onSuccess: () => {
      refreshAllSystemViews();
      toast.success("Deleted");
      if (selectedAppointment) setSelectedAppointment(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  // ---------------------------------------------------------------------------
  // SOURCE DISCOVERY & TIMEZONE HELPERS
  // ---------------------------------------------------------------------------
  const resolveApptSource = (a: any) => {
    // 1. Direct explicit source field match
    if (a.source && SOURCES.includes(a.source as any)) {
      return a.source;
    }
    // 2. Discover from metadata or notes without overwriting
    const meta = String(a.metadata || a.internal_notes || "").toLowerCase();
    if (meta.includes("sophia")) return "Sophia AI";
    if (meta.includes("admin")) return "Admin Panel";
    if (meta.includes("api")) return "API";
    
    return "Website";
  };

  const parseLocalISOString = (dateInput?: string | Date) => {
    if (!dateInput) return null;
    if (typeof dateInput === "string" && dateInput.length === 10 && dateInput.includes("-")) {
      const [y, m, d] = dateInput.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateTimeParts = (dateInput?: string | Date, rawTime?: string) => {
    if (!dateInput) return { weekday: "—", dateStr: "—", timeStr: rawTime || "10:00 AM" };
    const d = parseLocalISOString(dateInput);
    if (!d) return { weekday: "—", dateStr: String(dateInput), timeStr: rawTime || "10:00 AM" };

    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    const timeStr = rawTime || (typeof dateInput === "string" && dateInput.includes("T")
      ? new Date(dateInput).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      : "10:00 AM");

    return { weekday, dateStr: `${day} ${month} ${year}`, timeStr };
  };

  const getRecencyBadge = (createdAtString?: string) => {
    if (!createdAtString) return null;
    const createdTime = new Date(createdAtString).getTime();
    if (isNaN(createdTime)) return null;

    const now = Date.now();
    const diffMinutes = (now - createdTime) / (1000 * 60);

    if (diffMinutes >= 0 && diffMinutes <= 2) {
      return (
        <span className="animate-pulse rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
          JUST NOW
        </span>
      );
    }
    if (diffMinutes > 2 && diffMinutes <= 30) {
      return (
        <span className="rounded-md bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase">
          NEW
        </span>
      );
    }
    return null;
  };

  const uniqueServices = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a: any) => {
      if (a.service) set.add(a.service);
    });
    if (set.size === 0) {
      return ["Consultation", "General Inquiry", "Implementation", "Strategy Brief", "Technical Review"];
    }
    return Array.from(set);
  }, [data]);

  const filteredServicesForDropdown = useMemo(() => {
    if (!serviceSearch.trim()) return uniqueServices;
    return uniqueServices.filter((s) => s.toLowerCase().includes(serviceSearch.toLowerCase().trim()));
  }, [uniqueServices, serviceSearch]);

  // ---------------------------------------------------------------------------
  // SEARCH & ADVANCED FILTERING
  // ---------------------------------------------------------------------------
  const filteredData = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();

    return data.filter((a: any) => {
      if (activeTab !== "all" && a.status !== activeTab) return false;
      if (filterService !== "all" && a.service !== filterService) return false;

      if (filterSource !== "all") {
        const itemSource = resolveApptSource(a);
        if (itemSource !== filterSource) return false;
      }

      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = a.full_name?.toLowerCase().includes(q);
        const matchesPhone = a.phone?.toLowerCase().includes(q);
        const matchesEmail = a.email?.toLowerCase().includes(q);
        const matchesService = a.service?.toLowerCase().includes(q);
        const matchesId = a.id?.toLowerCase().includes(q) || `ba-${a.id?.slice(0, 6)}`.includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesService && !matchesId) return false;
      }

      const apptDateStr = a.preferred_date || (a.created_at ? a.created_at.split("T")[0] : "");
      if (presetRange === "today" && apptDateStr !== todayStr) return false;
      if (presetRange === "week") {
        const apptDate = parseLocalISOString(apptDateStr);
        if (!apptDate) return false;
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (apptDate < sevenDaysAgo || apptDate > now) return false;
      }
      if (presetRange === "month") {
        const apptDate = parseLocalISOString(apptDateStr);
        if (!apptDate) return false;
        if (apptDate.getMonth() !== now.getMonth() || apptDate.getFullYear() !== now.getFullYear()) return false;
      }

      if (fromDate && apptDateStr && apptDateStr < fromDate) return false;
      if (toDate && apptDateStr && apptDateStr > toDate) return false;

      return true;
    });
  }, [data, activeTab, searchQuery, filterService, filterSource, presetRange, fromDate, toDate]);

  // ---------------------------------------------------------------------------
  // METRICS & ANALYTICS
  // ---------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const total = data.length;
    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    data.forEach((a: any) => {
      if (a.status === "pending") pending++;
      else if (a.status === "confirmed") confirmed++;
      else if (a.status === "completed") completed++;
      else if (a.status === "cancelled") cancelled++;

      const dateStr = a.preferred_date || (a.created_at ? a.created_at.split("T")[0] : "");
      if (dateStr === todayStr) todayCount++;

      const d = parseLocalISOString(dateStr);
      if (d) {
        if (d >= sevenDaysAgo && d <= now) weekCount++;
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthCount++;
      }
    });

    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total ? Math.round((cancelled / total) * 100) : 0;
    const pendingRate = total ? Math.round((pending / total) * 100) : 0;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      todayCount,
      weekCount,
      monthCount,
      completionRate,
      cancellationRate,
      pendingRate,
    };
  }, [data]);

  // Persistent Notification System with Server Sync
  const notifications = useMemo(() => {
    const list: Array<{ id: string; rawItem: any; title: string; desc: string; type: "pending" | "today" | "new"; time: string }> = [];
    const todayStr = new Date().toISOString().split("T")[0];

    data.forEach((a: any) => {
      const recency = getRecencyBadge(a.created_at);
      if (recency) {
        list.push({
          id: `new-${a.id}`,
          rawItem: a,
          title: "New Booking Received",
          desc: `${a.full_name || "Guest"} booked ${a.service || "a service"}`,
          type: "new",
          time: new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      } else if (a.status === "pending") {
        list.push({
          id: `pending-${a.id}`,
          rawItem: a,
          title: "Pending Confirmation",
          desc: `${a.full_name || "Guest"} is awaiting confirmation`,
          type: "pending",
          time: a.preferred_date || "Upcoming",
        });
      } else if (a.preferred_date === todayStr) {
        list.push({
          id: `today-${a.id}`,
          rawItem: a,
          title: "Scheduled for Today",
          desc: `${a.full_name || "Guest"} at ${a.preferred_time || "scheduled time"}`,
          type: "today",
          time: "Today",
        });
      }
    });

    return list.slice(0, 10);
  }, [data]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !readNotifIds.has(n.id) && !n.rawItem.is_read);
  }, [notifications, readNotifIds]);

  const handleNotificationClick = (n: any) => {
    setReadNotifIds((prev) => new Set(prev).add(n.id));
    if (n.rawItem?.id) {
      update.mutate({ id: n.rawItem.id, is_read: true });
    }
    setSelectedAppointment(n.rawItem);
    setShowNotifications(false);
  };

  const handleMarkAllNotifsRead = () => {
    const allIds = new Set(readNotifIds);
    notifications.forEach((n) => {
      allIds.add(n.id);
      if (n.rawItem?.id) {
        update.mutate({ id: n.rawItem.id, is_read: true });
      }
    });
    setReadNotifIds(allIds);
  };

  // ---------------------------------------------------------------------------
  // CREATE & EXPORT HANDLERS
  // ---------------------------------------------------------------------------
  const handleCreateAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.full_name) {
      toast.error("Please enter customer name");
      return;
    }

    const payload = {
      full_name: newAppt.full_name,
      email: newAppt.email || null,
      phone: newAppt.phone || null,
      service: newAppt.service || "General Inquiry",
      preferred_date: newAppt.preferred_date,
      preferred_time: newAppt.preferred_time || "10:00 AM",
      source: "Admin Panel",
      created_by: currentUserRole,
      status: "pending" as StatusType,
      internal_notes: newAppt.notes ? `[Created by ${currentUserRole}]\n${newAppt.notes}` : `[Created by ${currentUserRole}]`,
    };

    create.mutate(payload);
  };

  const handleExportData = (format: "csv" | "excel" | "json" | "pdf") => {
    if (!filteredData.length) {
      toast.error("No data to export");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    if (format === "csv" || format === "excel") {
      const mimeType = format === "excel" ? "application/vnd.ms-excel;charset=utf-8;" : "text/csv;charset=utf-8;";
      const ext = format === "excel" ? "xls" : "csv";
      const fileName = `appointments_export_${todayStr}.${ext}`;

      const headers = ["ID", "Customer Name", "Email", "Phone", "Service", "Visit Date", "Visit Time", "Status", "Source", "Created At"];
      const rows = filteredData.map((a: any) => [
        `"${a.id || ""}"`,
        `"${(a.full_name || "").replace(/"/g, '""')}"`,
        `"${(a.email || "").replace(/"/g, '""')}"`,
        `"${(a.phone || "").replace(/"/g, '""')}"`,
        `"${(a.service || "").replace(/"/g, '""')}"`,
        `"${a.preferred_date || ""}"`,
        `"${a.preferred_time || "10:00 AM"}"`,
        `"${a.status || ""}"`,
        `"${resolveApptSource(a)}"`,
        `"${a.created_at || ""}"`,
      ]);

      const content = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${filteredData.length} records as ${ext.toUpperCase()}`);
      setShowExportModal(false);
      return;
    }

    if (format === "json") {
      const content = JSON.stringify(
        filteredData.map((a: any) => ({ ...a, source: resolveApptSource(a) })),
        null,
        2
      );
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `appointments_${todayStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${filteredData.length} records as JSON`);
      setShowExportModal(false);
      return;
    }

    if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to generate PDF");
        return;
      }

      const rowsHtml = filteredData
        .map(
          (a: any, idx: number) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${idx + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold;">BA-${a.id ? a.id.slice(0, 6) : "000" + (idx + 1)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
              <strong>${a.full_name || "Guest"}</strong><br/>
              <span style="color: #64748b; font-size: 10px;">${a.phone || ""} | ${a.email || ""}</span>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${a.service || "General"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${a.preferred_date || "N/A"} (${a.preferred_time || "10:00 AM"})</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${resolveApptSource(a)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-transform: capitalize; font-weight: bold;">${a.status}</td>
          </tr>
        `
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Appointments Schedule Report - ${todayStr}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
              .logo { font-weight: 800; font-size: 18px; color: #4f46e5; }
              .title { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
              .meta { font-size: 12px; color: #64748b; margin-bottom: 16px; }
              table { width: 100%; border-collapse: collapse; text-align: left; }
              th { background: #f8fafc; padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
              .totals { margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 12px; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">ADMIN PANEL</div>
              <div style="text-align: right;">
                <div style="font-size: 12px; font-weight: bold;">Appointments Official Report</div>
                <div style="font-size: 10px; color: #64748b;">Generated on ${new Date().toLocaleString()}</div>
              </div>
            </div>
            
            <div class="title">Scheduled Appointments</div>
            <div class="meta">Filter applied: Status (${activeTab}) | Total Records: ${filteredData.length}</div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Appt ID</th>
                  <th>Customer Details</th>
                  <th>Service</th>
                  <th>Visit Date & Time</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div class="totals">
              <span><strong>Total Listed:</strong> ${filteredData.length}</span>
              <span><strong>Confirmed:</strong> ${metrics.confirmed}</span>
              <span><strong>Pending:</strong> ${metrics.pending}</span>
              <span><strong>Completed:</strong> ${metrics.completed}</span>
            </div>

            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      setShowExportModal(false);
      toast.success("Print-friendly PDF generated");
    }
  };

  const handlePrint = () => {
    handleExportData("pdf");
  };

  // ---------------------------------------------------------------------------
  // CALENDAR DATES & WEEK CREATION
  // ---------------------------------------------------------------------------
  const calendarDays = useMemo(() => {
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startPadding = firstDay.getDay();

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [calendarCurrentDate]);

  const calendarWeekDays = useMemo(() => {
    const curr = new Date(calendarCurrentDate);
    const first = curr.getDate() - curr.getDay();
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(curr.getFullYear(), curr.getMonth(), first + i));
    }
    return days;
  }, [calendarCurrentDate]);

  // Helper renderer for Source Badge
  const renderSourceBadge = (a: any) => {
    const sourceVal = resolveApptSource(a);

    if (sourceVal === "Sophia AI") {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-100">
          <Bot className="h-3 w-3 text-purple-600" />
          <span>Sophia AI</span>
        </div>
      );
    }
    if (sourceVal === "Admin Panel") {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
          <Monitor className="h-3 w-3 text-indigo-600" />
          <span>Admin Panel</span>
        </div>
      );
    }
    if (sourceVal === "API") {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 text-[10px] font-semibold border border-cyan-100">
          <Cpu className="h-3 w-3 text-cyan-600" />
          <span>API</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
        <Globe className="h-3 w-3 text-emerald-600" />
        <span>Website</span>
      </div>
    );
  };

  const todayIsoStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 text-slate-800">
      {/* ------------------------------------------------------------------- */}
      {/* HEADER SECTION WITH DYNAMIC ADMIN DETECT & NOTIFICATIONS            */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointments Dashboard</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              {currentUserRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time management and tracking for customer appointments and schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCalendarModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            Calendar View
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={handleMarkAllNotifsRead}
                        className="text-[10px] font-semibold text-indigo-600 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {unreadNotifications.length} Unread
                    </span>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => {
                    const isRead = readNotifIds.has(n.id) || n.rawItem.is_read;
                    return (
                      <div
                        key={`notif-${n.id}`}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 transition text-xs cursor-pointer flex items-start gap-2.5 ${
                          isRead ? "bg-white opacity-60 hover:opacity-100" : "bg-indigo-50/40 hover:bg-indigo-50/80 font-medium"
                        }`}
                      >
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${isRead ? "bg-slate-300" : "bg-indigo-600"}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{n.title}</span>
                            <span className="text-[10px] font-normal text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                  {notifications.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* METRIC CARDS                                                       */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="p-3.5 border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{metrics.pending}</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 border border-amber-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <span className="mt-2 inline-block rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Awaiting confirmation
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Confirmed</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{metrics.confirmed}</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <span className="mt-2 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Upcoming appointments
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Completed</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{metrics.completed}</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 border border-blue-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <span className="mt-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            Successfully completed
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">Cancelled</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{metrics.cancelled}</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600 border border-rose-100">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <span className="mt-2 inline-block rounded bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
            Cancelled appointments
          </span>
        </Card>

        <Card className="p-3.5 border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Today's</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{metrics.todayCount}</div>
            </div>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 border border-indigo-100">
              <CalendarIcon className="h-4 w-4" />
            </div>
          </div>
          <span className="mt-2 inline-block rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            Scheduled for today
          </span>
        </Card>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* STATUS TABS: NO WRAP ON DESKTOP, HORIZONTAL SCROLL ON MOBILE        */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Strict Single Row Non-wrapping Tab Bar */}
        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar py-0.5">
          <div className="flex flex-nowrap items-center gap-1.5 min-w-max">
            {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((tab) => (
              <button
                key={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition whitespace-nowrap shrink-0 ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600">
            <span className="text-[10px] font-bold text-slate-400 uppercase">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="outline-none bg-transparent text-xs"
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="outline-none bg-transparent text-xs"
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="text-slate-400 hover:text-slate-600 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, service, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition ${
                filterService !== "all" || filterSource !== "all" || presetRange !== "all"
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-4 space-y-3.5 text-xs">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Filter Appointments</span>
                  <button
                    onClick={() => {
                      setFilterService("all");
                      setFilterSource("all");
                      setPresetRange("all");
                      setFromDate("");
                      setToDate("");
                    }}
                    className="text-[10px] font-semibold text-indigo-600 hover:underline"
                  >
                    Reset
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Time Preset</label>
                  <select
                    value={presetRange}
                    onChange={(e) => setPresetRange(e.target.value as any)}
                    className="w-full rounded-md border border-slate-200 p-1.5 text-xs"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Service</label>
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full rounded-md border border-slate-200 p-1.5 text-xs"
                  >
                    <option value="all">All Services</option>
                    {uniqueServices.map((s) => (
                      <option key={`filter-srv-${s}`} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Source</label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full rounded-md border border-slate-200 p-1.5 text-xs"
                  >
                    <option value="all">All Sources</option>
                    {SOURCES.map((src) => (
                      <option key={`filter-src-${src}`} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* MAIN APPOINTMENTS TABLE                                            */}
      {/* ------------------------------------------------------------------- */}
      <Card className="overflow-hidden border-slate-200/90 shadow-2xs">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Appointments List</h2>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              LIVE
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">{filteredData.length} total entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-3">#</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Appointment</th>
                <th className="px-3.5 py-3">Customer Details</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Service</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Visit Date & Time</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Booked At</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Source</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.map((a: any, idx: number) => {
                const visitParts = formatDateTimeParts(a.preferred_date, a.preferred_time);
                const bookedParts = formatDateTimeParts(a.created_at);
                const recencyBadge = getRecencyBadge(a.created_at);
                const displayId = a.id ? `BA-${a.id.slice(0, 6)}` : `BA-000${idx + 1}`;

                return (
                  <tr key={a.id || `row-${idx}`} className="hover:bg-slate-50/80 transition-colors align-top">
                    <td className="px-3.5 py-3 font-bold text-slate-400">{idx + 1}</td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {recencyBadge}
                        <span className="font-bold text-slate-900">{displayId}</span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3">
                      <div className="flex items-start gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center text-[10px] shrink-0 border border-slate-200">
                          {a.full_name ? a.full_name.slice(0, 2).toUpperCase() : "G"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{a.full_name || "Guest"}</div>
                          {a.phone && <div className="text-[11px] text-slate-500">{a.phone}</div>}
                          {a.email && <div className="text-[11px] text-slate-400">{a.email}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 max-w-[180px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 truncate">
                        <Home className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="font-medium text-slate-800 truncate" title={a.service || "General Inquiry"}>
                          {a.service || "General Inquiry"}
                        </span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{visitParts.weekday}</div>
                      <div className="text-slate-600 text-[11px]">{visitParts.dateStr}</div>
                      <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{visitParts.timeStr}</span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{bookedParts.weekday}</div>
                      <div className="text-slate-600 text-[11px]">{bookedParts.dateStr}</div>
                      <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{bookedParts.timeStr}</span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      {renderSourceBadge(a)}
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <select
                        value={a.status}
                        onChange={(e) => update.mutate({ id: a.id, status: e.target.value as StatusType })}
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-bold capitalize outline-none cursor-pointer transition ${
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
                          <option key={`status-opt-${a.id}-${s}`} value={s} className="bg-white text-slate-800 font-normal">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {a.status === "pending" && (
                          <button
                            title="Quick Confirm"
                            onClick={() => update.mutate({ id: a.id, status: "confirmed" })}
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          title="View Details"
                          onClick={() => setSelectedAppointment(a)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50 border border-blue-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => confirm("Delete appointment?") && remove.mutate(a.id)}
                          className="p-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ------------------------------------------------------------------- */}
      {/* METRICS & ANALYTICS                                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Status Summary</h3>
          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 font-medium mb-1">
                <span>Pending</span>
                <span>
                  {metrics.pending} ({metrics.pendingRate}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${metrics.pendingRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 font-medium mb-1">
                <span>Confirmed</span>
                <span>
                  {metrics.confirmed} ({metrics.completionRate}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metrics.completionRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 font-medium mb-1">
                <span>Cancelled</span>
                <span>
                  {metrics.cancelled} ({metrics.cancellationRate}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${metrics.cancellationRate}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Appointment Analytics</h3>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Booked</span>
              <div className="text-base font-black text-slate-900 mt-0.5">{metrics.total}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Completion Rate</span>
              <div className="text-base font-black text-emerald-600 mt-0.5">{metrics.completionRate}%</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">This Week</span>
              <div className="text-base font-black text-slate-900 mt-0.5">{metrics.weekCount}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">This Month</span>
              <div className="text-base font-black text-slate-900 mt-0.5">{metrics.monthCount}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-2xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Quick Actions</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition"
          >
            <Plus className="h-4 w-4" /> Add New Appointment
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
          >
            <Download className="h-4 w-4" /> Export Appointments
          </button>
        </Card>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 1: RICH SCHEDULING CALENDAR WITH PATIENT AVATARS              */}
      {/* ------------------------------------------------------------------- */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Scheduling Calendar</h3>
                  <p className="text-[11px] text-slate-500">Visual appointment timeline and patient scheduler</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold border border-slate-200">
                  {(["month", "week", "day"] as const).map((m) => (
                    <button
                      key={`cal-mode-${m}`}
                      onClick={() => setCalendarViewMode(m)}
                      className={`px-3 py-1 rounded-lg capitalize transition ${
                        calendarViewMode === m ? "bg-white text-indigo-600 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="font-black text-slate-900 text-base tracking-tight">
                {calendarViewMode === "month" &&
                  calendarCurrentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                {calendarViewMode === "week" &&
                  `Week of ${calendarWeekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${calendarWeekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                {calendarViewMode === "day" &&
                  calendarCurrentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (calendarViewMode === "month") {
                      setCalendarCurrentDate(new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() - 1, 1));
                    } else if (calendarViewMode === "week") {
                      const d = new Date(calendarCurrentDate);
                      d.setDate(d.getDate() - 7);
                      setCalendarCurrentDate(d);
                    } else {
                      const d = new Date(calendarCurrentDate);
                      d.setDate(d.getDate() - 1);
                      setCalendarCurrentDate(d);
                    }
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCalendarCurrentDate(new Date())}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    if (calendarViewMode === "month") {
                      setCalendarCurrentDate(new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1, 1));
                    } else if (calendarViewMode === "week") {
                      const d = new Date(calendarCurrentDate);
                      d.setDate(d.getDate() + 7);
                      setCalendarCurrentDate(d);
                    } else {
                      const d = new Date(calendarCurrentDate);
                      d.setDate(d.getDate() + 1);
                      setCalendarCurrentDate(d);
                    }
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* MONTH VIEW GRID WITH AVATAR CARDS */}
            {calendarViewMode === "month" && (
              <div className="p-4 bg-slate-50/50">
                <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold uppercase tracking-wider mb-2">
                  <span className="text-slate-400">Sun</span>
                  <span className="text-slate-600">Mon</span>
                  <span className="text-slate-600">Tue</span>
                  <span className="text-slate-600">Wed</span>
                  <span className="text-slate-600">Thu</span>
                  <span className="text-slate-600">Fri</span>
                  <span className="text-slate-400">Sat</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="h-32 bg-slate-100/40 rounded-xl border border-dashed border-slate-200/60" />;
                    const year = day.getFullYear();
                    const month = String(day.getMonth() + 1).padStart(2, "0");
                    const dateNum = String(day.getDate()).padStart(2, "0");
                    const dateStr = `${year}-${month}-${dateNum}`;
                    const dayAppts = data.filter((a: any) => a.preferred_date === dateStr);
                    const isToday = dateStr === todayIsoStr;
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                    return (
                      <div
                        key={`mday-${dateStr}-${idx}`}
                        className={`h-32 rounded-xl p-2 flex flex-col justify-between transition border ${
                          isToday
                            ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20"
                            : isWeekend
                            ? "bg-slate-100/60 border-slate-200/80"
                            : "bg-white border-slate-200/90 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-black rounded-full h-5 w-5 flex items-center justify-center ${
                              isToday ? "bg-indigo-600 text-white shadow-xs" : "text-slate-700"
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          {dayAppts.length > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {dayAppts.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 overflow-y-auto max-h-24 pr-0.5 no-scrollbar">
                          {dayAppts.map((a: any) => (
                            <div
                              key={`cal-item-${a.id}`}
                              onClick={() => {
                                setSelectedAppointment(a);
                                setShowCalendarModal(false);
                              }}
                              className={`p-1.5 rounded-lg border text-[10px] cursor-pointer transition shadow-2xs flex items-center gap-1.5 ${
                                a.status === "confirmed"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100"
                                  : a.status === "pending"
                                  ? "bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100"
                                  : a.status === "completed"
                                  ? "bg-blue-50 border-blue-200 text-blue-950 hover:bg-blue-100"
                                  : "bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100"
                              }`}
                            >
                              <div className="h-5 w-5 rounded-full bg-white border border-slate-200 shrink-0 font-bold text-[9px] flex items-center justify-center text-slate-700 shadow-2xs">
                                {a.full_name ? a.full_name.slice(0, 1).toUpperCase() : "P"}
                              </div>
                              <div className="truncate flex-1">
                                <div className="font-bold truncate">{a.full_name || "Patient"}</div>
                                <div className="text-[8px] opacity-75 font-semibold flex items-center gap-1">
                                  <span>{a.preferred_time || "10:00 AM"}</span>
                                  <span>•</span>
                                  <span className="truncate">{a.service || "General"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW GRID */}
            {calendarViewMode === "week" && (
              <div className="p-4 bg-slate-50/50">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold mb-3">
                  {calendarWeekDays.map((wDay, idx) => {
                    const wIso = wDay.toISOString().split("T")[0];
                    const isToday = wIso === todayIsoStr;
                    return (
                      <div
                        key={`wk-head-${idx}`}
                        className={`p-2 rounded-xl border ${
                          isToday ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs" : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="text-[10px] uppercase font-semibold opacity-80">
                          {wDay.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div className="text-base font-black">{wDay.getDate()}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarWeekDays.map((wDay, idx) => {
                    const dateStr = wDay.toISOString().split("T")[0];
                    const dayAppts = data.filter((a: any) => a.preferred_date === dateStr);
                    const isWeekend = wDay.getDay() === 0 || wDay.getDay() === 6;

                    return (
                      <div
                        key={`wk-col-${dateStr}-${idx}`}
                        className={`min-h-64 rounded-xl p-2 border space-y-1.5 ${
                          isWeekend ? "bg-slate-100/60 border-slate-200/80" : "bg-white border-slate-200"
                        }`}
                      >
                        {dayAppts.map((a: any) => (
                          <div
                            key={`wk-appt-${a.id}`}
                            onClick={() => {
                              setSelectedAppointment(a);
                              setShowCalendarModal(false);
                            }}
                            className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-indigo-400 transition"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="h-5 w-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                                {a.full_name ? a.full_name.slice(0, 1).toUpperCase() : "P"}
                              </div>
                              <span className="font-bold text-slate-900 text-[10px] truncate">{a.full_name || "Patient"}</span>
                            </div>
                            <div className="text-[9px] text-slate-500 font-semibold">{a.preferred_time || "10:00 AM"}</div>
                            <div className="text-[9px] text-slate-400 truncate">{a.service || "General"}</div>
                          </div>
                        ))}
                        {dayAppts.length === 0 && (
                          <div className="text-[10px] font-medium text-slate-300 text-center pt-10">No appts</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAY VIEW GRID */}
            {calendarViewMode === "day" && (
              <div className="p-4 max-h-96 overflow-y-auto space-y-2.5 bg-slate-50/50">
                {(() => {
                  const dateStr = calendarCurrentDate.toISOString().split("T")[0];
                  const dayAppts = data.filter((a: any) => a.preferred_date === dateStr);

                  if (dayAppts.length === 0) {
                    return (
                      <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                        No appointments scheduled for this date.
                      </div>
                    );
                  }

                  return dayAppts.map((a: any) => (
                    <div
                      key={`day-view-item-${a.id}`}
                      onClick={() => {
                        setSelectedAppointment(a);
                        setShowCalendarModal(false);
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-indigo-400 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-2xs">
                          {a.full_name ? a.full_name.slice(0, 2).toUpperCase() : "P"}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{a.full_name || "Patient"}</h4>
                          <p className="text-[11px] text-slate-500">{a.service || "General Service"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {a.preferred_time || "10:00 AM"}
                        </div>
                        {renderSourceBadge(a)}
                        <span className="capitalize px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 2: ADD APPOINTMENT WITH ACCURATE SAVING & INSTANT SYNC       */}
      {/* ------------------------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Add New Appointment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAppointmentSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAppt.full_name}
                  onChange={(e) => setNewAppt({ ...newAppt, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={newAppt.email}
                    onChange={(e) => setNewAppt({ ...newAppt, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newAppt.phone}
                    onChange={(e) => setNewAppt({ ...newAppt, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative" ref={serviceDropdownRef}>
                <label className="block font-bold text-slate-600 mb-1">Service Requested</label>
                <div
                  onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white cursor-pointer flex items-center justify-between"
                >
                  <span className={newAppt.service ? "text-slate-900 font-medium" : "text-slate-400"}>
                    {newAppt.service || "Select or search service..."}
                  </span>
                  <ChevronRight className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isServiceDropdownOpen ? "rotate-90" : ""}`} />
                </div>

                {isServiceDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Search existing services..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full rounded-md border border-slate-200 p-1.5 text-xs mb-1"
                    />
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100">
                      {filteredServicesForDropdown.map((s) => (
                        <div
                          key={`srv-opt-${s}`}
                          onClick={() => {
                            setNewAppt({ ...newAppt, service: s });
                            setIsServiceDropdownOpen(false);
                          }}
                          className="p-1.5 hover:bg-indigo-50 rounded text-slate-800 cursor-pointer font-medium text-xs"
                        >
                          {s}
                        </div>
                      ))}
                      {filteredServicesForDropdown.length === 0 && (
                        <div
                          onClick={() => {
                            setNewAppt({ ...newAppt, service: serviceSearch });
                            setIsServiceDropdownOpen(false);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer font-semibold text-xs"
                        >
                          + Use custom service: "{serviceSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Precise Date & Time Pickers */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={newAppt.preferred_date}
                    onChange={(e) => setNewAppt({ ...newAppt, preferred_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Preferred Time *</label>
                  <select
                    value={newAppt.preferred_time}
                    onChange={(e) => setNewAppt({ ...newAppt, preferred_time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white text-slate-900 font-medium"
                  >
                    {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"].map((t) => (
                      <option key={`time-opt-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Source</label>
                <div className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-slate-50 font-bold text-indigo-700 flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Admin Panel</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newAppt.notes}
                  onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-2xs"
                >
                  {create.isPending ? "Saving..." : "Save Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 3: EXPORT OPTIONS                                            */}
      {/* ------------------------------------------------------------------- */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Export Appointments</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 text-xs">
              <button
                onClick={() => handleExportData("csv")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 transition"
              >
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <span>Export Complete CSV</span>
              </button>
              <button
                onClick={() => handleExportData("excel")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 transition"
              >
                <FileSpreadsheet className="h-5 w-5 text-teal-600" />
                <span>Export Complete Excel (.xls)</span>
              </button>
              <button
                onClick={() => handleExportData("pdf")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 transition"
              >
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Generate Professional PDF</span>
              </button>
              <button
                onClick={() => handleExportData("json")}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 transition"
              >
                <FileCode className="h-5 w-5 text-blue-600" />
                <span>Export JSON Data</span>
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 transition"
              >
                <Printer className="h-5 w-5 text-purple-600" />
                <span>Print Schedule View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 4: APPOINTMENT DETAILS                                       */}
      {/* ------------------------------------------------------------------- */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Appointment Details</h3>
              <button onClick={() => setSelectedAppointment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">Customer Name</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedAppointment.full_name}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Status</span>
                  <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-bold">
                    {selectedAppointment.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Email</span>
                  <p>{selectedAppointment.email || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Phone</span>
                  <p>{selectedAppointment.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Service</span>
                  <p className="font-semibold text-slate-800">{selectedAppointment.service || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Preferred Date & Time</span>
                  <p className="font-semibold text-slate-800">
                    {selectedAppointment.preferred_date || "N/A"} ({selectedAppointment.preferred_time || "10:00 AM"})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Source</span>
                  <div>{renderSourceBadge(selectedAppointment)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Created By</span>
                  <p className="font-medium text-slate-800">{selectedAppointment.created_by || currentUserRole}</p>
                </div>
              </div>

              {selectedAppointment.internal_notes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-1">Notes</span>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 whitespace-pre-wrap font-mono text-[11px] text-slate-600">
                    {selectedAppointment.internal_notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
