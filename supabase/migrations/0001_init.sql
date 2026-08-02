-- Scomparin Advogados — Sistema de Controle Financeiro e Processos Judiciais
-- Migration inicial: schema, RLS e triggers

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type public.papel_usuario as enum ('admin', 'advogado', 'financeiro');
create type public.tipo_pessoa as enum ('fisica', 'juridica');
create type public.tipo_relacao_cliente as enum ('cliente', 'devedor', 'ambos');
create type public.area_processo as enum (
  'civel', 'trabalhista', 'familia', 'cobranca', 'tributario',
  'criminal', 'consumidor', 'previdenciario', 'empresarial', 'outro'
);
create type public.fase_processo as enum (
  'conhecimento', 'recursal', 'execucao', 'cumprimento_sentenca', 'inqueito', 'administrativo'
);
create type public.status_processo as enum ('ativo', 'suspenso', 'arquivado', 'encerrado', 'extinto');
create type public.tipo_andamento as enum ('andamento', 'prazo', 'audiencia');
create type public.tipo_lancamento as enum ('receita', 'despesa');
create type public.categoria_lancamento as enum (
  'honorarios_contratuais', 'honorarios_exito', 'parcela_acordo', 'custas_processuais',
  'despesa_escritorio', 'salario', 'aluguel', 'imposto', 'outro'
);
create type public.status_lancamento as enum ('pendente', 'pago', 'cancelado');
create type public.forma_pagamento as enum ('pix', 'boleto', 'transferencia', 'dinheiro', 'cartao', 'outro');

-- ============================================================
-- PROFILES (equipe do escritório)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  papel public.papel_usuario not null default 'advogado',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CLIENTES / CONTATOS
-- ============================================================
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  tipo_pessoa public.tipo_pessoa not null default 'fisica',
  nome text not null,
  cpf_cnpj text,
  email text,
  telefone text,
  whatsapp text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  tipo_relacao public.tipo_relacao_cliente not null default 'cliente',
  observacoes text,
  ativo boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clientes_nome_idx on public.clientes using gin (to_tsvector('portuguese', nome));
create index clientes_cpf_cnpj_idx on public.clientes (cpf_cnpj);

-- ============================================================
-- PROCESSOS JUDICIAIS
-- ============================================================
create table public.processos (
  id uuid primary key default gen_random_uuid(),
  numero_processo text not null,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  parte_contraria text,
  area public.area_processo not null default 'civel',
  fase public.fase_processo not null default 'conhecimento',
  status public.status_processo not null default 'ativo',
  tribunal text,
  comarca text,
  vara text,
  valor_causa numeric(14,2),
  data_distribuicao date,
  advogado_responsavel uuid references public.profiles(id),
  observacoes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index processos_cliente_idx on public.processos (cliente_id);
create index processos_numero_idx on public.processos (numero_processo);
create index processos_status_idx on public.processos (status);

-- ============================================================
-- ANDAMENTOS / PRAZOS / AUDIÊNCIAS
-- ============================================================
create table public.andamentos (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos(id) on delete cascade,
  tipo public.tipo_andamento not null default 'andamento',
  data date not null default current_date,
  descricao text not null,
  prazo_data date,
  prazo_cumprido boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index andamentos_processo_idx on public.andamentos (processo_id);
create index andamentos_prazo_idx on public.andamentos (prazo_data) where tipo = 'prazo';

-- ============================================================
-- LANÇAMENTOS FINANCEIROS
-- ============================================================
create table public.lancamentos_financeiros (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_lancamento not null,
  categoria public.categoria_lancamento not null default 'outro',
  descricao text not null,
  valor numeric(14,2) not null check (valor >= 0),
  vencimento date not null,
  data_pagamento date,
  status public.status_lancamento not null default 'pendente',
  forma_pagamento public.forma_pagamento,
  cliente_id uuid references public.clientes(id) on delete set null,
  processo_id uuid references public.processos(id) on delete set null,
  grupo_parcela uuid,
  parcela_numero int,
  parcela_total int,
  observacoes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lancamentos_vencimento_idx on public.lancamentos_financeiros (vencimento);
create index lancamentos_status_idx on public.lancamentos_financeiros (status);
create index lancamentos_cliente_idx on public.lancamentos_financeiros (cliente_id);
create index lancamentos_processo_idx on public.lancamentos_financeiros (processo_id);
create index lancamentos_grupo_idx on public.lancamentos_financeiros (grupo_parcela);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clientes_set_updated_at before update on public.clientes
  for each row execute function public.set_updated_at();

create trigger processos_set_updated_at before update on public.processos
  for each row execute function public.set_updated_at();

create trigger lancamentos_set_updated_at before update on public.lancamentos_financeiros
  for each row execute function public.set_updated_at();

-- ============================================================
-- TRIGGER: criar profile automaticamente no signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- Modelo: qualquer usuário autenticado com profile ativo no
-- escritório enxerga e edita todos os dados (dados compartilhados
-- da equipe). Ajustar depois se for necessário granularidade por papel.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.processos enable row level security;
alter table public.andamentos enable row level security;
alter table public.lancamentos_financeiros enable row level security;

create or replace function public.is_membro_ativo()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and ativo = true
  );
$$;

-- profiles: usuário vê a própria linha e as dos colegas ativos; só admin edita papéis de terceiros
create policy "profiles_select" on public.profiles
  for select using (public.is_membro_ativo());

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- clientes
create policy "clientes_select" on public.clientes
  for select using (public.is_membro_ativo());
create policy "clientes_insert" on public.clientes
  for insert with check (public.is_membro_ativo());
create policy "clientes_update" on public.clientes
  for update using (public.is_membro_ativo());
create policy "clientes_delete" on public.clientes
  for delete using (public.is_membro_ativo());

-- processos
create policy "processos_select" on public.processos
  for select using (public.is_membro_ativo());
create policy "processos_insert" on public.processos
  for insert with check (public.is_membro_ativo());
create policy "processos_update" on public.processos
  for update using (public.is_membro_ativo());
create policy "processos_delete" on public.processos
  for delete using (public.is_membro_ativo());

-- andamentos
create policy "andamentos_select" on public.andamentos
  for select using (public.is_membro_ativo());
create policy "andamentos_insert" on public.andamentos
  for insert with check (public.is_membro_ativo());
create policy "andamentos_update" on public.andamentos
  for update using (public.is_membro_ativo());
create policy "andamentos_delete" on public.andamentos
  for delete using (public.is_membro_ativo());

-- lancamentos_financeiros
create policy "lancamentos_select" on public.lancamentos_financeiros
  for select using (public.is_membro_ativo());
create policy "lancamentos_insert" on public.lancamentos_financeiros
  for insert with check (public.is_membro_ativo());
create policy "lancamentos_update" on public.lancamentos_financeiros
  for update using (public.is_membro_ativo());
create policy "lancamentos_delete" on public.lancamentos_financeiros
  for delete using (public.is_membro_ativo());
