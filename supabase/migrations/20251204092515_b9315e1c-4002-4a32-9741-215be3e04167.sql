-- Create a helper function to check if user is IT staff (manager or admin)
CREATE OR REPLACE FUNCTION public.is_it_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('manager', 'admin')
  )
$$;

-- Create a function to check if user is front office (user or agent only)
CREATE OR REPLACE FUNCTION public.is_front_office(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('manager', 'admin')
  )
$$;