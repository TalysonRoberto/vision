# Plano Rede Social (MVP)

> Gerado por workflow **Fan-out-and-synthesize** em 2026-06-21.
> Supabase project_id: `svdxrekqtbtzifkreqio`.
> 6 subagentes planejaram as 6 fases do roadmap em paralelo; um sintetizador combinou os resultados.
> Regra do projeto: **TUDO em português** (progresso, tarefas, commits).
> Cofre Obsidian: ponto de entrada `00 - Contexto/_INDICE.md` · ADR do workflow `[[ADR-007-fanout-workflow-planejamento]]`.

**Status:** 🟢 GREEN — 6/6 fases com plano completo (objetivos, tarefas atômicas, critérios de conclusão, riscos, mitigações).

---

## 1. Resumo executivo

A Rede Social MVP entrega três ações centrais — **publicar, curtir e comentar** — com perfis editáveis (avatar/capa/bio), feed cronológico, abas de publicações (Todas/Fotos/Vídeos) e rastreio de visualizações de perfil (privado ao dono). A stack é Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui no front/fullstack, Prisma + PostgreSQL (Supabase) no banco, NextAuth.js (Credentials + opcional Google) na autenticação e Cloudinary no upload de mídia. Deploy na Vercel.

**Abordagem de execução:** 6 fases com dependência topológica clara. A Fase 1 (Setup) é a base — sem ela, nada avança. As Fases 2 e 3 podem rodar em paralelo após a 1 (compartilham o helper `lib/upload.ts` da Fase 2). A Fase 5 (visualizações) é leve e pode ser encaixada logo após a 2. A Fase 4 (interações) depende da 3. A Fase 6 (UI/UX) fecha o MVP, dependendo de todas as telas prontas.

**Ordem sugerida:** 1 → 2 → 3 → 5 → 4 → 6 (ver seção 2).

**Estimativa agregada:** ~M+M+M+P+M+P-M ≈ 10-14 dias úteis para um dev, com paralelismo potencial entre Fases 2 e 3 após a 1.

---

## 2. Ordem sugerida de execução

| Ordem | Fase | Título | Dependências | Estimativa |
|---|---|---|---|---|
| 1º | **1** | Setup do projeto (Next.js, Prisma, banco, auth) | — | M (2-3 dias) |
| 2º | **2** | CRUD de perfil (foto, capa, bio) | 1 | M |
| 3º | **3** | Feed + criação de publicações | 1, 2 | M |
| 4º | **5** | Sistema de visualizações de perfil | 2 | P |
| 5º | **4** | Curtidas e comentários aninhados | 3 | M |
| 6º | **6** | Ajustes finais de UI/UX e responsividade | 2, 3, 4, 5 | P-M |

> **Paralelismo possível:** após a Fase 1, as Fases 2 e 3 podem avançar em paralelo (mesmo dev alternando, ou 2 devs) — a Fase 3 reusa `lib/upload.ts` + `app/api/upload/route.ts` criados na Fase 2, então a task "Criar helper lib/upload.ts" da Fase 2 deve ser concluída antes da task "Componente `<NewPost/>`" da Fase 3. A Fase 5 (leve, P) encaixa bem entre a 3 e a 4.

---

## 3. Dependências cross-fase

| De Fase | Para Fase | Motivo |
|---|---|---|
| 2 → | 1 | Página `/perfil/[username]` precisa do `User` modelado, NextAuth e `lib/prisma.ts` da Fase 1 |
| 3 → | 1 | Feed precisa de auth (sessão), middleware e Prisma singleton da Fase 1 |
| 3 → | 2 | Fase 3 reusa `lib/upload.ts` + `app/api/upload/route.ts` (Cloudinary) criados na Fase 2 para o `<NewPost/>` |
| 4 → | 3 | LikeButton e CommentSection integram no `PostCard` e nos endpoints `/api/posts/*` criados na Fase 3 |
| 5 → | 2 | Visualizações registram-se e exibem-se na página `/perfil/[username]` criada na Fase 2 |
| 6 → | 2, 3, 4, 5 | UI/UX audita todas as telas — precisa que feed, perfil, interações e visualizações existam |

> **Nota sobre a saída do subagente da Fase 1:** o subagente reportou `dependencias: [2,3,4,5,6]` — invertido. A Fase 1 (Setup) **não depende de nenhuma outra**; é a base. As Fases 2-6 dependem dela. Corrigido na tabela acima.

---

## 4. Planos por fase

### Fase 1 — Setup do projeto (Next.js, Prisma, banco, autenticação)
**Notas do cofre:** [[auth]] · [[tabela-users]] · [[ADR-002-stack-nextjs-typescript]] · [[ADR-003-supabase-postgres]] · [[ADR-004-prisma-orm]] · [[ADR-005-nextauth]]
**Estimativa:** M (2-3 dias) · **Dependências:** —

