import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Flexible schema that accepts both flat payloads and nested `{ data: ... }` objects,
 * while seamlessly mapping alternate field naming conventions (e.g. name vs full_name,
 * date vs preferred_date, message vs notes).
 */
const RawAppointmentSchema = z.object({
  name: z.string().optional(),
  full_name: z.string().optional(),
  email: z.string().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable().or(z.literal("")),
  service: z.string().optional().nullable(),
  service_type: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  preferred_date: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().optional(),
});

export const AppointmentSchema = z.preprocess((val) => {
  if (val && typeof val === "object" && "data" in val && typeof (val as any).data === "object") {
    return { ...(val as any).data, ...val };
  }
  return val;
}, RawAppointmentSchema);

export type AppointmentInput = z.infer<typeof AppointmentSchema>;

export const submitAppointment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AppointmentSchema.parse(d))
  .handler(async ({ data }) => {
    console.log("[LOG] submitAppointment invoked with parsed data:", JSON.stringify(data));

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const fullName = (data.full_name || data.name || "Sophia Chat Visitor").trim();
      const email = data.email && data.email.trim() !== "" ? data.email.trim() : null;
      const phone = data.phone && data.phone.trim() !== "" ? data.phone.trim() : null;
      const service = data.service || data.service_type || "Care Home Tour";
      const preferredDate = data.preferred_date || data.date || new Date().toISOString().split("T")[0];
      const notes = data.notes || data.message || "";

      // Attempt primary schema insertion matching standard appointments table layout
      const primaryPayload = {
        full_name: fullName,
        email: email,
        phone: phone,
        service: service,
        preferred_date: preferredDate,
        notes: notes,
        status: data.status || "pending",
      };

      console.log("[LOG] Attempting appointment insertion with primary payload:", JSON.stringify(primaryPayload));

      const { data: insertedData, error: primaryError } = await supabaseAdmin
        .from("appointments")
        .insert(primaryPayload)
        .select()
        .single();

      if (!primaryError) {
        console.log("[LOG] Appointment created successfully:", JSON.stringify(insertedData));
        return { success: true, appointment: insertedData };
      }

      console.warn("[WARN] Primary appointment insertion failed, trying secondary fallback mapping:", primaryError);

      // Fallback payload for alternate column naming conventions (e.g. name, date, message)
      const fallbackPayload = {
        name: fullName,
        email: email,
        phone: phone,
        service: service,
        date: preferredDate,
        message: notes,
        status: data.status || "pending",
      };

      const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from("appointments")
        .insert(fallbackPayload)
        .select()
        .single();

      if (fallbackError) {
        console.error("[ERROR] Secondary appointment insertion failed:", JSON.stringify(fallbackError));
        throw new Error(`Failed to create appointment: ${fallbackError.message}`);
      }

      console.log("[LOG] Appointment created via fallback payload:", JSON.stringify(fallbackData));
      return { success: true, appointment: fallbackData };

    } catch (err: any) {
      console.error("[CATCH LOG] Exception inside submitAppointment:", err?.stack || err);
      return { success: false, error: err?.message || "Internal server error" };
    }
  });

export const listAppointments = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    } catch (err: any) {
      console.error("[ERROR] Failed to list appointments:", err);
      return [];
    }
  });
