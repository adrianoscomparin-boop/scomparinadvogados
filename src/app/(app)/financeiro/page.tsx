import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { CATEGORIA_LABELS, type LancamentoFinanceiro, type TipoLancamento } from "@/lib/types";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import { marcarPago, marcarPendente, cancelarLancamento } from "./actions";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>;
}) {
  const { tipo, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("lancamentos_financeiros")
    .select("*, clientes(id, nome), processos(id, numero_processo)")
    .order("vencimento", { ascending: true });

  if (tipo) query = query.eq("tipo", tipo);
  if (status) query = query.eq("status", status);

  const { data: lancamentos } = await query;
  const today = todayISO();

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Contas a pagar e a receber" action={{ href: "/financeiro/novo", label: "+ Novo lançamento" }} />

      <form className="mb-4 flex flex-wrap gap-2">
        <select name="tipo" defaultValue={tipo ?? ""} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm">
          <option value="">Receitas e despesas</option>
          <option value="receita">Somente receitas (a receber)</option>
          <option value="despesa">Somente despesas (a pagar)</option>
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button type="submit" className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
          Filtrar
        </button>
      </form>

      {!lancamentos || lancamentos.length === 0 ? (
        <EmptyState message="Nenhum lançamento encontrado." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Cliente / Processo</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(lancamentos as LancamentoFinanceiro[]).map((l) => {
                const atrasado = l.status === "pendente" && l.vencimento < today;
                return (
                  <tr key={l.id} className="border-b border-[var(--border)] last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link href={`/financeiro/${l.id}`} className="font-medium text-[var(--brand-dark)] hover:underline">
                        {l.descricao}
                      </Link>
                      {l.parcela_total && l.parcela_total > 1 && (
                        <p className="text-xs text-neutral-400">
                          Parcela {l.parcela_numero}/{l.parcela_total}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {l.clientes?.nome ?? "—"}
                      {l.processos?.numero_processo && (
                        <p className="text-xs text-neutral-400">{l.processos.numero_processo}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{CATEGORIA_LABELS[l.categoria]}</td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(l.vencimento)}</td>
                    <td className={`px-4 py-3 font-semibold ${l.tipo === "receita" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                      {l.tipo === ("receita" as TipoLancamento) ? "+" : "-"} {formatCurrency(l.valor)}
                    </td>
                    <td className="px-4 py-3">
                      {l.status === "pago" && <Badge color="green">Pago</Badge>}
                      {l.status === "cancelado" && <Badge color="neutral">Cancelado</Badge>}
                      {l.status === "pendente" && (atrasado ? <Badge color="red">Atrasado</Badge> : <Badge color="amber">Pendente</Badge>)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {l.status !== "pago" && (
                          <form action={marcarPago}>
                            <input type="hidden" name="id" value={l.id} />
                            <button type="submit" className="text-xs font-medium text-[var(--success)] hover:underline">
                              Marcar pago
                            </button>
                          </form>
                        )}
                        {l.status === "pago" && (
                          <form action={marcarPendente}>
                            <input type="hidden" name="id" value={l.id} />
                            <button type="submit" className="text-xs font-medium text-neutral-400 hover:underline">
                              Reabrir
                            </button>
                          </form>
                        )}
                        {l.status !== "cancelado" && (
                          <form action={cancelarLancamento}>
                            <input type="hidden" name="id" value={l.id} />
                            <button type="submit" className="text-xs font-medium text-neutral-400 hover:text-[var(--danger)]">
                              Cancelar
                            </button>
                          </form>
                        )}
                      </div>
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
