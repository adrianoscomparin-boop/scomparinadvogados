import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { TIPO_RELACAO_LABELS, type Cliente } from "@/lib/types";
import { deleteCliente } from "./actions";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (q) {
    query = query.or(`nome.ilike.%${q}%,cpf_cnpj.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: clientes } = await query;

  const relacaoColor: Record<string, "brand" | "red" | "amber"> = {
    cliente: "brand",
    devedor: "red",
    ambos: "amber",
  };

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Cadastro de clientes e devedores" action={{ href: "/clientes/novo", label: "+ Novo cliente" }} />

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
          className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
      </form>

      {!clientes || clientes.length === 0 ? (
        <EmptyState message="Nenhum cliente cadastrado ainda." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Relação</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(clientes as Cliente[]).map((cliente) => (
                <tr key={cliente.id} className="border-b border-[var(--border)] last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/clientes/${cliente.id}`} className="font-medium text-[var(--brand-dark)] hover:underline">
                      {cliente.nome}
                    </Link>
                    <p className="text-xs text-neutral-400">{cliente.tipo_pessoa === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{cliente.cpf_cnpj ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    <p>{cliente.telefone ?? cliente.whatsapp ?? "—"}</p>
                    <p className="text-xs text-neutral-400">{cliente.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={relacaoColor[cliente.tipo_relacao]}>{TIPO_RELACAO_LABELS[cliente.tipo_relacao]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteCliente}>
                      <input type="hidden" name="id" value={cliente.id} />
                      <button type="submit" className="text-xs font-medium text-neutral-400 hover:text-[var(--danger)]">
                        Inativar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
