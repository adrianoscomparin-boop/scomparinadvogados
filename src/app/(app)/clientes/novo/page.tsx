import { PageHeader } from "@/components/ui";
import { ClienteForm } from "../cliente-form";
import { createCliente } from "../actions";

export default function NovoClientePage() {
  return (
    <div>
      <PageHeader title="Novo cliente" subtitle="Cadastre um cliente ou devedor" />
      <ClienteForm action={createCliente} />
    </div>
  );
}
