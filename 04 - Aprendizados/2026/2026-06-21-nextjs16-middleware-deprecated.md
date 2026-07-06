---
tipo: aprendizado
area: infra
status: ativo
tokens: baixo
fonte:
  - middleware.ts
atualizado: 2026-06-21
tags: [gotcha, nextjs, middleware, deprecated, setup]
---

> [!tldr] TL;DR
> **Next.js 16 deprecated `middleware.ts` em favor de `proxy.ts`.** O `middleware.ts` ainda funciona (warning no build), mas deve ser migrado. A convenção `export default auth(...)` do NextAuth é compatível com ambos — só renomear o arquivo.

# 2026-06-21 — Next.js 16: middleware deprecated → proxy

## O que aconteceu
O `pnpm build` imprimiu warning: "The 'middleware' file convention is deprecated. Please use 'proxy' instead." O build passou e o middleware funciona, mas a convenção foi descontinuada.

## Causa raiz
Next.js 16 renomeou a feature de "middleware" para "proxy" (clarificação de responsabilidade — o proxy roda no edge antes do request chegar à app). A API (`export default`, `config.matcher`) é a mesma; apenas o nome do arquivo muda de `middleware.ts` para `proxy.ts`.

## Como resolver / evitar
- **Migrar na Fase 6** (UI/UX): renomear `middleware.ts` → `proxy.ts` e remover o warning.
- Não urgente — funciona como está; é apenas ruído no build.
- Se NextAuth lançar update que muda a integração, checar compatibilidade com `proxy.ts`.
- Referência: https://nextjs.org/docs/messages/middleware-to-proxy

## Relacionado
- Origem: Fase 1 setup · dívida: [[middleware-deprecated-proxy]]
