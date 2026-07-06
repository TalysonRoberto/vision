---
tipo: arquitetura
area: perfil
camada: fullstack
status: ativo
tokens: medio
fonte:
  - app/perfil/[username]/page.tsx
  - components/profile/
  - lib/upload.ts
atualizado: 2026-06-21
tags: [perfil, avatar, capa, profile-view, abas]
---

> [!tldr] TL;DR
> Página `/perfil/[username]` com 2 modos: **dono** (edita avatar/capa/bio + vê lista de visualizações) e **visitante** (mesma estrutura visual, sem editar e sem visualizações). Publicações em abas: Todas / Fotos / Vídeos. Visitante dispara registro `ProfileView` (Fase 5). **Implementado** — Fase 2 (CRUD) + Fase 5 (visualizações) — build/typecheck/lint passando.

# Perfil (perfil)

## Responsabilidade
Exibir e editar perfil de usuário. Renderização isomórfica por `username` na URL: se `session.user.username === params.username` → modo dono; senão → modo visitante.

## Como funciona (essencial)
1. **Rota dinâmica** `app/perfil/[username]/page.tsx` (Server Component): busca `User` por `username` via Prisma. Next.js 16: `params` e `searchParams` são Promises (await). `notFound()` se inexistente.
2. **Modo dono** (`session.user.username === params.username`): `EditProfileDialog` (client) com formulário (name, bio, avatar, capa) — uploads via [[upload-midia]] (multipart server-side); submit `PATCH /api/perfil`. Painel "Quem viu meu perfil" — placeholder implementado, ProfileView insert na Fase 5.
3. **Modo visitante**: mesma UI (ProfileHeader + ProfileTabs), sem botão editar e sem painel de visualizações; dispara `ProfileView` insert (Fase 5).
4. **Abas**: `?tab=todas|fotos|videos` — filtra `Post` por `media_type` (fotos: `image`, vídeos: `video`, todas: sem filtro). URL-driven via `<Link>` (SSR-friendly, compartilhável). Contagens por aba exibidas.
5. **Posts**: lista simples (Fase 2); PostCard completo na Fase 3.

## Interface / contrato
- **GET** `/perfil/[username]` — renderiza perfil (Server Component)
- **PATCH** `/api/perfil` (dono) — `{ name?, bio?, avatar_url?, cover_url? }` → `200 { user }` · `401` · `400` · `403` (self-only)
- **POST** `/api/upload` (auth) — multipart `{ arquivo, pasta }` → `200 { mediaUrl, mediaType }` · `401` · `413` · `415` · OU JSON `{ action: 'sign', preset, folder }` → `200 { signature, timestamp, ... }`
- **Server Action** `registrarProfileView(profileId)` — insert em `profile_views` (Fase 5)

## Dependências e relações
- Tabelas: [[tabela-users]] · [[tabela-posts]] · [[tabela-profile-views]]
- Upload: [[upload-midia]]
- Auth: [[auth]] (gating dono vs visitante)
- Decisão: [[ADR-006-cloudinary-upload]]

## Gotchas
- `ProfileView` só é inserida quando o visitante é **autenticado** e **diferente** do dono — não contar self-view nem anônimo.
- Race condition em visualizações: usar `upsert` ou `insert ... on conflict` se quiser dedup por (profile_id, viewer_id, dia) — MVP aceita duplicata.
- Abas via query param mantêm URL compartilhável e SSR-friendly.

## Fases do roadmap
**Fase 2** — CRUD de perfil (foto, capa, bio) ✅ Implementado. **Fase 5** — Sistema de visualizações de perfil ✅ Implementado (Server Action `registrarProfileView` + painel `ProfileViewsList` com gating dono).
