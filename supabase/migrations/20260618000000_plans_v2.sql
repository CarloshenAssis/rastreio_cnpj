-- ============================================================
-- PLANOS ATUALIZADOS COM LIMITES REAIS
-- ============================================================

-- Limpa planos antigos e recria
DELETE FROM public.plans;

INSERT INTO public.plans (name, max_queries, max_monitored, price_cents, features) VALUES
(
  'Free', 20, 10, 0,
  '["20 consultas/mês","10 empresas monitoradas","3 relatórios PDF/mês","1 export CSV/XLSX/PDF Lote por mês","Tags disponível","Monitoramento mensal/quinzenal","Monitora regime e status cadastral"]'::jsonb
),
(
  'Starter', 100, 20, 1990,
  '["100 consultas/mês","20 empresas monitoradas","10 relatórios PDF/mês","10 exports CSV/XLSX/PDF Lote por mês","Alertas por e-mail","Tags disponível","Monitoramento mensal/quinzenal","Monitora regime e status cadastral"]'::jsonb
),
(
  'Pro', 2000, 50, 4490,
  '["2000 consultas/mês","50 empresas monitoradas","100 relatórios PDF/mês","50 exports CSV/XLSX/PDF Lote por mês","Alertas por e-mail","Tags disponível","Todas as frequências de monitoramento","Monitora tudo: regime, status, endereço, sócios"]'::jsonb
),
(
  'Personalizado', -1, -1, -1,
  '["Consultas ilimitadas","CNPJs ilimitados","PDFs ilimitados","Exports ilimitados","Todas as features","Suporte prioritário","Acesso via código exclusivo"]'::jsonb
);

-- Adiciona colunas de limites extras na tabela plans
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS max_pdfs integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS max_exports integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS email_alerts boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS monitor_fields text[] NOT NULL DEFAULT ARRAY['regime_tributario','status_cadastral'],
  ADD COLUMN IF NOT EXISTS allowed_frequencies text[] NOT NULL DEFAULT ARRAY['monthly','biweekly'];

-- Atualiza os valores das novas colunas
UPDATE public.plans SET
  max_pdfs = 3, max_exports = 1, email_alerts = false,
  monitor_fields = ARRAY['regime_tributario','status_cadastral'],
  allowed_frequencies = ARRAY['monthly','biweekly']
WHERE name = 'Free';

UPDATE public.plans SET
  max_pdfs = 10, max_exports = 10, email_alerts = true,
  monitor_fields = ARRAY['regime_tributario','status_cadastral'],
  allowed_frequencies = ARRAY['monthly','biweekly']
WHERE name = 'Starter';

UPDATE public.plans SET
  max_pdfs = 100, max_exports = 50, email_alerts = true,
  monitor_fields = ARRAY['regime_tributario','status_cadastral','municipio','uf','porte','razao_social','nome_fantasia'],
  allowed_frequencies = ARRAY['daily','weekly','biweekly','monthly']
WHERE name = 'Pro';

UPDATE public.plans SET
  max_pdfs = -1, max_exports = -1, email_alerts = true,
  monitor_fields = ARRAY['regime_tributario','status_cadastral','municipio','uf','porte','razao_social','nome_fantasia'],
  allowed_frequencies = ARRAY['daily','weekly','biweekly','monthly']
WHERE name = 'Personalizado';

-- Tabela de códigos de acesso para plano Personalizado
CREATE TABLE IF NOT EXISTS public.access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  used_by uuid REFERENCES auth.users(id),
  used_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
-- Admin vê tudo (via service_role), usuário só vê se usou
CREATE POLICY "access_codes_used_by" ON public.access_codes
  FOR SELECT TO authenticated USING (used_by = auth.uid());

-- Função para resgatar código de acesso
CREATE OR REPLACE FUNCTION public.redeem_access_code(p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_code public.access_codes%ROWTYPE;
  v_plan public.plans%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not authenticated');
  END IF;

  SELECT * INTO v_code FROM public.access_codes
    WHERE code = upper(trim(p_code)) AND used_by IS NULL
      AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Código inválido ou já utilizado.');
  END IF;

  SELECT * INTO v_plan FROM public.plans WHERE id = v_code.plan_id;

  -- Marca código como usado
  UPDATE public.access_codes SET used_by = v_user_id, used_at = now() WHERE id = v_code.id;

  -- Aplica plano ao usuário
  INSERT INTO public.user_plans (user_id, plan_id, status, current_period_start, current_period_end)
    VALUES (v_user_id, v_code.plan_id, 'active', now(), null)
    ON CONFLICT (user_id) DO UPDATE SET
      plan_id = v_code.plan_id, status = 'active',
      current_period_start = now(), current_period_end = null, updated_at = now();

  RETURN jsonb_build_object('success', true, 'plan', v_plan.name);
END; $$;

REVOKE ALL ON FUNCTION public.redeem_access_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_access_code(text) TO authenticated;

-- Função admin para gerar código
CREATE OR REPLACE FUNCTION public.generate_access_code(p_plan_name text, p_expires_days int DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan_id uuid;
  v_code text;
  v_expires timestamptz;
BEGIN
  SELECT id INTO v_plan_id FROM public.plans WHERE name = p_plan_name;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plano não encontrado'; END IF;

  -- Gera código alfanumérico de 8 caracteres
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
  IF p_expires_days IS NOT NULL THEN
    v_expires := now() + (p_expires_days || ' days')::interval;
  END IF;

  INSERT INTO public.access_codes (code, plan_id, created_by, expires_at)
    VALUES (v_code, v_plan_id, auth.uid(), v_expires);

  RETURN v_code;
END; $$;

REVOKE ALL ON FUNCTION public.generate_access_code(text, int) FROM PUBLIC, anon, authenticated;
-- Só service_role (admin) pode gerar códigos
