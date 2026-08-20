import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { PesquisaForm } from "../pesquisa-form";
import { createPesquisa } from "../actions";

export default async function NovaPesquisaCertidoesPage() {
  const supabase = await createClient();
  const [{ data: clientes }, { data: processos }] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("processos").select("id, numero_processo").order("numero_processo"),
  ]);

  return (
    <div>
      <PageHeader title="Nova diligência de certidões" subtitle="Cadastre o imóvel e os proprietários para gerar o checklist de certidões negativas" />
      <PesquisaForm
        clientes={clientes ?? []}
        processos={(processos ?? []).map((p) => ({ id: p.id, nome: p.numero_processo, numero_processo: p.numero_processo }))}
        action={createPesquisa}
      />
    </div>
  );
}