**Objetivos**
- Bootstrapar Next.js (App Router) + TypeScript + Tailwind + shadcn/ui com pnpm
- Conectar Prisma ao PostgreSQL Supabase (pooler correto + client singleton anti-exaustão)
- Modelar tabela `users` (uniqueness em username/email, password_hash nullable p/ OAuth futuro) + primeira migration
- Implementar NextAuth.js v5 com Credentials Provider (JWT, bcrypt, SessionProvider) — cadastro + login
- Proteger rotas autenticadas via middleware e deixar `.env.example` + scripts prontos

**Tarefas**
1. **Inicializar Next.js + TS + Tailwind** — `create-next-app@latest` (App Router, TS, Tailwind, ESLint, import alias `@/*`). Critério: `pnpm dev` sobe em localhost:3000; TS estrito compila; Tailwind renderiza.
2. **Configurar shadcn/ui** — `pnpm dlx shadcn@latest init` + componentes base (button, input, label, card, form, sonner). Critério: componente renderiza; `cn()` funciona; CSS vars declaradas.
3. **Configurar Prisma + datasource Supabase** — `DATABASE_URL` (pooler Supavisor porta 6543 p/ runtime) + `DIRECT_URL` (porta 5432 p/ migrations); `?pg_bouncer=true&connection_limit=1`. Critério: `prisma validate` passa; `db pull` conecta ao Supabase.
4. **Criar `lib/prisma.ts` singleton (globalThis cache)** — uma instância por processo (evita exaustão Serverless). Critério: import em 2 Server Components não cria 2 instâncias.
5. **Modelar `User` no schema.prisma + primeira migration** — id, name, username @unique (slug-friendly), email @unique, password_hash? (nullable p/ OAuth), avatar_url?, cover_url?, bio?, created_at @db.Timestamptz; relações reversas placeholder. `pnpm prisma:migrate dev --name cria_tabela_users`. Critério: tabela visível no Supabase Studio com UNIQUE(username) e UNIQUE(email).
6. **Configurar NextAuth (auth.ts + Credentials + JWT + bcrypt)** — `next-auth@beta`, `@auth/prisma-adapter`, `bcryptjs`; callback `authorize` manual com `bcrypt.compare`; strategy JWT; estender Session com username/id/image; route handler `app/api/auth/[...nextauth]/route.ts`. Critério: `/api/auth/providers` retorna credentials; `auth()` retorna null deslogado.
7. **Envolver App com SessionProvider** — `components/providers.tsx` ('use client') com `<SessionProvider>` no `app/layout.tsx`. Critério: `useSession()` retorna 'unauthenticated' sem erro de contexto.
8. **Tela de cadastro + POST `/api/auth/signup`** — form (react-hook-form + zod: name, username regex slug-friendly, email, password min 8); uniqueness check (409); `bcrypt.hash` (salt 10-12); redirect ao login. Critério: duplicata retorna 409 pt-BR; senha persiste hasheada.
9. **Tela de login (Credentials)** — `signIn('credentials', {email, password, redirect:false})`; tratar `CredentialsSignin` com toast pt-BR; redirect `/feed`. Critério: login válido cria cookie de sessão e redireciona; inválido não vaza qual campo falhou.
10. **Middleware de proteção de rotas** — `middleware.ts` com `auth` do Auth.js v5; matcher `/feed/:path*`, `/perfil/:path*`; redirect não-autenticados a `/login?callbackUrl=`. Critério: `/feed` deslogado redireciona; logado acessa.
11. **Finalizar `.env.example` + scripts + gitignore** — vars: DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, AUTH_SECRET, AUTH_GOOGLE_* (comentados), CLOUDINARY_* (placeholder). Scripts: dev, build, start, lint, prisma:migrate, prisma:generate, prisma:studio. Critério: `pnpm build` passa; clone + install + migrate dev roda.

**Riscos**
- Exaustão de conexões Postgres em Serverless → **singleton globalThis + pooler 6543 + connection_limit=1 + pg_bouncer=true**
- URL de migração (5432) confundida com runtime (6543) → **duas env vars distintas documentadas no `.env.example`**
- NextAuth Credentials não hasheia senha → **bcrypt.hash no signup + bcrypt.compare manual no authorize**
- Username não slug-friendly quebra `/perfil/[username]` → **regex zod `^[a-z0-9_]+$` + UNIQUE + normalizar lowercase**
- `'use client'` esquecido quebra SessionProvider → **isolar em `components/providers.tsx` marcado**
- Migrations no pooler (pgbouncer não suporta prepared statements) → **DIRECT_URL para `prisma migrate`**
- Auth.js v5 beta com breaking changes vs docs v4 → **seguir authjs.dev; exportar handlers/auth/signIn/signOut**
- NEXTAUTH_SECRET ausente em dev → **gerar via `openssl rand -base64 32`; throw no boot se ausente**

