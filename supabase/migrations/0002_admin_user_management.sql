-- Permite que administradores gerenciem os perfis de outros usuários
-- (papel e status ativo/inativo), necessário para a tela /usuarios.

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and papel = 'admin' and ativo = true
  );
$$;

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());
