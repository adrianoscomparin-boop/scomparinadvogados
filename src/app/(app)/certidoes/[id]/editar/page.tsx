import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import type { CertidaoPesquisa } from "@/lib/types";
import { EditarPesquisaForm } from "../editar-form";
import { updatePesquisa } from "../../actions";

export default async function EditarPesquisaCertidoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pesquisa }, { data: clientes }, { data: processos }] = await Promise.all([
    supabase.from("certidoes_pesquisas").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("processos").select("id, numero_processo").order("numero_processo"),
  ]);

  if (!pesquisa) {
    notFound();
  }

  const boundUpdate = updatePesquisa.bind(null, id);

  return (
    <div>
      <PageHeader title="Editar diligência" subtitle={pesquisa.titulo} />
      <EditarPesquisaForm
        pesquisa={pesquisa as CertidaoPesquisa}
        clientes={clientes ?? []}
        processos={(processos ?? []).map((p) => ({ id: p.id, nome: p.numero_processo, numero_processo: p.numero_processo }))}
        action={boundUpdate}
      />
    </div>
  );
}
