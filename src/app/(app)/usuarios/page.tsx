import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { UsuarioForm } from "./usuario-form";
import { updateUsuarioPapel, toggleUsuarioAtivo } from "./actions";
import type { PapelUsuario, Profile } from "@/lib/types";

const papelLabel: Record<PapelUsuario, string> = {
  admin: "Administrador",
  advogado: "Advogado",
  financeiro: "Financeiro",
};

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: meuPerfil } = await supabase.from("profiles").select("papel").eq("id", user!.id).single();

  if (meuPerfil?.papel !== "admin") {
    return (
      <div>
        <PageHeader title="Usuários" subtitle="Gestão da equipe" />
        <EmptyState message="Apenas administradores podem gerenciar usuários. Peça para um administrador do escritório te dar esse acesso." />
      </div>
    );
  }

  const { data: usuarios } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Usuários" subtitle="Adicione e gerencie o acesso da equipe ao sistema" />

      <UsuarioForm />

      {!usuarios || usuarios.length === 0 ? (
        <EmptyState message="Nenhum usuário encontrado." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(usuarios as Profile[]).map((u) => {
                const isSelf = u.id === user!.id;
                return (
                  <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      {u.nome} {isSelf && <span className="text-xs font-normal text-neutral-400">(você)</span>}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <Badge color="brand">{papelLabel[u.papel]}</Badge>
                      ) : (
                        <form action={updateUsuarioPapel}>
                          <input type="hidden" name="id" value={u.id} />
                          <select
                            name="papel"
                            defaultValue={u.papel}
                            onChange={(e) => e.currentTarget.form?.requestSubmit()}
                            className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs"
                          >
                            <option value="advogado">Advogado</option>
                            <option value="financeiro">Financeiro</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </form>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge color={u.ativo ? "green" : "neutral"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isSelf && (
                        <form action={toggleUsuarioAtivo}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="ativo" value={String(u.ativo)} />
                          <button type="submit" className="text-xs font-medium text-neutral-400 hover:text-[var(--danger)]">
                            {u.ativo ? "Desativar" : "Reativar"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
