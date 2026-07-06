export const meta = {
  name: 'planejar-rede-social',
  description:
    'Planeja a Rede Social (MVP) com pattern Fan-out-and-synthesize: 1 subagente por fase do roadmap roda em paralelo (phase-researcher/planner do kit) e um sintetizador combina tudo em .planning/PLAN-REDE-SOCIAL.md.',
  whenToUse:
    'No início do projeto, para gerar o plano executável consolidado a partir do PRD. Reuso dos agents canônicos phase-researcher e planner do kit-mcp via agentType.',
  phases: [
    { title: 'Discover', detail: 'carregar contexto do PRD a partir do cofre Obsidian' },
    { title: 'Fanout', detail: '1 agent por fase do roadmap × 6 fases em paralelo (pipeline)' },
    { title: 'Synthesize', detail: 'combinar os 6 planos em .planning/PLAN-REDE-SOCIAL.md' },
  ],
}

const PROJECT_ROOT = args?.projectRoot ?? '.'
const SUPABASE_PROJECT_ID = args?.supabaseProjectId ?? 'svdxrekqtbtzifkreqio'
const OUTPUT_PATH = args?.outputPath ?? '.planning/PLAN-REDE-SOCIAL.md'
const NOW_ISO = args?.nowIso ?? '2026-06-21'

const PRD_CONTEXT = args?.prdContext ?? `Rede Social MVP — 3 ações centrais: publicar, curtir, comentar.
Stack: Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui + Prisma + PostgreSQL (Supabase project_id ${SUPABASE_PROJECT_ID}) + NextAuth.js (Credentials + opcional Google) + Cloudinary.
Estrutura: app/(auth)/{login,cadastro}, app/feed, app/perfil/[username], components/{post,comment,profile,feed}, lib/{prisma,auth,upload}.ts, prisma/schema.prisma.
Modelo: User, Post, Like, Comment (auto-ref parent_comment_id), ProfileView.
Roadmap: 6 fases (setup, perfil, feed+publicacoes, curtidas+comentarios, visualizacoes, ui/ux).
Fora de escopo: chat, notif realtime, stories, compartilhamento.
Regra do projeto: TODO progresso, tarefas e commits em portugues.
Cofre Obsidian: 00-Contexto/_INDICE.md é ponto de entrada; notas de arquitetura em 01-Arquitetura/{auth,perfil,feed,publicacao,upload-midia}.md; tabelas em 02-Banco-de-Dados/tabela-*.md; ADRs em 03-Decisoes/ADR-00{2..7}-*.md.`

const FASES = [
  {
    id: 1,
    titulo: 'Setup do projeto (Next.js, Prisma, banco, autenticação)',
    notasVault: '[[auth]] · [[ADR-002-stack-nextjs-typescript]] · [[ADR-003-supabase-postgres]] · [[ADR-004-prisma-orm]] · [[ADR-005-nextauth]] · [[tabela-users]]',
    escopo: 'Inicializar Next.js (App Router) + TS + Tailwind + shadcn/ui; configurar Prisma com Supabase (project_id ' + SUPABASE_PROJECT_ID + '); implementar NextAuth (Credentials, bcrypt, JWT); telas de cadastro/login; SessionProvider; lib/prisma.ts singleton.',
  },
  {
    id: 2,
    titulo: 'CRUD de perfil (foto, capa, bio)',
    notasVault: '[[perfil]] · [[upload-midia]] · [[ADR-006-cloudinary-upload]] · [[tabela-users]]',
    escopo: 'Página /perfil/[username] com modo dono vs visitante; edição de avatar, capa e bio (Server Action PATCH /api/perfil); integração Cloudinary via lib/upload.ts; abas Todas/Fotos/Vídeos (filtros por media_type).',
  },
  {
    id: 3,
    titulo: 'Feed + criação de publicações (texto, imagem, vídeo)',
    notasVault: '[[feed]] · [[publicacao]] · [[upload-midia]] · [[tabela-posts]]',
    escopo: 'app/feed com sidebar esquerda (info usuário logado) + caixa de nova publicação (textarea + anexo imagem/vídeo) + lista cronológica de posts de todos os usuários; Server Action criarPost com revalidatePath; paginação offset.',
  },
  {
    id: 4,
    titulo: 'Curtidas e comentários (com respostas aninhadas)',
    notasVault: '[[publicacao]] · [[tabela-likes]] · [[tabela-comments]]',
    escopo: 'Toggle like (UNIQUE(user_id,post_id) + upsert); comentar (parent_comment_id null); responder comentário (1 nível); validação parent.postId === postId; CommentSection + RepliesList; optimistic UI no like.',
  },
  {
    id: 5,
    titulo: 'Sistema de visualizações de perfil',
    notasVault: '[[perfil]] · [[tabela-profile-views]]',
    escopo: 'Insert ProfileView quando visitante autenticado != dono; painel "quem viu meu perfil" gated por session.user.id === profile_id; lista ordenada por created_at desc; não registrar self-view nem anônimo.',
  },
  {
    id: 6,
    titulo: 'Ajustes finais de UI/UX e responsividade',
    notasVault: '[[feed]] · [[perfil]] · [[publicacao]] · [[03 - Decisões]]',
    escopo: 'Revisão mobile-first em todas as telas; consistência shadcn/ui; espaço em branco; estados vazios (sem posts, sem comments); loading skeletons; acessibilidade básica (foco, contraste, aria); responsividade sidebar/perfil.',
  },
]

