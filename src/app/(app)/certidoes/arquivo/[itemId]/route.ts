import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: item } = await supabase
    .from("certidoes_itens")
    .select("arquivo_path, arquivo_nome")
    .eq("id", itemId)
    .single();

  if (!item?.arquivo_path) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("certidoes")
    .createSignedUrl(item.arquivo_path, 60, { download: item.arquivo_nome ?? true });

  if (error || !signed) {
    return NextResponse.json({ error: error?.message ?? "Erro ao gerar link de download." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
