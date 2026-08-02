"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PapelUsuario } from "@/lib/types";

export interface UsuarioFormState {
  error?: string;
  success?: string;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase.from("profiles").select("papel, ativo").eq("id", user.id).single();

  if (!profile || profile.papel !== "admin" || !profile.ativo) {
    throw new Error("Apenas administradores podem gerenciar usuários.");
  }
}

export async function createUsuario(_prevState: UsuarioFormState, formData: FormData): Promise<UsuarioFormState> {
  try {
    await requireAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sem permissão." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const papel = String(formData.get("papel") ?? "advogado") as PapelUsuario;

  if (!nome || !email || senha.length < 6) {
    return { error: "Nome, e-mail e senha (mínimo 6 caracteres) são obrigatórios." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro de configuração." };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Erro ao criar usuário." };
  }

  if (papel !== "advogado") {
    await admin.from("profiles").update({ papel }).eq("id", data.user.id);
  }

  revalidatePath("/usuarios");
  return { success: `Usuário ${email} criado com sucesso.` };
}

export async function updateUsuarioPapel(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const papel = String(formData.get("papel")) as PapelUsuario;

  const supabase = await createClient();
  await supabase.from("profiles").update({ papel }).eq("id", id);
  revalidatePath("/usuarios");
}

export async function toggleUsuarioAtivo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const ativo = formData.get("ativo") === "true";

  const supabase = await createClient();
  await supabase.from("profiles").update({ ativo: !ativo }).eq("id", id);
  revalidatePath("/usuarios");
}
