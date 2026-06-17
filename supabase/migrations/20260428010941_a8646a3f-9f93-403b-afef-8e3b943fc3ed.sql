
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Updated at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + notification_settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email) VALUES (NEW.id, NEW.email);
  INSERT INTO public.notification_settings (user_id, notification_email)
    VALUES (NEW.id, NEW.email);
  RETURN NEW;
END; $$;

-- CNPJs
CREATE TABLE public.cnpjs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cnpj VARCHAR(14) NOT NULL,
  razao_social TEXT,
  nome_fantasia TEXT,
  simples_nacional BOOLEAN,
  regime_tributario TEXT CHECK (regime_tributario IN ('MEI','Simples','Lucro Presumido','Lucro Real','Indefinido')),
  status_cadastral TEXT CHECK (status_cadastral IN ('Ativa','Inapta','Suspensa','Baixada','Nula','Indefinido')),
  data_inicio_regime DATE,
  porte TEXT,
  municipio TEXT,
  uf TEXT,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cnpj)
);
CREATE INDEX idx_cnpjs_user ON public.cnpjs(user_id);
CREATE INDEX idx_cnpjs_last_checked ON public.cnpjs(last_checked_at);
ALTER TABLE public.cnpjs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cnpjs select own" ON public.cnpjs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cnpjs insert own" ON public.cnpjs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cnpjs update own" ON public.cnpjs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cnpjs delete own" ON public.cnpjs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER cnpjs_updated_at BEFORE UPDATE ON public.cnpjs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- History
CREATE TABLE public.cnpj_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj_id UUID NOT NULL REFERENCES public.cnpjs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_history_user ON public.cnpj_history(user_id, changed_at DESC);
CREATE INDEX idx_history_cnpj ON public.cnpj_history(cnpj_id);
ALTER TABLE public.cnpj_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history select own" ON public.cnpj_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "history insert own" ON public.cnpj_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification settings
CREATE TABLE public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  notification_email TEXT,
  webhook_url TEXT,
  monitoring_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (monitoring_frequency IN ('daily','weekly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings select own" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings insert own" ON public.notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings update own" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
