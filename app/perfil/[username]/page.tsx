import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registrarProfileView } from "@/lib/profile-views"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { EmptyState } from "@/components/profile/empty-state"
import { ProfileViewsList, type Visualizacao } from "@/components/profile/profile-views-list"
import { PostCard, type PostCardDados } from "@/components/post/post-card"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"

type Tab = "todas" | "fotos" | "videos"

function normalizarTab(tab: string | string[] | undefined): Tab {
  if (tab === "fotos") return "fotos"
  if (tab === "videos") return "videos"
  return "todas"
}

export default async function PerfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { username } = await params
  const { tab } = await searchParams
  const abaAtual = normalizarTab(tab)

  const [sessao, usuario] = await Promise.all([
    auth(),
    prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatar_url: true,
        cover_url: true,
      },
    }),
  ])

  if (!usuario) {
    notFound()
  }

  const isOwner = sessao?.user?.username === usuario.username
  const currentUserId = sessao?.user?.id ?? null

  // Visitante autenticado != dono: registra visualizacao
  if (sessao?.user?.id && !isOwner) {
    await registrarProfileView(usuario.id)
  }

  // Contagens por aba + (se dono) visualizacoes de perfil
  const [totalTodas, totalFotos, totalVideos, visualizacoes] = await Promise.all([
    prisma.post.count({ where: { user_id: usuario.id } }),
    prisma.post.count({ where: { user_id: usuario.id, media_type: "image" } }),
    prisma.post.count({ where: { user_id: usuario.id, media_type: "video" } }),
    isOwner && sessao?.user?.id
      ? prisma.profileView.findMany({
          where: { profile_id: sessao.user.id },
          orderBy: { created_at: "desc" },
          take: 20,
          select: {
            id: true,
            created_at: true,
            viewer: {
              select: { id: true, name: true, username: true, avatar_url: true },
            },
          },
        })
      : Promise.resolve([] as Visualizacao[]),
  ])

  const whereClause =
    abaAtual === "fotos"
      ? { user_id: usuario.id, media_type: "image" }
      : abaAtual === "videos"
        ? { user_id: usuario.id, media_type: "video" }
        : { user_id: usuario.id }

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { created_at: "desc" },
    take: 20,
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
      likes: currentUserId
        ? { where: { user_id: currentUserId }, select: { id: true } }
        : false,
    },
  })

  const postsMapeados = posts.map((post) => ({
    ...post,
    likedByCurrentUser: Boolean(post.likes && post.likes.length > 0),
  })) as PostCardDados[]

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
      {isOwner && (
        <aside className="order-2 flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground lg:order-1 lg:sticky lg:top-6 lg:w-80 lg:self-start">
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Quem viu meu perfil</h2>
            <span className="text-xs text-muted-foreground">
              {visualizacoes.length === 0
                ? "nenhuma"
                : `${visualizacoes.length} recente${visualizacoes.length === 1 ? "" : "s"}`}
            </span>
          </header>
          <ProfileViewsList visualizacoes={visualizacoes} />
        </aside>
      )}

      <div className="order-1 flex min-w-0 flex-1 flex-col gap-6 lg:order-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-11 w-fit gap-2"
          render={<Link href="/feed" />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Voltar ao feed
        </Button>

        <ProfileHeader
          perfil={{
            name: usuario.name,
            username: usuario.username,
            bio: usuario.bio,
            avatar_url: usuario.avatar_url,
            cover_url: usuario.cover_url,
          }}
          isOwner={isOwner}
        />

        <ProfileTabs
          username={usuario.username}
          abaAtual={abaAtual}
          totalPorAba={{ todas: totalTodas, fotos: totalFotos, videos: totalVideos }}
        />

        <section aria-label="Publicacoes" className="flex flex-col gap-4">
          {postsMapeados.length === 0 ? (
            <EmptyState
              titulo={
                abaAtual === "fotos"
                  ? "Nenhuma foto ainda"
                  : abaAtual === "videos"
                    ? "Nenhum video ainda"
                    : "Nenhuma publicacao ainda"
              }
              descricao={
                isOwner
                  ? "Suas publicacoes aparecerao aqui."
                  : "Este usuario ainda nao publicou nada."
              }
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {postsMapeados.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
