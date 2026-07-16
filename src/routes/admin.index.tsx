import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { YDC } from "@/lib/admin/branding";
import {
  LayoutDashboard,
  LogOut,
  Loader2,
  Users,
  Target,
  Contact,
  FileText,
  Calendar,
  Settings,
  ArrowUpRight
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    console.log("[Admin Guard] 1. Evaluating beforeLoad route guard rules for '/admin'...");
    
    // Check cached session
    let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("[Admin Guard] Session check query returned an error:", sessionError);
    }
    
    // Fallback: If getSession is momentarily empty due to async lag, poll up to 3 times to prevent route guard rejection
    if (!sessionData || !sessionData.session) {
      console.log("[Admin Guard] Direct session cache empty. Retrying verification to prevent timing race conditions...");
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const retryResult = await supabase.auth.getSession();
        if (retryResult.data && retryResult.data.session) {
          sessionData = retryResult.data;
          console.log(`[Admin Guard] Session recovered on attempt #${i + 1}`);
          break;
        }
      }
    }

    const hasSession = !!(sessionData && sessionData.session);
    console.log("[Admin Guard] Local session verification result:", hasSession);

    // If local session cache isn't built yet, fall back directly to authenticating user context
    if (!hasSession) {
      console.log("[Admin Guard] Session cache empty. Retrieving fresh system user context from client...");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.warn("[Admin Guard] Failed to find authenticated user:", userError.message);
      }

      if (!userData || !userData.user) {
        console.warn("[Admin Guard] Access Blocked: No session or user match. Redirecting user back to /admin/login.");
        throw redirect({
          to: "/admin/login",
        });
      }
      
      console.log("[Admin Guard] Access Allowed: Fresh user verification succeeded.", userData.user.email);
    } else {
      console.log("[Admin Guard] Access Allowed: Existing session verification succeeded.", sessionData.session.user.email);
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    usersCount: 0,
    leadsCount: 0,
    contactsCount: 0,
    documentsCount: 0,
    appointmentsCount: 0,
    loading: true,
  });

  useEffect(() => {
    console.log("[Dashboard Render] Verifying authenticated state inside component lifecycle...");
    let active = true;
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("[Dashboard Render] Error querying active session inside dashboard mount:", error);
      }

      if (!data || !data.session) {
        console.warn("[Dashboard Render] Verification failure: No current session. Enforcing redirect to login.");
        window.location.href = "/admin/login";
        return;
      }

      if (!active) return;
      console.log("[Dashboard Render] Session validated successfully inside component layout.");
      
      // Load metric counts safely from Supabase checking table/view existence or fallback smoothly
      try {
        const [usersRes, leadsRes, contactsRes, documentsRes, appointmentsRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).limit(1),
          supabase.from("leads").select("*", { count: "exact", head: true }).limit(1),
          supabase.from("contacts").select("*", { count: "exact", head: true }).limit(1),
          supabase.from("documents").select("*", { count: "exact", head: true }).limit(1),
          supabase.from("appointments").select("*", { count: "exact", head: true }).limit(1),
        ]);

        if (active) {
          setStats({
            usersCount: usersRes.count || 0,
            leadsCount: leadsRes.count || 0,
            contactsCount: contactsRes.count || 0,
            documentsCount: documentsRes.count || 0,
            appointmentsCount: appointmentsRes.count || 0,
            loading: false,
          });
        }
      } catch (e) {
        console.warn("[Dashboard Metrics] Failed to fetch live metric counts:", e);
        if (active) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("[Dashboard Auth Listener] State event triggered:", event);
        if (event === "SIGNED_OUT" || !session) {
          console.log("[Dashboard Auth Listener] User signed out. Relocating layout...");
          window.location.href = "/admin/login";
        }
      });

      authListenerSubscription = authListener.subscription;
      if (active) {
        setCheckingAuth(false);
      }
    };
    
    checkUser();

    return () => {
      active = false;
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    console.log("[Dashboard UI] User initiated Sign Out sequence...");
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="h-5 w-5 animate-spin" /> Verifying Session...
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      title: "User Management",
      description: "Manage system administrators, profiles, and roles.",
      href: "/admin/users" as const,
      icon: Users,
      count: stats.usersCount,
      bgLight: "bg-blue-50 text-blue-600",
    },
    {
      title: "Leads",
      description: "Track sales pipelines, prospects, and deal sizes.",
      href: "/admin/leads" as const,
      icon: Target,
      count: stats.leadsCount,
      bgLight: "bg-amber-50 text-amber-600",
    },
    {
      title: "Contacts",
      description: "Directory of client contacts, communication history.",
      href: "/admin/contacts" as const,
      icon: Contact,
      count: stats.contactsCount,
      bgLight: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Documents",
      description: "Manage files, uploaded agreements, and asset records.",
      href: "/admin/documents" as const,
      icon: FileText,
      count: stats.documentsCount,
      bgLight: "bg-violet-50 text-violet-600",
    },
    {
      title: "Appointments",
      description: "Configure scheduling, meetings, and bookings.",
      href: "/admin/appointments" as const,
      icon: Calendar,
      count: stats.appointmentsCount,
      bgLight: "bg-rose-50 text-rose-600",
    },
    {
      title: "System Settings",
      description: "Configure site behavior, API details, and defaults.",
      href: "/admin/settings" as const,
      icon: Settings,
      count: null,
      bgLight: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-400 text-white font-bold text-lg flex items-center justify-center shadow-sm">
            Y
          </div>
          <div>
            <h1 className="text-md font-semibold text-slate-950">YDC Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Beauvais Group Admin Management</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-rose-600 transition text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </header>

      {/* Main Workspace Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-950">Welcome Back</h2>
            <p className="text-slate-600 max-w-xl text-sm">
              You are securely authenticated. Manage global metrics, workflows, appointments, documents, and system configurations below.
            </p>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-100 text-left shrink-0">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-md">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">System Live Status</div>
              <div className="text-[11px] text-slate-500">All deployment services active.</div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Modules & Navigation</h3>
          <span className="text-xs text-slate-500 font-medium">Select a system sector to manage</span>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden"
              >
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${item.bgLight} transition-colors`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-slate-900 transition-colors">
                      Go to module
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer status bar inside cards */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Current Metric:</span>
                  {stats.loading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  ) : item.count !== null ? (
                    <span className="font-semibold text-slate-800 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      {item.count} Record{item.count !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-slate-400">System Ready</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer System Versioning */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        {YDC.tagline} · v{YDC.version}
      </footer>
    </div>
  );
}
