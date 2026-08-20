"use client";

import { useActionState } from "react";
import { FieldLabel, inputClass } from "@/components/ui";
import { STATUS_PESQUISA_CERTIDOES_LABELS, type CertidaoPesquisa } from "@/lib/types";
import type { PesquisaFormState } from "../actions";

interface Option {
  id: string;
  nome: string;
}

export function EditarPesquisaForm({
  pesquisa,
  clientes,
  processos,
  action,
}: {
  pesquisa: CertidaoPesquisa;
  clientes: Option[];
  processos: (Option & { numero_processo?: string })[];
  action: (state: PesquisaFormState, formData: FormData) => Promise<PesquisaFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div>
        <FieldLabel htmlFor="titulo">Identificação da diligência</FieldLabel>
        <input id="titulo" name="titulo" required defaultValue={pesquisa.titulo} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="cliente_id">Cliente vinculado (opcional)</FieldLabel>
          <select id="cliente_id" name="cliente_id" defaultValue={pesquisa.cliente_id ?? ""} className={inputClass}>
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
          <select id="processo_id" name="processo_id" defaultValue={pesquisa.processo_id ?? ""} className={inputClass}>
            <option value="">Nenhum</option>
            {processos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.numero_processo ?? p.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="status">Status da diligência</FieldLabel>
          <select id="status" name="status" defaultValue={pesquisa.status} className={inputClass}>
            {Object.entries(STATUS_PESQUISA_CERTIDOES_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Dados do imóvel</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="endereco">Endereço</FieldLabel>
          <input id="endereco" name="endereco" defaultValue={pesquisa.endereco ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="numero">Número</FieldLabel>
          <input id="numero" name="numero" defaultValue={pesquisa.numero ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
          <input id="bairro" name="bairro" defaultValue={pesquisa.bairro ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
          <input id="cidade" name="cidade" defaultValue={pesquisa.cidade ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="estado">Estado</FieldLabel>
          <input id="estado" name="estado" maxLength={2} defaultValue={pesquisa.estado ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="cep">CEP</FieldLabel>
          <input id="cep" name="cep" defaultValue={pesquisa.cep ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="matricula">Matrícula do imóvel</FieldLabel>
          <input id="matricula" name="matricula" defaultValue={pesquisa.matricula ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="inscricao_imobiliaria">Inscrição imobiliária</FieldLabel>
          <input id="inscricao_imobiliaria" name="inscricao_imobiliaria" defaultValue={pesquisa.inscricao_imobiliaria ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
        <textarea id="observacoes" name="observacoes" rows={3} defaultValue={pesquisa.observacoes ?? ""} className={inputClass} />
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
