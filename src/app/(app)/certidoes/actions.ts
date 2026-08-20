"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { certidoesAplicaveis, certidoesDoImovel } from "@/lib/certidoes-catalogo";
import type {
  ResultadoCertidaoItem,
  StatusCertidaoItem,
  StatusPesquisaCertidoes,
  TipoPessoa,
} from "@/lib/types";

export interface PesquisaFormState {
  error?: string;
}

interface ParteInput {
  nome: string;
  cpf_cnpj: string;
  tipo_pessoa: TipoPessoa;
}

function readPesquisaForm(formData: FormData) {
  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    endereco: String(formData.get("endereco") ?? "").trim() || null,
    numero: String(formData.get("numero") ?? "").trim() || null,
    bairro: String(formData.get("bairro") ?? "").trim() || null,
    cidade: String(formData.get("cidade") ?? "").trim() || null,
    estado: String(formData.get("estado") ?? "").trim() || null,
    cep: String(formData.get("cep") ?? "").trim() || null,
    matricula: String(formData.get("matricula") ?? "").trim() || null,
    inscricao_imobiliaria: String(formData.get("inscricao_imobiliaria") ?? "").trim() || null,
    cliente_id: String(formData.get("cliente_id") ?? "").trim() || null,
    processo_id: String(formData.get("processo_id") ?? "").trim() || null,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  };
}

function readPartes(formData: FormData): ParteInput[] {
  const raw = String(formData.get("partes") ?? "[]");
  try {
    const parsed = JSON.parse(raw) as ParteInput[];
    return parsed
      .map((p) => ({ nome: (p.nome ?? "").trim(), cpf_cnpj: (p.cpf_cnpj ?? "").trim(), tipo_pessoa: p.tipo_pessoa }))
      .filter((p) => p.nome);
  } catch {
    return [];
  }
}

async function gerarItensImovel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pesquisaId: string,
  userId: string | undefined,
) {
  const itens = certidoesDoImovel().map((cat) => ({
    pesquisa_id: pesquisaId,
    parte_id: null,
    tipo: cat.tipo,
    created_by: userId,
  }));
  if (itens.length > 0) {
    await supabase.from("certidoes_itens").insert(itens);
  }
}

async function gerarItensParte(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pesquisaId: string,
  parteId: string,
  tipoPessoa: TipoPessoa,
  userId: string | undefined,
) {
  const itens = certidoesAplicaveis(tipoPessoa).map((cat) => ({
    pesquisa_id: pesquisaId,
    parte_id: parteId,
    tipo: cat.tipo,
    created_by: userId,
  }));
  if (itens.length > 0) {
    await supabase.from("certidoes_itens").insert(itens);
  }
}

export async function createPesquisa(_prevState: PesquisaFormState, formData: FormData): Promise<PesquisaFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = readPesquisaForm(formData);
  const partes = readPartes(formData);

  if (!payload.titulo) {
    return { error: "Título/identificação da diligência é obrigatório." };
  }

  const { data: pesquisa, error } = await supabase
    .from("certidoes_pesquisas")
    .insert({ ...payload, created_by: user?.id })
    .select("id")
    .single();

  if (error || !pesquisa) {
    return { error: error?.message ?? "Erro ao criar a pesquisa." };
  }

  await gerarItensImovel(supabase, pesquisa.id, user?.id);

  for (const parte of partes) {
    const { data: parteRow, error: parteError } = await supabase
      .from("certidoes_partes")
      .insert({
        pesquisa_id: pesquisa.id,
        nome: parte.nome,
        cpf_cnpj: parte.cpf_cnpj || null,
        tipo_pessoa: parte.tipo_pessoa,
      })
      .select("id")
      .single();

    if (!parteError && parteRow) {
      await gerarItensParte(supabase, pesquisa.id, parteRow.id, parte.tipo_pessoa, user?.id);
    }
  }

  revalidatePath("/certidoes");
  redirect(`/certidoes/${pesquisa.id}`);
}