const FASE_SCHEMA = {
  type: 'object',
  required: ['faseId', 'titulo', 'objetivos', 'tarefas', 'dependencias', 'riscos', 'estimativa', 'arquivosAfetados'],
  properties: {
    faseId: { type: 'number' },
    titulo: { type: 'string' },
    objetivos: { type: 'array', items: { type: 'string' } },
    tarefas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['titulo', 'descricao', 'arquivos', 'criterioConclusao'],
        properties: {
          titulo: { type: 'string' },
          descricao: { type: 'string' },
          arquivos: { type: 'array', items: { type: 'string' } },
          criterioConclusao: { type: 'string' },
        },
      },
    },
    dependencias: { type: 'array', items: { type: 'number' } },
    riscos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['risco', 'mitigacao'],
        properties: { risco: { type: 'string' }, mitigacao: { type: 'string' } },
      },
    },
    estimativa: { type: 'string' },
    arquivosAfetados: { type: 'array', items: { type: 'string' } },
    notasVaultReferenciadas: { type: 'array', items: { type: 'string' } },
  },
}

const SYNTHESIS_SCHEMA = {
  type: 'object',
  required: ['outputPath', 'status', 'fasesPlanned', 'ordemSugerida', 'dependenciasCrossFase', 'riscosTop', 'resumoExecutivo'],
  properties: {
    outputPath: { type: 'string' },
    status: { type: 'string', enum: ['GREEN', 'YELLOW', 'RED'] },
    fasesPlanned: { type: 'number' },
    ordemSugerida: { type: 'array', items: { type: 'number' } },
    dependenciasCrossFase: {
      type: 'array',
      items: {
        type: 'object',
        required: ['deFase', 'paraFase', 'motivo'],
        properties: {
          deFase: { type: 'number' },
          paraFase: { type: 'number' },
          motivo: { type: 'string' },
        },
      },
    },
    riscosTop: {
      type: 'array',
      items: {
        type: 'object',
        required: ['faseId', 'risco', 'impacto'],
        properties: {
          faseId: { type: 'number' },
          risco: { type: 'string' },
          impacto: { type: 'string', enum: ['alto', 'medio', 'baixo'] },
        },
      },
    },
    resumoExecutivo: { type: 'string' },
  },
}

phase('Discover')

const discovery = await agent(
  `Você é o Discover de um workflow Fan-out-and-synthesize. Contexto do projeto:

${PRD_CONTEXT}

Confirme que o cofre Obsidian está acessível listando (via Read tool) estes arquivos-chave:
- ${PROJECT_ROOT}/00 - Contexto/_INDICE.md
- ${PROJECT_ROOT}/00 - Contexto/visao-geral.md
- ${PROJECT_ROOT}/03 - Decisões/ADR-007-fanout-workflow-planejamento.md

Devolva um objeto confirmando o contexto. Sem narração.`,
  {
    label: 'discover-prd',
    phase: 'Discover',
    schema: {
      type: 'object',
      required: ['cofreAcessivel', 'fasesDetectadas', 'supabaseProjectId'],
      properties: {
        cofreAcessivel: { type: 'boolean' },
        fasesDetectadas: { type: 'number' },
        supabaseProjectId: { type: 'string' },
        notasEncontradas: { type: 'array', items: { type: 'string' } },
      },
    },
  }
)

