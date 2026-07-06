---
tipo: decisao
area: infra
status: ativo
tokens: baixo
fonte: []
decisao: aceita
atualizado: 2026-06-21
data: 2026-06-21
atualizado: 2026-06-21
tags: [adr, prisma, orm]
---

> [!tldr] TL;DR
> ORM: Prisma **6** (fixado em `@6` — não usar v7). Type-safe, schema declarativo, migrations automáticas, integra nativamente com NextAuth via `@auth/prisma-adapter`. Gera client tipado a partir de `schema.prisma`.

# ADR-004 — Prisma como ORM

## Contexto
MVP tem schema relacional com constraints, auto-relação (comments) e relações N:M implícitas (likes). Precisamos de migrations versionadas e types end-to-end com TypeScript.

## Decisão
Adotar **Prisma 6** (`prisma@6` + `@prisma/client@6`, versão 6.19.3) como ORM. Schema em `prisma/schema.prisma`, client singleton em `lib/prisma.ts`. Migrations via `pnpm prisma:migrate dev`.

> ⚠ **Não instalar Prisma 7** neste projeto — v7 removeu `url`/`directUrl` do `datasource` do schema (exige `prisma.config.ts` + driver adapter) e quebra a API familiar. Ver [[2026-06-21-prisma7-breaking-change-schema]].

## Alternativas consideradas
- **Drizzle** — mais leve, SQL-first, melhor para edge; mas ecossistema NextAuth adapter menos maduro.
- **Raw SQL + pg** — máximo controle, mas perde type safety e duplica boilerplate.
- **Supabase JS client direto** — bom, mas bypassa Prisma e perde migrations versionadas no repo.

## Consequências
- ✅ Type safety do schema até o client (autocomplete em `prisma.post.findMany`).
- ✅ Migrations versionadas no git (`prisma/migrations/`).
- ✅ `@auth/prisma-adapter` integra NextAuth sem boilerplate (ver [[ADR-005-nextauth]]).
- ✅ Schema com 5 modelos (User, Post, Like, Comment, ProfileView) validado e migration `cria_tabela_users` aplicada no Supabase (Fase 1).
- ⚠️ Cold connection em Serverless: singleton `PrismaClient` com `globalThis` cache para evitar exaustão de connections.
- ⚠️ Prisma não suporta CHECK constraints complexas nativamente — validação de profundidade de reply feita na app (ver [[tabela-comments]]).
- ⚠️ Fixar major `@6` ao instalar — `@latest` instala v7 que quebra o schema (ver aprendizado).

## Relacionado
- Banco: [[ADR-003-supabase-postgres]]
- Auth: [[ADR-005-nextauth]]
- Tabelas: [[02 - Banco de Dados]]
