---
tipo: aprendizado
area: auth
status: ativo
tokens: baixo
fonte:
  - components/auth/cadastro-form.tsx
  - components/auth/login-form.tsx
atualizado: 2026-06-21
tags: [gotcha, zod, react-hook-form, setup]
---

> [!tldr] TL;DR
> **Use Zod 3 (não 4) com `@hookform/resolvers` v5 neste projeto.** O resolver v5 espera `_def.typeName` (Zod 3); Zod 4 mudou a estrutura interna (`_zod.version.minor`) e quebra o `zodResolver` com erro TS2769.

# 2026-06-21 — Zod 4 incompatível com @hookform/resolvers

## O que aconteceu
Instalado `zod@4.4.3` + `@hookform/resolvers@5.4.0`. O `tsc --noEmit` falhou nos formulários: "No overload matches this call. Argument of type 'ZodObject<...>' is not assignable to parameter of type 'Zod3Type<...>'" e "Type '4' is not assignable to type '0'" (version minor mismatch).

## Causa raiz
`@hookform/resolvers` v5 ainda não suporta Zod 4 oficialmente. A versão 4 do Zod reescreveu os tipos internos (`$ZodObjectDef` sem `typeName`, versionamento interno diferente). O resolver detecta a major via `_zod.version.minor` e rejeita.

## Como resolver / evitar
- **Fixar Zod 3**: `pnpm add zod@3` (versão 3.25.76).
- Quando `@hookform/resolvers` lançar suporte a Zod 4, atualizar ambos juntos e testar `tsc --noEmit`.
- Se precisar de features do Zod 4 antes disso, usar validação manual (`z.parse`) sem `zodResolver`.

## Relacionado
- Origem: Fase 1 setup · [[auth]]
