"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TipoPessoa, TipoRelacaoCliente } from "@/lib/types";

export interface ClienteFormState {
  error?: string;
}

function readClienteForm(formData: FormData) {
  return {
    tipo_pessoa: String(formData.get("tipo_pessoa")) as TipoPessoa,
    nome: String(formData.get("nome") ?? "").trim(),
    cpf_cnpj: String(formData.get("cpf_cnpj") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    telefone: String(formData.get("telefone") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    endereco: String(formData.get("endereco") ?? "").trim() || null,
    cidade: String(formData.get("cidade") ?? "").trim() || null,
    estado: String(formData.get("estado") ?? "").trim() || null,
    cep: String(formData.get("cep") ?? "").trim() || null,
    tipo_relacao: String(formData.get("tipo_relacao")) as TipoRelacaoCliente,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };
}

export async function createCliente(_prevState: ClienteFormState, formData: FormData): Promise<ClienteFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = readClienteForm(formData);
  if (!payload.nome) {
    return { error: "Nome é obrigatório." };
  }

  const { error } = await supabase.from("clientes").insert({ ...payload, created_by: user?.id });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCliente(
  id: string,
  _prevState: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  const supabase = await createClient();
  const payload = readClienteForm(formData);
  if (!payload.nome) {
    return { error: "Nome é obrigatório." };
  }

  const { error } = await supabase.from("clientes").update(payload).eq("id", id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect("/clientes");
}

export async function deleteCliente(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("clientes").update({ ativo: false }).eq("id", id);
  revalidatePath("/clientes");
}
