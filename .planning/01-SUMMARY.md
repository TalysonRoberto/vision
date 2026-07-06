---
phase: 1
phase_name: Setup do projeto
status: completed
completed_at: 2026-06-21
plans: 11
---

# Fase 1 — Setup do projeto (Next.js, Prisma, banco, auth) — SUMMARY

> [!tldr] TL;DR
> Fase 1 concluída. Next.js 16.2.9 + React 19 + Tailwind v4 + shadcn/ui + Prisma 6 + Supabase + NextAuth 5 beta + bcrypt. 5 tabelas criadas no Supabase via migration `cria_tabela_users`. Build/typecheck/lint passando. 5 aprendizados e 1 dívida registrados no cofre.

## Self-Check: PASSED

- [x] `pnpm typecheck` — sem erros
- [x] `pnpm lint` — sem erros/warnings (após ignorar `.claude/` e `.planning/`)
- [x] `pnpm build` — Compiled successfully em 16.4s
- [x] Migration `cria_tabela_users` aplicada no Supabase (5 tabelas: users, posts, likes, comments, profile_views)
- [x] `pnpm prisma generate` — Prisma Client gerado

## Tarefas executadas (11/11)

| # | Tarefa | Entrega |
|---|---|---|
| 1 | Inicializar Next.js + TS + Tailwind | Next.js 16.2.9 + React 19 + Tailwind v4 scaffolded na raiz do vault |
| 2 | Configurar shadcn/ui | Preset base-nova + 5 componentes (button, input, label, card, sonner) + tokens oklch + `lib/utils.ts` |
| 3 | Configurar Prisma + Supabase | Prisma 6.19.3 + datasource (conexão direta `db.[ref].supabase.co:5432`) |
| 4 | `lib/prisma.ts` singleton | globalThis cache (anti-exaustão Serverless) |
| 5 | Modelar User + migration | Schema com 5 modelos + migration aplicada no Supabase |
| 6 | Configurar NextAuth | NextAuth 5.0.0-beta.31 + Credentials + JWT + bcrypt + `@auth/prisma-adapter` |
| 7 | SessionProvider | `components/providers.tsx` + `Toaster` no layout |
| 8 | Tela de cadastro + signup | `app/(auth)/cadastro` + `POST /api/auth/signup` (zod, bcrypt, 409) |
| 9 | Tela de login | `app/(auth)/login` (Credentials, redirect `/feed`, toast pt-BR) |
| 10 | Middleware | `middleware.ts` protege `/feed` e `/perfil` com callbackUrl |
| 11 | .env.example + scripts + gitignore | Env vars documentadas + scripts prisma:* + gitignore mesclado |

## Desvios do plano

- **Prisma 6 (não latest)**: plano não especificava versão; `@latest` instalou v7 que quebra schema. Downgrade para `@6`. Ver [[2026-06-21-prisma7-breaking-change-schema]].
- **Zod 3 (não 4)**: `@hookform/resolvers` v5 não suporta Zod 4. Downgrade para `@3`. Ver [[2026-06-21-zod4-incompativel-hookform-resolvers]].
- **Conexão direta Supabase**: plano mencionava pooler 6543, mas user `postgres.[ref]` só funciona no pooler. Dev local usa conexão direta com user `postgres`. Ver [[2026-06-21-supabase-conexao-direta-vs-pooler]].
- **pnpm approve-builds**: pnpm 11 exige `pnpm-workspace.yaml` + `approve-builds --all` para scripts de build. Ver [[2026-06-21-pnpm11-approve-builds]].
- **shadcn CLI mudou**: `--base-color` não existe mais; usado `-d` (defaults) com preset base-nova (usa `@base-ui/react` em vez de Radix).

## Dívida técnica gerada

- [[middleware-deprecated-proxy]] — `middleware.ts` deprecated no Next.js 16 → `proxy.ts`. Baixa prioridade, migrar na Fase 6.

## Próxima fase

**Fase 2 — CRUD de perfil (foto, capa, bio)** → `/executar-fase 2`

Depende de: User modelado (✅), NextAuth (✅), `lib/prisma.ts` (✅).
Reusa: `lib/upload.ts` + `app/api/upload/route.ts` (Cloudinary) — será criado na Fase 2.
