---
tipo: decisao
area: auth
status: ativo
tokens: baixo
fonte: []
decisao: aceita
data: 2026-06-21
atualizado: 2026-06-21
tags: [adr, auth, nextauth, sessao]
---

> [!tldr] TL;DR
# Auth: NextAuth.js (Auth.js) com Credentials Provider (e-mail/senha) + sessão JWT. Google OAuth é opcional (PKCE). Hash de senha com bcrypt. SessionProvider no layout raiz.

# ADR-005 — NextAuth.js para autenticação

## Contexto
MVP precisa de cadastro/login e-mail/senha com sessão persistente no Next.js App Router. PRD menciona opcional Google. Precisamos de solução integrada ao Next.js sem build de auth do zero.

## Decisão
Adotar **NextAuth.js (Auth.js v5)** com:
- **Credentials Provider** (e-mail/senha) — `authorize` callback valida contra `password_hash` via Prisma.
- **JWT strategy** (stateless) — mais simples p/ Vercel Serverless.
- **Opcional Google Provider** com PKCE.
- `bcrypt` para hash de senha no cadastro.
- `SessionProvider` no root layout (client).

## Alternativas consideradas
- **Supabase Auth nativo** — ótimo, mas acopla auth ao Supabase e bypassa Prisma como fonte de verdade do User.
- **Clerk** — UX completa, mas SaaS pago e adiciona vendor lock-in.
- **Lucia Auth** — leve, mas manutenção pausada em 2024 e menos ecossistema.

## Consequências
- ✅ Ecossistema Next.js, middleware de proteção de rotas pronto.
- ✅ `@auth/prisma-adapter` reusa schema Prisma se migrar para database sessions/OAuth.
- ⚠️ Credentials Provider exige hash manual no `authorize` — NextAuth não hasheia automaticamente.
- ⚠️ JWT não invalida sessão server-side sem rotate — aceitável no MVP.

## Relacionado
- Stack: [[ADR-002-stack-nextjs-typescript]]
- ORM: [[ADR-004-prisma-orm]]
- Nota: [[auth]]
- Tabela: [[tabela-users]]
