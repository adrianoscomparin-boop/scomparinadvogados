import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com privilégios de administrador (service_role). Usa a Admin API
// do Supabase Auth para criar usuários. NUNCA importar este arquivo em
// código que roda no navegador — apenas em server actions / route handlers.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione essa variável de ambiente (Project Settings → API → service_role, no Supabase) para gerenciar usuários pelo sistema.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