if (!discovery || !discovery.cofreAcessivel) {
  log('Cofre Obsidian não acessível. Abortando workflow.')
  return { aborted: true, reason: 'cofre-inacessivel', outputPath: null }
}

log(`Cofre acessível. ${discovery.fasesDetectadas} fases detectadas. Iniciando fan-out.`)

phase('Fanout')

const planos = await pipeline(
  FASES,
  (fase) =>
    agent(
      `Você é um planejador de fase. Use o agent canônico "planner" do kit-mcp (agentType) para produzir um plano executável para a Fase ${fase.id} do projeto Rede Social MVP.

CONTEXTO DO PROJETO:
${PRD_CONTEXT}

FASE ${fase.id} — ${fase.titulo}
Escopo: ${fase.escopo}
Notas do cofre a consultar (leia via Read tool antes de planejar): ${fase.notasVault}

INSTRUÇÕES:
1. Leia as notas do cofre listadas acima (caminhos relativos a ${PROJECT_ROOT}) para extrair requisitos, interfaces e gotchas já documentados.
2. Decomponha a fase em tarefas atômicas (cada uma com arquivos a tocar e critério de conclusão).
3. Identifique dependências com outras fases (por faseId).
4. Liste riscos técnicos e mitigações.
5. Estimativa em pontos (P/M/G) ou dias.
6. Referencie as notas do vault usadas (wiki-links [[...]]).

Regra do projeto: TUDO em português. Sem narração. Apenas o objeto JSON conforme schema.`,
      {
        label: `fanout:fase-${fase.id}`,
        phase: 'Fanout',
        agentType: 'planner',
        schema: FASE_SCHEMA,
      }
    ),
  async (plano, fase) => {
    if (!plano) return null
    return {
      ...plano,
      faseId: fase.id,
      titulo: plano.titulo ?? fase.titulo,
    }
  }
)

const rows = planos.filter(Boolean)
log(`${rows.length}/${FASES.length} fases planejadas. Iniciando síntese.`)

phase('Synthesize')

const synthesis = await agent(
  `Você é o sintetizador. Combine os ${rows.length} planos de fase da Rede Social MVP em um documento único e executável, escrito em ${OUTPUT_PATH} via Write tool.

DADOS (planos por fase, já estruturados):

${JSON.stringify(rows, null, 2)}

ESTRUTURA OBRIGATÓRIA do markdown em ${OUTPUT_PATH}:

# Plano Rede Social (MVP)

> Gerado por workflow Fan-out-and-synthesize em ${NOW_ISO}. Supabase project_id: ${SUPABASE_PROJECT_ID}.

## 1. Resumo executivo
(2-3 parágrafos: o que será construído, abordagem, ordem sugerida)

## 2. Ordem sugerida de execução
(sequência de faseIds com justificativa baseada em dependências)

## 3. Dependências cross-fase
(tabela: De Fase → Para Fase → Motivo)

## 4. Planos por fase
(para cada fase, replicar: objetivos, tarefas com critério de conclusão, dependências, riscos + mitigações, estimativa, arquivos afetados, notas do vault)

## 5. Top riscos do projeto
(ordenar por impacto alto→baixo)

## 6. Próximas ações
(3-5 primeiras tarefas acionáveis, com o nome do comando do kit a usar se aplicável: ex. /planejar-fase, /executar-fase)

REGRAS:
- TUDO em português.
- Densidade > completude — não reproduza o cofre, aponte para as notas [[...]].
- Status: GREEN se todas as fases têm plano completo; YELLOW se alguma tem tarefas vagas; RED se fase faltante.
- ordemSugerida deve respeitar dependencias (topológica).
- Retorne { outputPath, status, fasesPlanned, ordemSugerida, dependenciasCrossFase, riscosTop, resumoExecutivo }.`,
  {
    label: 'synthesize-plan',
    phase: 'Synthesize',
    agentType: 'research-synthesizer',
    schema: SYNTHESIS_SCHEMA,
  }
)

return {
  outputPath: synthesis?.outputPath ?? OUTPUT_PATH,
  status: synthesis?.status,
  fasesPlanned: synthesis?.fasesPlanned ?? rows.length,
  ordemSugerida: synthesis?.ordemSugerida,
  dependenciasCrossFase: synthesis?.dependenciasCrossFase,
  riscosTop: synthesis?.riscosTop,
  resumoExecutivo: synthesis?.resumoExecutivo,
  supabaseProjectId: SUPABASE_PROJECT_ID,
  discoverTier: discovery.tier ?? 'cofre',
}
