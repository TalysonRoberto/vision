---
tipo: aprendizado
area: infra
status: ativo
tokens: baixo
fonte:
  - .env.example
atualizado: 2026-06-21
tags: [gotcha, supabase, postgres, conexao, pgbouncer]
---

> [!tldr] TL;DR
# Conexão **direta** (`db.[ref].supabase.co:5432`) usa user `postgres`. Pooler Supavisor (`aws-0-[regiao].pooler.supabase.com:6543`) usa user `postgres.[ref]`. URL-encode caracteres especiais da senha (`@`→`%40`, `*`→`%2A`).

# 2026-06-21 — Supabase: conexão direta vs pooler e user correto

## O que aconteceu
Primeira migration falhou com `P1000: Authentication failed`. O `.env` usava user `postgres.svdxrekqtbtzifkreqio` na conexão direta `db.[ref].supabase.co:5432`. A senha `Vision@2026*0505` também não estava URL-encoded.

## Causa raiz
Dois erros combinados:
1. **User errado para a conexão direta**: o formato `postgres.[project-ref]` é específico do **pooler Supavisor**. A conexão direta (`db.[ref].supabase.co`) usa apenas `postgres`.
2. **Senha não URL-encoded**: `@` e `*` são caracteres reservados em URL e precisam ser escaped (`%40`, `%2A`).

## Como resolver / evitar
- **Dev local**: usar conexão direta para runtime E migrations (sem pgbouncer, sem região no hostname):
  `postgresql://postgres:SENHA_URL_ENCODED@db.[ref].supabase.co:5432/postgres`
- **Produção (Vercel Serverless)**: usar pooler Supavisor para `DATABASE_URL` (evita exaustão de conexões) + manter `DIRECT_URL` na direta para migrations:
  `postgresql://postgres.[ref]:SENHA@aws-0-[regiao].pooler.supabase.com:6543/postgres?pg_bouncer=true&connection_limit=1`
- **Sempre URL-encode a senha**. Script: `node -e "console.log(encodeURIComponent('sua@senha*'))"`.
- Confirmar a região do pooler no painel do Supabase (Project Settings → Database → Connection string → Transaction).

## Relacionado
- Origem: Fase 1 setup · [[ADR-003-supabase-postgres]] · [[ADR-004-prisma-orm]]
