"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/format";
import type { CategoriaLancamento, FormaPagamento, TipoLancamento } from "@/lib/types";

export interface LancamentoFormState {
  error?: string;
}

function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export async function createLancamento(_prevState: LancamentoFormState, formData: FormData): Promise<LancamentoFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tipo = String(formData.get("tipo")) as TipoLancamento;
  const categoria = String(formData.get("categoria")) as CategoriaLancamento;
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valorTotal = Number(formData.get("valor") ?? 0);
  const vencimento = String(formData.get("vencimento") ?? "");
  const forma_pagamento = (String(formData.get("forma_pagamento") ?? "") || null) as FormaPagamento | null;
  const cliente_id = String(formData.get("cliente_id") ?? "") || null;
  const processo_id = String(formData.get("processo_id") ?? "") || null;
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;
  const parcelas = Math.max(1, Number(formData.get("parcelas") ?? 1));

  if (!descricao || !valorTotal || !vencimento) {
    return { error: "Descrição, valor e vencimento são obrigatórios." };
  }

  const base = {
    tipo,
    categoria,
    forma_pagamento,
    cliente_id,
    processo_id,
    observacoes,
    status: "pendente" as const,
    created_by: user?.id,
  };

  if (parcelas <= 1) {
    const { error } = await supabase.from("lancamentos_financeiros").insert({
      ...base,
      descricao,
      valor: valorTotal,
      vencimento,
    });
    if (error) return { error: error.message };
  } else {
    const grupo_parcela = crypto.randomUUID();
    const valorParcela = Math.round((valorTotal / parcelas) * 100) / 100;
    const rows = Array.from({ length: parcelas }, (_, i) => ({
      ...base,
      descricao: `${descricao} (${i + 1}/${parcelas})`,
      valor: i === parcelas - 1 ? valorTotal - valorParcela * (parcelas - 1) : valorParcela,
      vencimento: addMonths(vencimento, i),
      grupo_parcela,
      parcela_numero: i + 1,
      parcela_total: parcelas,
    }));
    const { error } = await supabase.from("lancamentos_financeiros").insert(rows);
    if (error) return { error: error.message };
  }

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  if (processo_id) revalidatePath(`/processos/${processo_id}`);
  redirect("/financeiro");
}

export async function updateLancamento(
  id: string,
  _prevState: LancamentoFormState,
  formData: FormData,
): Promise<LancamentoFormState> {
  const supabase = await createClient();

  const payload = {
    tipo: String(formData.get("tipo")) as TipoLancamento,
    categoria: String(formData.get("categoria")) as CategoriaLancamento,
    descricao: String(formData.get("descricao") ?? "").trim(),
    valor: Number(formData.get("valor") ?? 0),
    vencimento: String(formData.get("vencimento") ?? ""),
    forma_pagamento: (String(formData.get("forma_pagamento") ?? "") || null) as FormaPagamento | null,
    cliente_id: String(formData.get("cliente_id") ?? "") || null,
    processo_id: String(formData.get("processo_id") ?? "") || null,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };

  if (!payload.descricao || !payload.valor || !payload.vencimento) {
    return { error: "Descrição, valor e vencimento são obrigatórios." };
  }

  const { error } = await supabase.from("lancamentos_financeiros").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  redirect("/financeiro");
}

export async function marcarPago(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("lancamentos_financeiros").update({ status: "pago", data_pagamento: todayISO() }).eq("id", id);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function marcarPendente(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("lancamentos_financeiros").update({ status: "pendente", data_pagamento: null }).eq("id", id);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function cancelarLancamento(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("lancamentos_financeiros").update({ status: "cancelado" }).eq("id", id);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}
