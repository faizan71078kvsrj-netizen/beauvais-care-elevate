/**
 * Admin API — server functions consumed by the /admin panel.
 *
 * IMPORTANT — future Laravel migration:
 * All admin data-access lives behind these thin RPC wrappers. When we migrate
 * to a Laravel REST backend, only the internals of these handlers change:
 * the frontend keeps calling `useServerFn(...)` and receives the same shapes.
 * Keep return types stable — that is the contract the UI depends on.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- helpers ---------------------------------------------------------

async function logAudit(
  supabase: any,
  userId: string,
  action: string,
  entity?: string,
  entity_id?: string,
  metadata: Record<string, unknown> = {},
) {
  const { data: prof } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
  await supabase.from("audit_logs").insert({
    actor_id: userId,
    actor_email: prof?.email ?? null,
    action,
    entity: entity ?? null,
    entity_id: entity_id ?? null,
    metadata,
  });
}

// ---------- session / me ----------------------------------------------------

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      userId,
      profile: profile ?? null,
      roles: (roles ?? []).map((r: { role: string }) => r.role),
    };
  });

// ---------- bootstrap (first-run super admin) -------------------------------

export const bootstrapStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "super_admin");
  return { needsBootstrap: (count ?? 0) === 0 };
});

const BootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(120),
});

export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => BootstrapSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");
    if ((count ?? 0) > 0) throw new Error("Super Admin already exists.");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: created.user.id, email: data.email, full_name: data.full_name, is_protected: true });
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "super_admin" });
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: created.user.id,
      actor_email: data.email,
      action: "bootstrap_super_admin",
      entity: "user",
      entity_id: created.user.id,
    });
    return { ok: true };
  });

// ---------- Appointments ----------------------------------------------------

const AppointmentPatch = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  internal_notes: z.string().max(4000).nullable().optional(),
});

const AppointmentCreateSchema = z.object({
  full_name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  service: z.string().max(120).optional().or(z.literal("")),
  appointment_date: z.string(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).default("pending"),
  assigned_to: z.string().uuid().nullable().optional(),
  internal_notes: z.string().max(4000).optional().or(z.literal("")),
});

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AppointmentCreateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("appointments")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "create_appointment", "appointment", row.id);
    return row;
  });

export const updateAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AppointmentPatch.parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("appointments").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "update_appointment", "appointment", id, patch);
    return { ok: true };
  });

export const deleteAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("appointments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "delete_appointment", "appointment", data.id);
    return { ok: true };
  });

// ---------- Contacts --------------------------------------------------------

export const listContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markContactRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), is_read: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("contacts").update({ is_read: data.is_read }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Leads / Customers ----------------------------------------------

const LeadSchema = z.object({
  full_name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  service: z.string().max(120).optional().or(z.literal("")),
  status: z.enum(["new", "contacted", "qualified", "won", "lost"]).default("new"),
  source: z.string().max(80).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  follow_up_at: z.string().datetime().nullable().optional(),
});

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LeadSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("leads").insert(data).select().single();
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "create_lead", "lead", row.id);
    return row;
  });

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const CustomerSchema = z.object({
  full_name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});

export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CustomerSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("customers").insert(data).select().single();
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "create_customer", "customer", row.id);
    return row;
  });

// ---------- Users / Roles ---------------------------------------------------

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // authorize: admin_or_super only
    const { data: canManage } = await context.supabase.rpc("is_admin_or_super", { _user_id: context.userId });
    if (!canManage) throw new Error("Forbidden");
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      context.supabase.from("profiles").select("*").order("created_at"),
      context.supabase.from("user_roles").select("*"),
    ]);
    return { profiles: profiles ?? [], roles: roles ?? [] };
  });

const InviteUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(120),
  role: z.enum(["admin", "staff", "receptionist"]),
});

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InviteUserSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: canManage } = await context.supabase.rpc("is_admin_or_super", { _user_id: context.userId });
    if (!canManage) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");

    await supabaseAdmin.from("profiles").upsert({
      id: created.user.id,
      email: data.email,
      full_name: data.full_name,
    });
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: data.role });
    await logAudit(context.supabase, context.userId, "invite_user", "user", created.user.id, { role: data.role });
    return { ok: true, id: created.user.id };
  });

export const setUserActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid(), is_active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: canManage } = await context.supabase.rpc("is_admin_or_super", { _user_id: context.userId });
    if (!canManage) throw new Error("Forbidden");
    const { error } = await context.supabase.from("profiles").update({ is_active: data.is_active }).eq("id", data.user_id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "toggle_user_active", "user", data.user_id, { is_active: data.is_active });
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isSuper } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    if (!isSuper) throw new Error("Only Super Admin can delete users.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin.from("profiles").select("is_protected,email").eq("id", data.user_id).maybeSingle();
    if (target?.is_protected) throw new Error("Protected account cannot be deleted.");

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "delete_user", "user", data.user_id, { email: target?.email });
    return { ok: true };
  });

// ---------- Documents / Chat / Audit / Settings ----------------------------

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("documents").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listChatSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_messages")
      .select("session_id, created_at, role, content")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: canRead } = await context.supabase.rpc("is_admin_or_super", { _user_id: context.userId });
    if (!canRead) throw new Error("Forbidden");
    const { data, error } = await context.supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("settings").select("*");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ key: z.string(), value: z.record(z.any()) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("settings")
      .upsert({ key: data.key, value: data.value, updated_by: context.userId, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, context.userId, "update_setting", "setting", data.key);
    return { ok: true };
  });

// ---------- Dashboard stats -------------------------------------------------

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const c = context.supabase;
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const [appt, apptPending, contacts, leads, customers, docs] = await Promise.all([
      c.from("appointments").select("*", { count: "exact", head: true }).gte("created_at", since),
      c.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      c.from("contacts").select("*", { count: "exact", head: true }).gte("created_at", since),
      c.from("leads").select("*", { count: "exact", head: true }),
      c.from("customers").select("*", { count: "exact", head: true }),
      c.from("documents").select("*", { count: "exact", head: true }),
    ]);
    return {
      appointments30d: appt.count ?? 0,
      appointmentsPending: apptPending.count ?? 0,
      contacts30d: contacts.count ?? 0,
      leads: leads.count ?? 0,
      customers: customers.count ?? 0,
      documents: docs.count ?? 0,
    };
  });
