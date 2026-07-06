---
tipo: banco
area: auth
status: ativo
tokens: baixo
fonte:
  - prisma/schema.prisma
atualizado: 2026-06-21
tags: [schema, users, perfil]
---

> [!tldr] TL;DR
> Tabela central do sistema: guarda identidade, perfil (avatar, capa, bio) e credenciais (`password_hash`) do usuário. Referenciada por posts, likes, comments e profile_views via `user_id`.

# Tabela: `users`

## Colunas (essenciais)
| Coluna | Tipo | Nota |
|---|---|---|
| `id` | String @id @default(cuid()) | PK — `cuid` (não uuid) por padrão Prisma |
| `name` | String | Nome exibido |
| `username` | String @unique | slug-friendly (`^[a-z0-9_]+$`), normalizado lowercase, usado na URL `/perfil/[username]` |
| `email` | String @unique | login, normalizado lowercase |
| `password_hash` | String? | bcrypt (12 rounds) — null se OAuth-only |
| `avatar_url` | String? | URL Cloudinary — ver [[upload-midia]] |
| `cover_url` | String? | URL Cloudinary — capa do perfil |
| `bio` | String? | Texto livre do perfil |
| `created_at` | DateTime @default(now()) @db.Timestamptz | default `now()` |

## Relações
- 1:N → [[tabela-posts]] (`user_id` autor)
- 1:N → [[tabela-likes]] (`user_id`)
- 1:N → [[tabela-comments]] (`user_id`)
- 1:N → [[tabela-profile-views]] (como `profile_id` via `ProfileViewsReceived` e como `viewer_id` via `ProfileViewsMade`)

## Índices / constraints relevantes
- `UNIQUE(username)` — Performance da rota `/perfil/[username]` + não permite duplicata.
- `UNIQUE(email)` — Login por e-mail + previne contas duplicadas.
- `@@map("users")` — mapeia model `User` para tabela `users` (snake_case).

## Observações
- Prisma model: `User` com `posts`, `likes`, `comments`, `profileViews`, `viewedProfiles` (relações reversas).
- `password_hash` nullable suporta futuro login só-Google sem senha.
- Migration `cria_tabela_users` aplicada no Supabase (Fase 1).
- [[ADR-004-prisma-orm]] · [[ADR-003-supabase-postgres]] · [[auth]]
