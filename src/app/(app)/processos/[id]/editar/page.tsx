import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { ProcessoForm } from "../../processo-form";
import { updateProcesso } from "../../actions";
import type { Processo } from "@/lib/types";

export default async function EditarProcessoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: processo }, { data: clientes }, { data: advogados }] = await Promise.all([
    supabase.from("processos").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("profiles").select("id, nome").eq("ativo", true).order("nome"),
  ]);

  if (!processo) {
    notFound();
  }

  const boundUpdate = updateProcesso.bind(null, id);

  return (
    <div>
      <PageHeader title="Editar processo" subtitle={processo.numero_processo} />
      <ProcessoForm processo={processo as Processo} clientes={clientes ?? []} advogados={advogados ?? []} action={boundUpdate} />
    </div>
  );
}
