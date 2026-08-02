import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { ClienteForm } from "../cliente-form";
import { updateCliente } from "../actions";
import type { Cliente } from "@/lib/types";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cliente } = await supabase.from("clientes").select("*").eq("id", id).single();

  if (!cliente) {
    notFound();
  }

  const boundUpdate = updateCliente.bind(null, id);

  return (
    <div>
      <PageHeader title="Editar cliente" subtitle={cliente.nome} />
      <ClienteForm cliente={cliente as Cliente} action={boundUpdate} />
    </div>
  );
}
