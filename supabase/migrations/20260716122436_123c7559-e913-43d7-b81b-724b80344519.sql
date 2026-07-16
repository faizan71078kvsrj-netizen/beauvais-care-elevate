
-- =========================================================================
-- ROLES
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'staff', 'receptionist');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'won', 'lost');

-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_protected BOOLEAN NOT NULL DEFAULT false, -- YDC super admin protection
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- USER ROLES
-- =========================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer helpers (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id) $$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('admin','super_admin')) $$;

-- Prevent deletion of protected super admin
CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.role = 'super_admin' AND EXISTS(
    SELECT 1 FROM public.profiles WHERE id = OLD.user_id AND is_protected = true
  ) THEN
    RAISE EXCEPTION 'The protected YDC Super Admin cannot be removed.';
  END IF;
  RETURN OLD;
END $$;
CREATE TRIGGER trg_protect_super_admin
BEFORE DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

CREATE OR REPLACE FUNCTION public.protect_super_admin_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.is_protected = true THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'Protected account cannot be deleted.';
    END IF;
    IF TG_OP = 'UPDATE' AND (NEW.is_active = false OR NEW.is_protected = false) THEN
      RAISE EXCEPTION 'Protected account cannot be disabled or unprotected.';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_protect_super_admin_profile
BEFORE UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin_profile();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Profiles policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_staff(auth.uid()));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admins manage profiles" ON public.profiles FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- user_roles policies
CREATE POLICY "staff read roles" ON public.user_roles FOR SELECT
  USING (public.is_staff(auth.uid()));
CREATE POLICY "admins insert roles" ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "admins update roles" ON public.user_roles FOR UPDATE
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "super delete roles" ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================================
-- APPOINTMENTS
-- =========================================================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT,
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_created ON public.appointments(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT INSERT ON public.appointments TO anon;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit appointments" ON public.appointments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "staff read appointments" ON public.appointments FOR SELECT
  USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update appointments" ON public.appointments FOR UPDATE
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "admins delete appointments" ON public.appointments FOR DELETE
  USING (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================================
-- CONTACTS (contact form submissions)
-- =========================================================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contacts_created ON public.contacts(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT INSERT ON public.contacts TO anon;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can submit contacts" ON public.contacts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "staff read contacts" ON public.contacts FOR SELECT
  USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update contacts" ON public.contacts FOR UPDATE
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "admins delete contacts" ON public.contacts FOR DELETE
  USING (public.is_admin_or_super(auth.uid()));

-- =========================================================================
-- CUSTOMERS (CRM)
-- =========================================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tags TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read customers" ON public.customers FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write customers" ON public.customers FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff update customers" ON public.customers FOR UPDATE USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "admins delete customers" ON public.customers FOR DELETE USING (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================================
-- CUSTOMER NOTES (timeline)
-- =========================================================================
CREATE TABLE public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  kind TEXT DEFAULT 'note', -- note | call | email | appointment
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notes_customer ON public.customer_notes(customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_notes TO authenticated;
GRANT ALL ON public.customer_notes TO service_role;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read notes" ON public.customer_notes FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write notes" ON public.customer_notes FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff update own notes" ON public.customer_notes FOR UPDATE USING (author_id = auth.uid() OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "admins delete notes" ON public.customer_notes FOR DELETE USING (public.is_admin_or_super(auth.uid()));

-- =========================================================================
-- LEADS
-- =========================================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  service TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  source TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read leads" ON public.leads FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write leads" ON public.leads FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff update leads" ON public.leads FOR UPDATE USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "admins delete leads" ON public.leads FOR DELETE USING (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================================
-- DOCUMENTS
-- =========================================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read docs" ON public.documents FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write docs" ON public.documents FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff update docs" ON public.documents FOR UPDATE USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "admins delete docs" ON public.documents FOR DELETE USING (public.is_admin_or_super(auth.uid()));

-- =========================================================================
-- AI CHAT MESSAGES
-- =========================================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  role TEXT NOT NULL, -- user | assistant | system
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_session ON public.chat_messages(session_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT INSERT ON public.chat_messages TO anon;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert chat" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "staff read chat" ON public.chat_messages FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "admins delete chat" ON public.chat_messages FOR DELETE USING (public.is_admin_or_super(auth.uid()));

-- =========================================================================
-- AUDIT LOGS
-- =========================================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff insert audit" ON public.audit_logs FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "admins read audit" ON public.audit_logs FOR SELECT USING (public.is_admin_or_super(auth.uid()));

-- =========================================================================
-- SETTINGS (key/value)
-- =========================================================================
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read settings" ON public.settings FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "admins write settings" ON public.settings FOR ALL
  USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

INSERT INTO public.settings (key, value) VALUES
  ('branding', '{"developer":"Your Digital Choices","tagline":"Powered by Your Digital Choices","version":"1.0.0","copyright":"© 2026 Your Digital Choices. All Rights Reserved.","logo_url":""}'::jsonb),
  ('business', '{"name":"Beauvais Group & Personal Care Home Inc.","email":"BeauvaisGroup@gmail.com","phone":"(954) 859-6294","whatsapp":"+13053671741","address":"944 Crossing Rock Dr, Lawrenceville, GA 30045"}'::jsonb);
