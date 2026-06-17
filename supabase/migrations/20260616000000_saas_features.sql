-- alerts: notificações de mudanças em empresas monitoradas
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.cnpjs(id) on delete cascade,
  event_type text not null,
  description text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
alter table public.alerts enable row level security;
create policy "alerts_own" on public.alerts for all using (auth.uid() = user_id);

-- company_changes: auditoria completa com diff campo a campo
create table if not exists public.company_changes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.cnpjs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  field_name text not null,
  old_value text,
  new_value text,
  changed_at timestamptz not null default now()
);
alter table public.company_changes enable row level security;
create policy "changes_own" on public.company_changes for all using (auth.uid() = user_id);

-- tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);
alter table public.tags enable row level security;
create policy "tags_own" on public.tags for all using (auth.uid() = user_id);

-- company_tags: relação M:N
create table if not exists public.company_tags (
  company_id uuid not null references public.cnpjs(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (company_id, tag_id)
);
alter table public.company_tags enable row level security;
create policy "company_tags_own" on public.company_tags
  for all using (
    exists (select 1 from public.cnpjs c where c.id = company_id and c.user_id = auth.uid())
  );

-- favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.cnpjs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, company_id)
);
alter table public.favorites enable row level security;
create policy "favorites_own" on public.favorites for all using (auth.uid() = user_id);

-- plans
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  max_queries integer not null default 20,
  max_monitored integer not null default 5,
  price_cents integer not null default 0,
  features jsonb not null default '[]'::jsonb
);
insert into public.plans (name, max_queries, max_monitored, price_cents, features) values
  ('Free',    20,   5,     0,     '["20 consultas/mês","5 empresas monitoradas"]'),
  ('Starter', 500,  100,  4900,  '["500 consultas/mês","100 monitoramentos","Alertas por email"]'),
  ('Pro',     -1,   -1,   9900,  '["Consultas ilimitadas","Monitoramento avançado","API pública","Relatórios PDF"]')
on conflict (name) do nothing;

-- user_plans
create table if not exists public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_plans enable row level security;
create policy "user_plans_own" on public.user_plans for all using (auth.uid() = user_id);

-- usage_logs: controle de consumo
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);
alter table public.usage_logs enable row level security;
create policy "usage_logs_own" on public.usage_logs for all using (auth.uid() = user_id);

-- monitor_settings: frequência por empresa
create table if not exists public.monitor_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.cnpjs(id) on delete cascade unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  frequency text not null default 'weekly',
  last_check timestamptz,
  next_check timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.monitor_settings enable row level security;
create policy "monitor_settings_own" on public.monitor_settings for all using (auth.uid() = user_id);

-- audit_logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create policy "audit_logs_own" on public.audit_logs for select using (auth.uid() = user_id);
create policy "audit_logs_insert" on public.audit_logs for insert with check (auth.uid() = user_id);
