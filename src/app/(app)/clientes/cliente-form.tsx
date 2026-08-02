"use client";

import { useActionState } from "react";
import type { Cliente } from "@/lib/types";
import { FieldLabel, inputClass } from "@/components/ui";
import type { ClienteFormState } from "./actions";

export function ClienteForm({
  cliente,
  action,
}: {
  cliente?: Cliente;
  action: (state: ClienteFormState, formData: FormData) => Promise<ClienteFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="tipo_pessoa">Tipo de pessoa</FieldLabel>
          <select id="tipo_pessoa" name="tipo_pessoa" defaultValue={cliente?.tipo_pessoa ?? "fisica"} className={inputClass}>
            <option value="fisica">Pessoa Física</option>
            <option value="juridica">Pessoa Jurídica</option>
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="tipo_relacao">Relação</FieldLabel>
          <select id="tipo_relacao" name="tipo_relacao" defaultValue={cliente?.tipo_relacao ?? "cliente"} className={inputClass}>
            <option value="cliente">Cliente</option>
            <option value="devedor">Devedor (cobrança)</option>
            <option value="ambos">Cliente e Devedor</option>
          </select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="nome">Nome completo / Razão social</FieldLabel>
        <input id="nome" name="nome" required defaultValue={cliente?.nome} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="cpf_cnpj">CPF / CNPJ</FieldLabel>
          <input id="cpf_cnpj" name="cpf_cnpj" defaultValue={cliente?.cpf_cnpj ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <input id="email" name="email" type="email" defaultValue={cliente?.email ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
          <input id="telefone" name="telefone" defaultValue={cliente?.telefone ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
          <input id="whatsapp" name="whatsapp" defaultValue={cliente?.whatsapp ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="endereco">Endereço</FieldLabel>
        <input id="endereco" name="endereco" defaultValue={cliente?.endereco ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
          <input id="cidade" name="cidade" defaultValue={cliente?.cidade ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="estado">Estado</FieldLabel>
          <input id="estado" name="estado" maxLength={2} defaultValue={cliente?.estado ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="cep">CEP</FieldLabel>
          <input id="cep" name="cep" defaultValue={cliente?.cep ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
        <textarea id="observacoes" name="observacoes" rows={3} defaultValue={cliente?.observacoes ?? ""} className={inputClass} />
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={pending} className="btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
