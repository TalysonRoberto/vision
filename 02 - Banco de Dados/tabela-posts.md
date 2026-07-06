---
tipo: banco
area: publicacao
status: ativo
tokens: baixo
fonte:
  - prisma/schema.prisma
atualizado: 2026-06-21
tags: [schema, posts, feed]
---

> [!tldr] TL;DR
> Unidade de conteúdo do feed: texto (`content_text`) + opcional mídia (`media_url` + `media_type`). Autor é `user_id`. Ordenado por `created_at` desc no feed. Recebe likes e comments.

# Tabela: `posts`

## Colunas (essenciais)
| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → [[tabela-users]] (autor) |
| `content_text` | text | Corpo da publicação (pode coexistir com mídia) |
| `media_url` | string? | URL Cloudinary — null se post só-texto |
| `media_type` | enum('image','video')? | null quando `media_url` é null |
| `created_at` | timestamptz | default `now()` — chave de ordenação do feed |

## Relações
- N:1 → [[tabela-users]] (autor)
- 1:N → [[tabela-likes]] (`post_id`)
- 1:N → [[tabela-comments]] (`post_id`)

## Índices / constraints relevantes
- `INDEX(created_at DESC)` — feed cronológico.
- `INDEX(user_id, created_at DESC)` — aba de publicações do perfil (Todas/Fotos/Vídeos por autor).
- `CHECK((media_url IS NULL) = (media_type IS NULL))` — consistência mídia/tipo.

## Observações
- Prisma: `Post` com `author User @relation(fields: [user_id], references: [id])`, `likes Like[]`, `comments Comment[]`.
- Abas do perfil filtram por `media_type`: `image` (Fotos), `video` (Vídeos), sem filtro (Todas).
- Sem soft-delete no MVP — `DELETE` remove cascata via `onDelete: Cascade`.
- Ver [[feed]] · [[publicacao]] · [[upload-midia]]
