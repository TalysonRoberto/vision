---
phase: 4
phase_name: Curtidas e comentários
status: completed
completed_at: 2026-06-21
plans: 11
---

# Fase 4 — Curtidas e comentários (com respostas aninhadas) — SUMMARY

> [!tldr] TL;DR
> Fase 4 concluída. Toggle like anti-race (UNIQUE + P2002 idempotente), comentários top-level + replies aninhados (1 nível), LikeButton com optimistic UI, CommentSection expandível. Skill `postgres-isolamento-concorrencia` consultada. Gate `ui-anti-padroes-ia` PASS.

## Self-Check: PASSED

- [x] `pnpm typecheck` — sem erros
- [x] `pnpm lint` — 0 erros, 11 warnings (`<img>` intencionais)
- [x] `pnpm build` — Compiled successfully; 2 rotas novas (`/api/posts/[id]/like`, `/api/posts/[id]/comments`)
- [x] **Gate `ui-anti-padroes-ia`** — zero P0 (T01, Q01, Q03, Q04, Q06 = 0 hits)

## Tarefas executadas (11/11)

| # | Tarefa | Entrega |
|---|---|---|
| 1-3 | Modelos Like + Comment + migration | Já prontos desde Fase 1 (confirmado: `@@unique([post_id, user_id])`, auto-relação `CommentReplies`, 2 indexes) |
| 4 | Toggle like `POST /api/posts/[id]/like` | `findUnique` em (post_id, user_id) → delete se existe / create se não; P2002 idempotente; count via `prisma.like.count`; `{ liked, count }` |
| 5 | Criar comentário `POST /api/posts/[id]/comments` | zod validation; valida `parent.post_id === postId` (400 cross-post); valida `parent.parent_comment_id IS NULL` (400 reply a reply); `{ comment }` 201 |
| 6 | Listar comentários `GET /api/posts/[id]/comments` | top-level ASC + `include: { user, replies: { include: { user } } }`; `{ comments }` |
| 7 | `LikeButton` (client) | optimistic UI (toggle + count ±1), sincroniza com servidor, reverte em erro, desabilita durante request, `aria-pressed`/`aria-label`, ícone Heart preenchido quando liked |
| 8 | `CommentForm` (client) | textarea controlada, Enter envia / Shift+Enter nova linha, modo reply com Cancelar, `onSubmitted` callback, validação client |
| 9 | `RepliesList` (server) | renderiza replies (avatar, nome link, data relativa); **sem** botão responder (1 nível MVP); border-l-2 indent |
| 10 | `CommentSection` (client) | orquestrador — GET on mount, CommentForm top-level, botão Responder expande inline, estados loading/erro/empty, `aria-expanded` |
| 11 | Integrar no PostCard | `likedByCurrentUser` no tipo; query do feed inclui `likes: { where: { user_id }, select: { id: true } }`; footer usa LikeButton + CommentSection |

## Skill do kit-mcp usada
- **`postgres-isolamento-concorrencia`** — carregada antes da implementação; confirmou que READ COMMITTED basta para toggle like (REGRA #2: INSERT em tabela única com UNIQUE guardando); P2002 = unique violation tratado como idempotente (não precisa SERIALIZABLE nem FOR UPDATE)
- **`ui-anti-padroes-ia`** — gate rodado no checkpoint (zero P0)

## Rotas novas no build
```
ƒ /api/posts/[id]/like      — toggle like (anti-race)
ƒ /api/posts/[id]/comments  — GET thread + POST criar/reply
```

## Decisões técnicas

- **Toggle like sem SERIALIZABLE**: a skill `postgres-isolamento-concorrencia` confirma que UNIQUE constraint + tratamento de P2002 resolve o race (REGRA #2). Não precisei de FOR UPDATE nem CAS — o `findUnique` + `delete`/`create` + P2002 guard é suficiente porque a constraint do banco é a fonte da verdade.
- **Profundidade 1 nível enforced no endpoint**: `parent.parent_comment_id IS NOT NULL` → 400. `RepliesList` não renderiza botão responder — dupla defesa (app + UI).
- **Optimistic UI no LikeButton**: toggle instantâneo + sincronização com resposta real. Em erro, reverte estado + toast. Desabilita durante request para evitar spam.
- **Perfil não usa PostCard**: a página `/perfil/[username]` ainda usa lista simples (Fase 2). PostCard com interações está no feed apenas. Migrar perfil para PostCard é escopo futuro (Fase 6 ou refatoração).

## Próxima fase

**Fase 5 — Sistema de visualizações de perfil** → `/executar-fase 5`

Depende de: `/perfil/[username]` (✅ Fase 2). Modelo `ProfileView` já no schema (Fase 1). Implementa Server Action `registrarProfileView` + painel "Quem viu meu perfil" (gating dono).
