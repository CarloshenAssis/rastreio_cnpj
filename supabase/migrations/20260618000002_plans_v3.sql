-- ============================================================
-- PLANOS V3 — limites atualizados + trial 7 dias
-- ============================================================

-- Atualiza limites do Starter
UPDATE public.plans SET
  max_queries = 100,
  max_monitored = 50,
  max_pdfs = 50,
  max_exports = 10,
  email_alerts = true,
  features = '["100 CNPJs consultados/mês","50 empresas monitoradas","50 relatórios PDF/mês","10 exports CSV/XLSX/PDF Lote por mês","Alertas por e-mail","Tags disponível","Monitoramento mensal/quinzenal","Monitora regime e status cadastral"]'::jsonb
WHERE name = 'Starter';

-- Atualiza limites do Pro
UPDATE public.plans SET
  max_queries = 2000,
  max_monitored = 500,
  max_pdfs = 100,
  max_exports = 50,
  email_alerts = true,
  features = '["2000 CNPJs consultados/mês","500 empresas monitoradas","100 relatórios PDF/mês","50 exports CSV/XLSX/PDF Lote por mês","Alertas por e-mail","Tags disponível","Todas as frequências de monitoramento","Monitora tudo: regime, status, endereço, sócios"]'::jsonb
WHERE name = 'Pro';

-- Free vira plano residual pós-trial (bem limitado)
UPDATE public.plans SET
  max_queries = 5,
  max_monitored = 0,
  max_pdfs = 0,
  max_exports = 0,
  email_alerts = false,
  features = '["5 CNPJs consultados/mês","Sem monitoramento automático","Sem PDFs","Sem exports","Apenas consultas manuais"]'::jsonb
WHERE name = 'Free';

-- Coluna de trial na user_plans
ALTER TABLE public.user_plans
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;

-- Trigger: ao criar usuário, atribui Starter grátis por 7 dias
CREATE OR REPLACE FUNCTION public.on_new_user_trial()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_plan_id uuid;
BEGIN
  SELECT id INTO v_plan_id FROM public.plans WHERE name = 'Starter';
  IF FOUND THEN
    INSERT INTO public.user_plans (user_id, plan_id, status, is_trial, current_period_start, current_period_end)
      VALUES (NEW.id, v_plan_id, 'active', true, now(), now() + interval '7 days')
      ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_new_user_trial ON auth.users;
CREATE TRIGGER on_new_user_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.on_new_user_trial();

-- Função que verifica/rebaixa trial expirado para Free
CREATE OR REPLACE FUNCTION public.check_trial_expiry()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_free_id uuid;
BEGIN
  SELECT id INTO v_free_id FROM public.plans WHERE name = 'Free';
  UPDATE public.user_plans SET
    plan_id = v_free_id,
    status = 'expired',
    is_trial = false,
    updated_at = now()
  WHERE is_trial = true
    AND current_period_end < now()
    AND status = 'active';
END; $$;

REVOKE ALL ON FUNCTION public.check_trial_expiry() FROM PUBLIC, anon, authenticated;
-- Chamado via pg_cron pelo service_role diariamente