**Arquivos afetados:** package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, components.json, prisma/schema.prisma, prisma/migrations/, lib/prisma.ts, lib/auth.ts, lib/utils.ts, components/providers.tsx, components/ui/*, components/auth/*, app/layout.tsx, app/page.tsx, app/(auth)/{login,cadastro}/page.tsx, app/api/auth/[...nextauth]/route.ts, app/api/auth/signup/route.ts, middleware.ts, .env.example, .gitignore, globals.css

---

### Fase 2 — CRUD de perfil (foto, capa, bio)
**Notas do cofre:** [[perfil]] · [[upload-midia]] · [[tabela-users]] · [[ADR-006-cloudinary-upload]]
**Estimativa:** M · **Dependências:** 1

**Objetivos**
- Renderizar rota dinâmica `/perfil/[username]` buscando User por username via Prisma
- Distinguir modo dono (edita avatar/capa/bio) de modo visitante (só visualiza)
- Editar avatar, capa e bio via Server Action `PATCH /api/perfil` com autorização de dono
- Integrar upload Cloudinary via `lib/upload.ts` (signed preset, env vars `CLOUDINARY_*`)
- Construir `components/profile/` — ProfileHeader, EditProfileDialog, ProfileTabs
- Implementar abas Todas/Fotos/Vídeos via `?tab=` filtrando posts por `media_type`
- Reservar o lugar do painel "Quem viu meu perfil" (Fase 5) sem implementar

**Tarefas**
1. **Criar helper `lib/upload.ts` (Cloudinary)** — `gerarSignatureUpload()` retorna {signature, timestamp, cloudName, apiKey, preset}; `validarMime(file)` rejeita não imagem/vídeo. Critério: env vars documentadas; função assina e valida.
2. **Criar `POST /api/upload/route.ts`** — multipart (pequenos) OU signature (signed preset p/ vídeos grandes); 200 {mediaUrl, mediaType}; 401/413/415. Critério: retorna URL+tipo ou signature; rejeita MIME inválido.
3. **Criar `PATCH /api/perfil/route.ts` (Server Action)** — atualiza {name?, bio?, avatar_url?, cover_url?} do usuário da sessão; autorização session.user.username === User.username; 403 se tentar editar outro. Critério: edita só dono; rejeita username/email.
4. **Criar `page.tsx /perfil/[username]`** — busca User por username (404 se inexistente); modo dono vs visitante; lê `?tab=`; placeholder do painel ProfileView. Critério: 404 funcional; dono vê editar + placeholder; visitante não vê ambos.
5. **Criar `ProfileHeader`** — capa, avatar sobreposto, name, @username, bio; botão "Editar perfil" só no modo dono; fallback default. Critério: renderiza fallback; botão só para isOwner.
6. **Criar `EditProfileDialog`** — form (name, bio textarea, avatar input file, capa input file); upload via `/api/upload` com preview; submit PATCH `/api/perfil`; valida bio ≤ 160, name obrigatório. Critério: dialog abre; troca avatar/capa com preview; edita name/bio; trata loading/erro/sucesso.
7. **Criar `ProfileTabs`** — 3 abas (Todas/Fotos/Vídeos) via `?tab=todas|fotos|videos`; filtra por media_type; empty state. Critério: abas mudam URL; filtra; empty state funciona.
8. **Polimento, validações e estados de borda** — skeletons, erro, 404, feedback upload, a11y (labels, alt, focus trap no dialog), responsividade mobile-first, tsc --noEmit. Critério: trata 404/loading/erro; dialog acessível; alt em avatar/capa; mobile-first; TS estrito passa.

**Riscos**
- Limite 4.5MB Vercel quebra upload de capa/avatar grandes → **signed preset upload direto client→Cloudinary**
- Race/autorização permitir editar perfil de terceiro → **Server Action valida session.user.id === user.id; nunca confiar no body para o alvo**
- MIME spoofing → **validar MIME server-side mesmo com accept no client**
- Username case sensitivity → **lowercase único no cadastro; buscar com insensitive/normalize**
- Acoplamento prematuro com ProfileView (Fase 5) → **só placeholder condicional; não criar tabela nem Server Action**
- Falta de env vars CLOUDINARY_* em dev → **documentar + throw claro ao chamar gerarSignatureUpload()**

**Arquivos afetados:** app/perfil/[username]/page.tsx, components/profile/{ProfileHeader,EditProfileDialog,ProfileTabs}.tsx, lib/upload.ts, app/api/upload/route.ts, app/api/perfil/route.ts, .env.example

---

### Fase 3 — Feed + criação de publicações (texto, imagem, vídeo)
**Notas do cofre:** [[feed]] · [[publicacao]] · [[upload-midia]] · [[tabela-posts]]
**Estimativa:** M · **Dependências:** 1, 2

**Objetivos**
- Usuário logado cria publicações com texto, imagem ou vídeo (ou combinação texto+mídia)
- Feed cronológico (desc) com todas as publicações, autor e contadores via `_count`
- Layout com sidebar esquerda (info do usuário logado + atalho ao perfil)
- Paginação offset simples (`?page=N`)

**Tarefas**
1. **Modelo `Post` no schema.prisma** — id, user_id FK, content_text, media_url?, media_type? (enum image|video), created_at; indexes `@@index([created_at])` e `@@index([user_id, created_at])`; CHECK `(media_url IS NULL) = (media_type IS NULL)` adicionado manualmente no SQL via `migrate dev --create-only`. Critério: migration aplicada com PK, FK, 2 indexes e CHECK ativo.
2. **Server Action `criarPost`** — valida sessão; rejeita post vazio; limite content_text (ex. 2000); `prisma.post.create` com user_id da sessão; `revalidatePath('/feed')`. Critério: cria post (texto/mídia/ambos); não logado rejeitado; vazio/acima do limite rejeitado.
3. **Componente `<NewPost/>`** — textarea + input file `accept="image/*,video/*"`; POST multipart `/api/upload` → {mediaUrl, mediaType}; preview inline; estados idle/uploading/submitting/sucesso/erro; invoca `criarPost`; limpa após sucesso. Critério: cria os 4 tipos de post; preview; erro pt-BR; reset.
4. **Componente `<PostCard/>`** — avatar + nome (link `/perfil/[username]`), content_text (preserva quebras), mídia (`<img>` ou `<video controls>`), data relativa, contadores via `_count.likes`/`_count.comments`; **sem** botões funcionais (Fase 4). Critério: renderiza os 4 tipos; autor clicável; contadores exibidos.
5. **`app/feed/layout.tsx` com sidebar esquerda** — sidebar fixa desktop (topbar no mobile); busca usuário logado via `getServerSession` + Prisma; avatar, nome, username, link `/perfil/[username]`; `redirect('/login')` sem sessão. Critério: sidebar mostra info; link ao perfil; sem sessão redireciona.
6. **`app/feed/page.tsx` com lista cronológica + paginação** — `searchParams.page` (default 1); `prisma.post.findMany({ orderBy: { createdAt: 'desc' }, skip, take, include: { user, _count: { likes, comments } } })`; `prisma.post.count()` para totalPages; `<NewPost/>` no topo + `<PostCard/>` + paginação `?page=N`; clamp limites. Critério: ordem desc; paginação navega e clampa; PostCard com autor e contadores; revalidate reflete novo post.
7. **Rota `GET /api/posts` (espelho paginado)** — valida sessão (401); mesma query paginada; retorna `{ posts, currentPage, totalPages }`. Critério: 200 com JSON consistente; 401 sem sessão; clamp de range.
8. **Validação server-side de upload e conteúdo** — MIME check no `/api/upload` (415); limite tamanho (signed preset p/ vídeos); `criarPost` rejeita vazio e texto > limite; `media_type` derivado do `resource_type` Cloudinary; erros pt-BR. Critério: MIME inválido rejeitado; vazio rejeitado; vídeos grandes via signed preset; erros pt-BR.

**Riscos**
- Prisma não suporta CHECK declarativo → **`migrate dev --create-only` + editar SQL + aplicar**
- Limite 4.5MB Vercel p/ vídeo multipart → **signed preset upload direto ao Cloudinary**
- Server Action sem sessão cria post fantasma → **getServerSession no início; user_id da sessão, nunca do formData**
- Paginação offset lenta em volume → **aceitável p/ MVP; index em created_at DESC; documentar como dívida p/ cursor-based**
- Carregar arrays de likes/comments em vez de `_count` → **`include: { _count: { select: { likes: true, comments: true } } }`**

**Arquivos afetados:** prisma/schema.prisma, prisma/migrations/, app/feed/page.tsx, app/feed/layout.tsx, app/feed/actions.ts, components/feed/NewPost.tsx, components/post/PostCard.tsx, app/api/posts/route.ts, app/api/upload/route.ts, lib/upload.ts, lib/auth.ts

---

### Fase 4 — Curtidas e comentários (com respostas aninhadas)
**Notas do cofre:** [[publicacao]] · [[tabela-likes]] · [[tabela-comments]]
**Estimativa:** M · **Dependências:** 3

**Objetivos**
- Curtidas 1:1 usuário↔post com toggle anti-race (`UNIQUE(user_id, post_id)` + upsert/deleteMany)
- Comentários top-level e respostas aninhadas de 1 nível
- Endpoints de toggle like, criar comentário/reply e listar comentários com replies
- Renderizar interações no PostCard com optimistic UI para like e thread inline

**Tarefas**
1. **Modelo `Like` no schema Prisma** — id, post_id FK, user_id FK, created_at; `@@unique([post_id, user_id])` (crítico anti-race); `@@index([post_id])`; relações inversas. Critério: modelo com unique + index; `prisma validate` passa.
2. **Modelo `Comment` no schema Prisma** — id, post_id FK, user_id FK, parent_comment_id? (self-ref), content, created_at; auto-relação `CommentReplies`; `@@index([post_id, created_at])`; `@@index([parent_comment_id])`. Critério: auto-relação nomeada + 2 indexes; validate passa.
3. **Gerar e aplicar migration** — `pnpm prisma migrate dev --name add_likes_comments`; aplicar no Supabase; `prisma generate`. Critério: tabelas visíveis no Studio com UNIQUE e indexes; client regenerado.
4. **Endpoint toggle like (`POST /api/posts/[id]/like`)** — autenticado (401); valida post (404); findUnique em `{ post_id_user_id }`; existe → delete, não → create; count via `prisma.like.count`; tratar P2002 como idempotente; retorna `{ liked, count }`. Critério: toggle funciona; UNIQUE impede duplicata; 404/401 corretos.
5. **Endpoint criar comentário/reply (`POST /api/posts/[id]/comments`)** — autenticado; body `{ content, parent_comment_id? }`; valida content (400 se vazio); valida post (404); se parent: valida `parent.postId === postId` (400 se divergente) + valida profundidade (`parent.parent_comment_id IS NOT NULL` → 400); cria Comment; retorna 201 com user. Critério: cria top-level e reply; rejeita reply cross-post e reply a reply; valida content.
6. **Endpoint listar comentários (`GET /api/posts/[id]/comments`)** — top-level (`parent_comment_id: null`) ASC por created_at; `include: { user, replies: { include: { user }, orderBy: { created_at: 'asc' } } }`; 404 se post inexistente. Critério: retorna thread com autores de ambos os níveis; ordenação ASC; 404 correto.
7. **Componente `LikeButton` (optimistic UI)** — props { postId, initialLiked, initialCount }; optimistic toggle + count ±1; POST `/api/posts/[id]/like`; sincroniza com resposta real; reverte em erro; desabilita durante request; `aria-pressed`/`aria-label`. Critério: toggle instantâneo; sincroniza; reverte em erro; acessível.
8. **Componente `CommentForm`** — props { postId, parentCommentId?, onSubmitted, onCancel }; textarea controlada; validação client; POST comments; limpa após sucesso; modo reply com Cancelar; Enter envia, Shift+Enter nova linha. Critério: envia comentário/reply; valida; limpa; cancela reply; feedback loading/erro.
9. **Componente `RepliesList`** — renderiza replies (avatar, username, content, createdAt relativo pt-BR); **sem** botão responder (limite 1 nível MVP); empty state. Critério: renderiza replies; sem botão responder; vazio não quebra.
10. **Componente `CommentSection` (orquestrador)** — GET comments no mount; CommentForm top-level + lista top-level com botão Responder; expande CommentForm inline ao responder; RepliesList sob cada top-level; estados loading/error/empty. Critério: carrega thread; criar comentário atualiza lista; criar reply atualiza replies do parent e fecha form; estados tratados.
11. **Integrar LikeButton e CommentSection no PostCard** — LikeButton com initialLiked/initialCount (queries de feed/perfil incluem `_count.likes` e `likes: { where: { user_id: currentUserId } }`); área expandível Comentários monta CommentSection. Critério: PostCard exibe LikeButton com estado inicial correto; comentários expandíveis; queries atualizadas.

**Riscos**
- Race no toggle de like (clicks duplicados) → **UNIQUE(user_id, post_id) + upsert/deleteMany + tratar P2002 + bloquear botão durante request**
- Reply cross-post (parent de outro post) → **validar parent.postId === postId; 400 se divergente**
- Profundidade infinita de replies → **validar parent.parent_comment_id IS NOT NULL → 400; RepliesList sem botão responder**
- Optimistic UI inconsistente → **sincronizar com resposta real; reverter em erro; desabilitar durante request**
- Query N+1 ao carregar replies → **include aninhado do Prisma em única query**
- Queries de feed/perfil sem count/liked-by-current-user → **atualizar queries da Fase 3 para incluir _count.likes e verificação de like do usuário atual**

**Arquivos afetados:** prisma/schema.prisma, prisma/migrations/, app/api/posts/[id]/like/route.ts, app/api/posts/[id]/comments/route.ts, components/post/{LikeButton,PostCard}.tsx, components/comment/{CommentSection,CommentForm,RepliesList}.tsx, app/feed/page.tsx, app/perfil/[username]/page.tsx

---

### Fase 5 — Sistema de visualizações de perfil
**Notas do cofre:** [[perfil]] · [[tabela-profile-views]]
**Estimativa:** P · **Dependências:** 2

**Objetivos**
- Registrar quem (autenticado) visitou cada perfil, sem contar self-view nem anônimo
- Dono vê lista "Quem viu meu perfil" ordenada por data desc
- Privacidade via gating server-side (só dono acessa suas visualizações)
- Documentar trade-off de dedup para futuro (`UNIQUE(profile_id, viewer_id)`)

**Tarefas**
1. **Modelar `ProfileView` no schema Prisma** — id, profile_id FK, viewer_id FK, created_at; `@@index([profile_id, created_at(desc)])`; **sem** `@@unique` no MVP; 2 relações reversas em User (profileViews, viewedProfiles); migrate + generate. Critério: modelo com 4 colunas, 2 FKs, index composto, 2 relações; migration aplicada.
2. **Criar Server Action `registrarProfileView`** — `lib/profile-views.ts` ('use server'); valida sessão (rejeita anônimo); valida `session.user.id !== profileId` (rejeita self-view); `prisma.profileView.create`; retorno void; trata erro silenciosamente. Critério: valida anônimo e self-view; insere; não quebra render.
3. **Disparar registro na página de perfil** — em `app/perfil/[username]/page.tsx`, se visitante autenticado != dono, chamar `registrarProfileView(user.id)`. Critério: visitante autenticado gera 1 row por acesso; dono/anônimo não geram.
4. **Query de visualizações com gating (modo dono)** — quando `session.user.id === user.id`, `prisma.profileView.findMany({ where: { profile_id: session.user.id }, include: { viewer: { select: { id, name, username, avatar_url } } }, orderBy: { created_at: 'desc' } })`; passar a ProfileViewsList; gating server-side obrigatório. Critério: dados só carregados para o dono; visitante nunca recebe.
5. **Componente `ProfileViewsList`** — lista { viewer, created_at }; avatar, nome (link `/perfil/[username]`), data relativa pt-BR; empty state; shadcn Avatar/ScrollArea. Critério: renderiza viewers com avatar, nome linkável, data; empty state funciona.
6. **Integrar painel no perfil (modo dono)** — seção "Quem viu meu perfil" com ProfileViewsList; só aparece para o dono; posicionado abaixo das abas ou em coluna lateral. Critério: dono vê painel populado; visitante não vê; layout responsivo.
7. **Documentar trade-off de dedup no cofre** — atualizar [[tabela-profile-views]] confirmando MVP aceita duplicata + receita futura (UNIQUE + upsert atualizando created_at). Critério: nota reflete decisão e caminho futuro; status ativo.

**Riscos**
- Race/duplicata de visualização → **aceito no MVP (sem upsert); index cobre query; dedup futuro documentado**
- Vazamento de privacidade (visitante acessa lista de outro) → **gating server-side session.user.id === profile_id; query só no modo dono; sem endpoint público**
- Self-view/anônimo inflam contagem → **validação na Server Action: rejeitar sem sessão e session.user.id === profileId**
- Erro no insert quebra render do perfil → **Server Action trata erro e loga sem propagar**
- Custo de query crescer com volume → **index composto cobre lista; paginação/limite em fase futura se necessário**

**Arquivos afetados:** prisma/schema.prisma, lib/profile-views.ts, app/perfil/[username]/page.tsx, components/profile/ProfileViewsList.tsx, 02 - Banco de Dados/tabela-profile-views.md

---

### Fase 6 — Ajustes finais de UI/UX e responsividade
**Notas do cofre:** [[feed]] · [[perfil]] · [[publicacao]] · [[visao-geral]]
**Estimativa:** P-M · **Dependências:** 2, 3, 4, 5

**Objetivos**
- Garantir mobile-first em 375px/768px/1280px sem overflow horizontal em todas as telas
- Padronizar consistência via tokens shadcn/ui (radius, cores, spacing) sem valores hardcoded
- Aplicar ritmo espacial base-4 (4/8/16/24/32/48/64) com espaço em branco
- Estados vazios para todas as listas (posts, comments, visualizações, posts por aba)
- Loading skeletons via Suspense + loading.tsx sem layout shift
- Acessibilidade básica — foco visível, contraste WCAG AA 4.5:1, aria-labels em botões icon-only
- Avaliar dark mode opcional (ou registrar como dívida)

**Tarefas**
1. **Auditoria mobile-first do feed** — revisar em sm/md/lg; touch targets ≥44px; sem overflow. Critério: feed sem overflow em 375/768/1280; interativos ≥44px.
2. **Responsividade da sidebar (colapsa em mobile)** — converter em Sheet (shadcn) abaixo de lg; fixa em desktop. Critério: hamburger abre Sheet em <lg; fixa em ≥lg; link ao perfil acessível.
3. **Responsividade do formulário de nova publicação** — NewPost full width mobile; preview escalável; botão Publicar alcançável. Critério: full width; preview responsiva; botão visível.
4. **Auditoria mobile-first do perfil** — header (avatar/capa/bio), botões edição (modo dono), listagem; capa com aspect ratio consistente; bio com quebra adequada. Critério: sem overflow em 375; capa/avatar proporcionais; botões só no modo dono.
5. **Responsividade das abas do perfil** — scroll horizontal ou segmented control shadcn; `?tab=` compartilhável. Critério: abas com scroll horizontal sem overflow; URL mantém ?tab=.
6. **Responsividade do painel de visualizações** — lista avatar + nome + data; scroll vertical delimitado; ausente em modo visitante. Critério: renderiza em mobile; ausente para visitante; vazio usa EmptyState.
7. **Auditoria mobile-first das telas de auth** — forms centralizados; inputs full width ≥44px; validação acessível; tab order coerente. Critério: full width; inputs ≥44px; foco visível; tab order (email → senha → submit).
8. **Padronizar tokens shadcn/ui** — revisar globals.css e tailwind.config; sem cor/radius hardcoded fora de globals.css; todos consomem tokens semânticos. Critério: nenhum valor hardcoded; componentes usam bg-background, text-foreground, rounded-md.
9. **Aplicar ritmo espacial base-4** — padding/margin/gap em escala 4/8/16/24/32/48/64/96; sem valores arbitrários (7px, 13px). Critério: todos múltiplos de 4px; sem arbitrários; hierarquia de densidade consistente.
10. **Estados vazios** — EmptyState reutilizável (ícone + mensagem pt-BR + CTA opcional) para feed sem posts, perfil sem posts por aba, post sem comentários, painel vazio. Critério: toda lista vazia exibe EmptyState pt-BR; componente reutilizado em ≥4 contextos.
11. **Loading skeletons** — `app/feed/loading.tsx`, `app/perfil/[username]/loading.tsx`, PostCard/CommentSection skeletons; dimensões idênticas ao real (sem layout shift). Critério: navegação exibe skeleton sem shift; Suspense com fallback.
12. **Acessibilidade — foco visível e contraste WCAG AA** — `focus-visible:ring` em todos interativos; contraste ≥4.5:1 em light mode; ajustar sem quebrar identidade. Critério: foco visível via Tab; contraste ≥4.5:1; sem texto abaixo do limite.
13. **Acessibilidade — aria-labels em botões icon-only** — like ('Curtir'/'Descurtir'), comment ('Comentar'), reply ('Responder a X'), sidebar hamburger, editar perfil; `aria-pressed` no LikeButton. Critério: todo icon-only tem aria-label pt-BR; LikeButton reflete curtido via aria-pressed.
14. **Dark mode opcional** — se shadcn já tem estrutura (class strategy + vars), adicionar ThemeProvider + toggle; se custo alto (>5 componentes com cor hardcoded), registrar dívida em 05 - Dívidas Técnicas. Critério: dark mode funcional com toggle persistente OU dívida documentada com prioridade e esforço.

**Riscos**
- Dark mode revelar cores hardcoded → refactor grande → **escopo limitado a tokens shadcn; se >5 componentes com cor hardcoded, registrar dívida**
- Estados vazios divergirem visualmente → **construir EmptyState reutilizável primeiro e consumi-lo em todos os contextos**
- Skeletons causarem layout shift → **dimensões exatas (altura/largura) entre skeleton e real; aspect ratio fixo para mídia**
- Contraste WCAG AA conflitar com paleta → **ajustar apenas tokens semânticos em globals.css; validar com ferramenta de contraste**
- Sidebar colapsar quebrar atalho ao perfil (Sheet não fecha) → **onOpenChange ligado à navegação; closeOnClick do link; testar hamburger → perfil**

**Arquivos afetados:** app/**/*.tsx, components/**/*.tsx, app/globals.css, tailwind.config.ts, app/layout.tsx

