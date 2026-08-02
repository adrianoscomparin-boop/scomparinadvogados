"use client";

import { useActionState, useState } from "react";
import { FieldLabel, inputClass } from "@/components/ui";
import { CATEGORIA_LABELS, FORMA_PAGAMENTO_LABELS, type LancamentoFinanceiro } from "@/lib/types";
import type { LancamentoFormState } from "./actions";

interface Option {
  id: string;
  nome: string;
}

export function LancamentoForm({
  lancamento,
  clientes,
  processos,
  defaultClienteId,
  defaultProcessoId,
  action,
}: {
  lancamento?: LancamentoFinanceiro;
  clientes: Option[];
  processos: { id: string; numero_processo: string }[];
  defaultClienteId?: string;
  defaultProcessoId?: string;
  action: (state: LancamentoFormState, formData: FormData) => Promise<LancamentoFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [tipo, setTipo] = useState(lancamento?.tipo ?? "receita");

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
          <select
            id="tipo"
            name="tipo"
            className={inputClass}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "receita" | "despesa")}
          >
            <option value="receita">Receita (a receber)</option>
            <option value="despesa">Despesa (a pagar)</option>
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="categoria">Categoria</FieldLabel>
          <select id="categoria" name="categoria" defaultValue={lancamento?.categoria ?? "honorarios_contratuais"} className={inputClass}>
            {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
        <input id="descricao" name="descricao" required defaultValue={lancamento?.descricao} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="valor">{lancamento ? "Valor (R$)" : "Valor total (R$)"}</FieldLabel>
          <input id="valor" name="valor" type="number" step="0.01" min="0.01" required defaultValue={lancamento?.valor ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="vencimento">{lancamento ? "Vencimento" : "1º vencimento"}</FieldLabel>
          <input id="vencimento" name="vencimento" type="date" required defaultValue={lancamento?.vencimento ?? ""} className={inputClass} />
        </div>
        {!lancamento && (
          <div>
            <FieldLabel htmlFor="parcelas">Parcelas</FieldLabel>
            <input id="parcelas" name="parcelas" type="number" min="1" max="120" defaultValue={1} className={inputClass} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="cliente_id">Cliente</FieldLabel>
          <select id="cliente_id" name="cliente_id" defaultValue={lancamento?.cliente_id ?? defaultClienteId ?? ""} className={inputClass}>
            <option value="">Nenhum</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="processo_id">Processo vinculado</FieldLabel>
          <select id="processo_id" name="processo_id" defaultValue={lancamento?.processo_id ?? defaultProcessoId ?? ""} className={inputClass}>
            <option value="">Nenhum</option>
            {processos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.numero_processo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="forma_pagamento">Forma de pagamento</FieldLabel>
        <select id="forma_pagamento" name="forma_pagamento" defaultValue={lancamento?.forma_pagamento ?? ""} className={inputClass}>
          <option value="">Não definida</option>
          {Object.entries(FORMA_PAGAMENTO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
        <textarea id="observacoes" name="observacoes" rows={3} defaultValue={lancamento?.observacoes ?? ""} className={inputClass} />
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
