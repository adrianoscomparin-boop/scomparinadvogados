"use client";

import { useState } from "react";
import { Badge, FieldLabel, inputClass } from "@/components/ui";
import { daysUntil } from "@/lib/format";
import {
  RESULTADO_CERTIDAO_ITEM_LABELS,
  STATUS_CERTIDAO_ITEM_LABELS,
  type CertidaoItem,
} from "@/lib/types";
import type { CertidaoCatalogoItem } from "@/lib/certidoes-catalogo";
import { updateItem, uploadArquivoItem, removeArquivoItem } from "../actions";

export function ItemRow({
  item,
  catalogo,
  pesquisaId,
}: {
  item: CertidaoItem;
  catalogo: CertidaoCatalogoItem | undefined;
  pesquisaId: string;
}) {
  const [open, setOpen] = useState(false);

  const vencida =
    item.status === "emitida" && item.data_validade ? daysUntil(item.data_validade) < 0 : false;
  const venceEmBreve =
    item.status === "emitida" && item.data_validade && !vencida ? daysUntil(item.data_validade) <= 15 : false;

  const statusColor =
    item.status === "nao_aplicavel"
      ? "neutral"
      : vencida
        ? "red"
        : item.status === "emitida"
          ? item.resultado === "positiva"
            ? "red"
            : venceEmBreve
              ? "amber"
              : "green"
          : item.status === "solicitada"
            ? "blue"
            : "amber";

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            {catalogo?.label ?? item.tipo}
            {catalogo?.condicional && <span className="ml-1 text-xs font-normal text-neutral-400">(quando houver)</span>}
          </p>
          <p className="text-xs text-neutral-400">{catalogo?.orgao}</p>
          {catalogo?.observacao && <p className="mt-0.5 text-xs text-neutral-400">{catalogo.observacao}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge color={statusColor}>
            {vencida ? "Vencida" : STATUS_CERTIDAO_ITEM_LABELS[item.status]}
            {item.status === "emitida" && item.resultado ? ` · ${RESULTADO_CERTIDAO_ITEM_LABELS[item.resultado]}` : ""}
          </Badge>
          {catalogo?.url && (
            <a
              href={catalogo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
            >
              Abrir portal ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium text-[var(--brand-dark)] hover:underline"
          >
            {open ? "Fechar" : "Detalhes"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-4 border-t border-[var(--border)] pt-4">
          <form action={updateItem} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="pesquisa_id" value={pesquisaId} />
            <div>
              <FieldLabel htmlFor={`status_${item.id}`}>Status</FieldLabel>
              <select id={`status_${item.id}`} name="status" defaultValue={item.status} className={inputClass}>
                {Object.entries(STATUS_CERTIDAO_ITEM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor={`resultado_${item.id}`}>Resultado</FieldLabel>
              <select id={`resultado_${item.id}`} name="resultado" defaultValue={item.resultado ?? ""} className={inputClass}>
                <option value="">—</option>
                {Object.entries(RESULTADO_CERTIDAO_ITEM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor={`data_solicitacao_${item.id}`}>Solicitada em</FieldLabel>
              <input id={`data_solicitacao_${item.id}`} name="data_solicitacao" type="date" defaultValue={item.data_solicitacao ?? ""} className={inputClass} />
            </div>
            <div>
              <FieldLabel htmlFor={`data_emissao_${item.id}`}>Emitida em</FieldLabel>
              <input id={`data_emissao_${item.id}`} name="data_emissao" type="date" defaultValue={item.data_emissao ?? ""} className={inputClass} />
            </div>
            <div>
              <FieldLabel htmlFor={`data_validade_${item.id}`}>Válida até</FieldLabel>
              <input id={`data_validade_${item.id}`} name="data_validade" type="date" defaultValue={item.data_validade ?? ""} className={inputClass} />
            </div>
            <div className="sm:col-span-4">
              <FieldLabel htmlFor={`observacoes_${item.id}`}>Observações</FieldLabel>
              <input id={`observacoes_${item.id}`} name="observacoes" defaultValue={item.observacoes ?? ""} className={inputClass} />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full rounded-lg px-4 py-2 text-sm font-semibold">
                Salvar
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {item.arquivo_path ? (
              <>
                <a
                  href={`/certidoes/arquivo/${item.id}`}
                  className="text-sm font-medium text-[var(--brand-dark)] hover:underline"
                >
                  📎 {item.arquivo_nome ?? "Baixar arquivo"}
                </a>
                <form action={removeArquivoItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="pesquisa_id" value={pesquisaId} />
                  <input type="hidden" name="arquivo_path" value={item.arquivo_path} />
                  <button type="submit" className="text-xs font-medium text-neutral-400 hover:text-[var(--danger)]">
                    Remover arquivo
                  </button>
                </form>
              </>
            ) : (
              <form action={uploadArquivoItem} className="flex items-center gap-2">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="pesquisa_id" value={pesquisaId} />
                <input type="file" name="arquivo" accept="application/pdf,image/*" required className="text-xs" />
                <button type="submit" className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">
                  Anexar PDF
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