---

## 5. Top riscos do projeto

Ordenados por impacto (alto → baixo):

| Fase | Risco | Impacto | Mitigação |
|---|---|---|---|
| 1 | Exaustão de conexões Postgres em Vercel Serverless | **alto** | Singleton globalThis em `lib/prisma.ts` + pooler Supavisor 6543 + `connection_limit=1` + `pg_bouncer=true` |
| 1 | NextAuth Credentials não hasheia senha (risco plain text) | **alto** | `bcrypt.hash` no signup + `bcrypt.compare` manual no authorize; characterization test verifica password_hash ≠ password |
| 5 | Vazamento de privacidade — visitante acessa visualizações de outro | **alto** | Gating server-side `session.user.id === profile_id`; query só no modo dono; sem endpoint público |
| 4 | Race no toggle de like (clicks duplicados criam 2 likes) | **médio** | `UNIQUE(user_id, post_id)` + upsert/deleteMany + tratar P2002 + bloquear botão durante request |
| 4 | Reply cross-post (parent_comment_id de outro post) | **médio** | Validar `parent.postId === postId` antes de criar; 400 se divergente |
| 3 | Limite 4.5MB Vercel quebra upload de vídeo multipart | **médio** | Signed preset upload direto client→Cloudinary; `/api/upload` só assina |
| 2 | Autorização permitir editar perfil de terceiro | **médio** | Server Action valida `session.user.id === user.id`; nunca confiar no body para o alvo |
| 1 | URL de migração (5432) confundida com runtime (6543) | **médio** | Duas env vars distintas (DATABASE_URL / DIRECT_URL) documentadas no `.env.example` |
| 6 | Dark mode revelar cores hardcoded → refactor grande | **médio** | Escopo limitado a tokens shadcn; se >5 componentes com cor hardcoded, registrar dívida |
| 3 | Paginação offset lenta em volume alto | **baixo** | Aceitável p/ MVP (volume baixo); index em created_at DESC; documentar dívida p/ cursor-based |
| 5 | Duplicata de visualização (mesmo viewer visita várias vezes) | **baixo** | Aceito no MVP; index cobre query; dedup futuro via UNIQUE documentado |

