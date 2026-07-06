---
tipo: banco
area: perfil
status: ativo
tokens: baixo
fonte:
  - prisma/schema.prisma
atualizado: 2026-06-21
tags: [schema, profile-views, visualizacoes, privacidade]
---

> [!tldr] TL;DR
# Registro de quem visitou um perfil. `profile_id` = dono do perfil visitado; `viewer_id` = quem visitou. Visível **só ao dono** (`profile_id`). MVP aceita duplicata (mesmo viewer pode contar múltiplas visitas).

# Tabela: `profile_views`

## Colunas (essenciais)
| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid | PK |
| `profile_id` | uuid | FK → [[tabela-users]] (dono do perfil visitado) |
| `viewer_id` | uuid | FK → [[tabela-users]] (quem visitou) |
| `created_at` | timestamptz | default `now()` — ordenação da lista |

## Relações
- N:1 → [[tabela-users]] (como `profile_id`)
- N:1 → [[tabela-users]] (como `viewer_id`)

## Índices / constraints relevantes
- `INDEX(profile_id, created_at DESC)` — lista "quem viu meu perfil" do dono, ordenada.
- Sem `UNIQUE(profile_id, viewer_id)` no MVP — permite múltiplas visitas do mesmo viewer (conta cada visita).

## Observações
- **Inserção**: só quando `viewer !== profile` E `viewer` autenticado — não registrar self-view nem anônimo (ver [[perfil]] Gotchas). Implementado em `lib/profile-views.ts` → `registrarProfileView` (Fase 5).
- **Privacidade**: query de visualizações é gated por `session.user.id === profile_id` — RLS via app layer (não expor endpoint público). Implementado no `app/perfil/[username]/page.tsx` (Fase 5): query só roda quando `isOwner && sessao.user.id`.
- **Dedup opcional**: MVP aceita duplicata (mesmo viewer gera várias rows). Receita futura para "visualizações únicas": adicionar `UNIQUE(profile_id, viewer_id)` + `upsert` atualizando `created_at`. Dívida leve — só vale se produto pedir contagem única.
- Prisma: `ProfileView` com duas relações reversas em `User`: `profileViews ProfileView[]` (recebidas) e `viewedProfiles ProfileView[]` (feitas).
- Migration `cria_tabela_users` (Fase 1) já criou a tabela `profile_views` com `INDEX(profile_id, created_at)`.
- Ver [[perfil]] · [[tabela-users]]
