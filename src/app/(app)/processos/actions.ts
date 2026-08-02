"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AreaProcesso, FaseProcesso, StatusProcesso, TipoAndamento } from "@/lib/types";

export interface ProcessoFormState {
  error?: string;
}

function readProcessoForm(formData: FormData) {
  return {
    numero_processo: String(formData.get("numero_processo") ?? "").trim(),
    cliente_id: String(formData.get("cliente_id") ?? "").trim(),
    parte_contraria: String(formData.get("parte_contraria") ?? "").trim() || null,
    area: String(formData.get("area")) as AreaProcesso,
    fase: String(formData.get("fase")) as FaseProcesso,
    status: String(formData.get("status")) as StatusProcesso,
    tribunal: String(formData.get("tribunal") ?? "").trim() || null,
    comarca: String(formData.get("comarca") ?? "").trim() || null,
    vara: String(formData.get("vara") ?? "").trim() || null,
    valor_causa: formData.get("valor_causa") ? Number(formData.get("valor_causa")) : null,
    data_distribuicao: String(formData.get("data_distribuicao") ?? "") || null,
    advogado_responsavel: String(formData.get("advogado_responsavel") ?? "") || null,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };
}

export async function createProcesso(_prevState: ProcessoFormState, formData: FormData): Promise<ProcessoFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = readProcessoForm(formData);
  if (!payload.numero_processo || !payload.cliente_id) {
    return { error: "Número do processo e cliente são obrigatórios." };
  }

  const { data, error } = await supabase
    .from("processos")
    .insert({ ...payload, created_by: user?.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Erro ao criar processo." };
  }

  revalidatePath("/processos");
  redirect(`/processos/${data.id}`);
}

export async function updateProcesso(
  id: string,
  _prevState: ProcessoFormState,
  formData: FormData,
): Promise<ProcessoFormState> {
  const supabase = await createClient();
  const payload = readProcessoForm(formData);
  if (!payload.numero_processo || !payload.cliente_id) {
    return { error: "Número do processo e cliente são obrigatórios." };
  }

  const { error } = await supabase.from("processos").update(payload).eq("id", id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/processos");
  revalidatePath(`/processos/${id}`);
  redirect(`/processos/${id}`);
}

export async function addAndamento(processoId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tipo = String(formData.get("tipo")) as TipoAndamento;
  const data = String(formData.get("data") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const prazo_data = String(formData.get("prazo_data") ?? "") || null;

  if (!descricao || !data) return;

  await supabase.from("andamentos").insert({
    processo_id: processoId,
    tipo,
    data,
    descricao,
    prazo_data: tipo === "prazo" ? prazo_data : null,
    created_by: user?.id,
  });

  revalidatePath(`/processos/${processoId}`);
  revalidatePath("/dashboard");
}

export async function togglePrazoCumprido(formData: FormData) {
  const id = String(formData.get("id"));
  const processoId = String(formData.get("processo_id"));
  const cumprido = formData.get("cumprido") === "true";

  const supabase = await createClient();
  await supabase.from("andamentos").update({ prazo_cumprido: !cumprido }).eq("id", id);

  revalidatePath(`/processos/${processoId}`);
  revalidatePath("/dashboard");
}
