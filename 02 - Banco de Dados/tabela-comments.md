---
tipo: banco
area: publicacao
status: ativo
tokens: medio
fonte:
  - prisma/schema.prisma
atualizado: 2026-06-21
tags: [schema, comments, reply, aninhado]
---

> [!tldr] TL;DR
> Comentário em um post, com suporte a reply (auto-relação via `parent_comment_id`). MVP: 1 nível de profundidade. Validação: `parent_comment_id` deve pertencer ao mesmo `post_id`.

# Tabela: `comments`

## Colunas (essenciais)
| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid | PK |
| `post_id` | uuid | FK → [[tabela-posts]] |
| `user_id` | uuid | FK → [[tabela-users]] (autor) |
| `parent_comment_id` | uuid? | FK → `comments.id` (self-ref); null = comentário top-level |
| `content` | text | Corpo do comentário |
| `created_at` | timestamptz | default `now()` |

## Relações
- N:1 → [[tabela-posts]]
- N:1 → [[tabela-users]]
- N:1 → `comments` (parent) — self-reference
- 1:N → `comments` (replies) — self-reference

## Índices / constraints relevantes
- `INDEX(post_id, created_at)` — listar comentários de um post ordenados.
- `INDEX(parent_comment_id)` — carregar replies de um comentário.
- `CHECK` validação de profundidade é feita na app (Prisma não suporta CHECK complexo nativo) — ver [[publicacao]] Gotchas.

## Observações
- **Auto-relação Prisma**: `parent Comment? @relation("CommentReplies", fields: [parent_comment_id], references: [id])` + `replies Comment[] @relation("CommentReplies")`.
- **Renderização**: query top-level (`parent_comment_id IS NULL`) + `include: { replies: { include: { user } } }`.
- **Validação de reply**: endpoint checa `parent.postId === postId` antes de criar — evita reply cross-post.
- **Profundidade MVP**: se `parent.parent_comment_id IS NOT NULL`, rejeitar (não permite reply a reply) ou reatribuir ao top-level.
- Ver [[publicacao]]
