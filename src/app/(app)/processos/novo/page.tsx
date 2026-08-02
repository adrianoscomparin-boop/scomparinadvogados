import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { ProcessoForm } from "../processo-form";
import { createProcesso } from "../actions";

export default async function NovoProcessoPage() {
  const supabase = await createClient();
  const [{ data: clientes }, { data: advogados }] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("profiles").select("id, nome").eq("ativo", true).order("nome"),
  ]);

  return (
    <div>
      <PageHeader title="Novo processo" subtitle="Cadastre um processo judicial" />
      <ProcessoForm clientes={clientes ?? []} advogados={advogados ?? []} action={createProcesso} />
    </div>
  );
}
