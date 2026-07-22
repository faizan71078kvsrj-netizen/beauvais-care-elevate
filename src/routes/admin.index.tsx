import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    console.log("[Admin Guard] Evaluating route guard rules for '/admin'...");

    // Check cached session
    let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("[Admin Guard] Session check error:", sessionError);
    }

    // Retry fallback for async lag
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
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.warn("[Admin Guard] Failed to find authenticated user:", userError.message);
      }

      if (!userData || !userData.user) {
        console.warn("[Admin Guard] Access Blocked: No session or user match. Redirecting to /admin/login.");
        throw redirect({
          to: "/admin/login",
        });
      }
    }

    // Authenticated: redirect directly to appointments
    throw redirect({
      to: "/admin/appointments",
    });
  },
  component: () => null,
});
