---
tipo: arquitetura
area: auth
camada: fullstack
status: ativo
tokens: medio
fonte:
  - lib/auth.ts
  - app/(auth)/login/page.tsx
  - app/(auth)/cadastro/page.tsx
atualizado: 2026-06-21
tags: [auth, nextauth, cadastro, login, sessao]
---

> [!tldr] TL;DR
> Cadastro + login e-mail/senha via NextAuth 5.0.0-beta.31 (Credentials Provider), sessão persistente (JWT strategy). Hash de senha com bcrypt (12 rounds). `SessionProvider` envolve o App Router. Middleware protege `/feed` e `/perfil`. **Implementado na Fase 1** — build/typecheck/lint passando.

# Autenticação (auth)

## Responsabilidade
Autenticar usuários (cadastro + login) e manter sessão persistente no Next.js App Router. **Não** faz recuperação de senha nem RBAC granular — escopo MVP é usuário único autenticado.

## Como funciona (essencial)
1. **Cadastro** (`app/(auth)/cadastro`): form react-hook-form + zod valida (name, username regex `^[a-z0-9_]+$`, email, password min 8). `POST /api/auth/signup` checa uniqueness (409), hasheia senha com `bcrypt.hash` (12 rounds), cria row em `users`, redireciona ao login.
2. **Login** (`app/(auth)/login`): NextAuth Credentials Provider com callback `authorize` manual — busca user por email (lowercase), compara `password_hash` via `bcrypt.compare`. JWT strategy (stateless).
3. **Sessão**: JWT strategy em `lib/auth.ts`, `SessionProvider` em `components/providers.tsx` envolve o layout raiz. `useSession()` no client. Callbacks `jwt`/`session` estendem session com `id` e `username` (ver `lib/auth-types.ts`).
4. **Opcional Google**: Google Provider com PKCE — deixar comentado por env var (não implementado no MVP).

## Interface / contrato
- **POST `/api/auth/callback/credentials`** — NextAuth interno
- **POST `/api/auth/signup`** — `{ name, username, email, password }` → `201 { id }` · `409` (email/username duplicado) · `400` (validação)
- **Session**: `{ user: { id, name, email, username, image } }`

## Dependências e relações
- Tabela: [[tabela-users]]
- Cliente Prisma: `lib/prisma.ts`
- Decisão: [[ADR-005-nextauth]]
- Fluxo de perfil pós-login: [[perfil]] · [[feed]]

## Gotchas
- `username` deve ser único e slug-friendly (lowercase, sem espaços) — usado na URL `/perfil/[username]`. Validado com regex `^[a-z0-9_]+$` no zod + normalizado lowercase antes de salvar.
- Credentials Provider exige callback `authorize` manual — NextAuth não hasheia automaticamente. `bcrypt.hash` no signup, `bcrypt.compare` no authorize.
- JWT strategy vs database strategy: JWT é stateless e mais simples p/ Vercel; database exige adapter Supabase.
- Prisma adapter NextAuth: `@auth/prisma-adapter` — útil se usar OAuth providers com database sessions.
- **Zod 3 (não 4)** com `@hookform/resolvers` v5 — ver [[2026-06-21-zod4-incompativel-hookform-resolvers]].
- **Next.js 16 deprecou `middleware.ts`** → `proxy.ts` — ver [[middleware-deprecated-proxy]] (migrar na Fase 6).

## Fase do roadmap
**Fase 1 — Setup** ✅ Implementado (build/typecheck/lint passando).
