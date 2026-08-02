"use client";

import { useActionState } from "react";
import { FieldLabel, inputClass } from "@/components/ui";
import {
  AREA_LABELS,
  FASE_LABELS,
  STATUS_PROCESSO_LABELS,
  type Processo,
} from "@/lib/types";
import type { ProcessoFormState } from "./actions";

interface Option {
  id: string;
  nome: string;
}

export function ProcessoForm({
  processo,
  clientes,
  advogados,
  action,
}: {
  processo?: Processo;
  clientes: Option[];
  advogados: Option[];
  action: (state: ProcessoFormState, formData: FormData) => Promise<ProcessoFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="numero_processo">Número do processo</FieldLabel>
          <input
            id="numero_processo"
            name="numero_processo"
            required
            defaultValue={processo?.numero_processo}
            placeholder="0000000-00.0000.0.00.0000"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="cliente_id">Cliente</FieldLabel>
          <select id="cliente_id" name="cliente_id" required defaultValue={processo?.cliente_id ?? ""} className={inputClass}>
            <option value="" disabled>
              Selecione...
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="parte_contraria">Parte contrária</FieldLabel>
        <input id="parte_contraria" name="parte_contraria" defaultValue={processo?.parte_contraria ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="area">Área</FieldLabel>
          <select id="area" name="area" defaultValue={processo?.area ?? "civel"} className={inputClass}>
            {Object.entries(AREA_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="fase">Fase</FieldLabel>
          <select id="fase" name="fase" defaultValue={processo?.fase ?? "conhecimento"} className={inputClass}>
            {Object.entries(FASE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <select id="status" name="status" defaultValue={processo?.status ?? "ativo"} className={inputClass}>
            {Object.entries(STATUS_PROCESSO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="tribunal">Tribunal</FieldLabel>
          <input id="tribunal" name="tribunal" defaultValue={processo?.tribunal ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="comarca">Comarca</FieldLabel>
          <input id="comarca" name="comarca" defaultValue={processo?.comarca ?? ""} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="vara">Vara</FieldLabel>
          <input id="vara" name="vara" defaultValue={processo?.vara ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel htmlFor="valor_causa">Valor da causa (R$)</FieldLabel>
          <input
            id="valor_causa"
            name="valor_causa"
            type="number"
            step="0.01"
            min="0"
            defaultValue={processo?.valor_causa ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="data_distribuicao">Data de distribuição</FieldLabel>
          <input
            id="data_distribuicao"
            name="data_distribuicao"
            type="date"
            defaultValue={processo?.data_distribuicao ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="advogado_responsavel">Advogado responsável</FieldLabel>
          <select id="advogado_responsavel" name="advogado_responsavel" defaultValue={processo?.advogado_responsavel ?? ""} className={inputClass}>
            <option value="">Não definido</option>
            {advogados.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
        <textarea id="observacoes" name="observacoes" rows={3} defaultValue={processo?.observacoes ?? ""} className={inputClass} />
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
