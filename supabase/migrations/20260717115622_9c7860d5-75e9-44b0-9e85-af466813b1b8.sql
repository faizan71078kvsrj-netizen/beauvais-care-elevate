
-- Knowledge base files for Sophia (admin uploads)
CREATE TABLE public.knowledge_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_files TO authenticated;
GRANT ALL ON public.knowledge_files TO service_role;
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read knowledge" ON public.knowledge_files FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "admins write knowledge" ON public.knowledge_files FOR ALL USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER touch_knowledge_files BEFORE UPDATE ON public.knowledge_files FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- AI error log (Gemini failures, rate limits)
CREATE TABLE public.ai_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID,
  code TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_errors TO authenticated;
GRANT ALL ON public.ai_errors TO service_role;
ALTER TABLE public.ai_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read ai_errors" ON public.ai_errors FOR SELECT USING (public.is_admin_or_super(auth.uid()));

-- Extend chat_messages with visitor metadata (page/browser/os/device) if not present
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS page_url TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS visitor_name TEXT,
  ADD COLUMN IF NOT EXISTS visitor_email TEXT,
  ADD COLUMN IF NOT EXISTS visitor_phone TEXT;

-- Seed default AI settings row
INSERT INTO public.settings (key, value)
VALUES ('ai', '{"enabled": true, "model": "gemini-2.5-flash", "language": "en", "greeting": "Hi! I''m Sophia, your Beauvais Care Assistant. How can I help you today?"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
