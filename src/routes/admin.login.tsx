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
      console.log("[Login Page] Checking active session on mount...");
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("[Login Page] Session retrieval error on mount:", error);
      }
      if (data.session) {
        console.log("[Login Page] Active session found on mount. Redirecting to /admin. User:", data.session.user.email);
        navigate({ to: "/admin" });
      } else {
        console.log("[Login Page] No active session found on mount.");
      }
      
      try {
        const s = await bootstrapStatus();
        console.log("[Login Page] Bootstrap status check completed:", s);
        setNeedsBootstrap(s.needsBootstrap);
      } catch (err) {
        console.error("[Login Page] Failed to fetch bootstrap status:", err);
      }
    })();
  }, [navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Login Flow] 1. Starting onSignIn for email:", email);
    setBusy(true);

    try {
      console.log("[Login Flow] 2. Calling supabase.auth.signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[Login Flow] 3a. Supabase signInWithPassword returned error:", error.message);
        toast.error(error.message);
        setBusy(false);
        return;
      }

      console.log("[Login Flow] 3b. Supabase signInWithPassword successfully completed.");
      console.log("[Login Flow] User ID:", data?.user?.id);
      console.log("[Login Flow] Session access token exists:", !!data?.session?.access_token);

      if (data?.session) {
        console.log("[Login Flow] 4. Committing session and syncing storage...");
        // Set session explicitly to ensure the client-side state is hydrated instantly
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        if (setSessionError) {
          console.error("[Login Flow] Error setting session manually:", setSessionError.message);
        }

        // Essential: Yield thread briefly to let Supabase listeners & storage finish writing token data
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("[Login Flow] 5. Double-checking active session is registered...");
        const verifiedSession = await supabase.auth.getSession();
        console.log("[Login Flow] Verified local storage session status:", !!verifiedSession.data.session);

        console.log("[Login Flow] 6. Triggering navigate to /admin...");
        navigate({ to: "/admin/users" });
      } else {
        console.error("[Login Flow] Error: No session structure returned in successful auth payload.");
        toast.error("Authentication succeeded, but active session was not generated.");
      }
    } catch (err: any) {
      console.error("[Login Flow] Critical catch block error during sign in:", err);
      toast.error(err?.message ?? "An unexpected error occurred during sign in");
    } finally {
      setBusy(false);
    }
  };

  const onBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Bootstrap Flow] Starting system Super Admin creation...");
    setBusy(true);
    try {
      await bootstrapSuperAdmin({ data: { email, password, full_name: fullName } });
      toast.success("Super Admin created. Signing in…");
      
      console.log("[Bootstrap Flow] Attempting sign-in with newly generated credentials...");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data?.session) {
        console.log("[Bootstrap Flow] Synchronizing session state...");
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        await new Promise((resolve) => setTimeout(resolve, 150));
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      console.error("[Bootstrap Flow] Critical error encountered during bootstrapping setup:", err);
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
