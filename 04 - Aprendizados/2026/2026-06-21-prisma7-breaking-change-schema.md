---
tipo: aprendizado
area: infra
status: ativo
tokens: baixo
fonte:
  - prisma/schema.prisma
atualizado: 2026-06-21
tags: [gotcha, prisma, breaking-change, setup]
---

> [!tldr] TL;DR
> **Nunca instale `prisma@latest` (v7+) neste projeto.** Use `prisma@6` + `@prisma/client@6`. O Prisma 7 removeu `url` e `directUrl` do `datasource` do schema (exige `prisma.config.ts` + driver adapter) — quebra toda a API familiar.

# 2026-06-21 — Prisma 7 quebra schema com `url`/`directUrl`

## O que aconteceu
Ao rodar `pnpm add prisma @prisma/client` (sem pinning), instalou Prisma 7.8.0. O `prisma validate` falhou com `P1012`: "The datasource property `url` is no longer supported in schema files. Move connection URLs to `prisma.config.ts`".

## Causa raiz
Prisma 7 é uma major release com breaking change arquitetural: connection strings saem do `schema.prisma` e vão para `prisma.config.ts`, exigindo driver adapter (`@prisma/adapter-pg`) ou `accelerateUrl`. A API do `PrismaClient` muda também. Para MVP com NextAuth + `@auth/prisma-adapter`, essa migração é overhead desnecessário.

## Como resolver / evitar
- **Fixar Prisma 6**: `pnpm add prisma@6 @prisma/client@6` (versão estável 6.19.3).
- Se no futuro migrar para Prisma 7, seguir https://pris.ly/d/config-datasource e atualizar [[ADR-004-prisma-orm]].
- Ao instalar qualquer dep Prisma, sempre pinning de major: `@6`, nunca `@latest`.

## Relacionado
- Origem: Fase 1 setup · [[ADR-004-prisma-orm]]
