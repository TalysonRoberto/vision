---
tipo: divida
area: infra
status: aberta
prioridade: baixa
esforco: P
situacao: aberta
tokens: baixo
fonte:
  - middleware.ts
atualizado: 2026-06-21
tags: [divida-tecnica, nextjs, middleware, proxy]
---

> [!tldr] TL;DR
> `middleware.ts` funciona mas está deprecated no Next.js 16 (deve ser `proxy.ts`). Baixo risco — só gera warning no build. Migrar na Fase 6.

# Middleware deprecated → proxy (Next.js 16)

## O problema
O `middleware.ts` (proteção de rotas `/feed`, `/perfil`) foi criado na Fase 1 com a convenção antiga. Next.js 16 deprecated `middleware` em favor de `proxy`. Funciona corretamente, mas o `pnpm build` emite warning: "The 'middleware' file convention is deprecated. Please use 'proxy' instead."

## Risco de não tratar
- **Baixo.** Apenas warning no build; nenhuma quebra funcional.
- Pode virar erro em Next.js 17+ (remoção definitiva da convenção).
- Ruído no log de build dificulta detectar warnings reais.

## Como pagar
1. Renomear `middleware.ts` → `proxy.ts`.
2. A API (`export default auth(...)`, `export const config = { matcher }`) é idêntica — nenhuma mudança de código além do nome do arquivo.
3. Rodar `pnpm build` e confirmar que o warning sumiu.
4. Esforço: **P** (< 5 min).

## Relacionado
- Afeta: [[auth]]
- Aprendizado: [[2026-06-21-nextjs16-middleware-deprecated]]
- Migrar durante: Fase 6 (Ajustes finais de UI/UX)
