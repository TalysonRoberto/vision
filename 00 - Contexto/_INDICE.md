---
tipo: contexto
area: cofre
status: ativo
tokens: baixo
fonte: []
atualizado: 2026-06-21
tags: [indice, mapa, entrypoint, rede-social]
---

> [!tldr] TL;DR
> **Ponto de entrada do cofre. Leia esta nota antes de qualquer tarefa.** Ela mapeia onde mora cada coisa, para você não grepar o código à toa. Suba a escada de custo: TL;DR → nota → `fonte:` (código). Use a nota antes do código; se a nota estiver desatualizada, conserte-a.

# 🗺️ Mapa de Contexto — Rede Social MVP

Este é o índice mestre do cofre. O protocolo completo de uso está em [[CLAUDE]] (raiz) e [[como-usar-com-claude]].

## Por onde começar
- 📌 **Visão geral do projeto** → [[visao-geral]] (stack, propósito, roadmap)
- 📖 **Glossário do domínio** → [[glossario]] (Post, Like, Comment, ProfileView, Feed, Capa, Avatar)
- 🧭 **O padrão deste cofre** → [[padrao-do-cofre]]
- 🗂️ **Workflow de planejamento** → `.claude/workflows/planejar-rede-social.workflow.js` (Fan-out-and-synthesize)

## Mapa por área
- **auth** → [[auth]] ✅ · decisões: [[ADR-005-nextauth]] · aprendizados: [[2026-06-21-zod4-incompativel-hookform-resolvers]]
- **perfil** → [[perfil]] · banco: [[tabela-users]] · [[tabela-profile-views]]
- **feed** → [[feed]]
- **publicacao** → [[publicacao]] · banco: [[tabela-posts]] · [[tabela-likes]] · [[tabela-comments]]
- **upload-midia** → [[upload-midia]] · decisão: [[ADR-006-cloudinary-upload]]
- **infra/banco** → [[ADR-003-supabase-postgres]] (project_id `svdxrekqtbtzifkreqio`) · [[ADR-004-prisma-orm]] · aprendizados: [[2026-06-21-prisma7-breaking-change-schema]] · [[2026-06-21-supabase-conexao-direta-vs-pooler]] · [[2026-06-21-pnpm11-approve-builds]]
- **workflow** → [[ADR-007-fanout-workflow-planejamento]]

## Aprendizados da Fase 1 (Setup)
- [[2026-06-21-prisma7-breaking-change-schema]] — fixar Prisma 6 (v7 quebra schema)
- [[2026-06-21-zod4-incompativel-hookform-resolvers]] — usar Zod 3 com hook-form
- [[2026-06-21-supabase-conexao-direta-vs-pooler]] — user `postgres` na direta, `postgres.[ref]` no pooler
- [[2026-06-21-pnpm11-approve-builds]] — `pnpm-workspace.yaml` + `approve-builds --all`
- [[2026-06-21-nextjs16-middleware-deprecated]] — `middleware.ts` → `proxy.ts`

## Aprendizados da Fase 2 (Perfil)
- [[2026-06-21-shadcn-base-ui-render-vs-aschild]] — preset base-nova usa `render={<Component />}` (não `asChild`)

## Fase 3 (Feed) — gate ui-anti-padroes-ia PASS
- Zero P0: sem gradientes roxo, sem texto gradiente, sem card borda lateral, sem uppercase decorativo, sem cores hard-coded, sem padding cramped
- T08 (fonte Geist saturada) — aceite (escopo de marca, Fase 6)

## Fase 4 (Interações) — skill postgres-isolamento-concorrencia + gate ui-anti-padroes-ia PASS
- Toggle like: UNIQUE(user_id, post_id) + P2002 idempotente (READ COMMITTED basta, REGRA #2)
- Zero P0 no gate UI

## Fase 5 (Visualizações) — gating server-side implementado
- Server Action `registrarProfileView` (valida anônimo + self-view)
- Painel "Quem viu meu perfil" só carrega quando `session.user.id === profile_id`
- MVP aceita duplicata (dedup futuro via UNIQUE → dívida leve)

## Dívidas técnicas
- [[middleware-deprecated-proxy]] — baixa prioridade, migrar na Fase 6
- [[check-constraint-media-consistency]] — CHECK media_url/media_type em app layer, adicionar ao banco (P)

## Roadmap → Notas
| Fase | Roadmap | Notas de entrada | Status |
|---|---|---|---|
| 1 | Setup (Next.js, Prisma, banco, auth) | [[auth]] · [[ADR-002-stack-nextjs-typescript]] | ✅ Concluída |
| 2 | CRUD de perfil (foto, capa, bio) | [[perfil]] · [[upload-midia]] | ✅ Concluída |
| 3 | Feed + publicações (texto/foto/vídeo) | [[feed]] · [[publicacao]] · [[upload-midia]] | ✅ Concluída |
| 4 | Curtidas + comentários aninhados | [[publicacao]] | ✅ Concluída |
| 5 | Visualizações de perfil | [[perfil]] · [[tabela-profile-views]] | ✅ Concluída |
| 6 | Ajustes finais de UI/UX | [[03 - Decisões]] · [[middleware-deprecated-proxy]] | Pendente |

---

## 📊 Painéis dinâmicos

As tabelas abaixo se atualizam sozinhas a partir do frontmatter das notas (recurso **Bases**, nativo — sem plugin). Painel completo e openável: [[Painel.base|Abrir Painel]].

### 🔴 Revisar primeiro (notas desatualizadas)
```base
filters:
  and:
    - 'status == "desatualizado"'
views:
  - type: table
    name: "Desatualizadas"
    order:
      - file.name
      - area
      - atualizado
```

### 💸 Dívidas técnicas abertas
```base
filters:
  and:
    - 'tipo == "divida"'
    - 'situacao != "resolvida"'
views:
  - type: table
    name: "Dívidas abertas"
    order:
      - prioridade
      - file.name
      - esforco
```
