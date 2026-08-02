import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { LancamentoForm } from "../lancamento-form";
import { createLancamento } from "../actions";

export default async function NovoLancamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ processo_id?: string; cliente_id?: string }>;
}) {
  const { processo_id, cliente_id } = await searchParams;
  const supabase = await createClient();
  const [{ data: clientes }, { data: processos }] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("processos").select("id, numero_processo").order("numero_processo"),
  ]);

  return (
    <div>
      <PageHeader title="Novo lançamento" subtitle="Conta a pagar ou a receber" />
      <LancamentoForm
        clientes={clientes ?? []}
        processos={processos ?? []}
        defaultProcessoId={processo_id}
        defaultClienteId={cliente_id}
        action={createLancamento}
      />
    </div>
  );
}
