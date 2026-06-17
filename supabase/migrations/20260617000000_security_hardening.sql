-- ============================================================
-- SECURITY HARDENING — RLS reforçado + proteções extras
-- ============================================================

-- 1. Garante que anon NÃO acessa nenhuma tabela de dados
REVOKE ALL ON public.cnpjs FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.cnpj_history FROM anon;
REVOKE ALL ON public.notification_settings FROM anon;
REVOKE ALL ON public.alerts FROM anon;
REVOKE ALL ON public.company_changes FROM anon;
REVOKE ALL ON public.tags FROM anon;
REVOKE ALL ON public.company_tags FROM anon;
REVOKE ALL ON public.favorites FROM anon;
REVOKE ALL ON public.user_plans FROM anon;
REVOKE ALL ON public.usage_logs FROM anon;
REVOKE ALL ON public.monitor_settings FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;

-- plans é pública (precisa mostrar na landing)
REVOKE ALL ON public.plans FROM anon;
GRANT SELECT ON public.plans TO anon;

-- 2. Garante que authenticated só acessa o próprio dado (RLS já cobre, mas dupla garantia)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cnpjs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.cnpj_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.alerts TO authenticated;
GRANT SELECT, INSERT ON public.company_changes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.company_tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT SELECT ON public.user_plans TO authenticated;
GRANT SELECT, INSERT ON public.usage_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.monitor_settings TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.plans TO authenticated;

-- 3. Função para registrar tentativas suspeitas
CREATE OR REPLACE FUNCTION public.log_suspicious_access()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    INSERT INTO public.audit_logs (action, metadata)
    VALUES ('suspicious_anon_access', jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now()
    ));
  END IF;
  RETURN NULL;
END; $$;

-- 4. View segura de perfil (sem expor dados internos)
CREATE OR REPLACE VIEW public.my_profile AS
  SELECT
    p.id,
    p.display_name,
    p.email,
    p.created_at,
    pl.name as plan_name,
    up.status as plan_status,
    up.current_period_end
  FROM public.profiles p
  LEFT JOIN public.user_plans up ON up.user_id = p.user_id
  LEFT JOIN public.plans pl ON pl.id = up.plan_id
  WHERE p.user_id = auth.uid();

-- 5. Função segura para stats do dashboard (sem expor dados de outros usuários)
CREATE OR REPLACE FUNCTION public.get_my_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id uuid := auth.uid();
  result jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT jsonb_build_object(
    'total_cnpjs', COUNT(*),
    'ativas', COUNT(*) FILTER (WHERE status_cadastral = 'Ativa'),
    'baixadas', COUNT(*) FILTER (WHERE status_cadastral = 'Baixada'),
    'simples', COUNT(*) FILTER (WHERE regime_tributario = 'Simples'),
    'mei', COUNT(*) FILTER (WHERE regime_tributario = 'MEI'),
    'lucro_presumido', COUNT(*) FILTER (WHERE regime_tributario = 'Lucro Presumido'),
    'lucro_real', COUNT(*) FILTER (WHERE regime_tributario = 'Lucro Real')
  ) INTO result
  FROM public.cnpjs
  WHERE user_id = v_user_id;

  RETURN result;
END; $$;

REVOKE ALL ON FUNCTION public.get_my_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_stats() TO authenticated;

-- 6. Rate limiting simples por usuário na tabela de uso
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_action text, p_limit int, p_window_minutes int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count int;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RETURN false; END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.usage_logs
  WHERE user_id = v_user_id
    AND action = p_action
    AND created_at > now() - (p_window_minutes || ' minutes')::interval;

  RETURN v_count < p_limit;
END; $$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, int, int) TO authenticated;
