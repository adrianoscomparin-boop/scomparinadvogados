import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { AREA_LABELS, STATUS_PROCESSO_LABELS, type Processo, type StatusProcesso } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const statusColor: Record<StatusProcesso, "brand" | "amber" | "neutral" | "red" | "green"> = {
  ativo: "brand",
  suspenso: "amber",
  arquivado: "neutral",
  encerrado: "green",
  extinto: "neutral",
};

export default async function ProcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("processos")
    .select("*, clientes(id, nome)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }
  if (q) {
    query = query.or(`numero_processo.ilike.%${q}%,parte_contraria.ilike.%${q}%`);
  }

  const { data: processos } = await query;

  return (
    <div>
      <PageHeader title="Processos judiciais" subtitle="Acompanhamento de processos em andamento" action={{ href: "/processos/novo", label: "+ Novo processo" }} />

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número ou parte contrária..."
          className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_PROCESSO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
          Filtrar
        </button>
      </form>

      {!processos || processos.length === 0 ? (
        <EmptyState message="Nenhum processo cadastrado ainda." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-medium">Processo</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Área</th>
                <th className="px-4 py-3 font-medium">Valor da causa</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(processos as Processo[]).map((processo) => (
                <tr key={processo.id} className="border-b border-[var(--border)] last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/processos/${processo.id}`} className="font-medium text-[var(--brand-dark)] hover:underline">
                      {processo.numero_processo}
                    </Link>
                    {processo.parte_contraria && <p className="text-xs text-neutral-400">x {processo.parte_contraria}</p>}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{processo.clientes?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{AREA_LABELS[processo.area]}</td>
                  <td className="px-4 py-3 text-neutral-600">{processo.valor_causa ? formatCurrency(processo.valor_causa) : "—"}</td>
                  <td className="px-4 py-3">
                    <Badge color={statusColor[processo.status]}>{STATUS_PROCESSO_LABELS[processo.status]}</Badge>
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
