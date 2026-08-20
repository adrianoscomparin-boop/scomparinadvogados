"use client";

import { useActionState, useState } from "react";
import { FieldLabel, inputClass } from "@/components/ui";
import type { TipoPessoa } from "@/lib/types";
import type { PesquisaFormState } from "./actions";

interface Option {
  id: string;
  nome: string;
}

interface ParteDraft {
  nome: string;
  cpf_cnpj: string;
  tipo_pessoa: TipoPessoa;
}

export function PesquisaForm({
  clientes,
  processos,
  action,
}: {
  clientes: Option[];
  processos: (Option & { numero_processo?: string })[];
  action: (state: PesquisaFormState, formData: FormData) => Promise<PesquisaFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [partes, setPartes] = useState<ParteDraft[]>([{ nome: "", cpf_cnpj: "", tipo_pessoa: "fisica" }]);

  function updateParte(index: number, patch: Partial<ParteDraft>) {
    setPartes((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function addParteRow() {
    setPartes((prev) => [...prev, { nome: "", cpf_cnpj: "", tipo_pessoa: "fisica" }]);
  }

  function removeParteRow(index: number) {
    setPartes((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <input type="hidden" name="partes" value={JSON.stringify(partes)} />

      <div>
        <FieldLabel htmlFor="titulo">Identificação da diligência</FieldLabel>
        <input
          id="titulo"
          name="titulo"
          required
          placeholder="Ex.: Rua das Flores, 123 - Sinop/MT"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="cliente_id">Cliente vinculado (opcional)</FieldLabel>
          <select id="cliente_id" name="cliente_id" defaultValue="" className={inputClass}>
            <option value="">Nenhum</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="processo_id">Processo vinculado (opcional)</FieldLabel>
          <select id="processo_id" name="processo_id" defaultValue="" className={inputClass}>
            <option value="">Nenhum</option>
            {processos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.numero_processo ?? p.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Dados do imóvel</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="endereco">Endereço</FieldLabel>
          <input id="endereco" name="endereco" className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="numero">Número</FieldLabel>
          <input id="numero" name="numero" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
          <input id="bairro" name="bairro" className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
          <input id="cidade" name="cidade" className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="estado">Estado</FieldLabel>
          <input id="estado" name="estado" maxLength={2} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="cep">CEP</FieldLabel>
          <input id="cep" name="cep" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="matricula">Matrícula do imóvel</FieldLabel>
          <input id="matricula" name="matricula" className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="inscricao_imobiliaria">Inscrição imobiliária</FieldLabel>
          <input id="inscricao_imobiliaria" name="inscricao_imobiliaria" className={inputClass} />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Proprietários (para as certidões pessoais)
        </p>
        <button type="button" onClick={addParteRow} className="text-sm font-medium text-[var(--brand-dark)] hover:underline">
          + Adicionar proprietário
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {partes.map((parte, index) => (
          <div key={index} className="grid grid-cols-1 items-end gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_140px_auto]">
            <div>
              <FieldLabel htmlFor={`parte_nome_${index}`}>Nome / Razão social</FieldLabel>
              <input
                id={`parte_nome_${index}`}
                value={parte.nome}
                onChange={(e) => updateParte(index, { nome: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor={`parte_doc_${index}`}>CPF / CNPJ</FieldLabel>
              <input
                id={`parte_doc_${index}`}
                value={parte.cpf_cnpj}
                onChange={(e) => updateParte(index, { cpf_cnpj: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor={`parte_tipo_${index}`}>Tipo</FieldLabel>
              <select
                id={`parte_tipo_${index}`}
                value={parte.tipo_pessoa}
                onChange={(e) => updateParte(index, { tipo_pessoa: e.target.value as TipoPessoa })}
                className={inputClass}
              >
                <option value="fisica">Física</option>
                <option value="juridica">Jurídica</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeParteRow(index)}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-neutral-500 hover:border-[var(--danger)] hover:text-[var(--danger)]"
            >
              Remover
            </button>
          </div>
        ))}
        {partes.length === 0 && (
          <p className="text-sm text-neutral-400">Nenhum proprietário adicionado — apenas as certidões do imóvel serão geradas.</p>
        )}
      </div>

      <div>
        <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
        <textarea id="observacoes" name="observacoes" rows={3} className={inputClass} />
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={pending} className="btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
          {pending ? "Criando..." : "Criar diligência e gerar checklist"}
        </button>
      </div>
    </form>
  );
}
