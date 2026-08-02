import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, EmptyState, FieldLabel, inputClass } from "@/components/ui";
import {
  AREA_LABELS,
  FASE_LABELS,
  STATUS_PROCESSO_LABELS,
  CATEGORIA_LABELS,
  type Andamento,
  type LancamentoFinanceiro,
  type StatusProcesso,
} from "@/lib/types";
import { formatCurrency, formatDate, daysUntil } from "@/lib/format";
import { addAndamento, togglePrazoCumprido } from "../actions";

const statusColor: Record<StatusProcesso, "brand" | "amber" | "neutral" | "red" | "green"> = {
  ativo: "brand",
  suspenso: "amber",
  arquivado: "neutral",
  encerrado: "green",
  extinto: "neutral",
};

const tipoIcon: Record<string, string> = {
  andamento: "📄",
  prazo: "⏰",
  audiencia: "🏛️",
};

export default async function ProcessoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: processo }, { data: andamentos }, { data: lancamentos }] = await Promise.all([
    supabase.from("processos").select("*, clientes(id, nome)").eq("id", id).single(),
    supabase.from("andamentos").select("*").eq("processo_id", id).order("data", { ascending: false }),
    supabase
      .from("lancamentos_financeiros")
      .select("*")
      .eq("processo_id", id)
      .order("vencimento", { ascending: false }),
  ]);

  if (!processo) {
    notFound();
  }

  const boundAddAndamento = addAndamento.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--foreground)]">{processo.numero_processo}</h1>
            <Badge color={statusColor[processo.status as StatusProcesso]}>{STATUS_PROCESSO_LABELS[processo.status as StatusProcesso]}</Badge>
          </div>
          <p className="text-sm text-neutral-500">
            <Link href={`/clientes/${processo.cliente_id}`} className="text-[var(--brand-dark)] hover:underline">
              {processo.clientes?.nome}
            </Link>
            {processo.parte_contraria && <> x {processo.parte_contraria}</>}
          </p>
        </div>
        <Link href={`/processos/${id}/editar`} className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
          Editar processo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoItem label="Área" value={AREA_LABELS[processo.area as keyof typeof AREA_LABELS]} />
        <InfoItem label="Fase" value={FASE_LABELS[processo.fase as keyof typeof FASE_LABELS]} />
        <InfoItem label="Tribunal/Vara" value={[processo.tribunal, processo.vara].filter(Boolean).join(" / ") || "—"} />
        <InfoItem label="Comarca" value={processo.comarca ?? "—"} />
        <InfoItem label="Valor da causa" value={processo.valor_causa ? formatCurrency(processo.valor_causa) : "—"} />
        <InfoItem label="Distribuição" value={formatDate(processo.data_distribuicao)} />
      </div>

      {processo.observacoes && (
        <div className="card p-4 text-sm text-neutral-600">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Observações</p>
          {processo.observacoes}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--foreground)]">Andamentos e prazos</h2>

        <form action={boundAddAndamento} className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-[140px_140px_1fr_140px_auto]">
          <div>
            <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
            <select id="tipo" name="tipo" className={inputClass} defaultValue="andamento">
              <option value="andamento">Andamento</option>
              <option value="prazo">Prazo</option>
              <option value="audiencia">Audiência</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="data">Data</FieldLabel>
            <input id="data" name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
          </div>
          <div>
            <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
            <input id="descricao" name="descricao" required placeholder="Ex.: Juntada de contestação" className={inputClass} />
          </div>
          <div>
            <FieldLabel htmlFor="prazo_data">Vencimento do prazo</FieldLabel>
            <input id="prazo_data" name="prazo_data" type="date" className={inputClass} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full rounded-lg px-4 py-2 text-sm font-semibold">
              Adicionar
            </button>
          </div>
        </form>

        {!andamentos || andamentos.length === 0 ? (
          <EmptyState message="Nenhum andamento registrado." />
        ) : (
          <ul className="flex flex-col gap-2">
            {(andamentos as Andamento[]).map((item) => {
              const isPrazo = item.tipo === "prazo" && item.prazo_data;
              const remaining = isPrazo ? daysUntil(item.prazo_data!) : null;
              return (
                <li key={item.id} className="card flex items-start justify-between gap-3 p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{tipoIcon[item.tipo]}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{item.descricao}</p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(item.data)}
                        {isPrazo && (
                          <>
                            {" "}
                            · vence em {formatDate(item.prazo_data)}
                            {!item.prazo_cumprido && remaining !== null && (
                              <span className={remaining < 0 ? "text-[var(--danger)]" : remaining <= 5 ? "text-[var(--warning)]" : ""}>
                                {" "}
                                ({remaining < 0 ? `${Math.abs(remaining)}d atrasado` : `faltam ${remaining}d`})
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  {item.tipo === "prazo" && (
                    <form action={togglePrazoCumprido}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="processo_id" value={id} />
                      <input type="hidden" name="cumprido" value={String(item.prazo_cumprido)} />
                      <button type="submit">
                        <Badge color={item.prazo_cumprido ? "green" : "amber"}>{item.prazo_cumprido ? "Cumprido" : "Pendente"}</Badge>
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--foreground)]">Lançamentos financeiros vinculados</h2>
          <Link href={`/financeiro/novo?processo_id=${id}`} className="text-sm font-medium text-[var(--brand-dark)] hover:underline">
            + Novo lançamento
          </Link>
        </div>
        {!lancamentos || lancamentos.length === 0 ? (
          <EmptyState message="Nenhum lançamento financeiro vinculado a este processo." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(lancamentos as LancamentoFinanceiro[]).map((l) => (
                  <tr key={l.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/financeiro/${l.id}`} className="text-[var(--brand-dark)] hover:underline">
                        {l.descricao}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{CATEGORIA_LABELS[l.categoria]}</td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(l.vencimento)}</td>
                    <td className={`px-4 py-3 font-medium ${l.tipo === "receita" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                      {l.tipo === "receita" ? "+" : "-"} {formatCurrency(l.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={l.status === "pago" ? "green" : l.status === "cancelado" ? "neutral" : "amber"}>
                        {l.status === "pago" ? "Pago" : l.status === "cancelado" ? "Cancelado" : "Pendente"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">{value}</p>
    </div>
  );
}
