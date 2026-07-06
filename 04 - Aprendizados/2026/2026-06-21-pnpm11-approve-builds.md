---
tipo: aprendizado
area: infra
status: ativo
tokens: baixo
fonte:
  - pnpm-workspace.yaml
  - package.json
atualizado: 2026-06-21
tags: [gotcha, pnpm, build-scripts, setup]
---

> [!tldr] TL;DR
# No pnpm 11+, o campo `pnpm` em `package.json` foi **removido**. Use `pnpm-workspace.yaml` com `onlyBuiltDependencies:` + rode `pnpm approve-builds --all` para permitir scripts de build (Prisma, sharp, etc.). Sem isso, `pnpm install` sai com exit 1.

# 2026-06-21 — pnpm 11: approve-builds e fim do campo `pnpm` no package.json

## O que aconteceu
`pnpm install` e `prisma validate` (que chama `pnpm install` internamente) falhavam com `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: prisma, @prisma/engines, sharp, unrs-resolver` e exit code 1. Tentar declarar `pnpm.onlyBuiltDependencies` no `package.json` não funcionou — o pnpm 11.8 imprimiu warning: "The 'pnpm' field in package.json is no longer read by pnpm."

## Causa raiz
pnpm 11 descontinuou a leitura do campo `pnpm` no `package.json` (mudou para `pnpm-workspace.yaml`). Por segurança, pnpm não roda scripts `postinstall`/`preinstall` de dependências sem aprovação explícita — daí o `ERR_PNPM_IGNORED_BUILDS` que faz o install sair com código não-zero.

## Como resolver / evitar
1. **Declarar em `pnpm-workspace.yaml`** (não em `package.json`):
   ```yaml
   onlyBuiltDependencies:
     - sharp
     - unrs-resolver
     - prisma
     - "@prisma/engines"
     - "@prisma/client"
   ```
2. **Rode `pnpm approve-builds --all`** uma vez para aprovar e executar os scripts pendentes.
3. Após isso, `pnpm install` sai com exit 0 e o Prisma funciona.
4. Ao adicionar nova dep com script de build, adicione ao `onlyBuiltDependencies` e rode `approve-builds --all`.

## Relacionado
- Origem: Fase 1 setup · [[ADR-002-stack-nextjs-typescript]]
