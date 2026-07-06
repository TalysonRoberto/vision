---
tipo: contexto
area: projeto
status: ativo
tokens: medio
fonte:
  - README.md
  - package.json
  - prisma/schema.prisma
atualizado: 2026-06-21
tags: [overview, stack, rede-social, mvp]
---

> [!tldr] TL;DR
> Rede social simples (MVP) com 3 ações centrais: **publicar, curtir e comentar**. Stack: Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui + Prisma + PostgreSQL (Supabase, project_id `svdxrekqtbtzifkreqio`) + NextAuth.js + Cloudinary. Mobile-first, deploy na Vercel. Regra de ouro: todo progresso/commits em **português**.

# Visão Geral do Projeto

## O que é
Rede social MVP focada em simplicidade — usuários cadastram-se, publicam texto/foto/vídeo, curtem e comentam (com respostas aninhadas). Cada perfil rastreia quem o visitou (visível só ao dono). Sem chat, stories, notificações realtime ou compartilhamento (fora de escopo).

## Stack
| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui |
| Backend | Next.js API Routes / Server Actions |
| Banco | PostgreSQL (Supabase — project_id `svdxrekqtbtzifkreqio`) |
| ORM | Prisma |
| Auth | NextAuth.js (Auth.js) |
| Upload mídia | Cloudinary (ou S3 + CDN) |
| Deploy | Vercel (app) + Supabase (banco) |
| Package manager | pnpm |

## Como rodar (dev)
```bash
pnpm install
pnpm prisma:migrate dev
pnpm dev
```

## Estrutura do código (alto nível)
- `app/(auth)/` → login + cadastro → [[auth]]
- `app/feed/` → página principal pós-login → [[feed]]
- `app/perfil/[username]/` → perfil próprio/terceiros → [[perfil]]
- `components/{post,comment,profile,feed}/` → componentes UI
- `lib/{prisma,auth,upload}.ts` → clients e helpers
- `prisma/schema.prisma` → modelo de dados → [[02 - Banco de Dados]]

## Roadmap (6 fases)
1. Setup (Next.js, Prisma, banco, auth) → [[auth]]
2. CRUD de perfil (foto, capa, bio) → [[perfil]]
3. Feed + publicações (texto, imagem, vídeo) → [[feed]] · [[publicacao]]
4. Curtidas + comentários aninhados → [[publicacao]]
5. Visualizações de perfil → [[perfil]]
6. Ajustes finais de UI/UX → ver [[03 - Decisões]]

## Decisões e dívidas que moldam o projeto
- Decisões: [[ADR-002-stack-nextjs-typescript]] · [[ADR-003-supabase-postgres]] · [[ADR-004-prisma-orm]] · [[ADR-005-nextauth]] · [[ADR-006-cloudinary-upload]] · [[ADR-007-fanout-workflow-planejamento]]
- Dívidas: ver painel em [[_INDICE]]

## Fora de escopo (MVP)
Mensagens diretas (chat), notificações em tempo real, stories, compartilhamento de publicações.
