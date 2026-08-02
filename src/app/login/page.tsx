import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--background)] px-4">
      <div className="card w-full max-w-sm p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-[#fff8e8]"
            style={{ background: "linear-gradient(135deg, #6b3010, #8a4518)" }}
          >
            SA
          </div>
          <h1 className="mt-2 text-lg font-bold text-[var(--foreground)]">Scomparin Advogados</h1>
          <p className="text-sm text-neutral-500">Sistema de Gestão Financeira e Processual</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
