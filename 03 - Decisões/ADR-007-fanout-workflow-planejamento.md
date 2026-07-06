---
tipo: decisao
area: workflow
status: ativo
tokens: medio
fonte:
  - .claude/workflows/planejar-rede-social.workflow.js
decisao: aceita
data: 2026-06-21
atualizado: 2026-06-21
tags: [adr, workflow, fanout-synthesize, kit-mcp, planejamento]
---

> [!tldr] TL;DR
# Planejamento do projeto via workflow dinâmico **Fan-out-and-synthesize** do kit-mcp: 1 subagente por fase do roadmap roda em paralelo (fan-out), e um agente sintetizador combina os resultados num plano unificado. Reuso dos agents canônicos do kit (`phase-researcher`, `planner`).

# ADR-007 — Workflow Fan-out-and-synthesize para planejamento

## Contexto
O PRD tem 6 fases de roadmap independentes (setup, perfil, feed, interações, visualizações, UI/UX). Planejá-las em série custa wall-clock e perde paralelismo. O kit-mcp oferece o pattern **Fan-out-and-synthesize** (skill `dynamic-workflow-authoring`) e agents canônicos reutilizáveis.

## Decisão
Adotar o pattern **Fan-out-and-synthesize** materializado em `.claude/workflows/planejar-rede-social.workflow.js`:
- **Fan-out**: `pipeline()` sobre as 6 fases; cada item dispara um `agent()` que delega ao agent canônico do kit via `agentType` (`phase-researcher` para research, `planner` para plano).
- **Synthesize**: agent final recebe JSON dos 6 planos e produz `.planning/PLAN-REDE-SOCIAL.md` unificado, com dependências cross-fase, ordem sugerida e riscos.
- Schemas JSON Schema forçam saída estruturada (`required: [...]`).
- Sem `Date.now()`/`Math.random()` (resume cache-safe); timestamps via `args`.

## Alternativas consideradas
- **Planejamento serial monolítico** — simples, mas perde paralelismo e contexto cresce com cada fase.
- **Um planner gigante para todas as fases** — contexto estoura e perde profundidade por fase.
- **Adversarial-Verify** — útil para qualidade crítica, mas planejamento se beneficia mais de paralelismo que de refutação.

## Consequências
- ✅ 6 fases pesquisadas/planejadas em paralelo — wall-clock cai ~6×.
- ✅ Cada subagente tem contexto focado (1 fase) → planos mais densos.
- ✅ Síntese expõe dependências cross-fase (ex.: Fase 3 depende do upload da Fase 2).
- ✅ Reuso de agents do kit (`phase-researcher`, `planner`) — sem reinventar prompts.
- ⚠️ Synthesizer cego: pré-resumir cada item antes de passar (anti-pitfall da skill) — cada agente retorna só campos essenciais.
- ⚠️ Concorrência cap ~10 simultâneos — 6 fases está dentro do limite.

## Relacionado
- Skill: `dynamic-workflow-authoring` (kit-mcp)
- Workflow: `.claude/workflows/planejar-rede-social.workflow.js`
- Roadmap: [[visao-geral]] · [[_INDICE]]
- Agents do kit: `phase-researcher` · `planner` · `research-synthesizer`
