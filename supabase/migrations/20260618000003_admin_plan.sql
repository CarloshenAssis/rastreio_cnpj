-- Atribui plano Personalizado permanente ao admin
DO $$
DECLARE
  v_user_id uuid;
  v_plan_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'carloshen.senai@gmail.com';
  SELECT id INTO v_plan_id FROM public.plans WHERE name = 'Personalizado';

  IF v_user_id IS NOT NULL AND v_plan_id IS NOT NULL THEN
    INSERT INTO public.user_plans (user_id, plan_id, status, is_trial, current_period_start, current_period_end)
      VALUES (v_user_id, v_plan_id, 'active', false, now(), null)
      ON CONFLICT (user_id) DO UPDATE SET
        plan_id = v_plan_id,
        status = 'active',
        is_trial = false,
        current_period_end = null,
        updated_at = now();
  END IF;
END; $$;

-- Garante que o trigger de trial não sobrescreva o admin no futuro
CREATE OR REPLACE FUNCTION public.on_new_user_trial()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan_id uuid;
  v_plan_name text;
BEGIN
  IF NEW.email = 'carloshen.senai@gmail.com' THEN
    v_plan_name := 'Personalizado';
  ELSE
    v_plan_name := 'Starter';
  END IF;

  SELECT id INTO v_plan_id FROM public.plans WHERE name = v_plan_name;
  IF FOUND THEN
    INSERT INTO public.user_plans (user_id, plan_id, status, is_trial, current_period_start, current_period_end)
      VALUES (
        NEW.id, v_plan_id, 'active',
        CASE WHEN v_plan_name = 'Personalizado' THEN false ELSE true END,
        now(),
        CASE WHEN v_plan_name = 'Personalizado' THEN null ELSE now() + interval '7 days' END
      )
      ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
