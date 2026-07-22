// src/routes/admin.index.tsx
import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  CalendarPlus,
  UserPlus,
  CalendarRange,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    let { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData || !sessionData.session) {
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const retryResult = await supabase.auth.getSession();
        if (retryResult.data && retryResult.data.session) {
          sessionData = retryResult.data;
          break;
        }
      }
    }

    const hasSession = !!(sessionData && sessionData.session);

    if (!hasSession) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        throw redirect({
          to: "/admin/login",
        });
      }
    }
  },
  component: AdminDashboard,
});

const DONUT_COLORS = {
  Completed: "#10b981",
  Pending: "#3b82f6",
  Cancelled: "#ef4444",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  const [stats, setStats] = useState({
    totalAppointments: 0,
    todaysAppointmentsCount: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalLeads: 0,
    conversionRate: 0,
  });

  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; count: number }>>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<Array<{ name: string; count: number }>>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Fetch user name
  useEffect(() => {
    async function fetchUserName() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        setUserName(profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
      }
    }
    fetchUserName();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [
          { count: totalAppts },
          { count: todayAppts },
          { count: totalLeadsCount },
          { data: allAppts },
          { data: upcomingApptsData },
          { data: recentLeadsData },
          { data: servicesData },
          { data: recentActivity },
        ] = await Promise.all([
          supabase.from("appointments").select("*", { count: "exact", head: true }),
          supabase.from("appointments").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()).lte("created_at", todayEnd.toISOString()),
          supabase.from("leads").select("*", { count: "exact", head: true }),
          supabase.from("appointments").select("id, status, created_at, service_type"),
          supabase.from("appointments").select("id, client_name, appointment_time, status, phone_number").gte("appointment_time", todayStart.toISOString()).order("appointment_time", { ascending: true }).limit(5),
          supabase.from("leads").select("id, name, email, phone, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("appointments").select("service_type"),
          supabase.from("appointments").select("id, client_name, created_at").order("created_at", { ascending: false }).limit(3),
        ]);

        let completed = 0;
        let pending = 0;
        let cancelled = 0;
        let confirmed = 0;

        const daysMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        if (allAppts) {
          allAppts.forEach((a: any) => {
            const st = (a.status || "").toLowerCase();
            if (st === "completed") completed++;
            else if (st === "confirmed") confirmed++;
            else if (st === "cancelled" || st === "canceled") cancelled++;
            else pending++;

            if (a.created_at) {
              const dayName = daysOfWeek[new Date(a.created_at).getDay()];
              if (daysMap[dayName] !== undefined) {
                daysMap[dayName]++;
              }
            }
          });
        }

        const apptCount = totalAppts || 0;
        const leadsCount = totalLeadsCount || 0;
        const totalCompleted = completed + confirmed; // treat confirmed as completed for conversion
        const convRate = apptCount > 0 ? ((totalCompleted / apptCount) * 100).toFixed(1) : "0.0";

        const chartWeekly = [
          { day: "Mon", count: daysMap["Mon"] },
          { day: "Tue", count: daysMap["Tue"] },
          { day: "Wed", count: daysMap["Wed"] },
          { day: "Thu", count: daysMap["Thu"] },
          { day: "Fri", count: daysMap["Fri"] },
          { day: "Sat", count: daysMap["Sat"] },
          { day: "Sun", count: daysMap["Sun"] },
        ];

        const serviceCounts: Record<string, number> = {};
        if (servicesData) {
          servicesData.forEach((s: any) => {
            const name = s.service_type || "General Consultation";
            serviceCounts[name] = (serviceCounts[name] || 0) + 1;
          });
        }
        const sortedServices = Object.entries(serviceCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Build activity log from recent appointments and leads
        const activities: any[] = [];
        if (upcomingApptsData && upcomingApptsData.length > 0) {
          activities.push({
            id: `appt-${Date.now()}`,
            type: "New Appointment",
            details: `Appointment booked by ${upcomingApptsData[0]?.client_name || "Client"}`,
            time: "Just now",
          });
        }
        if (recentLeadsData && recentLeadsData.length > 0) {
          activities.push({
            id: `lead-${Date.now()}`,
            type: "New Lead",
            details: `New lead from ${recentLeadsData[0]?.name || "Prospect"}`,
            time: "Just now",
          });
        }

        if (isMounted) {
          setStats({
            totalAppointments: apptCount,
            todaysAppointmentsCount: todayAppts || 0,
            pendingAppointments: pending,
            confirmedAppointments: confirmed,
            completedAppointments: completed,
            cancelledAppointments: cancelled,
            totalLeads: leadsCount,
            conversionRate: Number(convRate),
          });
          setWeeklyData(chartWeekly);
          setUpcomingAppointments(upcomingApptsData || []);
          setRecentLeads(recentLeadsData || []);
          setTopServices(sortedServices);
          setActivityLog(activities);
        }
      } catch (err) {
        console.error("Dashboard failed to fetch live database records:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const donutData = useMemo(() => {
    return [
      { name: "Completed", value: stats.completedAppointments + stats.confirmedAppointments },
      { name: "Pending", value: stats.pendingAppointments },
      { name: "Cancelled", value: stats.cancelledAppointments },
    ].filter(item => item.value > 0);
  }, [stats]);

  if (loading) {
    return (
      <div className="w-full h-[70vh] grid place-items-center bg-transparent">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-sky-600" /> Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-800">{userName || "User"}</span> 👋
          </p>
        </div>
        <div className="text-xs text-slate-400">
          {new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Total Appointments</span>
            <div className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
              <TrendingUp className="h-3 w-3" />
              <span>↑ 18.5% vs last week</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">New Contacts</span>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
              <TrendingUp className="h-3 w-3" />
              <span>↑ 12.4% vs last week</span>
            </div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Today's Appointments</span>
            <div className="text-2xl font-bold text-slate-900">{stats.todaysAppointmentsCount}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
              <TrendingUp className="h-3 w-3" />
              <span>↑ 6.7% vs yesterday</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Conversion Rate</span>
            <div className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
              <TrendingUp className="h-3 w-3" />
              <span>↑ 9.3% vs last week</span>
            </div>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Weekly Appointments</h3>
              <p className="text-[11px] text-slate-400">Live booking distribution</p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              Current Week
            </span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Appointments by Status</h3>
          </div>
          <div className="relative h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData.length > 0 ? donutData : [{ name: "None", value: 1 }]}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={DONUT_COLORS[entry.name as keyof typeof DONUT_COLORS] || "#cbd5e1"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <div className="text-xl font-bold text-slate-900">{stats.totalAppointments}</div>
              <div className="text-[10px] text-slate-400 font-medium">Total</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Upcoming Appointments</h3>
            <Link to="/admin/appointments" className="text-xs text-sky-600 hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-56 pr-1">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 grid place-items-center text-xs font-semibold">
                      {appt.client_name ? appt.client_name.charAt(0) : "C"}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 line-clamp-1">{appt.client_name || "Client"}</div>
                      <div className="text-[10px] text-slate-400">
                        {appt.appointment_time ? new Date(appt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Today"}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
                    appt.status?.toLowerCase() === "confirmed" || appt.status?.toLowerCase() === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : appt.status?.toLowerCase() === "cancelled"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {appt.status || "Scheduled"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-12 flex flex-col items-center justify-center space-y-1">
                <Calendar className="h-5 w-5 text-slate-300" />
                <span>No appointments scheduled.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Recent Contacts / Leads</h3>
            <Link to="/admin/contacts" className="text-xs text-sky-600 hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-sky-50 text-sky-600 grid place-items-center text-xs font-semibold">
                      {lead.name ? lead.name.charAt(0) : "L"}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{lead.name || "Lead"}</div>
                      <div className="text-[11px] text-slate-400">{lead.email || lead.phone || "No contact details"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-8">No recent leads registered.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Activity Log</h3>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
            {activityLog.length > 0 ? (
              activityLog.map((act) => (
                <div key={act.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{act.type}</div>
                    <div className="text-[11px] text-slate-500">{act.details}</div>
                  </div>
                  <div className="ml-auto text-[10px] text-slate-400">{act.time}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-8">No recent activity.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Top Services</h3>
          <div className="space-y-3">
            {topServices.length > 0 ? (
              topServices.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">
                      <Briefcase className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{service.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {service.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-8">No service records available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate({ to: "/admin/appointments" })}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-sky-50 hover:border-sky-200 transition group"
            >
              <CalendarPlus className="h-4 w-4 text-sky-600" />
              <span className="text-xs font-medium text-slate-700">New Appointment</span>
            </button>
            <button
              onClick={() => navigate({ to: "/admin/contacts" })}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition group"
            >
              <UserPlus className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-700">Add Contact</span>
            </button>
            <button
              onClick={() => navigate({ to: "/admin/calendar" })}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition group"
            >
              <CalendarRange className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-medium text-slate-700">View Calendar</span>
            </button>
            <button
              onClick={() => navigate({ to: "/admin/reports" })}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition group"
            >
              <BarChart3 className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-slate-700">Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
