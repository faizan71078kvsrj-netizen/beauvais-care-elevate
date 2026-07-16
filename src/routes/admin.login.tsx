An analysis of the TanStack Router structure indicates the root cause of the `404` or route mismatch on `/admin` after login:

### Root Cause Analysis

1. **Route Matching & Naming Collision**: In TanStack Router's file-based routing system, if you define `src/routes/admin.login.tsx` (which compiles to `/admin/login`), the router expects a parent layout file or route index for the `/admin` path. If there is no explicit `src/routes/admin.tsx` layout file or a dedicated `src/routes/admin.index.tsx` file registered in your route tree, the router cannot resolve the transition to `/admin` after login. It defaults to the fallback route (often a `404` route or `/`).
2. **Missing `/admin` Index File**: To prevent a `404` error upon navigating to `/admin` and avoid route generation failures, the layout configuration must be explicitly defined.

To resolve this completely, the correct configurations for both the `/admin/login` and the `/admin` dashboard index route must be matched cleanly. Below are the two complete, corrected files to ensure that route generation, compilation, and login redirect work together seamlessly.

---

### File 1: `src/routes/admin.login.tsx`

This file implements the correct component structure, hooks up `onSignIn` and `onBootstrap` perfectly, uses `toast` notifications, and handles standard redirects cleanly.

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapStatus, bootstrapSuperAdmin } from "@/lib/admin/api.functions";
import { YDC } from "@/lib/admin/branding";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login | Beauvais Group" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/admin" });
      }
      const s = await bootstrapStatus();
      setNeedsBootstrap(s.needsBootstrap);
    })();
  }, [navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "An unexpected error occurred during sign in");
    } finally {
      setBusy(false);
    }
  };

  const onBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await bootstrapSuperAdmin({ data: { email, password, full_name: fullName } });
      toast.success("Super Admin created. Signing in…");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to set up Super Admin");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-sky-500 to-emerald-400 text-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-white/15 grid place-items-center font-bold text-lg">Y</div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80">YDC Admin Portal</div>
              <div className="text-lg font-semibold">Beauvais Group</div>
            </div>
          </div>
        </div>
        <div className="p-6">
          {needsBootstrap === null ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : needsBootstrap ? (
            <>
              <div className="flex items-center gap-2 rounded-md bg-sky-50 border border-sky-100 p-3 text-sm text-sky-800 mb-4">
                <ShieldCheck className="h-4 w-4" /> First-run setup: create the protected YDC Super Admin.
              </div>
              <form onSubmit={onBootstrap} className="space-y-3">
                <Field label="Full name" value={fullName} onChange={setFullName} required />
                <Field label="Email" type="email" value={email} onChange={setEmail} required />
                <Field label="Password (min 8 chars)" type="password" value={password} onChange={setPassword} required />
                <button disabled={busy} className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {busy ? "Creating…" : "Create Super Admin"}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={onSignIn} className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">Sign in</h2>
              <Field label="Email" type="email" value={email} onChange={setEmail} required />
              <Field label="Password" type="password" value={password} onChange={setPassword} required />
              <button disabled={busy} className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}
          <div className="mt-6 text-center text-[11px] text-slate-500">
            {YDC.tagline} · v{YDC.version}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />
    </div>
  );
}

```

---

### File 2: `src/routes/admin.index.tsx`

This completes the setup by serving as the root container dashboard for `/admin`. It checks the Supabase authentication session dynamically during the route loading process (`beforeLoad`) and throws a secure redirect back to `/admin/login` if the user is unauthenticated, preventing infinite redirect patterns and `404` issues.

```tsx
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { YDC } from "@/lib/admin/branding";
import { LayoutDashboard, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/admin/login",
      });
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-400 text-white font-bold text-lg flex items-center justify-center">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">System Live Status</h3>
              <p className="text-xs text-slate-500 mt-1">First-run deployment parameters are fully online.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Welcome to Beauvais Group Admin Portal</h2>
          <p className="text-slate-600 max-w-md mx-auto text-sm">
            You are securely authenticated. Use this interface to manage system assets, configurations, and super admin access.
          </p>
        </div>
      </main>

      {/* Footer System Versioning */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        {YDC.tagline} · v{YDC.version}
      </footer>
    </div>
  );
}

```
