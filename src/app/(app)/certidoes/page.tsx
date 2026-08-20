import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { STATUS_PESQUISA_CERTIDOES_LABELS, type CertidaoPesquisa } from "@/lib/types";

export default async function CertidoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("certidoes_pesquisas")
    .select("*, clientes(id, nome)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`titulo.ilike.%${q}%,endereco.ilike.%${q}%,cidade.ilike.%${q}%`);
  }

  const { data: pesquisas } = await query;

  const ids = (pesquisas ?? []).map((p) => p.id);
  const { data: itens } = ids.length
    ? await supabase.from("certidoes_itens").select("pesquisa_id, status").in("pesquisa_id", ids)
    : { data: [] as { pesquisa_id: string; status: string }[] };

  const progresso = new Map<string, { total: number; emitidas: number }>();
  for (const item of itens ?? []) {
    const current = progresso.get(item.pesquisa_id) ?? { total: 0, emitidas: 0 };
    current.total += 1;
    if (item.status === "emitida" || item.status === "nao_aplicavel") current.emitidas += 1;
    progresso.set(item.pesquisa_id, current);
  }

  return (
    <div>
      <PageHeader
        title="Certidões negativas"
        subtitle="Checklist de diligências imobiliárias — links diretos aos portais e controle de status"
        action={{ href: "/certidoes/novo", label: "+ Nova diligência" }}
      />

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por título, endereço ou cidade..."
          className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
      </form>

      {!pesquisas || pesquisas.length === 0 ? (
        <EmptyState message="Nenhuma diligência de certidões cadastrada ainda." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-medium">Diligência</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Progresso</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Criada em</th>
              </tr>
            </thead>
            <tbody>
              {(pesquisas as CertidaoPesquisa[]).map((pesquisa) => {
                const p = progresso.get(pesquisa.id) ?? { total: 0, emitidas: 0 };
                return (
                  <tr key={pesquisa.id} className="border-b border-[var(--border)] last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link href={`/certidoes/${pesquisa.id}`} className="font-medium text-[var(--brand-dark)] hover:underline">
                        {pesquisa.titulo}
                      </Link>
                      <p className="text-xs text-neutral-400">{[pesquisa.endereco, pesquisa.cidade].filter(Boolean).join(" — ")}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{pesquisa.clientes?.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge color={p.total > 0 && p.emitidas === p.total ? "green" : "amber"}>
                        {p.emitidas}/{p.total} concluídas
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={pesquisa.status === "concluida" ? "green" : "brand"}>
                        {STATUS_PESQUISA_CERTIDOES_LABELS[pesquisa.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(pesquisa.created_at)}</td>
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
