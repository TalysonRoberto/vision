---
phase: 2
phase_name: CRUD de perfil
status: completed
completed_at: 2026-06-21
plans: 8
---

# Fase 2 — CRUD de perfil (foto, capa, bio) — SUMMARY

> [!tldr] TL;DR
> Fase 2 concluída. Página `/perfil/[username]` com modo dono/visitante, edição de avatar/capa/bio via Cloudinary, abas Todas/Fotos/Vídeos. Build/typecheck/lint passando. 1 aprendizado registrado (Base UI render vs asChild).

## Self-Check: PASSED

- [x] `pnpm typecheck` — sem erros
- [x] `pnpm lint` — 0 erros, 5 warnings (4 `<img>` intencionais para conteúdo dinâmico do Cloudinary, 1 crypto unused corrigido)
- [x] `pnpm build` — Compiled successfully em 12.6s

## Tarefas executadas (8/8)

| # | Tarefa | Entrega |
|---|---|---|
| 1 | `lib/upload.ts` (Cloudinary) | `gerarSignatureUpload()` + `uploadArquivo()` + `validarMime()` + `validarTamanho()` — Cloudinary v2 SDK |
| 2 | `POST /api/upload/route.ts` | Multipart (pequenos) + signature (videos grandes); auth, MIME validation, 413/415 |
| 3 | `PATCH /api/perfil/route.ts` | Auth + zod + self-only update (session.user.id); 401/400 |
| 4 | `app/perfil/[username]/page.tsx` | Server Component; busca User, 404 notFound(), modo dono vs visitante, abas com filtro media_type, placeholder ProfileView |
| 5 | `ProfileHeader` | Capa (ou gradient fallback), avatar sobreposto, nome, @username, bio; botão editar condicional |
| 6 | `EditProfileDialog` | Client component; form name/bio + upload avatar/capa com preview; PATCH /api/perfil; toasts pt-BR |
| 7 | `ProfileTabs` | Todas/Fotos/Vídeos via ?tab=; URL-driven (Link); contagens por aba |
| 8 | Polimento | `loading.tsx` (skeleton), `not-found.tsx` (404), `EmptyState` component, responsividade mobile-first |

## Componentes shadcn adicionados
dialog, avatar, textarea, skeleton, separator

## Nova dependência
`cloudinary@2.10.0` (SDK v2 — `import { v2 as cloudinary }`)

## Desvios do plano

- **Base UI `render` vs `asChild`**: preset base-nova usa `@base-ui/react` (não Radix); `DialogTrigger` e `Button` usam `render={<Component />}` em vez de `asChild`. Ver [[2026-06-21-shadcn-base-ui-render-vs-aschild]].
- **Cloudinary v2 SDK**: API sem namespace `v2` nos métodos (`cloudinary.uploader.upload_stream`, `cloudinary.utils.api_sign_request`); `import { v2 as cloudinary }` ainda funciona.
- **Next.js 16 async params**: `params` e `searchParams` são Promises — `await params` / `await searchParams`.
- **`<img>` em vez de `<Image>`**: para conteúdo dinâmico do Cloudinary (URLs externas com dimensões variáveis), `<img>` é mais simples no MVP; `next/image` exigiria configurar `remotePatterns` e width/height. Aceito como warning.

## Ainda precisa de credenciais Cloudinary

O upload de avatar/capa requer `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` no `.env`. Sem elas, o endpoint `/api/upload` retorna 500 com mensagem clara. A edição de name/bio funciona sem Cloudinary.

## Próxima fase

**Fase 3 — Feed + criação de publicações (texto, imagem, vídeo)** → `/executar-fase 3`

Depende de: auth (✅), `lib/upload.ts` + `/api/upload` (✅ Fase 2). Reusa o upload para a caixa de nova publicação.
