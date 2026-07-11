import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NewPost } from "@/components/feed/new-post"
import { PostCard, type PostCardDados } from "@/components/post/post-card"
import { EmptyState } from "@/components/profile/empty-state"

const PAGE_SIZE = 10

type BuscaPosts = {
  posts: PostCardDados[]
  total: number
  totalPages: number
  page: number
}

async function buscarPosts(page: number, userId: string | null): Promise<BuscaPosts> {
  const pagina = Math.max(1, page)
  const [total, posts] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
      orderBy: { created_at: "desc" },
      skip: (pagina - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        content_text: true,
        media_url: true,
        media_type: true,
        media_fit: true,
        created_at: true,
        author: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
        likes: userId
          ? { where: { user_id: userId }, select: { id: true } }
          : false,
      },
    }),
  ])

  const postsMapeados = posts.map((post) => ({
    ...post,
    likedByCurrentUser: Boolean(post.likes && post.likes.length > 0),
  })) as PostCardDados[]

  return {
    posts: postsMapeados,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    page: pagina,
  }
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page } = await searchParams
  const paginaParam = Array.isArray(page) ? page[0] : page
  const paginaAtual = paginaParam ? parseInt(paginaParam, 10) || 1 : 1

  const sessao = await auth()
  const { posts, total, totalPages, page: pagina } = await buscarPosts(
    paginaAtual,
    sessao?.user?.id ?? null
  )

  return (
    <>
      <NewPost />

      <section aria-label="Publicacoes" className="flex flex-col gap-4">
        <h1 className="sr-only">Feed de publicacoes</h1>

        {posts.length === 0 ? (
          <EmptyState
            titulo="Nenhuma publicacao ainda"
            descricao="Seja o primeiro a publicar algo na rede!"
          />
        ) : (
            <ul className="flex flex-col gap-4">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} isOwner={post.author.id === sessao?.user?.id} />
                </li>
              ))}
            </ul>
        )}
      </section>

      {totalPages > 1 && (
        <nav
          aria-label="Paginacao"
          className="flex items-center justify-between gap-4 pt-2"
        >
          <span className="text-xs text-muted-foreground">
            {total} publicacao{total === 1 ? "" : "es"} · pagina {pagina} de {totalPages}
          </span>
          <div className="flex gap-2">
            {pagina > 1 ? (
              <Link
                href={`/feed?page=${pagina - 1}`}
                className="inline-flex h-11 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Anterior
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input px-4 text-sm font-medium opacity-50"
              >
                Anterior
              </span>
            )}
            {pagina < totalPages ? (
              <Link
                href={`/feed?page=${pagina + 1}`}
                className="inline-flex h-11 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Proximo
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input px-4 text-sm font-medium opacity-50"
              >
                Proximo
              </span>
            )}
          </div>
        </nav>
      )}
    </>
  )
}
