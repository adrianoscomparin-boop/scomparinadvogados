"use client";

import { useActionState } from "react";
import { FieldLabel, inputClass } from "@/components/ui";
import { createUsuario, type UsuarioFormState } from "./actions";

const initialState: UsuarioFormState = {};

export function UsuarioForm() {
  const [state, formAction, pending] = useActionState(createUsuario, initialState);

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <h2 className="text-sm font-bold text-[var(--foreground)]">Adicionar usuário</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="nome">Nome</FieldLabel>
          <input id="nome" name="nome" required className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="senha">Senha provisória</FieldLabel>
          <input id="senha" name="senha" type="text" required minLength={6} placeholder="mínimo 6 caracteres" className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="papel">Papel</FieldLabel>
          <select id="papel" name="papel" defaultValue="advogado" className={inputClass}>
            <option value="advogado">Advogado</option>
            <option value="financeiro">Financeiro</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">{state.error}</p>}
      {state.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-[var(--success)]">{state.success}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
          {pending ? "Criando..." : "Criar usuário"}
        </button>
      </div>
    </form>
  );
}
