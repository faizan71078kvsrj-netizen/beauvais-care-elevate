import { useState, useMemo, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminGate, Card } from "@/components/admin/shell";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/lib/admin/api.functions";
import { useAdminAuth } from "@/lib/admin/auth";
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
  Printer,
  Globe,
  User,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/admin/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments · Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
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
  const { user } = useAdminAuth();
  const loggedInRole = user?.role || user?.user_metadata?.role || "Admin";

  const { data = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => listAppointments(),
  });

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<"all" | StatusType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Filter Popover & Controls
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterService, setFilterService] = useState<string>("all");
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
  const [exportDateRange, setExportDateRange] = useState<"all" | "today" | "yesterday" | "7days" | "month">("all");

  // New Appointment Form State
  const [serviceSearch, setServiceSearch] = useState("");
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({
    full_name: "",
    email: "",
    phone: "",
    service: "",
    preferred_date: new Date().toISOString().split("T")[0],
    preferred_time: "10:00 AM",
    notes: "",
  });

  const filterRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // DYNAMIC SERVICES EXTRACTOR
  // ---------------------------------------------------------------------------
  const availableServices = useMemo(() => {
    const set = new Set<string>([
      "General Consultation",
      "Property Inspection",
      "Listing Strategy",
      "Legal Advisory",
    ]);
    data.forEach((a: any) => {
      if (a.service) set.add(a.service);
    });
    return Array.from(set);
  }, [data]);

  const filteredServicesList = useMemo(() => {
    return availableServices.filter((s) =>
      s.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  }, [availableServices, serviceSearch]);

  // ---------------------------------------------------------------------------
  // EXISTING API MUTATIONS
  // ---------------------------------------------------------------------------
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

  const createMut = useMutation({
    mutationFn: (data: any) => createAppointment({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("New appointment created successfully");
      setShowAddModal(false);
      setNewAppt({
        full_name: "",
        email: "",
        phone: "",
        service: "",
        preferred_date: new Date().toISOString().split("T")[0],
        preferred_time: "10:00 AM",
        notes: "",
      });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to create appointment"),
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

  // ---------------------------------------------------------------------------
  // HELPER FUNCTIONS & FORMATTERS
  // ---------------------------------------------------------------------------
  const formatDateTimeParts = (dateInput?: string | Date) => {
    if (!dateInput) return { weekday: "—", dateStr: "—", timeStr: "—" };
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return { weekday: "—", dateStr: String(dateInput), timeStr: "—" };

    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      weekday,
      dateStr: `${day} ${month} ${year}`,
      timeStr,
    };
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

  const getAppointmentSourceDetails = (a: any) => {
    const rawSource = a.source || a.created_via || (a.metadata?.source ?? "");
    let source = "Website";
    let createdBy = a.created_by || "Customer";

    if (rawSource.toLowerCase().includes("sophia") || a.is_ai_booked) {
      source = "Sophia AI";
      createdBy = "Sophia AI";
    } else if (rawSource.toLowerCase().includes("admin") || a.created_by_admin) {
      source = "Admin Panel";
      createdBy = a.created_by || loggedInRole;
    } else if (rawSource.toLowerCase().includes("api")) {
      source = "API";
      createdBy = "Integration API";
    }

    return { source, createdBy };
  };

  // ---------------------------------------------------------------------------
  // SEARCH & ADVANCED FILTERING
  // ---------------------------------------------------------------------------
  const filteredData = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();

    return data.filter((a: any) => {
      // 1. Tab Status
      if (activeTab !== "all" && a.status !== activeTab) return false;

      // 2. Filter Menu Service
      if (filterService !== "all" && a.service !== filterService) return false;

      // 3. Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = a.full_name?.toLowerCase().includes(q);
        const matchesPhone = a.phone?.toLowerCase().includes(q);
        const matchesEmail = a.email?.toLowerCase().includes(q);
        const matchesService = a.service?.toLowerCase().includes(q);
        const matchesId =
          a.id?.toLowerCase().includes(q) || `ba-${a.id?.slice(0, 6)}`.includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesService && !matchesId)
          return false;
      }

      // 4. Quick Date Presets
      const apptDateStr = a.preferred_date || (a.created_at ? a.created_at.split("T")[0] : "");
      if (presetRange === "today" && apptDateStr !== todayStr) return false;
      if (presetRange === "week") {
        const apptDate = new Date(apptDateStr);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (apptDate < sevenDaysAgo || apptDate > now) return false;
      }
      if (presetRange === "month") {
        const apptDate = new Date(apptDateStr);
        if (
          apptDate.getMonth() !== now.getMonth() ||
          apptDate.getFullYear() !== now.getFullYear()
        )
          return false;
      }

      // 5. Custom Date Range
      if (fromDate) {
        if (!apptDateStr || apptDateStr < fromDate) return false;
      }
      if (toDate) {
        if (!apptDateStr || apptDateStr > toDate) return false;
      }

      return true;
    });
  }, [data, activeTab, searchQuery, filterService, presetRange, fromDate, toDate]);

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

      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        if (d >= sevenDaysAgo && d <= now) weekCount++;
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
          monthCount++;
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

  // Dynamic Notifications List
  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      desc: string;
      type: "pending" | "today" | "new";
      time: string;
    }> = [];
    const todayStr = new Date().toISOString().split("T")[0];

    data.forEach((a: any) => {
      const recency = getRecencyBadge(a.created_at);
      if (recency) {
        list.push({
          id: a.id,
          title: "New Booking Received",
          desc: `${a.full_name || "Guest"} booked ${a.service || "a service"}`,
          type: "new",
          time: new Date(a.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      } else if (a.status === "pending") {
        list.push({
          id: a.id,
          title: "Pending Confirmation",
          desc: `${a.full_name || "Guest"} is awaiting confirmation`,
          type: "pending",
          time: a.preferred_date || "Upcoming",
        });
      } else if (a.preferred_date === todayStr) {
        list.push({
          id: a.id,
          title: "Scheduled for Today",
          desc: `${a.full_name || "Guest"} at ${a.preferred_time || "scheduled time"}`,
          type: "today",
          time: "Today",
        });
      }
    });

    return list.slice(0, 8);
  }, [data]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const handleCreateAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.full_name || !newAppt.service) {
      toast.error("Please fill in required fields (Name and Service)");
      return;
    }

    createMut.mutate({
      full_name: newAppt.full_name,
      email: newAppt.email,
      phone: newAppt.phone,
      service: newAppt.service,
      preferred_date: newAppt.preferred_date,
      preferred_time: newAppt.preferred_time,
      notes: newAppt.notes,
      source: "Admin Panel",
      created_by: loggedInRole,
      status: "pending",
    });
  };

  const handleExportData = (format: "csv" | "json" | "txt") => {
    if (!filteredData.length) {
      toast.error("No data to export");
      return;
    }

    let content = "";
    let mimeType = "text/plain";
    let fileName = `appointments_export_${new Date().toISOString().split("T")[0]}.${format}`;

    if (format === "csv") {
      mimeType = "text/csv;charset=utf-8;";
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Service",
        "Preferred Date",
        "Status",
        "Created At",
      ];
      const rows = filteredData.map((a: any) => [
        a.id,
        `"${a.full_name || ""}"`,
        `"${a.email || ""}"`,
        `"${a.phone || ""}"`,
        `"${a.service || ""}"`,
        `"${a.preferred_date || ""}"`,
        a.status,
        a.created_at,
      ]);
      content = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    } else if (format === "json") {
      mimeType = "application/json";
      content = JSON.stringify(filteredData, null, 2);
    } else {
      content = filteredData
        .map(
          (a: any) =>
            `ID: ${a.id}\nName: ${a.full_name}\nContact: ${a.email} | ${a.phone}\nService: ${a.service}\nDate: ${a.preferred_date}\nStatus: ${a.status}\n----------------------------------`
        )
        .join("\n");
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredData.length} records as ${format.toUpperCase()}`);
    setShowExportModal(false);
  };

  // Calendar Days Calculation
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

  return (
    <div className="space-y-6 text-slate-800">
      {/* ------------------------------------------------------------------- */}
      {/* HEADER SECTION WITH FUNCTIONAL NOTIFICATION BELL & CALENDAR BTN    */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Appointments Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage and track all customer appointments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Calendar View Button */}
          <button
            onClick={() => setShowCalendarModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            Calendar View
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-xs">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {notifications.length} Unread
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        const found = data.find((item: any) => item.id === n.id);
                        if (found) setSelectedAppointment(found);
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-indigo-50/50 transition cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* METRIC SUMMARY TOP CARDS                                           */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="p-3.5 border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                Pending
              </span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {metrics.pending}
              </div>
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
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                Confirmed
              </span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {metrics.confirmed}
              </div>
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
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                Completed
              </span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {metrics.completed}
              </div>
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
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">
                Cancelled
              </span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {metrics.cancelled}
              </div>
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
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                Today's
              </span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {metrics.todayCount}
              </div>
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
      {/* CONTROL BAR: NON-SCROLLABLE STATUS TABS + SEARCH + DATE PICKER      */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Responsive Non-Scrollable Status Tabs */}
        <div className="w-full lg:w-auto grid grid-cols-5 gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full py-1.5 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold capitalize transition-all text-center truncate ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Search & Date Range Picker & Filter Menu */}
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
                filterService !== "all" || presetRange !== "all"
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
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Time Preset
                  </label>
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
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Service
                  </label>
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full rounded-md border border-slate-200 p-1.5 text-xs"
                  >
                    <option value="all">All Services</option>
                    {availableServices.map((s) => (
                      <option key={s} value={s}>
                        {s}
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
            <h2 className="text-sm font-bold text-slate-900">Today's New Appointments</h2>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              NOW
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {filteredData.length} total entries
          </span>
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
                <th className="px-3.5 py-3 whitespace-nowrap">Source & Creator</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.map((a: any, idx: number) => {
                const visitParts = formatDateTimeParts(a.preferred_date);
                const bookedParts = formatDateTimeParts(a.created_at);
                const recencyBadge = getRecencyBadge(a.created_at);
                const displayId = a.id ? `BA-${a.id.slice(0, 6)}` : `BA-000${idx + 1}`;

                return (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors align-top">
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
                          <div className="font-bold text-slate-900 leading-tight">
                            {a.full_name || "Guest"}
                          </div>
                          {a.phone && <div className="text-[11px] text-slate-500">{a.phone}</div>}
                          {a.email && <div className="text-[11px] text-slate-400">{a.email}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 max-w-[180px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 truncate">
                        <Home className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span
                          className="font-medium text-slate-800 truncate"
                          title={a.service || "General Inquiry"}
                        >
                          {a.service || "General Inquiry"}
                        </span>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{visitParts.weekday}</div>
                      <div className="text-slate-600 text-[11px]">{visitParts.dateStr}</div>
                      <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{a.preferred_time || visitParts.timeStr}</span>
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

                    {/* Dynamic Source & Created By Column */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      {(() => {
                        const { source, createdBy } = getAppointmentSourceDetails(a);
                        return (
                          <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200">
                              {source === "Sophia AI" ? (
                                <Bot className="h-3 w-3 text-purple-600" />
                              ) : source === "Admin Panel" ? (
                                <ShieldCheck className="h-3 w-3 text-indigo-600" />
                              ) : (
                                <Globe className="h-3 w-3 text-emerald-600" />
                              )}
                              <span>{source}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 pl-0.5">
                              <User className="h-2.5 w-2.5" />
                              <span>By: {createdBy}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <select
                        value={a.status}
                        onChange={(e) =>
                          update.mutate({ id: a.id, status: e.target.value as StatusType })
                        }
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
                          <option key={s} value={s} className="bg-white text-slate-800 font-normal">
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
                          onClick={() =>
                            confirm("Delete appointment?") && remove.mutate(a.id)
                          }
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
      {/* STATUS SUMMARY & ANALYTICS & QUICK ACTIONS SECTION                  */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Status Summary
          </h3>
          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 font-medium mb-1">
                <span>Pending</span>
                <span>
                  {metrics.pending} ({metrics.pendingRate}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${metrics.pendingRate}%` }}
                />
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
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${metrics.completionRate}%` }}
                />
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
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${metrics.cancellationRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Appointment Analytics
            </h3>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Total Booked
              </span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {metrics.total}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Completion Rate
              </span>
              <div className="text-base font-black text-emerald-600 mt-0.5">
                {metrics.completionRate}%
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                This Week
              </span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {metrics.weekCount}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                This Month
              </span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {metrics.monthCount}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200/90 shadow-2xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Quick Actions
          </h3>
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
      {/* MODAL 1: CALENDAR VIEW WITH MONTH / WEEK / DAY MODES               */}
      {/* ------------------------------------------------------------------- */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Appointment Calendar</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                  {(["month", "week", "day"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCalendarViewMode(m)}
                      className={`px-2 py-1 rounded-md capitalize transition ${
                        calendarViewMode === m
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between border-b border-slate-100 text-xs">
              <div className="font-bold text-slate-800 text-sm">
                {calendarCurrentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCalendarCurrentDate(
                      new Date(
                        calendarCurrentDate.getFullYear(),
                        calendarCurrentDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCalendarCurrentDate(new Date())}
                  className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Today
                </button>
                <button
                  onClick={() =>
                    setCalendarCurrentDate(
                      new Date(
                        calendarCurrentDate.getFullYear(),
                        calendarCurrentDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                  className="p-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[75vh] overflow-y-auto">
              {/* MONTH VIEW */}
              {calendarViewMode === "month" && (
                <>
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      if (!day)
                        return <div key={idx} className="h-24 bg-slate-50/40 rounded-lg" />;
                      const dateStr = day.toISOString().split("T")[0];
                      const isToday =
                        dateStr === new Date().toISOString().split("T")[0];
                      const dayAppts = data.filter((a: any) => a.preferred_date === dateStr);

                      return (
                        <div
                          key={idx}
                          className={`h-24 border rounded-xl p-1.5 flex flex-col justify-between transition-all ${
                            isToday
                              ? "bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200"
                              : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                        >
                          <span
                            className={`text-[10px] font-bold ${
                              isToday ? "text-indigo-700 font-extrabold" : "text-slate-700"
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          <div className="space-y-1 overflow-y-auto">
                            {dayAppts.map((a: any) => (
                              <div
                                key={a.id}
                                onClick={() => setSelectedAppointment(a)}
                                className="text-[9px] truncate bg-indigo-600 text-white font-medium px-1.5 py-0.5 rounded-md shadow-2xs cursor-pointer hover:bg-indigo-700 transition"
                              >
                                {a.preferred_time || "10:00 AM"} - {a.full_name}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* WEEK VIEW */}
              {calendarViewMode === "week" && (
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                    const curr = new Date(calendarCurrentDate);
                    curr.setDate(curr.getDate() - curr.getDay() + offset);
                    const dateStr = curr.toISOString().split("T")[0];
                    const dayAppts = data.filter((a: any) => a.preferred_date === dateStr);

                    return (
                      <div
                        key={offset}
                        className="flex gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 items-start"
                      >
                        <div className="w-24 shrink-0 font-bold text-xs text-slate-800">
                          {curr.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "numeric",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex-1 flex flex-wrap gap-2">
                          {dayAppts.length > 0 ? (
                            dayAppts.map((a: any) => (
                              <div
                                key={a.id}
                                onClick={() => setSelectedAppointment(a)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs cursor-pointer hover:border-indigo-400 transition"
                              >
                                <span className="font-bold text-indigo-600 mr-1.5">
                                  {a.preferred_time || "10:00 AM"}
                                </span>
                                <span className="font-medium text-slate-900">
                                  {a.full_name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              No appointments
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DAY VIEW */}
              {calendarViewMode === "day" && (
                <div className="space-y-2">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-xs text-indigo-900">
                    Appointments for{" "}
                    {calendarCurrentDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {data.filter(
                    (a: any) =>
                      a.preferred_date ===
                      calendarCurrentDate.toISOString().split("T")[0]
                  ).length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No appointments scheduled for this day.
                    </div>
                  ) : (
                    data
                      .filter(
                        (a: any) =>
                          a.preferred_date ===
                          calendarCurrentDate.toISOString().split("T")[0]
                      )
                      .map((a: any) => (
                        <div
                          key={a.id}
                          onClick={() => setSelectedAppointment(a)}
                          className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between cursor-pointer hover:border-indigo-500 transition"
                        >
                          <div>
                            <span className="text-xs font-bold text-indigo-600 block">
                              {a.preferred_time || "10:00 AM"}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {a.full_name}
                            </span>
                            <span className="text-xs text-slate-500 block">{a.service}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {a.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 2: ADD NEW APPOINTMENT                                       */}
      {/* ------------------------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Add New Appointment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAppointmentSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAppt.full_name}
                  onChange={(e) => setNewAppt({ ...newAppt, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
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
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newAppt.phone}
                    onChange={(e) => setNewAppt({ ...newAppt, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Searchable Service Dropdown */}
              <div className="relative">
                <label className="block font-bold text-slate-600 mb-1">
                  Service Requested *
                </label>
                <div
                  onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white cursor-pointer flex justify-between items-center"
                >
                  <span
                    className={
                      newAppt.service ? "text-slate-900 font-medium" : "text-slate-400"
                    }
                  >
                    {newAppt.service || "Select a service..."}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 rotate-90" />
                </div>

                {isServiceDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Search service..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded-md text-xs mb-1 outline-none"
                    />
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100">
                      {filteredServicesList.map((service) => (
                        <div
                          key={service}
                          onClick={() => {
                            setNewAppt({ ...newAppt, service });
                            setIsServiceDropdownOpen(false);
                          }}
                          className="p-1.5 hover:bg-indigo-50 rounded cursor-pointer font-medium text-slate-800"
                        >
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={newAppt.preferred_date}
                    onChange={(e) =>
                      setNewAppt({ ...newAppt, preferred_date: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Preferred Time
                  </label>
                  <input
                    type="text"
                    value={newAppt.preferred_time}
                    onChange={(e) =>
                      setNewAppt({ ...newAppt, preferred_time: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-2xs disabled:opacity-50"
                >
                  {createMut.isPending ? "Saving..." : "Save Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 3: EXPORT APPOINTMENTS                                       */}
      {/* ------------------------------------------------------------------- */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                Export Filtered Appointments
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Time Horizon</label>
                <select
                  value={exportDateRange}
                  onChange={(e) => setExportDateRange(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white outline-none"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today Only</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExportData("csv")}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 transition"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>CSV / Excel</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 transition"
                >
                  <Printer className="h-4 w-4 text-indigo-600" />
                  <span>Print / PDF</span>
                </button>
              </div>
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
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">Customer Name</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedAppointment.full_name}
                  </p>
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
                  <p className="font-semibold text-slate-800">
                    {selectedAppointment.service || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Preferred Date</span>
                  <p className="font-semibold text-slate-800">
                    {selectedAppointment.preferred_date || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
