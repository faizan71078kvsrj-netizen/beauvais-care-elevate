import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Search,
  Bell,
  CalendarPlus,
  UserPlus,
  CalendarRange,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Briefcase,
  Loader2,
  ChevronDown,
  User,
  Settings as EditIcon,
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X
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
  Completed: "#10b981", // Emerald-500
  Pending: "#3b82f6",   // Blue-500
  Cancelled: "#ef4444", // Red-500
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // User Profile & Menu State
  const [userProfile, setUserProfile] = useState<{ id: string; fullName: string; role: string; email: string; avatarUrl: string | null }>({
    id: "",
    fullName: "User",
    role: "Staff",
    email: "",
    avatarUrl: null
  });
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Live Statistics
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todaysAppointmentsCount: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalLeads: 0,
    conversionRate: 0,
  });

  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; count: number }>>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<Array<{ name: string; count: number }>>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch Auth User & Profile
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, role, avatar_url")
            .eq("id", authUser.user.id)
            .maybeSingle();

          if (isMounted) {
            setUserProfile({
              id: authUser.user.id,
              fullName: profile?.full_name || authUser.user.user_metadata?.full_name || authUser.user.email?.split("@")[0] || "User",
              role: profile?.role || "Staff",
              email: authUser.user.email || "",
              avatarUrl: profile?.avatar_url || null
            });
            setEditFullName(profile?.full_name || authUser.user.user_metadata?.full_name || authUser.user.email?.split("@")[0] || "User");
          }
        }

        // 2. Fetch Live Appointments, Leads, Notifications & Services Data
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
          { data: notificationsData }
        ] = await Promise.all([
          supabase.from("appointments").select("*", { count: "exact", head: true }),
          supabase.from("appointments").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()).lte("created_at", todayEnd.toISOString()),
          supabase.from("leads").select("*", { count: "exact", head: true }),
          supabase.from("appointments").select("id, status, created_at, service_type"),
          supabase.from("appointments").select("id, client_name, appointment_time, status, phone_number").gte("appointment_time", todayStart.toISOString()).order("appointment_time", { ascending: true }).limit(5),
          supabase.from("leads").select("id, name, email, phone, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("appointments").select("service_type"),
          supabase.from("notifications").select("id, title, message, created_at, read").order("created_at", { ascending: false }).limit(5)
        ]);

        // Calculate Detailed Status Counts
        let completed = 0;
        let pending = 0;
        let cancelled = 0;

        const daysMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        if (allAppts) {
          allAppts.forEach((a: any) => {
            const st = (a.status || "").toLowerCase();
            if (st === "completed" || st === "confirmed") completed++;
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
        const convRate = apptCount > 0 ? ((completed / apptCount) * 100).toFixed(1) : "0.0";

        const chartWeekly = [
          { day: "Mon", count: daysMap["Mon"] },
          { day: "Tue", count: daysMap["Tue"] },
          { day: "Wed", count: daysMap["Wed"] },
          { day: "Thu", count: daysMap["Thu"] },
          { day: "Fri", count: daysMap["Fri"] },
          { day: "Sat", count: daysMap["Sat"] },
          { day: "Sun", count: daysMap["Sun"] },
        ];

        // Service booking aggregations
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

        // Build Activity Feed from live DB actions
        const activities: any[] = [];
        if (upcomingApptsData && upcomingApptsData.length > 0) {
          upcomingApptsData.slice(0, 2).forEach((a: any) => {
            activities.push({
              id: `appt-${a.id}`,
              type: "Appointment Booked",
              details: `Appointment booked for ${a.client_name || "Client"}`,
              time: a.appointment_time ? new Date(a.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
              badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
            });
          });
        }
        if (recentLeadsData && recentLeadsData.length > 0) {
          recentLeadsData.slice(0, 2).forEach((l: any) => {
            activities.push({
              id: `lead-${l.id}`,
              type: "Lead Created",
              details: `New lead created: ${l.name || "Prospect"}`,
              time: l.created_at ? new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
              badgeColor: "bg-sky-50 text-sky-700 border-sky-200"
            });
          });
        }

        if (isMounted) {
          setStats({
            totalAppointments: apptCount,
            todaysAppointmentsCount: todayAppts || 0,
            pendingAppointments: pending,
            completedAppointments: completed,
            cancelledAppointments: cancelled,
            totalLeads: leadsCount,
            conversionRate: Number(convRate),
          });
          setWeeklyData(chartWeekly);
          setUpcomingAppointments(upcomingApptsData || []);
          setRecentLeads(recentLeadsData || []);
          setTopServices(sortedServices);
          setRecentActivities(activities);
          setNotifications(notificationsData || []);
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
      { name: "Completed", value: stats.completedAppointments },
      { name: "Pending", value: stats.pendingAppointments },
      { name: "Cancelled", value: stats.cancelledAppointments },
    ].filter(item => item.value > 0);
  }, [stats]);

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile.id) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userProfile.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { uppercase: false, overwrite: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userProfile.id);

      setUserProfile((prev) => ({ ...prev, avatarUrl }));
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  const saveProfileDetails = async () => {
    if (!userProfile.id || !editFullName.trim()) return;
    setSavingProfile(true);
    try {
      await supabase
        .from('profiles')
        .update({ full_name: editFullName.trim() })
        .eq('id', userProfile.id);
      
      setUserProfile((prev) => ({ ...prev, fullName: editFullName.trim() }));
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSavingProfile(false);
    }
  };

  const openProfile = (edit = false) => {
    setIsEditMode(edit);
    setEditFullName(userProfile.fullName);
    setIsProfileModalOpen(true);
    setProfileDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full h-[70vh] grid place-items-center bg-transparent">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-sky-600" /> Syncing Dashboard Analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8 space-y-6 text-slate-800 bg-[#F8FAFC]">
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-800">{userProfile.fullName}</span> 👋
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden sm:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search appointments, leads..."
              className="w-full pl-9 pr-12 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Ctrl + K
            </span>
          </div>

          {/* Date Picker Display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className="relative p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition"
            >
              <Bell className="h-4 w-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-sky-600 font-semibold">{notifications.length} Alerts</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2 bg-slate-50 rounded border text-xs space-y-0.5">
                        <div className="font-semibold text-slate-800">{n.title || "Notification"}</div>
                        <div className="text-[11px] text-slate-500">{n.message || "System update alert."}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-4">No recent notifications.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 pl-2 border-l border-slate-200 focus:outline-none"
            >
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-200" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 text-white font-bold text-xs grid place-items-center shadow-sm">
                  {userProfile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{userProfile.fullName}</div>
                <div className="text-[10px] text-slate-500 capitalize">{userProfile.role}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden lg:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 text-xs space-y-1">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{userProfile.fullName}</div>
                  <div className="text-[10px] text-slate-400">{userProfile.email}</div>
                </div>

                <button onClick={() => openProfile(false)} className="w-full text-left flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>My Profile</span>
                </button>

                <button onClick={() => openProfile(true)} className="w-full text-left flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50">
                  <EditIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>Edit Profile</span>
                </button>

                <label className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <Camera className="h-3.5 w-3.5 text-slate-500" />
                  <span>Upload Picture</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>

                <div className="border-t border-slate-100 my-1"></div>

                <button onClick={handleSignOut} className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal Overlay */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">{isEditMode ? "Edit Profile" : "My Profile"}</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  {userProfile.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-sm border-4 border-white" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 text-white font-bold text-2xl flex items-center justify-center shadow-sm border-4 border-white">
                      {userProfile.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isEditMode && (
                    <label className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition">
                      <Camera className="h-6 w-6" />
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  )}
                </div>
                {!isEditMode && (
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900">{userProfile.fullName}</h3>
                    <p className="text-xs text-slate-500">{userProfile.email}</p>
                    <span className="mt-2 inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                      {userProfile.role}
                    </span>
                  </div>
                )}
              </div>

              {isEditMode && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Email (Read Only)</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      disabled
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </div>

            {isEditMode && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfileDetails}
                  disabled={savingProfile || !editFullName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProfile ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            )}
            {!isEditMode && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Total Appointments</span>
            <div className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
              <TrendingUp className="h-3 w-3" />
              <span>Live Database</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Today's Appointments</span>
            <div className="text-2xl font-bold text-slate-900">{stats.todaysAppointmentsCount}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
              <Clock className="h-3 w-3" />
              <span>Scheduled today</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Total Leads</span>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
              <Users className="h-3 w-3" />
              <span>Live Database</span>
            </div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Conversion Rate</span>
            <div className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-1">
              <BarChart3 className="h-3 w-3" />
              <span>Completed Ratio</span>
            </div>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Detailed Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-medium text-slate-500">Completed</p>
              <p className="text-lg font-bold text-slate-900">{stats.completedAppointments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><AlertCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pending</p>
              <p className="text-lg font-bold text-slate-900">{stats.pendingAppointments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg"><XCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-medium text-slate-500">Cancelled</p>
              <p className="text-lg font-bold text-slate-900">{stats.cancelledAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Analytics Section (Charts & Upcoming Appointments) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointments Weekly Line Chart */}
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

        {/* Appointment Status Donut Chart */}
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

        {/* 4. Upcoming Appointments */}
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
                <span>No appointments scheduled for today.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Bottom Grid: Recent Leads, Top Services & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Leads / Contacts */}
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
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-8">No recent leads registered.</div>
            )}
          </div>
        </div>

        {/* Top Services */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Top Services</h3>
            <span className="text-[11px] font-medium text-slate-400">By Bookings</span>
          </div>

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

        {/* Quick Actions */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-3">
            {/* New Appointment */}
            <button
              onClick={() => navigate({ to: "/admin/appointments" })}
              className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-sky-50 hover:border-sky-200 transition group text-center"
            >
              <div className="p-2 bg-white rounded-lg text-sky-600 shadow-sm mb-1.5 group-hover:scale-105 transition">
                <CalendarPlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">New Appointment</span>
            </button>

            {/* Add Lead */}
            <button
              onClick={() => navigate({ to: "/admin/contacts" })}
              className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition group text-center"
            >
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm mb-1.5 group-hover:scale-105 transition">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">Add Lead</span>
            </button>

            {/* Open Calendar */}
            <button
              onClick={() => navigate({ to: "/admin/calendar" })}
              className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition group text-center"
            >
              <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm mb-1.5 group-hover:scale-105 transition">
                <CalendarRange className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">Open Calendar</span>
            </button>

            {/* View Reports */}
            <button
              onClick={() => navigate({ to: "/admin/reports" })}
              className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition group text-center"
            >
              <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm mb-1.5 group-hover:scale-105 transition">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