export async function updatePesquisa(
  id: string,
  _prevState: PesquisaFormState,
  formData: FormData,
): Promise<PesquisaFormState> {
  const supabase = await createClient();
  const payload = readPesquisaForm(formData);
  const status = String(formData.get("status") ?? "em_andamento") as StatusPesquisaCertidoes;

  if (!payload.titulo) {
    return { error: "Título/identificação da diligência é obrigatório." };
  }

  const { error } = await supabase
    .from("certidoes_pesquisas")
    .update({ ...payload, status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/certidoes");
  revalidatePath(`/certidoes/${id}`);
  redirect(`/certidoes/${id}`);
}

export async function deletePesquisa(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("certidoes_pesquisas").delete().eq("id", id);
  revalidatePath("/certidoes");
  redirect("/certidoes");
}

export async function addParte(pesquisaId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nome = String(formData.get("nome") ?? "").trim();
  const cpf_cnpj = String(formData.get("cpf_cnpj") ?? "").trim() || null;
  const tipo_pessoa = String(formData.get("tipo_pessoa") ?? "fisica") as TipoPessoa;

  if (!nome) return;

  const { data: parte, error } = await supabase
    .from("certidoes_partes")
    .insert({ pesquisa_id: pesquisaId, nome, cpf_cnpj, tipo_pessoa })
    .select("id")
    .single();

  if (!error && parte) {
    await gerarItensParte(supabase, pesquisaId, parte.id, tipo_pessoa, user?.id);
  }

  revalidatePath(`/certidoes/${pesquisaId}`);
}

export async function removeParte(formData: FormData) {
  const id = String(formData.get("id"));
  const pesquisaId = String(formData.get("pesquisa_id"));
  const supabase = await createClient();
  await supabase.from("certidoes_partes").delete().eq("id", id);
  revalidatePath(`/certidoes/${pesquisaId}`);
}

export async function updateItem(formData: FormData) {
  const id = String(formData.get("id"));
  const pesquisaId = String(formData.get("pesquisa_id"));
  const status = String(formData.get("status")) as StatusCertidaoItem;
  const resultadoRaw = String(formData.get("resultado") ?? "");
  const resultado = (resultadoRaw || null) as ResultadoCertidaoItem | null;

  const supabase = await createClient();
  await supabase
    .from("certidoes_itens")
    .update({
      status,
      resultado: status === "emitida" ? resultado : null,
      data_solicitacao: String(formData.get("data_solicitacao") ?? "") || null,
      data_emissao: String(formData.get("data_emissao") ?? "") || null,
      data_validade: String(formData.get("data_validade") ?? "") || null,
      observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    })
    .eq("id", id);

  revalidatePath(`/certidoes/${pesquisaId}`);
}

export async function uploadArquivoItem(formData: FormData) {
  const id = String(formData.get("id"));
  const pesquisaId = String(formData.get("pesquisa_id"));
  const file = formData.get("arquivo") as File | null;

  if (!file || file.size === 0) return;

  const supabase = await createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${pesquisaId}/${id}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage.from("certidoes").upload(path, file, {
    contentType: file.type || "application/pdf",
    upsert: false,
  });

  if (!uploadError) {
    await supabase
      .from("certidoes_itens")
      .update({ arquivo_path: path, arquivo_nome: file.name })
      .eq("id", id);
  }

  revalidatePath(`/certidoes/${pesquisaId}`);
}

export async function removeArquivoItem(formData: FormData) {
  const id = String(formData.get("id"));
  const pesquisaId = String(formData.get("pesquisa_id"));
  const arquivoPath = String(formData.get("arquivo_path") ?? "");

  const supabase = await createClient();
  if (arquivoPath) {
    await supabase.storage.from("certidoes").remove([arquivoPath]);
  }
  await supabase.from("certidoes_itens").update({ arquivo_path: null, arquivo_nome: null }).eq("id", id);

  revalidatePath(`/certidoes/${pesquisaId}`);
}