---

## 6. Próximas ações

As 5 primeiras tarefas acionáveis, em ordem:

1. **[Fase 1, Task 1] Inicializar Next.js + TS + Tailwind** — rodar `pnpm create next-app@latest` com App Router, TS, Tailwind, ESLint, import alias `@/*`. Validar `pnpm dev`.
2. **[Fase 1, Task 3] Configurar Prisma + datasource Supabase** — `pnpm prisma init`; configurar `DATABASE_URL` (pooler 6543) e `DIRECT_URL` (5432) com `?pg_bouncer=true&connection_limit=1`; validar `prisma validate` e `db pull` contra `svdxrekqtbtzifkreqio`.
3. **[Fase 1, Task 5] Modelar `User` + primeira migration** — criar modelo em `prisma/schema.prisma`; `pnpm prisma:migrate dev --name cria_tabela_users`; confirmar tabela no Supabase Studio.
4. **[Fase 1, Task 6] Configurar NextAuth** — instalar `next-auth@beta` + `@auth/prisma-adapter` + `bcryptjs`; criar `lib/auth.ts` com Credentials Provider + JWT + bcrypt; route handler `[...nextauth]`.
5. **[Fase 1, Task 8-9] Telas de cadastro + login** — `app/(auth)/cadastro` e `app/(auth)/login` com react-hook-form + zod; `POST /api/auth/signup` com bcrypt.hash.

