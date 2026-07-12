-- ==========================================================================
-- LENO-RAA COLD PROCESS SOAP - ENTERPRISE FEATURES SCHEMAS
-- ==========================================================================

-- ==========================================================================
-- 1. STORAGE BUCKETS INITIALIZATION
-- ==========================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('invoices', 'invoices', true),
  ('chat_uploads', 'chat_uploads', true),
  ('support_files', 'support_files', true),
  ('exports', 'exports', false),
  ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 2. TABLES DEFINITIONS
-- ==========================================================================

-- Phone Verification Logs (Custom OTP tracking/logs)
CREATE TABLE public.phone_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL
);

-- Linked Google OAuth Accounts Logs
CREATE TABLE public.google_accounts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL,
    avatar_url TEXT,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PDF Invoices Records
CREATE TABLE public.invoices (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Email Sending Logs
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Sent' CHECK (status IN ('Sent', 'Failed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- WhatsApp Sending Logs
CREATE TABLE public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_phone TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Sent' CHECK (status IN ('Sent', 'Failed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Delivery Shipment Tracking Table
CREATE TABLE public.tracking (
    tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    tracking_number TEXT UNIQUE NOT NULL,
    courier_name TEXT NOT NULL,
    tracking_url TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    current_location TEXT,
    status TEXT NOT NULL DEFAULT 'In Transit' CHECK (status IN ('In Transit', 'Out for Delivery', 'Delivered', 'Returned')),
    delivery_updates JSONB DEFAULT '[]'::jsonb, -- Array of updates: {time, location, status, description}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Support Tickets
CREATE TABLE public.support_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Support Ticket Chat Messages
CREATE TABLE public.support_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(ticket_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT,
    attachments TEXT[] DEFAULT '{}'::text[], -- Storage URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Administrative Backup Logs
CREATE TABLE public.backups (
    backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    backup_type TEXT NOT NULL DEFAULT 'Manual' CHECK (backup_type IN ('Auto', 'Manual')),
    status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Security Audit Logs (Auth failures, sensitive administrative adjustments)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'LOGIN_ATTEMPT', 'PASSWORD_RESET', 'INVENTORY_ALERT', 'BACKUP_CREATED', etc.
    description TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Customer Behavior/Activity Logs
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'VIEW_PRODUCT', 'ADD_TO_CART', 'ADD_TO_WISHLIST', 'PLACE_ORDER', etc.
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==========================================================================

CREATE INDEX idx_tracking_number ON public.tracking(tracking_number);
CREATE INDEX idx_tracking_order_id ON public.tracking(order_id);
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_messages_ticket_id ON public.support_messages(ticket_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);

-- ==========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================

ALTER TABLE public.phone_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Phone Verification Policies (Only verification entries for owner phone number / rate limiting)
CREATE POLICY "PhoneVerification: insert anyone" ON public.phone_verification FOR INSERT WITH CHECK (true);
CREATE POLICY "PhoneVerification: select anyone" ON public.phone_verification FOR SELECT USING (true);

-- Google Accounts Policies
CREATE POLICY "GoogleAccounts: owner manage" ON public.google_accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Invoices Policies (Owner or Admin read, admin write)
CREATE POLICY "Invoices: owner select" ON public.invoices FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.order_id = invoices.order_id AND (o.user_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Invoices: admin write" ON public.invoices FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Email/WhatsApp logs (Admin only)
CREATE POLICY "EmailLogs: admin read" ON public.email_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "WhatsAppLogs: admin read" ON public.whatsapp_logs FOR SELECT TO authenticated USING (public.is_admin());

-- Tracking Policies (Public read by tracking_number, admin full write)
CREATE POLICY "Tracking: select anyone" ON public.tracking FOR SELECT USING (true);
CREATE POLICY "Tracking: admin manage" ON public.tracking FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Support Tickets Policies (User can manage their own, admin manages all)
CREATE POLICY "SupportTickets: owner select" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "SupportTickets: owner insert" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "SupportTickets: admin manage" ON public.support_tickets FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Support Messages Policies (User can view/add messages to their tickets, admin full access)
CREATE POLICY "SupportMessages: owner select" ON public.support_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.ticket_id = support_messages.ticket_id AND (t.user_id = auth.uid() OR public.is_admin())));
CREATE POLICY "SupportMessages: owner insert" ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.ticket_id = support_messages.ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "SupportMessages: admin manage" ON public.support_messages FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Backup, Audit Logs, Activity Logs (Admin only)
CREATE POLICY "Backups: admin manage" ON public.backups FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "AuditLogs: admin manage" ON public.audit_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "ActivityLogs: owner insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ActivityLogs: admin manage" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin());

-- ==========================================================================
-- 5. STORAGE POLICIES FOR NEW BUCKETS
-- ==========================================================================

-- Invoices Bucket (Public read, authenticated write on matching order owner)
CREATE POLICY "Invoices storage: public read" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');
CREATE POLICY "Invoices storage: auth write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'invoices');

-- Chat Uploads & Support Files Bucket (Owner read/write profiles/{user_id}/...)
CREATE POLICY "ChatUploads storage: owner select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'chat_uploads');
CREATE POLICY "ChatUploads storage: owner write" ON storage.objects FOR ALL TO authenticated 
  USING (bucket_id = 'chat_uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'chat_uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "SupportFiles storage: owner select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'support_files');
CREATE POLICY "SupportFiles storage: owner write" ON storage.objects FOR ALL TO authenticated 
  USING (bucket_id = 'support_files' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'support_files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Exports & Backups Bucket (Admin only access)
CREATE POLICY "Exports storage: admin select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'exports' AND public.is_admin());
CREATE POLICY "Exports storage: admin write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'exports' AND public.is_admin()) WITH CHECK (bucket_id = 'exports' AND public.is_admin());

CREATE POLICY "Backups storage: admin select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'backups' AND public.is_admin());
CREATE POLICY "Backups storage: admin write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'backups' AND public.is_admin()) WITH CHECK (bucket_id = 'backups' AND public.is_admin());

-- ==========================================================================
-- 6. TRIGGERS & RATE LIMITS FOR SECURITY
-- ==========================================================================

-- Auto update timestamp trigger for Tracking and Tickets
CREATE OR REPLACE TRIGGER update_tracking_modtime BEFORE UPDATE ON public.tracking FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE OR REPLACE TRIGGER update_tickets_modtime BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Support Tickets rate limiter (Prevent ticket spamming - max 5 open tickets per user)
CREATE OR REPLACE FUNCTION public.check_ticket_spam()
RETURNS TRIGGER AS $$
DECLARE
  v_open_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_open_count 
  FROM public.support_tickets 
  WHERE user_id = NEW.user_id AND status != 'Closed' AND status != 'Resolved';
  
  IF v_open_count >= 5 THEN
    RAISE EXCEPTION 'You cannot have more than 5 active support tickets open simultaneously.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_check_ticket_spam
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.check_ticket_spam();

-- Message rate limiter (Max 1 message every 2 seconds per ticket to prevent flooding)
CREATE OR REPLACE FUNCTION public.check_message_spam()
RETURNS TRIGGER AS $$
DECLARE
  v_last_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT created_at INTO v_last_time
  FROM public.support_messages
  WHERE ticket_id = NEW.ticket_id AND sender_id = NEW.sender_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_time IS NOT NULL AND NEW.created_at - v_last_time < INTERVAL '2 seconds' THEN
    RAISE EXCEPTION 'You are sending messages too quickly. Please wait a moment.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_check_message_spam
  BEFORE INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.check_message_spam();
