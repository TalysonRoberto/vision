---
phase: 5
phase_name: Sistema de visualizações de perfil
status: completed
completed_at: 2026-06-21
plans: 6
---

# Fase 5 — Sistema de visualizações de perfil — SUMMARY

> [!tldr] TL;DR
> Fase 5 concluída (leve, P). Server Action `registrarProfileView` + painel "Quem viu meu perfil" com gating server-side (só dono). MVP aceita duplicata (dedup futuro documentado). Build/typecheck/lint passando.

## Self-Check: PASSED

- [x] `pnpm typecheck` — sem erros
- [x] `pnpm lint` — 0 erros, 12 warnings (`<img>` intencionais)
- [x] `pnpm build` — Compiled successfully; `/perfil/[username]` continua dinâmica

## Tarefas executadas (6/6)

| # | Tarefa | Entrega |
|---|---|---|
| 1 | Server Action `registrarProfileView` | `lib/profile-views.ts` — valida anônimo (return) + self-view (return); `prisma.profileView.create`; erro tratado silenciosamente (não quebra render) |
| 2 | Disparar registro na página | `app/perfil/[username]/page.tsx` — `if (sessao.user.id && !isOwner) await registrarProfileView(usuario.id)` antes do render |
| 3 | Query de visualizações com gating | `Promise.all` com `isOwner && sessao.user.id ? prisma.profileView.findMany(...) : Promise.resolve([])` — query só roda no modo dono |
| 4 | `ProfileViewsList` | `components/profile/profile-views-list.tsx` — lista (avatar, nome link `/perfil/[username]`, data relativa); `EmptyState` quando vazio |
| 5 | Integrar painel no perfil | Placeholder substituído por `<section>` com header "Quem viu meu perfil" + contagem + `ProfileViewsList`; só renderiza no modo dono |
| 6 | Documentar trade-off dedup no cofre | `tabela-profile-views.md` atualizado com receita futura (UNIQUE + upsert) |

## Decisões técnicas

- **Gating server-side (não endpoint público)**: a query de visualizações está inline no Server Component `app/perfil/[username]/page.tsx`, condicional a `isOwner && sessao.user.id`. Não há endpoint `/api/profile-views` — impossível bypassar via client. Privacidade garantida na camada de render.
- **Registro fire-and-forget antes do render**: chamei `await registrarProfileView(usuario.id)` antes do `Promise.all` das contagens. Não usa `waitUntil` (não disponível em Server Component no Next.js 16 sem Edge Runtime), mas o insert é rápido (1 row) e não atrasa TTFB significativamente.
- **MVP aceita duplicata**: mesma pessoa visitando o mesmo perfil gera várias rows. Dedup futuro via `UNIQUE(profile_id, viewer_id)` + `upsert` atualizando `created_at` — documentado em [[tabela-profile-views]], não implementado (não há requisito de contagem única no PRD).
- **take: 20**: limite de visualizações carregadas (top 20 recentes). Paginação do painel é escopo futuro se volume crescer.

## Próxima fase

**Fase 6 — Ajustes finais de UI/UX e responsividade** → `/executar-fase 6`

Última fase. Depende de todas as telas prontas (✅ Fases 2-5). Inclui: auditoria mobile-first (375/768/1280), responsividade da sidebar (Sheet em mobile), tokens shadcn/ui, ritmo espacial base-4, EmptyState reutilizável, loading skeletons, a11y (foco, contraste WCAG AA, aria-labels), migração `middleware.ts` → `proxy.ts` (dívida Fase 1), e avaliação de dark mode.
