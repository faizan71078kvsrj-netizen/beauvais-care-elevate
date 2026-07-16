import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { YDC } from "@/lib/admin/branding";
import { LayoutDashboard, LogOut, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    console.log("[Admin Guard] 1. Evaluating beforeLoad route guard rules for '/admin'...");
    
    // Check cached session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("[Admin Guard] Session check query returned an error:", sessionError);
    }
    
    console.log("[Admin Guard] Local session verification result:", !!sessionData.session);

    // If local session cache isn't built yet, fall back directly to authenticating user context
    if (!sessionData.session) {
      console.log("[Admin Guard] Session cache empty. Retrieving fresh system user context from client...");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.warn("[Admin Guard] Failed to find authenticated user:", userError.message);
      }

      if (!userData.user) {
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

  useEffect(() => {
    console.log("[Dashboard Render] Verifying authenticated state inside component lifecycle...");
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("[Dashboard Render] Error querying active session inside dashboard mount:", error);
      }

      if (!data.session) {
        console.warn("[Dashboard Render] Verification failure: No current session. Enforcing redirect to login.");
        window.location.href = "/admin/login";
      } else {
        console.log("[Dashboard Render] Session validated successfully inside component layout.");
        
        // Listen for authentication changes to capture immediate logouts
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("[Dashboard Auth Listener] State event triggered:", event);
          if (event === "SIGNED_OUT" || !session) {
            console.log("[Dashboard Auth Listener] User signed out. Relocating layout...");
            window.location.href = "/admin/login";
          }
        });

        setCheckingAuth(false);
        return () => {
          authListener.subscription.unsubscribe();
        };
      }
    };
    
    checkUser();
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
