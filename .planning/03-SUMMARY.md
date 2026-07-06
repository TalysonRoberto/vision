---
phase: 3
phase_name: Feed + criação de publicações
status: completed
completed_at: 2026-06-21
plans: 8
---

# Fase 3 — Feed + criação de publicações — SUMMARY

> [!tldr] TL;DR
> Fase 3 concluída. Feed com sidebar esquerda, caixa de nova publicação (texto/imagem/vídeo via Cloudinary), lista cronológica paginada, PostCard com contadores. Gate `ui-anti-padroes-ia` PASS (zero P0). 1 dívida registrada (CHECK constraint).

## Self-Check: PASSED

- [x] `pnpm typecheck` — sem erros
- [x] `pnpm lint` — 0 erros, 9 warnings (`<img>` intencionais para Cloudinary dinâmico)
- [x] `pnpm build` — Compiled successfully em 3.7s; rota nova `/api/posts`
- [x] **Gate `ui-anti-padroes-ia` (kit-mcp)** — zero P0 detectados:
  - T01 (gradiente roxo): 0 · T02 (texto gradiente): 0 · T04 (uppercase decorativo): 0
  - T05 (card borda lateral): 0 · Q03 (cores hard-coded): 0 · Q06 (padding cramped): 0
  - T08 (fonte Geist saturada): aceite — escopo de marca (Fase 6)

## Tarefas executadas (8/8)

| # | Tarefa | Entrega |
|---|---|---|
| 1 | Modelo Post no schema.prisma | Já modelado na Fase 1 (id, user_id, content_text, media_url?, media_type?, created_at; indexes `created_at` + `user_id, created_at`) |
| 2 | Server Action `criarPost` | `app/feed/actions.ts` — auth, rejeita vazio, limite 2000 chars, consistência media_url/media_type, `revalidatePath('/feed')` |
| 3 | Componente `<NewPost/>` | `components/feed/new-post.tsx` — textarea + input file (image/video) + upload Cloudinary + preview + remover; estados idle/enviando/concluido; toast pt-BR |
| 4 | Componente `<PostCard/>` | `components/post/post-card.tsx` — avatar + nome (link), @username, data relativa pt-BR (`lib/data.ts`), texto, mídia (`<img>`/`<video controls>`), contadores via `_count` |
| 5 | `app/feed/layout.tsx` | Server Component — `auth()` + Prisma; sidebar esquerda (avatar, name, @username, link perfil, "Sair"); `redirect('/login')` sem sessão; sticky em desktop |
| 6 | `app/feed/page.tsx` | Lista cronológica desc + paginação offset (`?page=N`, PAGE_SIZE=10) + Anterior/Próximo + `EmptyState` |
| 7 | `GET /api/posts` | `app/api/posts/route.ts` — espelho JSON paginado (auth, 401); `{ posts, currentPage, totalPages, total }` |
| 8 | Validação server-side | MIME no `/api/upload` (415); tamanho 4.5MB (413); `criarPost` rejeita vazio + > 2000 chars + inconsistência media_url/media_type |

## Skills do kit-mcp usadas
- **`ui-anti-padroes-ia`** — carregada antes da implementação; 18 anti-padrões grepáveis consultados durante a construção; gate rodado no checkpoint (zero P0)
- **`kit_gates list`** — identificou gates aplicáveis (`secrets-scan`, `verify-phase-goal`, `regression`, `dependency-check`)
- **`kit_kit search`** + **`kit_kit list-skills`** — descoberta de recursos relevantes
- **`kit_cost-today`** — confirmado que cost tracking não funciona no opencode (lê logs do Claude Code)

## Rotas novas/alteradas no build
```
ƒ /api/posts          — NOVO, espelho JSON paginado do feed
ƒ /feed               — era estática (○), agora dinâmica (ƒ) por searchParams
```

## Dívida técnica gerada
- [[check-constraint-media-consistency]] — `CHECK ((media_url IS NULL) = (media_type IS NULL))` enforced em app layer (Server Action); adicionar ao banco via migration manual (P, baixa prioridade)

## Desvios do plano
- **CHECK constraint em app layer**: plano pedia adicionar CHECK via `migrate dev --create-only` + editar SQL. Decidi enforce na app layer (`criarPost` valida consistência) e registrar como dívida — MVP só cria posts via Server Action, risco baixo.
- **`signOut` inline no layout**: usei inline server action no form de logout (`"use server"` dentro do `action`) em vez de arquivo separado — funciona no Next.js 16 e mantém o layout coeso.
- **Sidebar sem Sheet (mobile)**: a sidebar é flex column no mobile e sticky no desktop (lg:). O plano mencionava colapsar em Sheet, mas adiei para a Fase 6 (UI/UX) — no mobile ela aparece como card no topo, funcional.

## Próxima fase

**Fase 4 — Curtidas e comentários (com respostas aninhadas)** → `/executar-fase 4`

Depende de: PostCard (✅), `/api/posts` (✅). Modelos Like + Comment já no schema (Fase 1). Implementa endpoints toggle like + comments + componentes LikeButton (optimistic) + CommentSection/CommentForm/RepliesList.
