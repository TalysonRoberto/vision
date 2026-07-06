---
tipo: decisao
area: upload-midia
status: ativo
tokens: baixo
fonte: []
decisao: aceita
data: 2026-06-21
atualizado: 2026-06-21
tags: [adr, upload, cloudinary, midia]
---

> [!tldr] TL;DR
# Upload de mídia: Cloudinary. Suporta imagem e vídeo nativamente, transforms on-the-fly, CDN global. Upload direto do client via signed preset para contornar limite 4.5MB da Vercel.

# ADR-006 — Cloudinary para upload de mídia

## Contexto
MVP tem posts com imagem/vídeo e perfil com avatar/capa. Precisamos armazenar, servir via CDN e distinguir `media_type`. Vercel Serverless limita body a 4.5MB no plan hobby — vídeos maiores precisam bypass.

## Decisão
Adotar **Cloudinary**:
- Upload direto client→Cloudinary via **signed upload preset** (server gera signature, client faz POST direto).
- Server endpoint `/api/upload` gera signature ou recebe multipart para uploads pequenos.
- `resource_type` (`image`/`video`) mapeia direto para `media_type` do Post.
- Env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Alternativas consideradas
- **S3 + CloudFront** — máximo controle, mas configuração pesada para MVP.
- **UploadThing** — wrapper simpático, mas camada extra sobre S3.
- **Vercel Blob** — simples, mas suporte a vídeo limitado no tier free.

## Consequências
- ✅ Transforms on-the-fly (resize avatar/capa sem pipeline).
- ✅ CDN global — feed rápido.
- ✅ Upload direto bypassa limite Vercel para vídeos.
- ⚠️ Vendor lock-in moderado — mitigado abstraindo em `lib/upload.ts` (ver [[upload-midia]]).
- ⚠️ Free tier tem créditos/requests limitados — monitorar uso.

## Relacionado
- Nota: [[upload-midia]]
- Usado por: [[feed]] · [[perfil]]
- Tabela: [[tabela-posts]] (`media_url`, `media_type`)
