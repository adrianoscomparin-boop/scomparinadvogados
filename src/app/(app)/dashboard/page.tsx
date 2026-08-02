import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Badge, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate, daysUntil, todayISO } from "@/lib/format";
import { STATUS_PROCESSO_LABELS, type StatusProcesso } from "@/lib/types";
import { ProcessosStatusChart, ReceitaDespesaChart } from "./charts";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = todayISO();

  const [{ data: lancamentos }, { data: processos }, { data: prazos }] = await Promise.all([
    supabase.from("lancamentos_financeiros").select("tipo, valor, vencimento, status"),
    supabase.from("processos").select("status"),
    supabase
      .from("andamentos")
      .select("id, prazo_data, descricao, processo_id, processos(numero_processo, clientes(nome))")
      .eq("tipo", "prazo")
      .eq("prazo_cumprido", false)
      .order("prazo_data", { ascending: true })
      .limit(8),
  ]);

  const aReceber = (lancamentos ?? [])
    .filter((l) => l.tipo === "receita" && l.status === "pendente")
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const aPagar = (lancamentos ?? [])
    .filter((l) => l.tipo === "despesa" && l.status === "pendente")
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const inadimplentes = (lancamentos ?? []).filter(
    (l) => l.tipo === "receita" && l.status === "pendente" && l.vencimento < today,
  );
  const totalInadimplente = inadimplentes.reduce((sum, l) => sum + Number(l.valor), 0);

  const recebidoMes = (lancamentos ?? [])
    .filter((l) => l.tipo === "receita" && l.status === "pago" && l.vencimento.slice(0, 7) === today.slice(0, 7))
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const statusCount = new Map<string, number>();
  for (const p of processos ?? []) {
    const label = STATUS_PROCESSO_LABELS[p.status as StatusProcesso];
    statusCount.set(label, (statusCount.get(label) ?? 0) + 1);
  }
  const processosChartData = Array.from(statusCount.entries()).map(([name, value]) => ({ name, value }));
  const processosAtivos = (processos ?? []).filter((p) => p.status === "ativo").length;

  const prazosList = (prazos ?? []).map((p) => {
    const rawProc: unknown = Array.isArray(p.processos) ? p.processos[0] : p.processos;
    const proc = rawProc as { numero_processo?: string; clientes?: unknown } | undefined;
    const rawCliente: unknown = Array.isArray(proc?.clientes) ? proc?.clientes[0] : proc?.clientes;
    const cliente = rawCliente as { nome?: string } | undefined;
    return {
      id: p.id as string,
      processo_id: p.processo_id as string,
      descricao: p.descricao as string,
      prazo_data: p.prazo_data as string | null,
      numero_processo: proc?.numero_processo ?? "",
      cliente_nome: cliente?.nome ?? "",
    };
  });

  const now = new Date();
  const monthly: { mes: string; receita: number; despesa: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const receita = (lancamentos ?? [])
      .filter((l) => l.tipo === "receita" && l.status !== "cancelado" && l.vencimento.slice(0, 7) === key)
      .reduce((sum, l) => sum + Number(l.valor), 0);
    const despesa = (lancamentos ?? [])
      .filter((l) => l.tipo === "despesa" && l.status !== "cancelado" && l.vencimento.slice(0, 7) === key)
      .reduce((sum, l) => sum + Number(l.valor), 0);
    monthly.push({ mes: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, receita, despesa });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-neutral-500">Visão geral do escritório</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="A receber" value={formatCurrency(aReceber)} color="brand" />
        <StatCard label="A pagar" value={formatCurrency(aPagar)} color="red" />
        <StatCard label="Recebido no mês" value={formatCurrency(recebidoMes)} color="green" />
        <StatCard label={`Inadimplência (${inadimplentes.length})`} value={formatCurrency(totalInadimplente)} color="amber" />
        <StatCard label="Processos ativos" value={String(processosAtivos)} color="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-2 text-sm font-bold text-[var(--foreground)]">Receitas x Despesas (últimos 6 meses)</h2>
          <ReceitaDespesaChart data={monthly} />
        </div>
        <div className="card p-4">
          <h2 className="mb-2 text-sm font-bold text-[var(--foreground)]">Processos por status</h2>
          <ProcessosStatusChart data={processosChartData} />
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--foreground)]">Próximos prazos</h2>
          <Link href="/processos" className="text-xs font-medium text-[var(--brand-dark)] hover:underline">
            Ver todos os processos
          </Link>
        </div>
        {prazosList.length === 0 ? (
          <EmptyState message="Nenhum prazo pendente." />
        ) : (
          <ul className="flex flex-col gap-2">
            {prazosList.map((p) => {
              const remaining = p.prazo_data ? daysUntil(p.prazo_data) : null;
              return (
                <li key={p.id} className="flex items-center justify-between border-b border-[var(--border)] py-2 text-sm last:border-0">
                  <div>
                    <Link href={`/processos/${p.processo_id}`} className="font-medium text-[var(--brand-dark)] hover:underline">
                      {p.numero_processo}
                    </Link>
                    <p className="text-xs text-neutral-400">
                      {p.cliente_nome} · {p.descricao}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{formatDate(p.prazo_data)}</span>
                    {remaining !== null && (
                      <Badge color={remaining < 0 ? "red" : remaining <= 5 ? "amber" : "neutral"}>
                        {remaining < 0 ? `${Math.abs(remaining)}d atrasado` : `${remaining}d`}
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
