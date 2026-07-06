---
tipo: aprendizado
area: frontend
status: ativo
tokens: baixo
fonte:
  - components/ui/button.tsx
  - components/ui/dialog.tsx
  - components/profile/edit-profile-dialog.tsx
  - app/perfil/[username]/not-found.tsx
atualizado: 2026-06-21
tags: [gotcha, shadcn, base-ui, react, composicao]
---

> [!tldr] TL;DR
> **O preset `base-nova` do shadcn usa `@base-ui/react` (não Radix). Composição de componentes usa `render={<Component />}` em vez de `asChild`.** Ex: `<DialogTrigger render={<Button />}>` em vez de `<DialogTrigger asChild><Button></DialogTrigger>`. Mesma regra para `<Button render={<Link />}>`.

# 2026-06-21 — shadcn base-nova: `render` prop em vez de `asChild`

## O que aconteceu
Typecheck falhou com TS2322 em `EditProfileDialog` (`<DialogTrigger asChild>`) e `not-found.tsx` (`<Button asChild>`): "Type '{ children: Element; asChild: true; }' is not assignable to type 'IntrinsicAttributes & ButtonProps'". O preset `base-nova` do shadcn (escolhido na Fase 1 via `-d` defaults) usa `@base-ui/react` em vez de Radix UI — a API de composição é diferente.

## Causa raiz
- **Radix UI** usa `asChild` prop (pattern "Slot") para compor componentes: `<DialogTrigger asChild><Button>...</Button></DialogTrigger>`.
- **Base UI** (substituto do Radix no preset base-nova) usa `render` prop: `<DialogTrigger render={<Button />}>...</DialogTrigger>`. O `render` aceita um elemento React que se torna o nodo renderizado, com props mescladas.
- O `Button` gerado pelo base-nova não declara `asChild` nos tipos → TS rejeita.

## Como resolver / evitar
- **Sempre que precisar compor** (Button como Link, Button como DialogTrigger, etc.), usar `render={<Component />}`:
  ```tsx
  // Button como Link
  <Button render={<Link href="/feed" />}>Voltar</Button>

  // DialogTrigger como Button
  <DialogTrigger render={<Button variant="outline" />}>Editar</DialogTrigger>
  ```
- **Não usar `asChild`** em nenhum componente do preset base-nova.
- Se migrar para preset Radix (estilo antigo), reverter para `asChild`.
- Referência: https://base-ui.com/react/docs/guides/render-prop

## Relacionado
- Origem: Fase 2 (EditProfileDialog + not-found) · [[perfil]]
