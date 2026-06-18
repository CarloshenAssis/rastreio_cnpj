-- ============================================================
-- ADMIN: função para gerar códigos (só carloshen.senai@gmail.com)
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_generate_code(p_plan_name text, p_expires_days int DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_email text;
  v_plan_id uuid;
  v_code text;
  v_expires timestamptz;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  IF v_user_email IS DISTINCT FROM 'carloshen.senai@gmail.com' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT id INTO v_plan_id FROM public.plans WHERE name = p_plan_name;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plano não encontrado'; END IF;

  v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
  IF p_expires_days IS NOT NULL THEN
    v_expires := now() + (p_expires_days || ' days')::interval;
  END IF;

  INSERT INTO public.access_codes (code, plan_id, created_by, expires_at)
    VALUES (v_code, v_plan_id, auth.uid(), v_expires);

  RETURN v_code;
END; $$;

REVOKE ALL ON FUNCTION public.admin_generate_code(text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_generate_code(text, int) TO authenticated;

-- Função para listar códigos gerados (só admin)
CREATE OR REPLACE FUNCTION public.admin_list_codes()
RETURNS TABLE (
  id uuid, code text, plan_name text, used_by_email text,
  used_at timestamptz, created_at timestamptz, expires_at timestamptz
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_email text;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  IF v_user_email IS DISTINCT FROM 'carloshen.senai@gmail.com' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
    SELECT
      ac.id, ac.code, p.name AS plan_name,
      u.email AS used_by_email,
      ac.used_at, ac.created_at, ac.expires_at
    FROM public.access_codes ac
    JOIN public.plans p ON p.id = ac.plan_id
    LEFT JOIN auth.users u ON u.id = ac.used_by
    ORDER BY ac.created_at DESC;
END; $$;

REVOKE ALL ON FUNCTION public.admin_list_codes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_codes() TO authenticated;

-- Função para listar usuários e seus planos (só admin)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid, email text, plan_name text, plan_status text,
  created_at timestamptz, queries_this_month bigint
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_email text;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  IF v_user_email IS DISTINCT FROM 'carloshen.senai@gmail.com' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
    SELECT
      u.id AS user_id,
      u.email,
      COALESCE(p.name, 'Free') AS plan_name,
      COALESCE(up.status, 'active') AS plan_status,
      u.created_at,
      COALESCE((
        SELECT SUM(ul.quantity)
        FROM public.usage_logs ul
        WHERE ul.user_id = u.id
          AND ul.action = 'consulta_cnpj'
          AND ul.created_at >= date_trunc('month', now())
      ), 0) AS queries_this_month
    FROM auth.users u
    LEFT JOIN public.user_plans up ON up.user_id = u.id
    LEFT JOIN public.plans p ON p.id = up.plan_id
    ORDER BY u.created_at DESC;
END; $$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- ============================================================
-- MERCADO PAGO: tabela de assinaturas/pagamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  mp_preference_id text,
  mp_payment_id text,
  mp_subscription_id text,
  status text NOT NULL DEFAULT 'pending',
  amount_cents integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own" ON public.subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