**Comandos do kit recomendados para a execução:**
- `/planejar-fase <faseId>` — detalhar o plano de uma fase específica antes de executar (ex.: `/planejar-fase 1`)
- `/executar-fase` — executar todas as tarefas de uma fase com paralelização por ondas
- `/verificar-trabalho` — UAT conversacional após concluir uma fase
- `/depurar` — depuração sistemática se surgir bug durante a execução
- `/nota` — capturar aprendizados no cofre Obsidian durante o desenvolvimento

**Workflow reexecutável:** `.claude/workflows/planejar-rede-social.workflow.js` pode ser reinvocado via `workflow('planejar-rede-social', { supabaseProjectId: 'svdxrekqtbtzifkreqio' })` para regenerar este plano se o PRD evoluir.

---

## Apêndice — Saída estruturada do workflow

```json
{
  "outputPath": ".planning/PLAN-REDE-SOCIAL.md",
  "status": "GREEN",
  "fasesPlanned": 6,
  "ordemSugerida": [1, 2, 3, 5, 4, 6],
  "supabaseProjectId": "svdxrekqtbtzifkreqio",
  "dependenciasCrossFase": [
    { "deFase": 2, "paraFase": 1, "motivo": "perfil precisa de User modelado, NextAuth e lib/prisma.ts" },
    { "deFase": 3, "paraFase": 1, "motivo": "feed precisa de auth, middleware e Prisma singleton" },
    { "deFase": 3, "paraFase": 2, "motivo": "reusa lib/upload.ts + /api/upload (Cloudinary) no NewPost" },
    { "deFase": 4, "paraFase": 3, "motivo": "LikeButton/CommentSection integram no PostCard e /api/posts/*" },
    { "deFase": 5, "paraFase": 2, "motivo": "visualizações registram-se e exibem-se em /perfil/[username]" },
    { "deFase": 6, "paraFase": 2, "motivo": "UI/UX audita telas de perfil" },
    { "deFase": 6, "paraFase": 3, "motivo": "UI/UX audita feed" },
    { "deFase": 6, "paraFase": 4, "motivo": "UI/UX audita interações (like/comment)" },
    { "deFase": 6, "paraFase": 5, "motivo": "UI/UX audita painel de visualizações" }
  ],
  "riscosTop": [
    { "faseId": 1, "risco": "Exaustão de conexões Postgres em Serverless", "impacto": "alto" },
    { "faseId": 1, "risco": "NextAuth Credentials não hasheia senha (plain text)", "impacto": "alto" },
    { "faseId": 5, "risco": "Vazamento de privacidade — visitante acessa visualizações de outro", "impacto": "alto" },
    { "faseId": 4, "risco": "Race no toggle de like (clicks duplicados)", "impacto": "medio" },
    { "faseId": 4, "risco": "Reply cross-post (parent de outro post)", "impacto": "medio" },
    { "faseId": 3, "risco": "Limite 4.5MB Vercel quebra upload de vídeo", "impacto": "medio" }
  ]
}
```
