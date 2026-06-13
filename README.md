# 🧠 Cofre de Contexto — Template para Projetos

Template de cofre [Obsidian](https://obsidian.md) cujo objetivo é **economizar tokens** quando você trabalha com o Claude Code (ou qualquer LLM) sobre um projeto de software.

A ideia central:

> Reler o código-fonte a cada sessão é **caro em tokens**. Em vez disso, mantemos aqui uma **camada de contexto comprimida** — resumos densos de arquitetura, banco, decisões, aprendizados e dívidas técnicas. O Claude lê o cofre (barato) e só vai ao código real quando a nota não basta. Cada vez que isso acontece, o conhecimento volta pro cofre — então o custo por sessão **cai com o tempo**.

Este é um **template reutilizável**: clone para cada projeto novo, limpe os exemplos e preencha com o contexto real.

---

## 🚀 Como usar

1. **Copie esta pasta** para o seu projeto novo (ou clone o repositório do cofre).
2. Abra no Obsidian: **Open folder as vault**.
3. Apague as notas marcadas **`EXEMPLO`**.
4. Preencha `00 - Contexto/visao-geral.md` e o `glossario.md`.
5. Ao trabalhar com o Claude Code, ele lê o [`CLAUDE.md`](./CLAUDE.md) e segue o protocolo de economia de token automaticamente.

> Detalhes do padrão e da filosofia: [`10 - Meta/padrao-do-cofre.md`](./10%20-%20Meta/padrao-do-cofre.md) e [`10 - Meta/como-usar-com-claude.md`](./10%20-%20Meta/como-usar-com-claude.md).

---

## 📂 Estrutura (enxuta, context-first)

```
00 - Contexto/         → Ponto de entrada: mapa de contexto, visão geral, glossário, painéis
01 - Arquitetura/      → Componentes, módulos, endpoints, fluxos (resumidos, com ponteiro pro código)
02 - Banco de Dados/   → Tabelas e schema
03 - Decisões/         → ADRs (por que as coisas são como são)
04 - Aprendizados/     → Gotchas, bugs instrutivos, descobertas não-óbvias
05 - Dívidas Técnicas/ → Débito conhecido e adiado
09 - Templates/        → Modelos de nota
10 - Meta/             → Sobre o próprio padrão do cofre
```

Cada nota tem **frontmatter padronizado** e um **TL;DR no topo**. Os painéis em `00 - Contexto/Painel.base` montam índices dinâmicos (notas a revisar, dívidas abertas, etc.) **sem nenhum plugin** — usam o recurso nativo **Bases** do Obsidian.

---

## 🧭 As 3 ideias que fazem o cofre economizar token

1. **Divulgação progressiva** — TL;DR → nota → `fonte:` (código). Para no degrau mais barato que resolve.
2. **Nota antes de código** — se a info está numa nota `ativo`, não releia o código.
3. **Economia composta** — leu código caro? Devolva o aprendizado como nota barata. A próxima sessão não paga de novo.

---

## ✅ / ❌ Regras de ouro

**Faça:** TL;DR denso, frontmatter completo, `fonte:` apontando pro código real, wiki-links entre notas, atualize a nota quando ela ficar desatualizada.

**Não faça:** copiar blocos grandes de código pra dentro da nota, criar nota sem frontmatter, deixar nota `desatualizado` sem consertar, criar pastas fora da estrutura `00–10`, commitar segredos.

---

*Template mantido como padrão de cofres de contexto. Veja [`CLAUDE.md`](./CLAUDE.md) para o protocolo completo.*
