---
tipo: divida
area: banco
status: aberta
prioridade: baixa
esforco: P
situacao: aberta
tokens: baixo
fonte:
  - prisma/schema.prisma
  - app/feed/actions.ts
atualizado: 2026-06-21
tags: [divida-tecnica, postgres, check-constraint, integridade]
---

> [!tldr] TL;DR
> A consistência `(media_url IS NULL) = (media_type IS NULL)` é enforced só na app layer (Server Action), não no banco. Prisma não suporta CHECK declarativo. Baixo risco — validar via migration manual se crescer.

# CHECK constraint de consistência media_url/media_type

## O problema
O modelo `Post` tem `media_url` e `media_type` ambos nullable. A regra de negócio diz que ambos devem estar presentes ou ambos ausentes (post de texto puro tem ambos null; post com mídia tem ambos preenchidos). Na Fase 1, a migration `cria_tabela_users` não incluiu o `CHECK ((media_url IS NULL) = (media_type IS NULL))` porque o Prisma não suporta CHECK constraints declarativamente no `schema.prisma`.

A validação foi implementada na app layer (`app/feed/actions.ts` → `criarPost`), mas isso não protege contra inserts diretos no banco ou bugs futuros em outros endpoints.

## Risco de não tratar
- **Baixo.** MVP só cria posts via `criarPost` (Server Action), que valida a consistência.
- Se futuro endpoint (ex.: import de dados, seed, outro Server Action) bypassar `criarPost`, pode inserir post inconsistente (media_url sem media_type ou vice-versa).
- PostCard espera que `media_type` diga como renderizar `media_url` — inconsistência quebra a renderização.

## Como pagar
1. Gerar migration vazia: `pnpm prisma migrate dev --create-only --name add_check_media_consistency`
2. Editar o SQL gerado adicionando:
   ```sql
   ALTER TABLE "posts" ADD CONSTRAINT posts_media_consistency_check
   CHECK ((media_url IS NULL) = (media_type IS NULL));
   ```
3. Aplicar: `pnpm prisma migrate dev`
4. Validar: tentar insert inconsistente deve falhar.
5. Esforço: **P** (< 10 min).

## Relacionado
- Afeta: [[tabela-posts]] · [[feed]]
- Origem: Fase 3 (decisão de adiar CHECK para app layer)
