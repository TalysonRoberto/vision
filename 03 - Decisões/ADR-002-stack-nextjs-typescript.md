---
tipo: decisao
area: infra
status: ativo
tokens: baixo
fonte: []
decisao: aceita
data: 2026-06-21
atualizado: 2026-06-21
tags: [adr, stack, nextjs, typescript, tailwind, shadcn]
---

> [!tldr] TL;DR
> Stack frontend/backend: Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui. Escolhida por produtividade MVP, SSR/Server Actions nativos e ecossistema de deploy rápido (Vercel).

# ADR-002 — Stack Next.js + TypeScript + Tailwind + shadcn/ui

## Contexto
MVP de rede social precisa de UI responsiva (mobile-first), upload de mídia, auth e CRUD — tudo em poucas semanas. Separar frontend e backend em dois repositórios aumentaria overhead sem ganho de MVP.

## Decisão
Adotar **Next.js (App Router)** como framework fullstack com **TypeScript** (type safety), **TailwindCSS** (utility-first, responsivo sem escrever CSS custom) e **shadcn/ui** (componentes consistentes, copiáveis, sem lock-in de vendor).

## Alternativas consideradas
- **Remix** — bom em forms/nested routes, mas ecossistema menor e menos templates UI.
- **Vite + React SPA + Express separado** — mais flexível, mas dobra deploys e perde SSR/SEO do feed.
- **Vue/Nuxt** — válido, mas a equipe/PRD já prefere ecossistema React.

## Consequências
- ✅ Server Components + Server Actions reduzem JS no client e simplificam data fetching.
- ✅ shadcn/ui dá componentes consistentes sem dependency pesada.
- ⚠️ App Router tem curva de aprendizado (Server vs Client Components, `'use client'`).
- ⚠️ Tailwind utility-first pode gerar classes longas — mitigado com componentes shadcn.

## Relacionado
- Banco: [[ADR-003-supabase-postgres]] · ORM: [[ADR-004-prisma-orm]]
- Auth: [[ADR-005-nextauth]] · Upload: [[ADR-006-cloudinary-upload]]
- Notas: [[auth]] · [[feed]] · [[perfil]]
