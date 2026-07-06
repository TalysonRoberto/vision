---
tipo: contexto
area: projeto
status: ativo
tokens: baixo
fonte: []
atualizado: 2026-06-21
tags: [glossario, dominio, rede-social]
---

> [!tldr] TL;DR
> Dicionário dos termos do domínio da Rede Social MVP. Evita re-explicar conceitos a cada sessão.

# Glossário

| Termo | Significado | Nota relacionada |
|---|---|---|
| Post / Publicação | Conteúdo criado por um usuário: texto + opcional mídia (imagem ou vídeo) | [[publicacao]] · [[tabela-posts]] |
| Like / Curtida | Reação positiva 1:1 usuário↔post (não-unicidade entre usuários, única por usuário por post) | [[publicacao]] · [[tabela-likes]] |
| Comment / Comentário | Texto anexado a um post; pode ser resposta a outro comentário (`parent_comment_id`) | [[publicacao]] · [[tabela-comments]] |
| Comentário aninhado / Reply | Comentário que responde a outro comentário (1 nível de profundidade no MVP) | [[publicacao]] |
| Feed | Página principal pós-login; lista cronológica de posts de todos os usuários | [[feed]] |
| ProfileView / Visualização de perfil | Registro de quem visitou um perfil; visível **só ao dono** | [[perfil]] · [[tabela-profile-views]] |
| Capa | Imagem de fundo do perfil (cover_url) | [[perfil]] · [[tabela-users]] |
| Avatar | Foto de perfil do usuário (avatar_url) | [[perfil]] · [[tabela-users]] |
| media_type | Enum `image \| video` que classifica o anexo de um post | [[tabela-posts]] |
| Abas do perfil | Filtros de publicações: **Todas / Fotos / Vídeos** | [[perfil]] |
| Sidebar esquerda | Card no feed com info básica do usuário logado + atalho ao perfil | [[feed]] |

> Sempre que aparecer um termo novo de domínio numa nota, registre-o aqui e linke.
