---
tipo: arquitetura
area: publicacao
camada: fullstack
status: ativo
tokens: medio
fonte:
  - components/post/
  - components/comment/
  - app/api/posts/
atualizado: 2026-06-21
tags: [post, like, comment, reply, aninhado]
---

> [!tldr] TL;DR
> Interação social sobre um post: **curtir** (toggle like 1:1 user↔post), **comentar** e **responder comentário** (`parent_comment_id`, 1 nível de profundidade). Likes e comments são contadores exibidos no PostCard; comentários expandem inline com thread de respostas. **Implementado na Fase 4** — build/typecheck/lint passando.

# Publicação — interações (publicacao)

## Responsabilidade
Materializar curtidas, comentários e respostas aninhadas sobre um `Post`. **Não** faz edição/remoção de comentário nem threads profundas (MVP: 1 nível de reply).

## Como funciona (essencial)
1. **Like** (toggle): `POST /api/posts/[id]/like` com sessão → `upsert` em `likes` (user_id + post_id únicos). Toggle: se existe, delete; se não, insert. Retornar novo count.
2. **Comentar**: `POST /api/posts/[id]/comments` → cria `Comment` com `parent_comment_id = null`.
3. **Responder**: mesmo endpoint com `parent_comment_id` preenchido → valida que o parent pertence ao mesmo post.
4. **Renderização**: `CommentSection` lista comentários top-level; cada um tem `RepliesList` (filhos). Botão "Responder" abre inline form.

## Interface / contrato
- **POST** `/api/posts/[id]/like` → `200 { liked: boolean, count: number }`
- **POST** `/api/posts/[id]/comments` — `{ content, parent_comment_id? }` → `201 { comment }`
- **GET** `/api/posts/[id]/comments` → `200 [{ id, content, user, createdAt, replies: [...] }]`

## Dependências e relações
- Tabelas: [[tabela-likes]] · [[tabela-comments]] · [[tabela-posts]]
- Renderizado no: [[feed]] · [[perfil]]
- Auth: [[auth]]

## Gotchas
- **Like toggle race**: dois clicks rápidos podem duplicar — mitigar com constraint `UNIQUE(user_id, post_id)` no banco (ver [[tabela-likes]]) e `upsert` no Prisma.
- **Validação do parent_comment_id**: sempre checar `parent.postId === postId` da URL — senão reply vira órfão cross-post.
- **Profundidade**: MVP permite só 1 nível (reply a reply vira reply ao top-level). Validar no endpoint: se `parent.parent_comment_id IS NOT NULL`, rejeitar ou reatribuir ao top-level.
- **Optimistic UI**: like toggle beneficia de optimistic update no client p/ snappy feel.

## Fase do roadmap
**Fase 4** — Curtidas e comentários (com respostas aninhadas) ✅ Implementado.

## Detalhes da implementação (Fase 4)
- **Toggle like**: `POST /api/posts/[id]/like` — `findUnique` em `(post_id, user_id)`; se existe → delete, se não → create; trata `P2002` (unique violation) como idempotente (outra transação criou concorrentemente). Count via `prisma.like.count`. READ COMMITTED basta (REGRA #2 da skill `postgres-isolamento-concorrencia` — INSERT em tabela única com UNIQUE guardando).
- **Criar comentário**: `POST /api/posts/[id]/comments` — valida `parent.post_id === postId` (400 se cross-post) + `parent.parent_comment_id IS NULL` (400 se reply a reply — MVP 1 nível).
- **Listar comentários**: `GET /api/posts/[id]/comments` — top-level (`parent_comment_id: null`) ASC + `include: { user, replies: { include: { user } } }`.
- **LikeButton** (client): optimistic UI (toggle + count ±1 imediatamente), sincroniza com resposta real, reverte em erro, desabilita durante request, `aria-pressed`/`aria-label`.
- **CommentForm** (client): textarea controlada, Enter envia / Shift+Enter quebra linha, modo reply com Cancelar, `onSubmitted` callback.
- **RepliesList** (server): renderiza replies com avatar/nome/data; **sem** botão responder (respeita 1 nível MVP).
- **CommentSection** (client): orquestrador — GET comments on mount, CommentForm top-level, botão Responder expande inline, estados loading/erro/empty.
- **PostCard**: integrado com `likedByCurrentUser` (query do feed inclui `likes: { where: { user_id }, select: { id: true } }`).
