---
tipo: decisao
area: infra
status: ativo
tokens: baixo
fonte: []
decisao: aceita
data: 2026-06-21
atualizado: 2026-06-21
tags: [adr, supabase, postgres, banco]
---

> [!tldr] TL;DR
# Banco: Supabase (PostgreSQL gerenciado). Project ID `svdxrekqtbtzifkreqio`. Escolhido por ter free tier generoso, Postgres real (não serverless cold-start como Neon) e painel/admin pronto.

# ADR-003 — Supabase como banco PostgreSQL

## Contexto
MVP precisa de PostgreSQL relacional com constraints (UNIQUE user+post em likes, self-ref em comments). Opções: Supabase, Railway, Neon. PRD lista os três como candidatos; kit-mcp tem agents/skills Supabase dedicados.

## Decisão
Usar **Supabase** (PostgreSQL gerenciado). **Project ID: `svdxrekqtbtzifkreqio`**. Conexão via Prisma usando connection string do Supabase (pooler porta 6543 para Serverless/Edge, direta 5432 para migrações).

## Alternativas consideradas
- **Neon** — Postgres serverless com branching; cold-start pode adds latência no MVP.
- **Railway** — simples, mas free tier menor e sem painel admin tão completo.
- **Vercel Postgres** — na verdade é Neon por baixo; mesmo trade-off de cold-start.

## Consequências
- ✅ Painel admin (Table Editor, SQL Editor) acelera debug.
- ✅ Free tier suficiente para MVP.
- ✅ Alinhado com kit-mcp (skills `supabase-*` e agents `supabase-*`).
- ⚠️ RLS do Supabase não é usado diretamente no MVP (Prisma roda server-side com role única) — gating de visualizações feito na app layer (ver [[tabela-profile-views]]).
- ⚠️ Connection pooler (Supavisor) exige URL específica para Serverless — usar `?pg_bouncer=true` no Prisma se necessário.

## Relacionado
- ORM: [[ADR-004-prisma-orm]]
- Tabelas: [[tabela-users]] · [[tabela-posts]] · [[tabela-likes]] · [[tabela-comments]] · [[tabela-profile-views]]
- Visão geral: [[visao-geral]]
