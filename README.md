# Scomparin Advogados — Gestão Financeira e Processual

Sistema interno para controle financeiro (contas a pagar/receber, honorários,
parcelamentos de acordos de cobrança) e acompanhamento de processos
judiciais (andamentos, prazos, clientes) do escritório.

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**
(Postgres com autenticação e Row Level Security).

## 1. Criar o projeto no Supabase

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e um novo projeto.
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole o
   conteúdo do arquivo [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)
   e execute (`Run`). Isso cria todas as tabelas, tipos, triggers e as
   políticas de Row Level Security.
3. Em **Authentication → Providers**, deixe apenas **Email** habilitado.
   Em **Authentication → Settings**, desative "Confirm email" se quiser
   liberar o acesso da equipe sem precisar confirmar e-mail (recomendado
   para uso interno).
4. Crie os usuários da equipe em **Authentication → Users → Add user**
   (defina e-mail e senha manualmente). Um registro em `profiles` é criado
   automaticamente para cada novo usuário (trigger `on_auth_user_created`).
   Depois, se quiser tornar alguém `admin`, rode no SQL Editor:
   ```sql
   update public.profiles set papel = 'admin' where email = 'voce@escritorio.com.br';
   ```
5. Em **Project Settings → API**, copie a **Project URL** e a chave
   **anon public**.

## 2. Configurar variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public
```

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — você será redirecionado
para a tela de login. Entre com um dos usuários criados no passo 1.4.

## 4. Deploy (Vercel)

1. Suba este repositório no GitHub (já está feito) e importe o projeto em
   [vercel.com/new](https://vercel.com/new).
2. Configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) em **Project Settings → Environment
   Variables**.
3. Deploy. O plano gratuito da Vercel + Supabase é suficiente para o uso
   de um escritório pequeno/médio.

## Estrutura do sistema

- **Dashboard** (`/dashboard`) — indicadores de contas a receber/pagar,
  inadimplência, processos ativos por status e próximos prazos.
- **Processos** (`/processos`) — cadastro de processos judiciais vinculados
  a um cliente, com andamentos, prazos e audiências, e lançamentos
  financeiros vinculados.
- **Financeiro** (`/financeiro`) — contas a pagar e a receber, honorários,
  parcelamento de acordos de cobrança (gera automaticamente N parcelas
  mensais), marcação de pago/pendente/cancelado.
- **Clientes** (`/clientes`) — cadastro central de clientes e devedores
  (pessoa física ou jurídica), usado tanto no módulo financeiro quanto no
  de processos.

Todos os dados são compartilhados entre os usuários autenticados da equipe
(modelo de escritório único). O campo `papel` em `profiles` (`admin`,
`advogado`, `financeiro`) está pronto para uma futura segmentação de
permissões, caso o escritório precise restringir o acesso por módulo.

## Legado

O arquivo `legacy/Severino Contratos 2.0.html` é uma ferramenta anterior de
geração de contratos, mantida no repositório apenas como referência — não
faz parte deste sistema.
