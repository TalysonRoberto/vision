---
tipo: arquitetura
area: upload-midia
camada: fullstack
status: ativo
tokens: baixo
fonte:
  - lib/upload.ts
  - app/api/upload/route.ts
atualizado: 2026-06-21
tags: [upload, cloudinary, midia, imagem, video]
---

> [!tldr] TL;DR
> Upload de mídia (imagem/vídeo) via Cloudinary. Client faz request a `/api/upload` (Server Action/Route) que assina upload ou recebe o arquivo e repassa ao Cloudinary; devolve `media_url` + `media_type` para anexar ao `Post` ou `User` (avatar/capa).

# Upload de mídia (upload-midia)

## Responsabilidade
Receber arquivo de imagem ou vídeo do cliente, enviar ao Cloudinary, devolver URL pública + tipo. **Não** faz processamento/transformação avançada nem validação de conteúdo (MVP).

## Como funciona (essencial)
1. **Client** seleciona arquivo (input file, `accept="image/*,video/*"`).
2. **Endpoint** `/api/upload` (Route Handler) recebe multipart ou gera **signed upload preset** para upload direto do client ao Cloudinary.
3. **Cloudinary** devolve `{ secure_url, resource_type }`.
4. **Resposta** ao client: `{ mediaUrl, mediaType }` → repassado ao criar/editar post/perfil.

## Interface / contrato
- **POST** `/api/upload` (multipart) → `200 { mediaUrl, mediaType: 'image'|'video' }` · `413` (arquivo grande) · `415` (tipo inválido)
- Env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Dependências e relações
- Decisão: [[ADR-006-cloudinary-upload]]
- Usado por: [[feed]] (caixa de publicação) · [[perfil]] (avatar/capa) · [[publicacao]]
- Tabela: [[tabela-posts]] (`media_url`, `media_type`)

## Gotchas
- **Limite de tamanho**: Vercel limita body a 4.5MB no plan hobby — upload direto ao Cloudinary (signed preset) evita esse gargalo para vídeos.
- **`resource_type`**: Cloudinary distingue `image` vs `video` — mapear diretamente para `media_type` do Post.
- **Validação**: checar MIME no server mesmo com `accept` no client (client é bypassável).
- **Fallback S3**: se Cloudinary rejeitado, S3 + CloudFront é a alternativa — ver [[ADR-006-cloudinary-upload]].

## Fase do roadmap
**Fase 3** (caixa de publicação) e **Fase 2** (avatar/capa do perfil).
