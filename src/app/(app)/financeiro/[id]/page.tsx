import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { LancamentoForm } from "../lancamento-form";
import { updateLancamento } from "../actions";
import type { LancamentoFinanceiro } from "@/lib/types";

export default async function EditarLancamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: lancamento }, { data: clientes }, { data: processos }] = await Promise.all([
    supabase.from("lancamentos_financeiros").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("processos").select("id, numero_processo").order("numero_processo"),
  ]);

  if (!lancamento) {
    notFound();
  }

  const boundUpdate = updateLancamento.bind(null, id);

  return (
    <div>
      <PageHeader title="Editar lançamento" subtitle={lancamento.descricao} />
      <LancamentoForm
        lancamento={lancamento as LancamentoFinanceiro}
        clientes={clientes ?? []}
        processos={processos ?? []}
        action={boundUpdate}
      />
    </div>
  );
}
