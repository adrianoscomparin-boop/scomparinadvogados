-- Módulo de Certidões Negativas — checklist de due diligence imobiliária
-- Cada "pesquisa" representa uma diligência (um imóvel + seus proprietários);
-- ao criar a pesquisa, o app gera automaticamente os itens de certidão
-- aplicáveis (catálogo definido em src/lib/certidoes-catalogo.ts) para o
-- usuário abrir o portal correto, acompanhar o status e anexar o PDF obtido.

-- ============================================================
-- TABELAS
-- ============================================================
create table public.certidoes_pesquisas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  endereco text,
  numero text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  matricula text,
  inscricao_imobiliaria text,
  cliente_id uuid references public.clientes(id) on delete set null,
  processo_id uuid references public.processos(id) on delete set null,
  status text not null default 'em_andamento' check (status in ('em_andamento', 'concluida')),
  observacoes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index certidoes_pesquisas_cliente_idx on public.certidoes_pesquisas (cliente_id);
create index certidoes_pesquisas_processo_idx on public.certidoes_pesquisas (processo_id);

create table public.certidoes_partes (
  id uuid primary key default gen_random_uuid(),
  pesquisa_id uuid not null references public.certidoes_pesquisas(id) on delete cascade,
  nome text not null,
  cpf_cnpj text,
  tipo_pessoa public.tipo_pessoa not null default 'fisica',
  created_at timestamptz not null default now()
);

create index certidoes_partes_pesquisa_idx on public.certidoes_partes (pesquisa_id);

create table public.certidoes_itens (
  id uuid primary key default gen_random_uuid(),
  pesquisa_id uuid not null references public.certidoes_pesquisas(id) on delete cascade,
  parte_id uuid references public.certidoes_partes(id) on delete cascade,
  tipo text not null,
  status text not null default 'pendente' check (status in ('pendente', 'solicitada', 'emitida', 'nao_aplicavel')),
  resultado text check (resultado in ('negativa', 'positiva')),
  data_solicitacao date,
  data_emissao date,
  data_validade date,
  arquivo_path text,
  arquivo_nome text,
  observacoes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index certidoes_itens_pesquisa_idx on public.certidoes_itens (pesquisa_id);
create index certidoes_itens_parte_idx on public.certidoes_itens (parte_id);
create index certidoes_itens_validade_idx on public.certidoes_itens (data_validade) where status = 'emitida';

create trigger certidoes_pesquisas_set_updated_at before update on public.certidoes_pesquisas
  for each row execute function public.set_updated_at();

create trigger certidoes_itens_set_updated_at before update on public.certidoes_itens
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (mesmo modelo de dados compartilhados da equipe)
-- ============================================================
alter table public.certidoes_pesquisas enable row level security;
alter table public.certidoes_partes enable row level security;
alter table public.certidoes_itens enable row level security;

create policy "certidoes_pesquisas_select" on public.certidoes_pesquisas
  for select using (public.is_membro_ativo());
create policy "certidoes_pesquisas_insert" on public.certidoes_pesquisas
  for insert with check (public.is_membro_ativo());
create policy "certidoes_pesquisas_update" on public.certidoes_pesquisas
  for update using (public.is_membro_ativo());
create policy "certidoes_pesquisas_delete" on public.certidoes_pesquisas
  for delete using (public.is_membro_ativo());

create policy "certidoes_partes_select" on public.certidoes_partes
  for select using (public.is_membro_ativo());
create policy "certidoes_partes_insert" on public.certidoes_partes
  for insert with check (public.is_membro_ativo());
create policy "certidoes_partes_update" on public.certidoes_partes
  for update using (public.is_membro_ativo());
create policy "certidoes_partes_delete" on public.certidoes_partes
  for delete using (public.is_membro_ativo());

create policy "certidoes_itens_select" on public.certidoes_itens
  for select using (public.is_membro_ativo());
create policy "certidoes_itens_insert" on public.certidoes_itens
  for insert with check (public.is_membro_ativo());
create policy "certidoes_itens_update" on public.certidoes_itens
  for update using (public.is_membro_ativo());
create policy "certidoes_itens_delete" on public.certidoes_itens
  for delete using (public.is_membro_ativo());

-- ============================================================
-- STORAGE: bucket privado para os PDFs das certidões anexadas
-- ============================================================
insert into storage.buckets (id, name, public)
values ('certidoes', 'certidoes', false)
on conflict (id) do nothing;

create policy "certidoes_storage_select" on storage.objects
  for select using (bucket_id = 'certidoes' and public.is_membro_ativo());
create policy "certidoes_storage_insert" on storage.objects
  for insert with check (bucket_id = 'certidoes' and public.is_membro_ativo());
create policy "certidoes_storage_update" on storage.objects
  for update using (bucket_id = 'certidoes' and public.is_membro_ativo());
create policy "certidoes_storage_delete" on storage.objects
  for delete using (bucket_id = 'certidoes' and public.is_membro_ativo());
