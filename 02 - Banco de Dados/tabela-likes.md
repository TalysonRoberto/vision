---
tipo: banco
area: publicacao
status: ativo
tokens: baixo
fonte:
  - prisma/schema.prisma
atualizado: 2026-06-21
tags: [schema, likes, curtidas]
---

> [!tldr] TL;DR
> Curtida 1:1 usuário↔post. `UNIQUE(user_id, post_id)` previne duplicata e resolve race do toggle. Count via `_count` no Prisma.

# Tabela: `likes`

## Colunas (essenciais)
| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid | PK |
| `post_id` | uuid | FK → [[tabela-posts]] |
| `user_id` | uuid | FK → [[tabela-users]] |
| `created_at` | timestamptz | default `now()` |

## Relações
- N:1 → [[tabela-posts]]
- N:1 → [[tabela-users]]

## Índices / constraints relevantes
- `UNIQUE(user_id, post_id)` — **crítico**: garante 1 like por usuário por post e resolve race condition do toggle (ver [[publicacao]] Gotchas).
- `INDEX(post_id)` — contar likes por post.

## Observações
- Toggle like: `upsert` Prisma com `where: { post_id_user_id: { postId, userId } }` — se existe, `deleteMany`; se não, `create`.
- Prisma: `Like` com `@@unique([post_id, user_id])`.
- Count no feed: `include: { _count: { select: { likes: true } } }` — mais barato que carregar rows.
- Ver [[publicacao]]
