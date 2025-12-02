-- Enum types for ITSM
CREATE TYPE public.ticket_type AS ENUM ('incident', 'request', 'problem', 'change');
CREATE TYPE public.ticket_status AS ENUM ('new', 'open', 'in_progress', 'pending', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'manager', 'user');
CREATE TYPE public.asset_status AS ENUM ('active', 'maintenance', 'retired', 'lost');
CREATE TYPE public.asset_type AS ENUM ('laptop', 'desktop', 'smartphone', 'tablet', 'server', 'printer', 'network', 'other');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  department TEXT,
  job_title TEXT,
  phone TEXT,
  entra_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Service catalog categories
CREATE TABLE public.service_catalog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.service_catalog_categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service catalog items
CREATE TABLE public.service_catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.service_catalog_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  estimated_time TEXT,
  requires_approval BOOLEAN DEFAULT false,
  approval_roles TEXT[],
  form_schema JSONB,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge base categories
CREATE TABLE public.kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.kb_categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge base articles
CREATE TABLE public.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL,
  type ticket_type NOT NULL DEFAULT 'incident',
  status ticket_status NOT NULL DEFAULT 'new',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  category TEXT,
  subcategory TEXT,
  service_catalog_item_id UUID REFERENCES public.service_catalog_items(id),
  sla_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket comments
CREATE TABLE public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket attachments
CREATE TABLE public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket history (audit trail)
CREATE TABLE public.ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory assets
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type asset_type NOT NULL DEFAULT 'other',
  status asset_status NOT NULL DEFAULT 'active',
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  location TEXT,
  purchase_date DATE,
  warranty_expires DATE,
  purchase_price DECIMAL(10,2),
  specifications JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asset history
CREATE TABLE public.asset_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs for security
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is agent or admin
CREATE OR REPLACE FUNCTION public.is_agent_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('agent', 'admin', 'manager')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for service catalog (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.service_catalog_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage categories" ON public.service_catalog_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view items" ON public.service_catalog_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage items" ON public.service_catalog_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for knowledge base
CREATE POLICY "Anyone can view published articles" ON public.kb_articles FOR SELECT TO authenticated USING (is_published = true OR author_id = auth.uid() OR public.is_agent_or_admin(auth.uid()));
CREATE POLICY "Agents can create articles" ON public.kb_articles FOR INSERT TO authenticated WITH CHECK (public.is_agent_or_admin(auth.uid()));
CREATE POLICY "Authors and admins can update articles" ON public.kb_articles FOR UPDATE TO authenticated USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view KB categories" ON public.kb_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage KB categories" ON public.kb_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tickets
CREATE POLICY "Users see own tickets, agents see all" ON public.tickets FOR SELECT TO authenticated 
  USING (requester_id = auth.uid() OR assigned_to = auth.uid() OR public.is_agent_or_admin(auth.uid()));
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Requester and agents can update tickets" ON public.tickets FOR UPDATE TO authenticated 
  USING (requester_id = auth.uid() OR assigned_to = auth.uid() OR public.is_agent_or_admin(auth.uid()));

-- RLS Policies for ticket comments
CREATE POLICY "Users see comments on their tickets" ON public.ticket_comments FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_id AND (requester_id = auth.uid() OR assigned_to = auth.uid()))
    OR public.is_agent_or_admin(auth.uid())
  );
CREATE POLICY "Users can add comments to their tickets" ON public.ticket_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

-- RLS Policies for ticket attachments
CREATE POLICY "View attachments on accessible tickets" ON public.ticket_attachments FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_id AND (requester_id = auth.uid() OR assigned_to = auth.uid()))
    OR public.is_agent_or_admin(auth.uid())
  );
CREATE POLICY "Add attachments to accessible tickets" ON public.ticket_attachments FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for ticket history
CREATE POLICY "View history on accessible tickets" ON public.ticket_history FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_id AND (requester_id = auth.uid() OR assigned_to = auth.uid()))
    OR public.is_agent_or_admin(auth.uid())
  );
CREATE POLICY "System can insert history" ON public.ticket_history FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for assets
CREATE POLICY "Users see assigned assets, agents see all" ON public.assets FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR public.is_agent_or_admin(auth.uid()));
CREATE POLICY "Agents can manage assets" ON public.assets FOR ALL TO authenticated USING (public.is_agent_or_admin(auth.uid()));

-- RLS Policies for asset history
CREATE POLICY "View history for accessible assets" ON public.asset_history FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.assets WHERE id = asset_id AND (assigned_to = auth.uid() OR public.is_agent_or_admin(auth.uid())))
  );
CREATE POLICY "Agents can insert asset history" ON public.asset_history FOR INSERT TO authenticated WITH CHECK (public.is_agent_or_admin(auth.uid()));

-- RLS Policies for audit logs (admins only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Give default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_kb_articles_updated_at BEFORE UPDATE ON public.kb_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_service_catalog_items_updated_at BEFORE UPDATE ON public.service_catalog_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_service_catalog_categories_updated_at BEFORE UPDATE ON public.service_catalog_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for tickets
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;