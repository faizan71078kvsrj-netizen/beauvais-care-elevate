import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Flexible schema that accepts both flat payloads and nested `{ data: ... }` objects.
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
  preferred_time: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().optional(),
  source: z.string().optional(),
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
      const preferredTime = data.preferred_time || data.time || null;
      const message = data.message || data.notes || "";
      const status = data.status || "pending";
      const source = data.source || "sophia_chat";

      const payload = {
        full_name: fullName,
        email: email,
        phone: phone,
        service: service,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        message: message,
        status: status,
        source: source,
      };

      console.log("[LOG] Inserting appointment into database:", JSON.stringify(payload));

      const { data: insertedData, error } = await supabaseAdmin
        .from("appointments")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("[ERROR] Appointment insertion failed:", JSON.stringify(error));
        throw new Error(`Failed to create appointment: ${error.message}`);
      }

      console.log("[LOG] Appointment created successfully:", JSON.stringify(insertedData));
      return { success: true, appointment: insertedData };

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
