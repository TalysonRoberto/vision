---
tipo: arquitetura
area: feed
camada: fullstack
status: ativo
tokens: medio
fonte:
  - app/feed/page.tsx
  - components/feed/
atualizado: 2026-06-21
tags: [feed, sidebar, cronologico, nova-publicacao]
---

> [!tldr] TL;DR
> Página principal pós-login. Layout: **sidebar esquerda** (info do usuário logado + atalho ao perfil) + **topo** (caixa de nova publicação: texto + anexo imagem/vídeo) + **lista cronológica** de posts de todos os usuários. Paginação offset (`?page=N`). **Implementado na Fase 3** — build/typecheck/lint passando.

# Feed (feed)

## Responsabilidade
Agregar publicações de todos os usuários em ordem cronológica (desc) e prover a entrada de criação de novas publicações. **Não** faz ranking/algoritmo nem filtragem por follow (MVP sem follow).

## Como funciona (essencial)
1. **Layout** `app/feed/layout.tsx` (Server Component): `auth()` + `prisma.user.findUnique`; sidebar esquerda fixa em desktop (avatar, name, @username, link `/perfil/[username]`, botão "Ver meu perfil", "Sair"); `redirect('/login')` sem sessão.
2. **Caixa de publicação** no topo: `<NewPost />` (client) — textarea + input file (image/video) → upload Cloudinary via `/api/upload` → Server Action `criarPost` com `revalidatePath('/feed')`.
3. **Lista** `app/feed/page.tsx`: `prisma.post.findMany({ orderBy: { created_at: 'desc' }, skip, take, include: { author, _count: { likes, comments } } })` — `searchParams.page` (async em Next.js 16).
4. **Paginação**: offset (`?page=N`, PAGE_SIZE=10) — clamp `Math.max(1, page)`; controles Anterior/Próximo com `<Link>`; `total` e `totalPages` exibidos.
5. **PostCard** (server): avatar + nome (link), @username, data relativa (pt-BR via `lib/data.ts`), texto, mídia (`<img>`/`<video controls>`), contadores via `_count`.

## Interface / contrato
- **GET** `/feed` — renderiza lista + caixa (Server Component)
- **GET** `/api/posts?page=N` — espelho JSON paginado (auth, 401 sem sessão)
- **Server Action** `criarPost({ contentText, mediaUrl, mediaType })` → `{ ok: true, postId } | { ok: false, erro }` · valida sessão, rejeita vazio, limite 2000 chars, consistência media_url/media_type, `revalidatePath('/feed')`

## Dependências e relações
- Componentes: [[publicacao]] (PostCard, LikeButton, CommentSection)
- Tabela: [[tabela-posts]]
- Upload: [[upload-midia]] (caixa de publicação)
- Auth: [[auth]]

## Gotchas
- `revalidatePath('/feed')` após criar post garante que a lista SSR reflita o novo item.
- `mediaType` só é setado se `mediaUrl` presente — post de texto puro tem `media_url = null`.
- `include: { _count }` é mais barato que carregar arrays inteiros de likes/comments no feed.

## Fase do roadmap
**Fase 3** — Feed + criação de publicações (texto, imagem, vídeo) ✅ Implementado.
