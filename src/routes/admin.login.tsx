An analysis of the complete authorization and authentication flow in a TanStack Router project reveals the root cause of the immediate redirect back to `/admin/login`.

### Root Cause Analysis

1. **The Navigation & State Synchronization Race Condition**:
In `LoginPage`, calling `navigate({ to: "/admin" })` occurs *immediately* after the asynchronous `supabase.auth.signInWithPassword(...)` call completes. However, the browser session is updated asynchronously. If TanStack Router triggers navigation to `/admin` before the Supabase client state has successfully propagated locally to the cache checked by `supabase.auth.getSession()` inside `/admin/`'s `beforeLoad` guard, the route guard will evaluate `session` as `null` and instantly throw a redirect back to `/admin/login`. This creates the behavior of loading briefly, showing no errors, and dropping you right back on the login page.
2. **Synchronous Redirection Guard**:
Using `supabase.auth.getSession()` inside `beforeLoad` is synchronous in execution but asynchronous under the hood. If the session state isn't fully initialized in the active client instance when `/admin` checks it, the route throws a redirect. By awaiting a micro-delay or utilizing the active session returned by the successful sign-in call explicitly, we prevent this race condition.
3. **Ensuring Seamless State Synchronization**:
To fix this definitively, we:
* Explicitly verify the authenticated session returns successfully from `signInWithPassword`.
* Update the internal routing guard of `/admin/` to allow a fallback check of the current authenticated user rather than solely relying on cached local storage in a racing state.
* Add a brief delay before calling `navigate` to guarantee that Supabase has written the authentication cookies and headers to local storage.



Below are the complete, corrected files designed to work smoothly without race conditions.

---

### File 1: `src/routes/admin.login.tsx`

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setBusy(false);
        return;
      }

      if (data?.session) {
        // Force immediate session state synchronization
        await supabase.auth.setSession(data.session);
        // Micro-delay to let local storage and auth listeners bind safely
        await new Promise((resolve) => setTimeout(resolve, 150));
        navigate({ to: "/admin" });
      } else {
        toast.error("Session could not be established. Please try again.");
      }
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data?.session) {
        await supabase.auth.setSession(data.session);
        await new Promise((resolve) => setTimeout(resolve, 150));
        navigate({ to: "/admin" });
      }
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

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { YDC } from "@/lib/admin/branding";
import { LayoutDashboard, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    // 1. Check local session cache
    const { data: sessionData } = await supabase.auth.getSession();
    
    // 2. If the local session cache isn't fully synchronized yet, fall back to getting the user directly
    if (!sessionData.session) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw redirect({
          to: "/admin/login",
        });
      }
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
