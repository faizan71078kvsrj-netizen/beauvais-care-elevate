import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/admin/api.functions";
import { YDC } from "@/lib/admin/branding";
import {
  LayoutDashboard, CalendarClock, MessageSquare, Users, Contact, FileText,
  Bot, ScrollText, Settings, LogOut, ShieldCheck, Menu, X, Building2, BarChart3,
} from "lucide-react";

type Me = { userId: string; profile: any; roles: string[] } | null;

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; adminOnly?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarClock },
  { to: "/admin/contacts", label: "Contact Forms", icon: MessageSquare },
  { to: "/admin/leads", label: "Leads", icon: BarChart3 },
  { to: "/admin/customers", label: "Customers", icon: Contact },
  { to: "/admin/documents", label: "Documents", icon: FileText },
  { to: "/admin/ai-chat", label: "AI Chats", icon: Bot },
  { to: "/admin/users", label: "Users & Roles", icon: Users, adminOnly: true },
  { to: "/admin/audit", label: "Audit Logs", icon: ScrollText, adminOnly: true },
  { to: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function AdminGate({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (alive) navigate({ to: "/admin/login" });
        return;
      }
      try {
        const result = await getMe();
        if (!alive) return;
        if (!result.roles.length) {
          setStatus("denied");
          return;
        }
        setMe(result);
        setStatus("ok");
      } catch {
        if (alive) navigate({ to: "/admin/login" });
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/admin/login" });
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  if (status === "loading") return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500 text-sm">Loading admin…</div>;
  if (status === "denied") return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-6 text-center">
      <div className="max-w-md">
        <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
        <h1 className="mt-4 text-lg font-semibold text-slate-900">No admin access</h1>
        <p className="mt-2 text-sm text-slate-500">Your account isn't assigned to any admin role. Contact your Super Admin.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return <AdminShell me={me!}>{children}</AdminShell>;
}

function AdminShell({ me, children }: { me: NonNullable<Me>; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isAdmin = me.roles.includes("admin") || me.roles.includes("super_admin");
  const isSuper = me.roles.includes("super_admin");
  const roleLabel = me.roles.includes("super_admin") ? "Super Admin" :
    me.roles.includes("admin") ? "Admin" :
    me.roles.includes("staff") ? "Staff" : "Receptionist";

  const nav = NAV.filter((n) => !n.adminOnly || isAdmin);
  const active = (to: string, exact?: boolean) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 px-5 border-b border-slate-800">
          {/* YDC Logo placeholder — upload via Settings → Branding */}
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-sky-500 to-emerald-400 grid place-items-center text-white font-bold">Y</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">YDC Admin</div>
            <div className="text-[10px] text-slate-400">v{YDC.version}</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-400" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-3 space-y-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition ${
                active(n.to, "exact" in n && n.exact) ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2"><Building2 className="h-3 w-3" /> {YDC.tagline}</div>
          <div className="mt-1">{YDC.copyright}</div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button className="lg:hidden text-slate-600" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
            <div className="text-sm text-slate-500">Beauvais Group · Admin</div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium text-slate-900">{me.profile?.full_name ?? me.profile?.email}</div>
                <div className="text-[11px] text-slate-500">{roleLabel}{isSuper && me.profile?.is_protected ? " · YDC" : ""}</div>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
        <footer className="px-6 py-6 text-center text-[11px] text-slate-500">
          {YDC.tagline} · System status: <span className="text-emerald-600 font-medium">{YDC.status}</span> · v{YDC.version}
        </footer>
      </div>
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}
