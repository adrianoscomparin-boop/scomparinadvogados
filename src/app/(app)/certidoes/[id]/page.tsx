import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, EmptyState, FieldLabel, inputClass } from "@/components/ui";
import { catalogoPorTipo } from "@/lib/certidoes-catalogo";
import { STATUS_PESQUISA_CERTIDOES_LABELS, type CertidaoItem, type CertidaoParte } from "@/lib/types";
import { addParte, removeParte, deletePesquisa } from "../actions";
import { ItemRow } from "./item-row";

export default async function PesquisaCertidoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pesquisa }, { data: partes }, { data: itens }] = await Promise.all([
    supabase.from("certidoes_pesquisas").select("*, clientes(id, nome), processos(id, numero_processo)").eq("id", id).single(),
    supabase.from("certidoes_partes").select("*").eq("pesquisa_id", id).order("created_at"),
    supabase.from("certidoes_itens").select("*").eq("pesquisa_id", id).order("created_at"),
  ]);

  if (!pesquisa) {
    notFound();
  }

  const itensImovel = (itens ?? []).filter((i) => !i.parte_id) as CertidaoItem[];
  const itensPorParte = new Map<string, CertidaoItem[]>();
  for (const item of (itens ?? []) as CertidaoItem[]) {
    if (!item.parte_id) continue;
    const list = itensPorParte.get(item.parte_id) ?? [];
    list.push(item);
    itensPorParte.set(item.parte_id, list);
  }

  const boundAddParte = addParte.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--foreground)]">{pesquisa.titulo}</h1>
            <Badge color={pesquisa.status === "concluida" ? "green" : "brand"}>
              {STATUS_PESQUISA_CERTIDOES_LABELS[pesquisa.status as "em_andamento" | "concluida"]}
            </Badge>
          </div>
          <p className="text-sm text-neutral-500">
            {[pesquisa.endereco, pesquisa.numero, pesquisa.bairro, pesquisa.cidade, pesquisa.estado].filter(Boolean).join(", ") || "Sem endereço cadastrado"}
          </p>
          {(pesquisa.clientes || pesquisa.processos) && (
            <p className="mt-1 text-xs text-neutral-400">
              {pesquisa.clientes && (
                <Link href={`/clientes/${pesquisa.clientes.id}`} className="text-[var(--brand-dark)] hover:underline">
                  {pesquisa.clientes.nome}
                </Link>
              )}
              {pesquisa.clientes && pesquisa.processos && " · "}
              {pesquisa.processos && (
                <Link href={`/processos/${pesquisa.processos.id}`} className="text-[var(--brand-dark)] hover:underline">
                  {pesquisa.processos.numero_processo}
                </Link>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/certidoes/${id}/editar`} className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
            Editar diligência
          </Link>
          <form action={deletePesquisa}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-neutral-500 hover:border-[var(--danger)] hover:text-[var(--danger)]"
            >
              Excluir
            </button>
          </form>
        </div>
      </div>

      {(pesquisa.matricula || pesquisa.inscricao_imobiliaria) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {pesquisa.matricula && <InfoItem label="Matrícula" value={pesquisa.matricula} />}
          {pesquisa.inscricao_imobiliaria && <InfoItem label="Inscrição imobiliária" value={pesquisa.inscricao_imobiliaria} />}
        </div>
      )}

      {pesquisa.observacoes && (
        <div className="card p-4 text-sm text-neutral-600">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Observações</p>
          {pesquisa.observacoes}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--foreground)]">Certidões do imóvel</h2>
        {itensImovel.length === 0 ? (
          <EmptyState message="Nenhum item gerado para o imóvel." />
        ) : (
          <ul className="flex flex-col gap-2">
            {itensImovel.map((item) => (
              <ItemRow key={item.id} item={item} catalogo={catalogoPorTipo(item.tipo)} pesquisaId={id} />
            ))}
          </ul>
        )}
      </section>

      {((partes ?? []) as CertidaoParte[]).map((parte) => (
        <section key={parte.id}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Certidões de {parte.nome}
              <span className="ml-2 text-xs font-normal text-neutral-400">
                {parte.tipo_pessoa === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
                {parte.cpf_cnpj ? ` · ${parte.cpf_cnpj}` : ""}
              </span>
            </h2>
            <form action={removeParte}>
              <input type="hidden" name="id" value={parte.id} />
              <input type="hidden" name="pesquisa_id" value={id} />
              <button type="submit" className="text-xs font-medium text-neutral-400 hover:text-[var(--danger)]">
                Remover proprietário
              </button>
            </form>
          </div>
          {(itensPorParte.get(parte.id) ?? []).length === 0 ? (
            <EmptyState message="Nenhum item gerado para este proprietário." />
          ) : (
            <ul className="flex flex-col gap-2">
              {(itensPorParte.get(parte.id) ?? []).map((item) => (
                <ItemRow key={item.id} item={item} catalogo={catalogoPorTipo(item.tipo)} pesquisaId={id} />
              ))}
            </ul>
          )}
        </section>
      ))}

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--foreground)]">Adicionar proprietário</h2>
        <form action={boundAddParte} className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_1fr_140px_auto]">
          <div>
            <FieldLabel htmlFor="nome">Nome / Razão social</FieldLabel>
            <input id="nome" name="nome" required className={inputClass} />
          </div>
          <div>
            <FieldLabel htmlFor="cpf_cnpj">CPF / CNPJ</FieldLabel>
            <input id="cpf_cnpj" name="cpf_cnpj" className={inputClass} />
          </div>
          <div>
            <FieldLabel htmlFor="tipo_pessoa">Tipo</FieldLabel>
            <select id="tipo_pessoa" name="tipo_pessoa" defaultValue="fisica" className={inputClass}>
              <option value="fisica">Física</option>
              <option value="juridica">Jurídica</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full rounded-lg px-4 py-2 text-sm font-semibold">
              Adicionar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">{value}</p>
    </div>
  );
}
